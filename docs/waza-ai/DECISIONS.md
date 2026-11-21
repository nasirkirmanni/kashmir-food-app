# Waza AI: decisions, and what was rejected

Each entry: what was found, what was decided, and what else was considered. Dated November 2026.

## 1. What existed

Found by reading the code and by asking the live site one question (21 November 2026).

- **The model.** The brief for this work described Waza as running on Google Gemini. It did not:
  `backend/src/routes/chatRoutes.js` called OpenRouter with one key, trying
  `meta-llama/llama-3.1-8b-instruct`, then a free Nvidia model, then a Qwen model. There was no
  Gemini call anywhere in the repository.
- **One request path, already.** The chat route was the only runtime caller of a model (two scripts
  call one offline). So there was a single place to rebuild, and no scattered provider code to
  gather up.
- **Failures looked like answers.** A missing key, every model down and an empty reply were all sent
  as ordinary answer text.
- **No retry, a 4-second cut-off per model, no cancellation.** A live question took 6.7 seconds to
  its first byte and 11.6 in all.
- **The recipe button on dish pages failed every time** (HTTP 400: a field the validator did not
  know).
- **The AI rate limit did not limit** without Redis: a new limiter was built per request.
- **Knowledge was one unsourced 76 KB text file** plus database records carrying default scores. The
  site's sourced writing (stories, guides, the restaurant directory, recipes) was not connected to
  the assistant at all.
- **No conversation was stored anywhere.** The browser sent the whole conversation with each
  question; closing the tab lost it.
- **Deployment.** One Express process on Render, a Next.js frontend on Vercel that proxies to it,
  MongoDB, optional Redis used only for rate limits. No worker, no queue.

Kept: the stack, the route, the request shape old pages send, the look of the chat, the site's
validation, sign-in and rate-limit middleware. Replaced: what happens inside the route.

## 2. One service, in the existing backend

**Decided.** All AI work goes through `createWazaService` in `backend/src/waza/service.js`, behind
the existing Express route.

**Rejected.** A separate AI service or serverless functions: another thing to deploy and keep in
step, for a site with one backend process and modest traffic. A framework (LangChain and the like):
the whole pipeline is a few hundred lines that can be read and tested; a framework would hide the
failure handling this work exists to make explicit.

## 3. Providers behind one door

**Decided.** `providers/index.js` exposes two functions, `streamChat` and `checkKey`. Nothing
outside that folder knows how a provider is called. Two adapters:

- `openaiCompatible.js` for OpenRouter, Google's Gemini API (its OpenAI-compatible endpoint), OpenAI
  and any other endpoint that speaks that API. Written against `fetch`. The providers differ in a
  few field names (how reasoning is asked for, what the output limit is called, whether a
  temperature is accepted), handled by a `dialect`.
- `anthropic.js` for Claude, through Anthropic's own SDK, with the SDK's retries switched off so
  that retrying happens in one place.

Every provider's failures are read into one set of kinds (`providers/errors.js`), each with a scope:
this key, this account, this model, this request, or the provider.

**Gemini stays the primary model**, as asked. With a Gemini key it is called directly; without one,
through OpenRouter.

**Which Gemini model goes first was decided by the live site.** The order first shipped put Gemini
3.8 Flash ahead of Gemini 3.5 Flash-Lite. On the day of release, on production, 3.8 Flash did not
start answering within ten to twelve seconds on any of six tries, and every answer came from
Flash-Lite after that wait. Flash-Lite's answers, read one by one, were drawn from the sources,
cited, and correct on the ten questions asked; it started in about a second. So Flash-Lite goes
first and 3.8 Flash is a fallback. Why 3.8 Flash did not answer is not known from outside the server
(the diagnostics need an admin sign-in); if it turns out to be a setting, `WAZA_MODELS` puts it back
in front. The same release made a slow model cheap to have in the chain at all: no second try after
a slow start, a rest that doubles, and a six-second trial on return.

**Rejected.**
- Google's native API instead of its OpenAI-compatible endpoint: more code for one provider; the
  compatible endpoint streams, reports usage and takes a reasoning effort. Its error bodies come in
  two shapes (an older one with `RESOURCE_EXHAUSTED`, a newer one with codes such as
  `quota_exceeded`); both are read.
- The OpenAI SDK for everything (it was already a dependency): it hides the stream, so a stall, a
  malformed chunk and an empty answer are harder to tell apart.
- An OpenAI adapter of its own: OpenAI is the API the shared adapter already speaks. It is supported
  with a key and a model name in `WAZA_MODELS`, and has no default model because none was verified.
- Putting Claude behind an OpenAI-compatible shim: Anthropic's SDK is the supported way to call it.

**The Claude fallback is Claude Haiku 5.5.** It matches the tier and price of the Gemini Flash
models it stands in for ($0.10 in, $0.50 out per million tokens). A larger Claude model is one line
in `WAZA_MODELS`.

**Not verified.** No adapter has been run against its real provider: there were no keys on the
build machine. Each is tested against a simulated server that behaves as the provider's
documentation describes.

## 4. Keys and quota domains

**Decided.** Keys come only from environment variables. A provider takes one key or a named list.
The name is the quota domain. Unnamed keys share one domain.

The default is the cautious one because each provider says so: Google applies rate limits per
project, not per key; OpenRouter says more keys or accounts do not raise limits. A second key from
the same account is a spare, useful for rotation and revocation, and nothing more. The system will
use genuinely separate accounts if they are configured, and it does not create or rotate accounts to
get around a limit.

Health is tracked at the level the failure speaks of: a rejected key is set aside by itself; an
empty account rests all its keys for all models; a used-up quota rests them for that model; a rate
limit rests them for as long as the provider asks.

**Rejected.**
- Storing keys in MongoDB with an admin screen: the environment is where Render and Vercel already
  keep secrets, and a second copy in a database is a second thing to leak.
- Treating every 401, 403 and 429 as "try the next key": a provider outage would burn through every
  key for nothing, and a rejected key would be retried on every question.
- Health state in Redis or MongoDB: one process serves the site, and the state rebuilds itself from
  the first failures after a restart. It would be needed before running several servers.

## 5. Conversations in MongoDB, by the site

**Decided.** A `WazaConversation` document per conversation, written with single-statement updates
(no transactions). A repeated request is recognised atomically: the update only matches when the
request id is absent, and the upsert that follows is refused by MongoDB as a duplicate. A TTL index
deletes conversations 30 days after their last use.

The page also keeps its own copy and still sends recent turns with each question. That copy is the
fallback when the store is unavailable, and what makes old pages and a rollback work.

**Long conversations get a note, not a model-written summary.** What no longer fits is replaced by
the visitor's own earlier questions, quoted, and the names of the dishes and places discussed.

**Rejected.**
- A summary written by a model: a second model call per long conversation, a second thing that can
  fail, and a summary can state something nobody said. Quoted questions cannot.
- Vector search over old messages: the visitor's questions are short; quoting the recent ones costs
  a few hundred tokens and needs no index.
- Server-side sessions keyed by cookie: the site's CSRF and auth cookies are already delicate behind
  the proxy and on iOS; a browser-made id in the request body avoids touching them.
- A provider's conversation or thread feature: it would tie the conversation to that provider.

**Not verified.** The MongoDB side has not been run against a real MongoDB (none was available). Its
statements are checked against a recorder, the rules are tested on an in-memory backend with the
same behaviour, and an integration test is ready to run against a throwaway database.

## 6. Answers that outlive their connection

**Decided.** Events of an answer are numbered and held in memory for the life of the answer plus two
minutes. A browser reconnects with its request id and the next number it needs. Stop is its own
request. A browser that sent a request id does not end the answer by disconnecting.

**Rejected.**
- Storing every event in MongoDB or Redis so that a reconnection survives a restart: a write per
  token, for a case (a restart during the few seconds of one answer, with the visitor still there)
  that ends in "Try again" at worst.
- Regenerating on reconnect: it prints a second, different answer after half of the first.
- WebSockets: the proxy on Vercel and the existing stream are HTTP; nothing here needs two-way
  traffic.
- Ending the model call when the browser disconnects (the previous behaviour): on a phone with a
  weak signal that throws away answers that were seconds from done. It is still what happens for a
  page that sent no request id, since such a page cannot come back for the rest.

## 7. No new infrastructure

**Decided.** No Redis requirement, no queue, no background worker, no vector database, no separate
metrics system.

The site runs one backend process. Retrieval is a word search over about 1,200 passages held in
memory, taking under a millisecond. Usage is one small document a day. Logs are structured lines to
standard output, which Render already collects.

What would change this: several backend instances (shared key health, shared answers in progress),
or a corpus large enough that word search stops finding things (embeddings).

## 8. Cost

**Decided.** List prices in `pricing.js`, each with the date it was read; an estimate per answer; a
daily total kept in MongoDB; an optional daily ceiling after which no model is asked.

Per answer, about 3,500 tokens in and 300 out: roughly $0.004 on Gemini 3.8 Flash through
OpenRouter, $0.002 on Gemini 3.5 Flash-Lite, $0.0005 on Claude Haiku 5.5. The model in use before
cost about $0.0001. Google's own price for Gemini 3.8 Flash doubles on 1 January 2027.

Greetings and written recipes use no model. The same first question is answered from a cache for six
hours. Only single-question answers with no unchecked details are cached, so nothing from one
visitor's conversation can reach another.

**Rejected.** Caching the fixed part of the prompt explicitly: at these prices it saves about a
hundredth of a cent per answer.

## 9. Things noticed and left alone

- `CSRF_SECRET` falls back to a value written in `server.js`. The repository is public, so the
  variable should be set on Render.
- The CSRF error handler logs token values.
- The `openai` package and `src/config/openrouter.js` are no longer used by the chat; two scripts
  still import them.
- Recipes for dishes with no written recipe: the recipe button now gets an honest "no written recipe
  yet", and every dish currently has one, so no page shows that button.
