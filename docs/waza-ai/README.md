# Waza AI: how it works and how to run it

Waza AI is the assistant on wazwanway.com. This is the engineering reference: what the system is,
what each part does, how to configure, test, deploy and roll it back, and what it does not do.
Why it is built this way, and what was considered and rejected, is in [DECISIONS.md](DECISIONS.md).

Everything here describes the code on the branch that carries this file. Where something has only
been tested against simulated providers, or not run at all, it says so.

## 1. What happens to a question

```
browser ──POST /api/proxy/chat──▶ Next.js function (Vercel) ──POST /api/chat──▶ Express (Render)
   ▲                                   frontend/app/api/proxy                    backend/src/routes/chatRoutes.js
   │                                                                             validation → rate limit
   │                                                                                    │
   └────────────── event stream (meta, delta…, notice, done | error) ◀──────────────────┘
                                                                              backend/src/waza/service.js
```

Inside the service, in order:

1. **Check the input** (`guard.js`): a question at all, not too long.
2. **Recognise the request** (`generations.js`): if this very request is already being answered, a
   repeat is refused (HTTP 409) and a browser coming back after a dropped connection is given the
   rest of the same answer.
3. **Find the conversation** (`conversations.js`): the site's own record in MongoDB. The turns the
   model is shown come from that record. If the database is slow or down, the turns the page sent
   are used instead and the answer goes ahead.
4. **Read the question** (`intent.js`, `plan.js`): what kind of question it is, which dishes,
   restaurants and places it names, whether it is a follow-up.
5. **Fetch the passages** (`retrieve.js`, `knowledge.js`): a search over an index built from the
   site's own pages. Each passage carries a trust label: *verified* (the page cites outside
   sources), *site* (Wazwan Way's own text), *background* (older unchecked notes).
6. **Answer without a model where the site has the answer written** (`direct.js`): greetings, and a
   plain request for a recipe the site has written out. These cost nothing and cannot fail.
7. **Otherwise ask a model** (`reliability.js`, `credentials.js`, `providers/`): each model in
   `WAZA_MODELS` in turn, with each usable key, with retries, backoff, failover and timeouts.
8. **Check the answer** (`guard.js`): a price, phone number, opening time or rating that is not in a
   checked source is flagged to the visitor under the answer.
9. **Record it**: the answer and how it ended in the conversation; counts, tokens and estimated cost
   in the day's usage; one JSON log line with a request id.

A failure at any step ends in an `error` event with a message written for the visitor. A failure is
never sent as answer text.

## 2. The modules

All in `backend/src/waza/`.

| File | What it is |
|---|---|
| `service.js` | The one entry point for every answer. Ties the rest together. |
| `config.js` | Every setting, read from environment variables. |
| `credentials.js` | API keys, the quota domain each belongs to, and which are fit to use now. |
| `providers/index.js` | The provider registry and the single door to all providers. |
| `providers/openaiCompatible.js` | OpenRouter, Google's Gemini API, OpenAI, any OpenAI-style endpoint. |
| `providers/anthropic.js` | Claude, through Anthropic's SDK. |
| `providers/errors.js` | One error type and one reading of every provider's failures. |
| `reliability.js` | Retry, backoff with jitter, key change, model failover, circuit breaker, deadline. |
| `conversations.js`, `mongoBackends.js` | The conversation store and its MongoDB side. |
| `generations.js` | Answers in progress, as numbered events, so a connection can be lost and regained. |
| `usage.js`, `pricing.js` | Daily usage, estimated cost, budget. |
| `knowledge.js`, `retrieve.js`, `text.js` | The index, the search, spelling of Kashmiri words. |
| `intent.js`, `plan.js`, `direct.js` | Reading the question; answers that need no model. |
| `prompt.js` | The rules given to the model, the sources block, the note of earlier turns. |
| `guard.js` | Input limits; the check of an answer against its sources. |
| `sse.js` | The event stream. |
| `cache.js`, `metrics.js`, `suggestions.js` | Answer cache, counters and log line, next questions and cards. |

Models: `backend/src/models/WazaConversation.js`, `WazaUsage.js`.
Browser: `frontend/hooks/useWazaChat.js` (the conversation), `frontend/lib/wazaStream.js` (the
stream), `frontend/components/waza/WazaThread.js` (how it is drawn), used by `WazaAI.js` (desktop
panel) and `MobileWazaAI.js` (phone screen).
The knowledge index, `backend/src/Knowledge/waza-index.json`, is built from the frontend's content
by `frontend/scripts/build-waza-knowledge.mjs`.

## 3. Configuration

All from environment variables on the backend (Render). None is required except one provider key.

### Provider keys

| Variable | Provider | Notes |
|---|---|---|
| `OPENROUTER_API_KEY` | OpenRouter | The key production already has. |
| `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) | Google's Gemini API | Asked first when set. |
| `ANTHROPIC_API_KEY` | Anthropic | |
| `OPENAI_API_KEY` | OpenAI | No default model: name one in `WAZA_MODELS`. |
| `WAZA_CUSTOM_API_KEY` + `WAZA_CUSTOM_BASE_URL` | Any OpenAI-style endpoint | |

Several keys for one provider go in the plural variable (`GEMINI_API_KEYS`, `OPENROUTER_API_KEYS`,
`ANTHROPIC_API_KEYS`, `OPENAI_API_KEYS`, `WAZA_CUSTOM_API_KEYS`), separated by commas:

```
GEMINI_API_KEYS=main=<key>,main=<key>,second=<key>
```

The name before `=` is the key's **quota domain**: the account or project whose limits it draws on.

- Keys with the same name share one allowance. When it runs out, all of them are rested together.
- Keys given no name are all put in the domain `default`. That is deliberate: a second key from the
  same account or project adds no capacity with any provider here. Google: "Rate limits are applied
  per project, not per API key." OpenRouter: "Making additional accounts or API keys will not affect
  your rate limits, as we govern capacity globally."
- Name two domains only where there are two separately billed accounts or projects that the
  provider's terms allow you to hold. Extra keys in one domain are spares (one can be revoked or
  rotated without an outage), not extra quota.

To rotate a key: add the new one to the list, deploy, remove the old one, deploy.

### Models

`WAZA_MODELS` is the order models are tried in: `provider:model@effort`, comma-separated. A provider
with no key is skipped. Unset, the order is, for the providers that have keys:

```
gemini:gemini-3.8-flash@low
openrouter:google/gemini-3.8-flash@low
anthropic:claude-haiku-5-5@low
gemini:gemini-3.5-flash-lite@minimal
openrouter:google/gemini-3.5-flash-lite@minimal
openrouter:anthropic/claude-haiku-5.5@none
```

With only `OPENROUTER_API_KEY` set (production today) that is Gemini 3.8 Flash, then Gemini 3.5
Flash-Lite, then Claude Haiku 5.5, all through OpenRouter. Model names were checked on 21 November
2026 against each provider's own list.

### Everything else

| Variable | Default | Meaning |
|---|---|---|
| `WAZA_DAILY_BUDGET_USD` | 0 (none) | Estimated spend per UTC day past which no model is asked. Recipes and greetings go on. |
| `WAZA_CONVERSATIONS` | on | `off` keeps nothing; the page's own copy is used. |
| `WAZA_CONVERSATION_DAYS` | 30 | Days a conversation is kept after its last use. |
| `WAZA_CONVERSATION_MAX_MESSAGES` | 400 | Messages kept per conversation. |
| `WAZA_MAX_OUTPUT_TOKENS` | 3000 | Ceiling per answer, reasoning included. |
| `WAZA_CONTEXT_TOKENS` / `WAZA_HISTORY_TOKENS` | 2600 / 1100 | Budget for passages / for recent turns. |
| `WAZA_TEMPERATURE` | 0.3 | Not sent to Claude or to OpenAI's reasoning models, which refuse it. |
| `WAZA_FIRST_BYTE_TIMEOUT_MS` | 12000 | No sign of life from a model. |
| `WAZA_FIRST_TEXT_TIMEOUT_MS` | 25000 | No answer text yet. |
| `WAZA_IDLE_TIMEOUT_MS` | 15000 | A stream gone quiet mid-answer. |
| `WAZA_ATTEMPT_TIMEOUT_MS` / `WAZA_TOTAL_TIMEOUT_MS` | 40000 / 50000 | One attempt / everything. |
| `WAZA_RETRIES_PER_MODEL` | 1 | Extra tries of one model after a failure worth retrying. |
| `WAZA_RETRY_BASE_MS` / `WAZA_RETRY_MAX_MS` | 400 / 4000 | Backoff. |
| `WAZA_BREAKER_FAILURES` / `WAZA_BREAKER_COOLDOWN_MS` | 3 / 60000 | When a failing model is rested, and for how long. |
| `WAZA_KEY_RECHECK_MIN` | 30 | How long a rejected key is set aside. |
| `WAZA_QUOTA_COOLDOWN_MIN` / `WAZA_CREDITS_COOLDOWN_MIN` | 15 / 30 | Rest after a quota / an empty account, when the provider gives no figure. |
| `WAZA_CACHE`, `WAZA_CACHE_TTL_MIN`, `WAZA_CACHE_MAX` | on, 360, 400 | The answer cache. |
| `WAZA_MAX_CONCURRENT` | 24 | Answers in progress at once. |
| `WAZA_PRICES` | | Extra or corrected list prices: `provider:model=in/out` per million tokens. |
| `RATE_LIMIT_AI_CHAT_*` | 30 / 60 / 120 / 1000 an hour | Questions per visitor (guest, signed in, premium, admin). |

Keys are read from the environment and nowhere else. They are not stored in MongoDB, not sent to the
browser, and not written to logs: a key appears in logs and diagnostics as an id such as
`gemini:main:1` with the first eight characters of its SHA-256.

## 4. What happens when something fails

| What the provider says | Read as | What Waza does |
|---|---|---|
| 401 | the key is wrong | That key is set aside for 30 minutes (longer each time). The next key of that provider is tried; with none, the next provider. |
| 403 | the key is not allowed (project restricted, key reported leaked) | The same. A 403 that is a moderation refusal of the question is treated as a refusal, not a bad key. |
| 402, or "credit balance too low" | the account is empty | Every key of that quota domain is rested for every model. The next domain or provider is tried. |
| 429 naming a daily or monthly quota | quota used up | Every key of that domain is rested for that model, for as long as the provider says, else 15 minutes and growing. |
| 429 otherwise | a rate limit | Waited out if the provider asks for 4 seconds or less; otherwise the domain is rested for the time asked and the next route is tried. |
| 404 | the provider does not know the model | The next model. |
| 400 | the request was refused | Sent once more in its barest form (a provider may reject a field it does not know), then the next model. |
| 5xx, 503, 529, timeouts, a broken or empty stream | the provider is in trouble | The same key again after a pause with jitter, then the next model. Three failures in a row rest that model for a minute. |
| the stream breaks after text has reached the visitor | interrupted | Not restarted: a second answer after half of the first would be worse. Shown as interrupted, with Try again. |

When every model is resting after failures, each is still asked once before the visitor is turned
away. A key the provider has rejected or rested is not asked early: that is the provider's
instruction.

When nothing can answer, the visitor sees one of a small set of messages (`FAILURES` in
`service.js`), each with a code the page uses to decide whether to offer Try again. Greetings and
written recipes keep working throughout, because they use no model.

## 5. Conversations

- **The record is the site's.** Each question and answer is stored in MongoDB
  (`wazaconversations`), with how the answer ended: `complete`, `partial` (cut off), `stopped` (the
  visitor pressed Stop), `failed`, or `pending` while it is being written. Whichever model answers
  next is given its turns from this record, in that provider's own shape. No provider's
  conversation memory is used.
- **Whose it is.** The browser makes a random id and keeps it (localStorage). For an anonymous
  visitor that id is the only thing that opens the conversation, so it is never put in a URL. When a
  visitor signs in, the conversation becomes theirs and no other account can open it.
- **Long conversations.** The most recent turns are sent in full. What does not fit is replaced by a
  note the application writes: the visitor's own earlier questions, newest first, and the dishes and
  places that came up. No model writes this note, so it cannot contain something that was not said.
  The stored record itself is not shortened until it passes 400 messages.
- **Retention.** A conversation is deleted by MongoDB 30 days after its last use
  (`WAZA_CONVERSATION_DAYS`). The browser's own copy is dropped after the same time. "New
  conversation" forgets the id in that browser at once.
- **If the database is down** every store call gives up after 1.5 seconds and Waza answers from the
  turns the page sent, exactly as before conversations were kept.

## 6. Streaming and recovery

An answer is written into a list of numbered events in memory, and a browser's connection reads from
that list.

- **A dropped connection.** The page asks again with the same request id and the number of the next
  event it needs. It gets the rest of the same answer. The model is not asked twice.
- **A browser that never comes back.** The answer is finished and stored (bounded by the 50-second
  deadline and the output ceiling), so it is there on the next visit.
- **Stop.** The page sends `POST /api/chat/cancel`. The model call is ended and the answer is stored
  as stopped with what had been written.
- **A repeated request.** The same request id while it is being answered: HTTP 409. After it has
  been answered: the stored answer is sent again and no model is asked.
- **A restart of the server.** The events in memory are lost. A browser asking for the rest of an
  answer it had half of is told it was interrupted and offered Try again; it is never given a second
  answer appended to the first. The conversation itself is intact.
- **A deploy.** On SIGTERM the server stops taking questions and gives answers in progress 20
  seconds to finish; any still running are stored as cut short.

Limits, stated plainly: recovery of a half-delivered answer works only while the same server process
is alive (and for two minutes after the answer ends). Providers offer no way to resume a model's
stream, so an answer the provider itself cut off cannot be continued, only retried.

## 7. Watching it

- **One log line per question** (`evt: "waza_chat"`): request id, what the question was taken to be,
  which model and key answered, every attempt and how it ended, tokens, estimated cost, timings,
  whether the conversation was the site's record or the page's copy. No question text, no answer
  text, no key.
- **`GET /api/chat/status`** (public): whether Waza can answer, whether conversations are kept, the
  index version.
- **`GET /api/chat/diagnostics`** (admin sign-in): models in use, each key's state (ready, resting
  and until when, invalid) by id and fingerprint, the breaker, cache, answers in progress, today's
  usage and estimated cost, the last seven days, the budget, latency percentiles, failures by model.
- **`POST /api/chat/diagnostics/check-keys`** (admin sign-in): asks each provider whether it accepts
  each key, without generating anything.
- **Cost** is an estimate from list prices (`pricing.js`, with the date each was read). The
  provider's invoice is what is owed. An answer from a model with no listed price is counted as
  unpriced, not guessed.

## 8. Testing

No test calls a real provider or a real database.

```bash
cd backend
npm run test:waza        # 114 tests: failover, keys, quota domains, conversations, recovery, budget
                         # (one more, against a real MongoDB, is skipped unless MONGODB_URI_TEST is set)
npm run eval:waza        # how 245 questions are read and what is fetched for them (no model)
npm run check:waza       # which models and keys the environment gives, and whether keys are accepted
```

```bash
cd frontend
npm test                 # 330 tests, 26 of them for the chat and its knowledge index
```

In a real browser, against a scripted stand-in for the model:

```bash
cd backend && node evals/local-harness.mjs --port 5199
cd frontend && npm run build && BACKEND_URL=http://127.0.0.1:5199 npx next start -p 3200
cd backend && node evals/browser-check.mjs        # 65 checks, desktop and phone
```

With real keys (these spend money on the account they belong to):

```bash
cd backend
node evals/check-providers.mjs --live     # one short question to each model
node evals/run-online.mjs --limit 20      # answers judged against the question set
MONGODB_URI_TEST=<a throwaway database> node --test src/tests/waza/mongo.integration.test.js
```

## 9. Deploying

Nothing here needs a new service, queue or database. MongoDB gains two collections on first use
(`wazaconversations`, `wazausages`); nothing existing is changed or migrated.

1. **Before**: on Render, confirm `OPENROUTER_API_KEY` is set (it is what production uses now). To
   ask Gemini directly as well, add `GEMINI_API_KEY`; for a provider independent of both, add
   `ANTHROPIC_API_KEY`. Optionally set `WAZA_DAILY_BUDGET_USD`.
2. **Push to `main`.** Vercel builds the frontend and Render the backend, at different speeds. Both
   orders are safe: the new page falls back to the old request form if the backend refuses the new
   fields, and the new backend still sends the fields the old page reads.
3. **After**: `GET https://api.wazwanway.com/api/chat/status` should say `"configured": true`. Ask
   Waza a question on the site. Signed in as an admin, open `/api/chat/diagnostics` and run
   `check-keys`.

### Rolling back

- **Everything**: revert the merge commit and push. The two new collections are left behind unused
  and can be dropped at leisure.
- **Conversations only**: set `WAZA_CONVERSATIONS=off` on Render. No deploy needed beyond the
  restart; Waza goes back to answering from the page's copy.
- **A model that misbehaves**: set `WAZA_MODELS` to the order wanted.
- **Spend**: set `WAZA_DAILY_BUDGET_USD`.

## 10. What it does not do

- It has not been run against a real model, a real provider error, or a real MongoDB on the machine
  it was built on: there were no keys and no database there. Everything is tested against simulated
  providers that behave as each provider's documentation says, and an in-memory store with the same
  rules as the MongoDB one. `check-providers.mjs --live`, `run-online.mjs` and the integration test
  above are how to close that gap.
- State that makes it fast (which keys are resting, the breaker, the cache, answers in progress) is
  in one process's memory. That is right for one server. With several, each would learn separately
  and a browser could reconnect to a server that does not hold its answer; shared state would be
  needed first.
- Answer quality with the chosen models is unmeasured until the online evaluation is run.
- It searches by words, not by meaning. A question phrased far from the site's own wording can miss.
- A provider's stream cannot be resumed; see section 6.
