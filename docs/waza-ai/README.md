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
| `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) | Google's Gemini API | Asked first when set. Four models are tried on it, each metered by Google separately. |
| `OPENROUTER_API_KEY` | OpenRouter | The same models through a second provider. Needs credit, except for its `:free` models. |
| `ANTHROPIC_API_KEY` | Anthropic | |
| `OPENAI_API_KEY` | OpenAI | No default model: name one in `WAZA_MODELS`. |
| `MISTRAL_API_KEY` | Mistral | No default model: name one in `WAZA_MODELS`. |
| `GROQ_API_KEY` | Groq | No default model: name one in `WAZA_MODELS`. |
| `WAZA_CUSTOM_API_KEY` + `WAZA_CUSTOM_BASE_URL` | Any OpenAI-style endpoint | |

Several keys for one provider go in the plural variable (`GEMINI_API_KEYS`, `OPENROUTER_API_KEYS`,
`ANTHROPIC_API_KEYS`, `OPENAI_API_KEYS`, `MISTRAL_API_KEYS`, `GROQ_API_KEYS`,
`WAZA_CUSTOM_API_KEYS`), separated by commas:

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
gemini:gemini-3.5-flash-lite@minimal
gemini:gemini-3.1-flash-lite@minimal
openrouter:google/gemini-3.5-flash-lite@minimal
anthropic:claude-haiku-5-5@low
gemini:gemini-3.6-flash@low
gemini:gemini-3.8-flash@low
openrouter:google/gemini-3.8-flash@low
openrouter:anthropic/claude-haiku-5.5@none
```

The light Gemini model is first because of what the live site showed on the day of release (21
November 2026): it answered every question from the sources in about a second, while Gemini 3.8
Flash did not start answering within ten seconds. Model names were checked the same day against each
provider's own list.

The second entry is a second light Gemini model on the same key. Google meters each model
separately, so when the first is paused by its per-minute limit, or has used its allowance for the
day, the second still has its own and answers in the same request. On the live site the same
evening, three questions asked while Gemini 3.5 Flash-Lite was paused were answered by Gemini 3.1
Flash-Lite, each a sound answer from the sources; one began in about a second and two in six to
seven. That is three answers, not a measure of the model. Gemini 3.6 Flash has not yet had to answer
there: the log lines (`said` on a failed attempt, `route` on an answer) will show when it does.

Google's refusal on that key reads "GenerateRequestsPerMinutePerProjectPerModel-FreeTier, limit 15":
the key is on the free tier, with 15 requests a minute for each model. In practice the limit was
enforced loosely: 28 questions one after another in 46 seconds drew one refusal, which an immediate
second ask got past; asked three at a time, the first refusal came at the twentieth question, ten
seconds in.

### Free allowances

Waza can run on providers' free allowances, within what each provider permits. As read on 21
November 2026:

**What works**

- *Several models on one Google key.* "Limits vary depending on the specific model being used", and
  they are "applied per project, not per API key". The free tier is offered for Gemini 3.5
  Flash-Lite, 3.1 Flash-Lite, 3.6 Flash and 3.8 Flash, among others. This needs no second account
  and is what the default order does.
- *One account at each of several providers.* Each provider's free allowance is its own. Put the key
  in that provider's variable and name its model in `WAZA_MODELS`.
- *OpenRouter's free models* (ids ending `:free`), with an OpenRouter key that has no credit: 20
  requests a minute, and 50 a day for an account that has bought fewer than 10 credits in all (1,000
  a day otherwise). An account with a negative balance may be refused even these.

**What does not**

- *A second key, project or account at the same provider.* Google counts by project and its API
  terms say "You agree to, and will not attempt to circumvent, such limitations". OpenRouter:
  "Making additional accounts or API keys will not affect your rate limits, as we govern capacity
  globally." Waza treats unnamed keys of one provider as one allowance for this reason.

**What a free allowance costs instead of money**

- Google's free tier: content is "used to improve our products", and "human reviewers may read,
  annotate, and process your API input and output". Google's terms: "Do not submit sensitive,
  confidential, or personal information to the Unpaid Services", and "You may use only Paid Services
  when making API Clients available to users in the European Economic Area, Switzerland, or the
  United Kingdom." A site open to visitors from those places needs the paid tier, or another
  provider for those visitors. On the paid tier content is "not used to improve our products".
- Limits are small and "not guaranteed and actual capacity may vary". Groq's published table gives
  its large open model 8,000 tokens a minute and 200,000 a day, which is about two of Waza's
  questions a minute and about fifty a day. Groq's preview models "should not be used in production
  environments".
- Some free offers are trials: Cerebras gives a credit to use up. GitHub Models closed on 30 July
  2026.
- A model that has not been run against the question set may follow the rules less well. Before a
  new model goes in the order: `npm run check:waza -- --live` (does it answer with this key), then
  `node evals/run-online.mjs --limit 20` with `WAZA_MODELS` set to that model alone (are its answers
  grounded and cited).

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
| `WAZA_BREAKER_FAILURES` / `WAZA_BREAKER_COOLDOWN_MS` | 2 / 60000 | When a failing model is rested, and for how long at first. |
| `WAZA_BREAKER_MAX_COOLDOWN_MS` | 900000 | The rest doubles each time a model fails on being let back, up to this. |
| `WAZA_PROBE_TIMEOUT_MS` | 6000 | How long a model let back after a rest is given to start answering. |
| `WAZA_LAST_RESORT_GAP_MS` | 10000 | A resting model that failed this recently is not asked again as a last resort. |
| `WAZA_WAIT_FOR_LIMIT_MS` | 15000 | When nothing else can answer, a rate limit that clears within this long is waited out. |
| `WAZA_RECENT_ANSWER_MS` | 600000 | A model that answered within this long and is then silent once is asked again at once (0 turns this off). |
| `WAZA_KEY_RECHECK_MIN` | 30 | How long a rejected key is set aside. |
| `WAZA_QUOTA_COOLDOWN_MIN` / `WAZA_CREDITS_COOLDOWN_MIN` | 15 / 30 | Rest after a quota / an empty account, when the provider gives no figure. |
| `WAZA_CACHE`, `WAZA_CACHE_TTL_MIN`, `WAZA_CACHE_MAX` | on, 360, 400 | The answer cache. |
| `WAZA_MAX_CONCURRENT` | 24 | Answers in progress at once. |
| `WAZA_PRICES` | | Extra or corrected list prices: `provider:model=in/out` per million tokens. |
| `RATE_LIMIT_AI_CHAT_*` | 30 / 60 / 120 / 1000 an hour | Questions per visitor: `MAX_GUEST` (counted by browser), `MAX_FREE` (signed in), `MAX_PREMIUM`, `MAX_ADMIN` (counted by account). |
| `RATE_LIMIT_AI_CHAT_MAX_SHARED` | 120 an hour | All guests arriving from one address, together. See "The site's own limit on questions" below. |

Keys are read from the environment and nowhere else. They are not stored in MongoDB, not sent to the
browser, and not written to logs: a key appears in logs and diagnostics as an id such as
`gemini:main:1` with the first eight characters of its SHA-256.

## 4. What happens when something fails

| What the provider says | Read as | What Waza does |
|---|---|---|
| 401 | the key is wrong | That key is set aside for 30 minutes (longer each time). The next key of that provider is tried; with none, the next provider. |
| 403 | the key is not allowed (project restricted, key reported leaked) | The same. A 403 that is a moderation refusal of the question is treated as a refusal, not a bad key. |
| 402, or "credit balance too low" | the account is empty | Every key of that quota domain is rested for every model. The next domain or provider is tried. |
| 429 naming a daily or monthly limit, a spend cap or an unpaid account | quota used up | Every key of that domain is rested for that model, for as long as the provider says, else 15 minutes and growing. |
| 429 naming a per-minute limit, or saying only "quota" with a wait of two minutes or less | a rate limit (a pause) | Waited out if the provider asks for 4 seconds or less; otherwise the domain is rested for the time asked and the next route is tried. |
| 429 saying only "quota", with no wait or a longer one | quota used up | As for a daily limit. |
| 429 otherwise | a rate limit | As for a pause. |
| 404 | the provider does not know the model | The next model. |
| 400 | the request was refused | Sent once more in its barest form (a provider may reject a field it does not know), then the next model. |
| 5xx, 503, 529, a broken or empty stream | the provider is in trouble | The same key again after a pause with jitter, then the next model. |
| no start within 12 seconds, or no text within 25 | the model is slow | The next model at once: the same model asked again is unlikely to be quicker. The exception is a model that answered within the last ten minutes: it is asked once more straight away, with six seconds to start, because one stuck request is likelier than an outage. |
| the stream breaks after text has reached the visitor | interrupted | Not restarted: a second answer after half of the first would be worse. Shown as interrupted, with Try again. |

Two failures in a row rest a model for a minute. When the minute is up it gets one short try (six
seconds to start, no retry); if it fails that, its rest doubles, up to fifteen minutes, so a model
that stays down costs a visitor a few seconds less and less often. One answer ends the rest.

Within one question, the time a further model is given to start shrinks by what the visitor has
already waited, down to those same six seconds: silence from several fallbacks in a row does not
add up to a minute.

When every model is resting after failures, each is still asked once (a short try) before the
visitor is turned away, unless it failed within the last ten seconds.

When the model that normally answers is paused by its provider (a rate limit or a quota) and nothing
else can answer, the visitor is told Waza is busy and, for a rate limit, how long to wait ("try
again in about 40 seconds"), whatever a lesser fallback did in the meantime. If the pause ends
within fifteen seconds, Waza waits for it and answers. A key the provider has rejected or rested is
not asked early: that is the provider's instruction.

Google words a per-minute limit as a quota ("You exceeded your current quota"). On 21 November 2026
the live site was refused twice that way and the model answered again 15 and 58 seconds later, so a
429 is read by what it names and by the wait attached, not by the word "quota" (`usedUp` in
`providers/errors.js`).

When nothing can answer, the visitor sees one of a small set of messages (`FAILURES` in
`service.js`), each with a code the page uses to decide whether to offer Try again. Greetings and
written recipes keep working throughout, because they use no model.

### The site's own limit on questions

Before a question reaches Waza the API counts it (`backend/src/middleware/rateLimiter.js`). A
signed-in visitor is counted by their account. A guest is counted by their browser: by a digest of
the cookie the site gives every visitor before a first question. They are not counted by the address
the request arrives from, because behind the site's proxy every visitor arrives from the same few
addresses. Until 21 November 2026 guests were counted by that address, and on the live site that
day one visitor's 60-odd questions in seven minutes used up the hourly allowance of everyone
arriving the same way: one of the addresses in rotation was refusing every guest for the next fifty
minutes, while another still had 21 of its 30 left.

| Who is refused | When | What they are told |
|---|---|---|
| One guest | 30 questions in an hour from one browser | "You've asked Waza AI a lot of questions in a short time. Please wait a little before asking more." |
| Every guest arriving from one address | 120 questions in an hour between them | "Waza AI is answering a lot of questions right now. Please try again in a little while." |

Anyone can ask the site for a new cookie, so the first limit holds a visitor to a fair share and
does not stop a script. The second is what stops a script, and it is why the count by address was
kept. A question refused under a visitor's own allowance does not count towards it. Neither limit
knows about the providers' limits: those are handled as the table above describes.

The counts are in the server's memory (in Redis if `REDIS_URL` is set), so they start again when
the server does.

## 5. Conversations

- **The record is the site's.** Each question and answer is stored in MongoDB
  (`wazaconversations`), with how the answer ended: `complete`, `partial` (cut off), `stopped` (the
  visitor pressed Stop), `failed`, or `pending` while it is being written. Whichever model answers
  next is given its turns from this record, in that provider's own shape. No provider's
  conversation memory is used.
- **Whose it is.** The browser makes a random id and keeps it (localStorage). For an anonymous
  visitor that id is the only thing that opens the conversation, so it is never put in a URL. (The
  site had visitor accounts until November 2026, and a signed-in visitor's conversation was tied to
  the account. With accounts removed every visitor is anonymous.)
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
  whether the conversation was the site's record or the page's copy. A failed attempt carries
  `said`: the provider's own account of the failure (its code, the limit it names, its message
  without links, at most 300 characters, anything key-like removed). No question text, no answer
  text, no key.
- **`GET /api/chat/status`** (public): whether Waza can answer, whether conversations are kept, the
  index version.
- **`GET /api/chat/diagnostics`** (admin sign-in; see the note below): models in use, each key's state (ready, resting
  and until when, invalid) by id and fingerprint, its last failure and what the provider said, the breaker, cache, answers in progress, today's
  usage and estimated cost, the last seven days, the budget, latency percentiles, failures by model.
- **`POST /api/chat/diagnostics/check-keys`** (admin sign-in): asks each provider whether it accepts
  each key, without generating anything.
- **Since November 2026 no one can sign in**: accounts were removed from the site and the API, so
  the two diagnostics addresses above cannot be reached. The log lines carry the same facts (the
  route, each failed attempt and what the provider said) and are the way to watch Waza now.
- **Cost** is an estimate from list prices (`pricing.js`, with the date each was read). The
  provider's invoice is what is owed. An answer from a model with no listed price is counted as
  unpriced, not guessed.

## 8. Testing

No test calls a real provider or a real database.

```bash
cd backend
npm run test:waza        # 129 tests: failover, keys, quota domains, conversations, recovery, budget,
                         # the limit on questions
                         # (one more, against a real MongoDB, is skipped unless MONGODB_URI_TEST is set)
npm run eval:waza        # how 245 questions are read and what is fetched for them (no model)
npm run check:waza       # which models and keys the environment gives, and whether keys are accepted
```

```bash
cd frontend
npm test                 # 331 tests, 27 of them for the chat and its knowledge index
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

1. **Before**: on Render, at least one provider key must be set. `GEMINI_API_KEY` is asked first
   (Gemini directly); `OPENROUTER_API_KEY` gives the same models through a second provider;
   `ANTHROPIC_API_KEY` gives one independent of both. A key only helps while its account can pay for
   the call: a route whose account has no credit is skipped, and tried again every half hour.
   Optionally set `WAZA_DAILY_BUDGET_USD`.
2. **Push to `main`.** Vercel builds the frontend and Render the backend, at different speeds. Both
   orders are safe: the new page falls back to the old request form if the backend refuses the new
   fields, and the new backend still sends the fields the old page reads.
3. **After**: `GET https://api.wazwanway.com/api/chat/status` should say `"configured": true`. Ask
   Waza a question on the site, and read its `waza_chat` line in the server log.

### Rolling back

- **Everything**: revert the merge commit and push. The two new collections are left behind unused
  and can be dropped at leisure.
- **Conversations only**: set `WAZA_CONVERSATIONS=off` on Render. No deploy needed beyond the
  restart; Waza goes back to answering from the page's copy.
- **A model that misbehaves**: set `WAZA_MODELS` to the order wanted.
- **Spend**: set `WAZA_DAILY_BUDGET_USD`.

## 10. What it does not do

- The automated tests call no real model and no real database: the machine it was built on has no
  keys. They use simulated providers that behave as each provider's documentation says, and an
  in-memory store with the same rules as the MongoDB one. On the live site (from 21 November 2026)
  it runs against a real model and the real MongoDB, and what was met there is in the code as
  comments and tests: a per-minute limit worded as a quota, an account with no credit, a model that
  is overloaded or never starts, one silent request from a healthy model. Provider failures not yet
  met live are still only simulated. `check-providers.mjs --live`, `run-online.mjs` and the
  integration test above test the rest against real services.
- Only the limit on questions tells guests apart by browser. The API's other limits (its general
  limit, and the one on sign-in attempts) still count by the address a request arrives from, which
  behind the site's proxy is shared by every visitor.
- State that makes it fast (which keys are resting, the breaker, the cache, answers in progress) is
  in one process's memory. That is right for one server. With several, each would learn separately
  and a browser could reconnect to a server that does not hold its answer; shared state would be
  needed first. On a host that stops an idle server and starts a new one for the next visitor, that
  memory is lost at each start: a model known to be down is given its full time once more, and the
  first question waits for the server itself.
- Answer quality has been sampled on the live site by hand, not scored: the online evaluation
  (`run-online.mjs`) has not been run against production.
- It searches by words, not by meaning. A question phrased far from the site's own wording can miss.
- A provider's stream cannot be resumed; see section 6.
