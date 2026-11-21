/**
 * Waza AI on this machine, with a scripted stand-in where the language model would be.
 *
 *   node evals/local-harness.mjs [--port 5199]
 *   then, in frontend/:  BACKEND_URL=http://127.0.0.1:5199 npx next start -p 3200
 *
 * Everything except the model is the real thing: the validation, the reading of the question, the
 * retrieval, the stream, the checks on the answer. The stand-in writes its "answer" out of the
 * passages it was handed, so what the page shows is grounded but is NOT what a real model would
 * write; use it to see the interface in every state, never to judge answer quality. No key, no
 * database and no network are needed.
 *
 * A word in the question makes the stand-in misbehave, to show how the page copes:
 *   #slow      takes its time to start and writes slowly (press Stop to see cancelling)
 *   #long      a long answer
 *   #down      every model fails                        → the error state, with Try again
 *   #failover  the first model fails, the second answers → the visitor sees only the answer
 *   #cut       the connection drops partway             → "interrupted", with Try again
 *   #hang      accepts the question and never answers   → the timeout message
 *   #invent    adds a price, a phone number and a time that are in no source → the notice
 *   #limit     stops at the length limit                → the "cut short" notice
 *   #drop      the connection to the browser is cut partway, while the answer goes on being
 *              written                                   → the page comes back for the rest
 *
 * Conversations are kept in memory here (the real server keeps them in MongoDB), so reloading the
 * page brings a conversation back until the harness is restarted. GET /harness/calls lists what the
 * stand-in model was asked, to check that a question was put to it once.
 */
import express from "express";
import { validate } from "../src/middleware/validate.js";
import { cancelSchema, chatSchema, conversationParams } from "../src/validations/chatValidations.js";
import { loadConfig } from "../src/waza/config.js";
import { createConversationStore, createMemoryBackend } from "../src/waza/conversations.js";
import { createWazaService } from "../src/waza/service.js";
import { fakeProvider } from "../src/tests/waza/helpers.js";

const port = Number(process.argv[process.argv.indexOf("--port") + 1]) || 5199;

/** The passages in a prompt, as { n, title, text }. */
function passages(system) {
  const block = system.split("\nSOURCES\n")[1] || "";
  return block
    .split("\n---\n")
    .map((entry) => {
      const head = entry.match(/^\[S(\d+)\] \([^)]*\) ([^\n|]*)/);
      if (!head) return null;
      return { n: Number(head[1]), title: head[2].trim(), text: entry.slice(entry.indexOf("\n") + 1).trim() };
    })
    .filter(Boolean);
}

const sentences = (text, count) =>
  text
    .replace(/\n+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"“(])/)
    .filter((sentence) => sentence.length > 20)
    .slice(0, count)
    .join(" ");

/** An "answer" made of the first lines of the passages, cited. A stand-in, not a model. */
function standIn(system, { long = false } = {}) {
  const found = passages(system);
  if (!found.length) return "Wazwan Way's pages do not cover that. I can help with Wazwan, Kashmiri dishes and recipes, where to eat in Srinagar, and travelling in Kashmir.";
  const [first, ...rest] = found;
  const lines = [`**${first.title.split(/[:,]/)[0]}**: ${sentences(first.text, long ? 4 : 2)} [S${first.n}]`];
  const more = rest.slice(0, long ? 6 : 2).map((passage) => `- ${sentences(passage.text, long ? 3 : 1)} [S${passage.n}]`);
  if (more.length) lines.push("", ...more);
  return lines.join("\n");
}

const provider = await fakeProvider(({ body, n, model }) => {
  const system = body.messages[0]?.content || "";
  const question = [...body.messages].reverse().find((message) => message.role === "user")?.content || "";
  const has = (tag) => question.includes(tag);
  if (has("#down")) return { status: 503 };
  if (has("#failover") && model === "stand-in-a") return { status: 503 };
  if (has("#hang")) return { hang: true };
  const text = standIn(system, { long: has("#long") || has("#slow") || has("#drop") });
  if (has("#drop")) return { text, gapMs: 70 };
  if (has("#cut")) return { text, dropAfter: 4, gapMs: 40 };
  if (has("#slow")) return { text, firstDelayMs: 2500, gapMs: 140 };
  if (has("#long")) return { text, gapMs: 35 };
  if (has("#invent")) return { text: `${text}\n\nA full trami there costs ₹4,999, they open at 7 am, and you can ring 0194-2999999.`, gapMs: 20 };
  if (has("#limit")) return { text: text.slice(0, 160), finish: "length", gapMs: 20 };
  return { text, gapMs: 20, usage: { prompt_tokens: Math.round(system.length / 3.8), completion_tokens: Math.round(text.length / 3.8) }, n };
});

const config = loadConfig({
  WAZA_MODELS: "custom:stand-in-a,custom:stand-in-b",
  WAZA_CUSTOM_API_KEY: "local-harness",
  WAZA_CUSTOM_BASE_URL: provider.url,
  WAZA_FIRST_BYTE_TIMEOUT_MS: "5000",
  WAZA_FIRST_TEXT_TIMEOUT_MS: "8000",
  WAZA_IDLE_TIMEOUT_MS: "5000",
  WAZA_ATTEMPT_TIMEOUT_MS: "40000",
  WAZA_TOTAL_TIMEOUT_MS: "45000",
  WAZA_RETRY_BASE_MS: "200",
  WAZA_RETRY_MAX_MS: "800",
});
const service = createWazaService({ config, conversations: createConversationStore({ backend: createMemoryBackend() }) });

const app = express();
app.use(express.json({ limit: "100kb" }));
app.get("/api/auth/csrf-token", (_req, res) => res.json({ success: true, csrfToken: "local-harness" }));
app.post("/api/chat", validate({ body: chatSchema }), (req, res) => {
  const question = req.body.messages.at(-1)?.content || "";
  if (question.includes("#drop") && req.body.resumeFrom === undefined) {
    // Cut this browser's connection after a few frames. The answer itself is not touched.
    let sent = 0;
    const write = res.write.bind(res);
    res.write = (chunk, ...rest) => {
      const out = write(chunk, ...rest);
      if (String(chunk).startsWith("data:") && ++sent === 6) setTimeout(() => res.socket?.destroy(), 5);
      return out;
    };
  }
  service.handle(req, res);
});
app.post("/api/chat/cancel", validate({ body: cancelSchema }), (req, res) => service.cancel(req, res));
app.get("/api/chat/conversations/:id", validate({ params: conversationParams }), (req, res) => service.conversation(req, res));
app.get("/api/chat/status", (_req, res) => res.json(service.status()));
app.get("/api/chat/diagnostics", async (_req, res) => res.json(await service.diagnostics()));
app.get("/harness/calls", (_req, res) => res.json(provider.calls.map((call) => ({ model: call.model, closed: call.closed, question: [...call.body.messages].reverse().find((message) => message.role === "user")?.content || "" }))));
app.get("/", (_req, res) => res.type("text/plain").send("Waza AI local harness: scripted stand-in model. POST /api/chat"));
app.use("/api", (_req, res) => res.status(404).json({ success: false, message: "Not part of the local harness" }));
app.use((error, _req, res, _next) => res.status(error.status || 500).json({ success: false, message: error.message || "Harness error" }));

app.listen(port, "127.0.0.1", () => console.log(`Waza AI local harness on http://127.0.0.1:${port} (stand-in model at ${provider.url})`));
