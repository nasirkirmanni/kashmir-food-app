/**
 * Drives the Waza AI chat in a real (headless) Chrome, on a desktop and a phone screen, through
 * every state the page can be in, and says which checks passed.
 *
 *   1. node evals/local-harness.mjs --port 5199                       (the scripted stand-in backend)
 *   2. in frontend/: npm run build && BACKEND_URL=http://127.0.0.1:5199 npx next start -p 3200
 *   3. node evals/browser-check.mjs [--base http://localhost:3200] [--out ./browser-check]
 *
 * It checks the interface, not the model: the stand-in "answers" are cut from the fetched passages.
 * Chrome is started on a port of its own (port 0) so a second run on the same machine cannot attach
 * to this one. Exit code 1 if any check fails.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const arg = (name, fallback) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback);
const BASE = arg("--base", "http://localhost:3200").replace(/\/+$/, "");
// The stand-in backend itself, to ask what its model was asked (GET /harness/calls).
const HARNESS = arg("--harness", "http://127.0.0.1:5199").replace(/\/+$/, "");
const modelCalls = async (needle) => (await (await fetch(`${HARNESS}/harness/calls`)).json()).filter((call) => call.question.includes(needle));
const OUT = path.resolve(arg("--out", "./browser-check"));
const CHROME = process.env.CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
fs.mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "waza-check-"));
const chrome = spawn(CHROME, ["--headless=new", "--mute-audio", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const portFile = path.join(profile, "DevToolsActivePort");
for (let i = 0; i < 100 && !fs.existsSync(portFile); i++) await sleep(100);
if (!fs.existsSync(portFile)) {
  chrome.kill();
  throw new Error("Chrome did not start");
}
const port = fs.readFileSync(portFile, "utf8").split("\n")[0];
const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
const ws = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
await new Promise((resolve) => ws.addEventListener("open", resolve));
let seq = 0;
const pending = new Map();
const consoleErrors = [];
const requests = [];
ws.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message);
    pending.delete(message.id);
  }
  if (message.method === "Runtime.exceptionThrown") consoleErrors.push(`exception: ${message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text}`.slice(0, 300));
  if (message.method === "Log.entryAdded" && message.params.entry.level === "error") consoleErrors.push(`${message.params.entry.text} ${message.params.entry.url || ""}`.slice(0, 300));
  if (message.method === "Network.requestWillBeSent" && /\/api\/proxy\/chat$/.test(message.params.request.url)) requests.push(message.params.request.postData || "");
});
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++seq;
    pending.set(id, resolve);
    ws.send(JSON.stringify({ id, method, params }));
  });
await send("Runtime.enable");
await send("Log.enable");
await send("Page.enable");
await send("Network.enable", { maxPostDataSize: 2_000_000 });

const evaluate = async (expression) => {
  const out = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (out.result?.exceptionDetails) throw new Error(`page script failed: ${out.result.exceptionDetails.exception?.description || out.result.exceptionDetails.text}`);
  return out.result?.result?.value;
};
async function waitFor(expression, { timeout = 15000, label = expression } = {}) {
  const until = Date.now() + timeout;
  for (;;) {
    const value = await evaluate(expression).catch(() => null);
    if (value) return value;
    if (Date.now() > until) throw new Error(`timed out waiting for: ${label}`);
    await sleep(120);
  }
}
const shot = async (name) => {
  const image = await send("Page.captureScreenshot", { format: "png" });
  fs.writeFileSync(path.join(OUT, `${name}.png`), Buffer.from(image.result.data, "base64"));
};
const goto = async (url, { width, height }) => {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: width < 768 ? 2 : 1, mobile: width < 768 });
  await send("Emulation.setTouchEmulationEnabled", { enabled: width < 768 });
  await send("Page.navigate", { url: `${BASE}${url}` });
  await waitFor("document.readyState === 'complete'", { label: `load ${url}` });
  await sleep(900);
};

// What the conversation looks like right now, read from the page as a visitor would see it.
const STATE = `(() => {
  const shown = (el) => el.offsetParent !== null;
  const log = [...document.querySelectorAll('[role="log"]')].find(shown);
  const input = [...document.querySelectorAll('input[aria-label="Message Waza AI"]')].find(shown);
  const inputBox = input?.getBoundingClientRect();
  const base = {
    busy: Boolean([...document.querySelectorAll('button[aria-label="Stop the answer"]')].find(shown)),
    sendEnabled: Boolean([...document.querySelectorAll('button[aria-label="Send message"]')].find((el) => shown(el) && !el.disabled)),
    input: input ? { value: input.value, visible: inputBox.top >= 0 && inputBox.bottom <= window.innerHeight + 1 && inputBox.width > 100 } : null,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
  // The phone screen opens on a welcome view; the thread appears with the first question.
  if (!log) return { ...base, messages: [], firstSuggestions: [...document.querySelectorAll("button h3")].filter(shown).map((el) => el.textContent.trim()), view: null };
  const rows = [...log.querySelectorAll("[data-waza-message]")];
  const messages = rows.map((row) => {
    const buttons = [...row.querySelectorAll("button")].map((button) => button.textContent.trim());
    return {
      role: row.dataset.wazaMessage,
      status: row.dataset.wazaStatus || null,
      text: row.innerText.trim(),
      alert: row.querySelector('[role="alert"]')?.innerText.trim() || null,
      notes: [...row.querySelectorAll('[role="note"]')].map((note) => note.innerText.trim()),
      retry: buttons.includes("Try again"),
      links: [...row.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")),
      chips: row.querySelectorAll('[aria-label^="Source "]').length,
      waiting: Boolean(row.querySelector('[role="status"]')),
      stopped: /You stopped this answer/.test(row.innerText),
      listItems: row.querySelectorAll("li").length,
      sourcesHeading: /From Wazwan Way|Related on Wazwan Way/i.test(row.innerText),
      suggestions: buttons.filter((text) => text && text !== "Try again"),
      raw: /\\[S\\d+\\]|\\*\\*/.test(row.innerText),
    };
  });
  // Where the reader is looking: the scrolling box, the newest question and the newest answer in it.
  let box = log.parentElement;
  while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement;
  const frame = box?.getBoundingClientRect();
  const question = rows.filter((row) => row.dataset.wazaMessage === "user").at(-1)?.getBoundingClientRect();
  const answer = rows.at(-1)?.getBoundingClientRect();
  const view = box && frame ? { height: Math.round(frame.height), scrollTop: Math.round(box.scrollTop), questionTop: question ? Math.round(question.top - frame.top) : null, answerTop: answer ? Math.round(answer.top - frame.top) : null, below: answer ? Math.round(answer.bottom - frame.bottom) : null } : null;
  return { ...base, messages, firstSuggestions: [...log.querySelectorAll(":scope > div button")].filter((button) => !button.closest("[data-waza-message]")).map((button) => button.textContent.trim()), view };
})()`;
const state = () => evaluate(STATE);
const last = async () => (await state()).messages.at(-1);
const settled = `(() => { const s = ${STATE}; return s && !s.busy && s.messages.length > 0 && !s.messages.at(-1).waiting; })()`;
const scrollThread = (top) => evaluate(`(() => { let box = [...document.querySelectorAll('[role="log"]')].find((el) => el.offsetParent !== null)?.parentElement; while (box && !/(auto|scroll)/.test(getComputedStyle(box).overflowY)) box = box.parentElement; if (!box) return null; box.scrollTop = ${top}; return box.scrollTop; })()`);

async function type(text) {
  await evaluate(`(() => { const input = [...document.querySelectorAll('input[aria-label="Message Waza AI"]')].find((el) => el.offsetParent !== null); input.focus(); return true; })()`);
  await send("Input.insertText", { text });
}
const pressEnter = async () => {
  for (const type of ["keyDown", "keyUp"]) await send("Input.dispatchKeyEvent", { type, key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, nativeVirtualKeyCode: 13, ...(type === "keyDown" ? { text: "\r" } : {}) });
};
/** Types a question, sends it and (by default) waits until the answer has finished one way or another. */
async function ask(text, { wait = true, timeout = 30000 } = {}) {
  const before = (await state()).messages.length;
  await type(text);
  await pressEnter();
  await waitFor(`(() => { const s = ${STATE}; return s && s.messages.length > ${before}; })()`, { label: `question shown: ${text}` });
  if (!wait) return null;
  await waitFor(settled, { timeout, label: `answer finished: ${text}` });
  await sleep(250);
  return last();
}
const clickLabel = (label) => evaluate(`(() => { const el = [...document.querySelectorAll('button[aria-label="${label}"]')].find((el) => el.offsetParent !== null); if (!el) return false; el.click(); return true; })()`);
const clickText = (text) => evaluate(`(() => { const el = [...document.querySelectorAll("button")].find((el) => el.offsetParent !== null && el.textContent.trim() === ${JSON.stringify(text)}); if (!el) return false; el.click(); return true; })()`);

/** The question a request to /chat was asking: the last message in its body. */
const lastQuestion = (body) => {
  try {
    return JSON.parse(body).messages.at(-1).content;
  } catch {
    return null;
  }
};

const results = [];
function check(screen, name, pass, detail = "") {
  results.push({ screen, name, pass: Boolean(pass), detail: pass ? "" : String(detail).slice(0, 400) });
  console.log(`${pass ? "ok  " : "FAIL"} [${screen}] ${name}${pass ? "" : ` :: ${String(detail).slice(0, 400)}`}`);
}

async function conversation(screen) {
  const users = async () => (await state()).messages.filter((message) => message.role === "user").length;

  // ── a good answer
  let answer = await ask("What is Gushtaba?");
  check(screen, "an answer arrives and reads as prose, with no raw markers left in it", answer.role === "assistant" && answer.text.length > 80 && !answer.raw && !answer.alert, JSON.stringify(answer));
  check(screen, "the answer names its pages, each a link into the site", answer.sourcesHeading && answer.links.length > 0 && answer.links.every((href) => href.startsWith("/")), JSON.stringify(answer.links));
  check(screen, "source numbers in the text are links to the page they came from", answer.chips >= 1, `chips ${answer.chips}`);
  check(screen, "it offers what to ask next", answer.suggestions.length >= 2, JSON.stringify(answer.suggestions));
  check(screen, "the composer is free again and nothing overflows sideways", (await state()).sendEnabled === false && (await state()).input.value === "" && (await state()).overflowX <= 0, JSON.stringify(await state().then((s) => ({ input: s.input, overflowX: s.overflowX }))));
  let view = (await state()).view;
  check(screen, "the question and the start of its answer are in view", view && view.questionTop >= -2 && view.answerTop < view.height - 60, JSON.stringify(view));
  await shot(`${screen}-1-answer`);

  // ── a follow-up, by tapping a suggestion
  const suggestion = answer.suggestions[0];
  const before = await users();
  await clickText(suggestion);
  await waitFor(`(() => { const s = ${STATE}; return s.messages.filter((m) => m.role === "user").length > ${before}; })()`, { label: "suggestion asked" });
  await waitFor(settled, { timeout: 30000, label: "suggestion answered" });
  answer = await last();
  check(screen, "tapping a suggestion asks it and gets an answer", (await users()) === before + 1 && answer.text.length > 40 && !answer.alert, JSON.stringify(answer).slice(0, 300));

  // ── a written recipe, with no model in the way
  answer = await ask("recipe for rista");
  check(screen, "a recipe comes as headings, ingredients and numbered steps", /ingredients/i.test(answer.text) && answer.listItems >= 8 && !answer.raw, `items ${answer.listItems}: ${answer.text.slice(0, 160)}`);
  check(screen, "the recipe links to its dish page", answer.links.some((href) => href.startsWith("/dishes/rista")), JSON.stringify(answer.links));
  view = (await state()).view;
  check(screen, "a long answer is read from its beginning: the question sits at the top and the rest runs on below", view && view.questionTop >= -2 && view.questionTop <= 40 && view.below > 100, JSON.stringify(view));
  await shot(`${screen}-2-recipe`);

  // ── a restaurant, with its card
  answer = await ask("Tell me about Ahdoos");
  check(screen, "a restaurant answer carries a card with the checked details and their date", /Ahdoos/.test(answer.text) && /checked/i.test(answer.text) && answer.links.some((href) => href === "/restaurants/ahdoos"), answer.text.slice(-400));
  view = (await state()).view;
  check(screen, "each new question takes the view to itself", view && view.questionTop >= -2 && view.questionTop <= view.height - 80, JSON.stringify(view));
  await shot(`${screen}-3-restaurant`);

  // ── two presses, one question
  const count = await users();
  const askedBefore = requests.filter((body) => lastQuestion(body) === "What is rista?").length;
  await type("What is rista?");
  await pressEnter();
  await pressEnter();
  await waitFor(settled, { timeout: 30000, label: "double press settled" });
  await sleep(300);
  const asked = requests.filter((body) => lastQuestion(body) === "What is rista?").length - askedBefore;
  check(screen, "pressing send twice asks once", (await users()) === count + 1 && asked === 1, `bubbles +${(await users()) - count}, requests ${asked}`);

  // ── every model down
  answer = await ask("What is harissa? #down");
  check(screen, "when every model fails the visitor sees an error, worded for them, not an answer", answer.alert && /trouble|try again/i.test(answer.alert) && !answer.sourcesHeading && !/503|stand-in|provider|sk-/i.test(answer.text), JSON.stringify(answer));
  check(screen, "the error offers Try again and the composer still works", answer.retry && (await state()).input !== null && !(await state()).busy, JSON.stringify(answer));
  await shot(`${screen}-4-error`);
  const requestsBefore = requests.length;
  await clickText("Try again");
  await waitFor(`(() => { const s = ${STATE}; return s.busy || s.messages.at(-1).waiting; })()`, { timeout: 5000, label: "retry started" }).catch(() => null);
  await waitFor(settled, { timeout: 30000, label: "retry settled" });
  check(screen, "Try again asks the same question again, in place of the failed answer", requests.length === requestsBefore + 1 && (await users()) === count + 2, `requests +${requests.length - requestsBefore}, users ${await users()} (wanted ${count + 2})`);

  // ── the first model down, the second answers
  answer = await ask("What is tabak maaz? #failover");
  check(screen, "when the first model fails the second answers, and the visitor only sees the answer", !answer.alert && answer.text.length > 60 && answer.sourcesHeading, JSON.stringify(answer).slice(0, 300));

  // ── cut off partway
  answer = await ask("Tell me about rogan josh #cut");
  check(screen, "an answer cut off partway is marked interrupted, keeps what arrived, and can be retried", answer.alert && /interrupted|incomplete/i.test(answer.alert) && answer.retry && answer.text.replace(answer.alert, "").trim().length > 10 && !answer.sourcesHeading, JSON.stringify(answer));
  await shot(`${screen}-5-interrupted`);

  // ── details nothing supports
  answer = await ask("Is Ahdoos worth it? #invent");
  check(screen, "a price, time and phone number that no source supports are called out under the answer", answer.notes.length === 1 && /4,?999/.test(answer.notes[0]) && /7 am/.test(answer.notes[0]) && /2999999/.test(answer.notes[0]), JSON.stringify(answer.notes));
  await shot(`${screen}-6-notice`);

  // ── stopped by the visitor
  await ask("How is a Wazwan served? #slow", { wait: false });
  await waitFor(`(() => { const s = ${STATE}; return s.busy && s.messages.at(-1).role === "assistant" && !s.messages.at(-1).waiting && s.messages.at(-1).text.length > 40; })()`, { timeout: 20000, label: "slow answer started" });
  await shot(`${screen}-7-streaming`);
  await scrollThread(0);
  await sleep(900);
  const away = await state();
  check(screen, "a reader who scrolls away while an answer arrives is left where they are", away.busy && away.view.scrollTop <= 4, JSON.stringify(away.view));
  const midway = (await last()).text.length;
  await clickLabel("Stop the answer");
  await waitFor(settled, { timeout: 8000, label: "stopped" });
  await sleep(1200);
  answer = await last();
  check(screen, "Stop ends the answer at once, keeps what arrived and says so", answer.stopped && !answer.alert && answer.text.length < midway + 400 && !(await state()).busy, JSON.stringify({ midway, now: answer.text.length, stopped: answer.stopped }));

  check(screen, "Stop reaches the server: the model stops writing too", (await modelCalls(`How is a Wazwan served? #slow`)).every((call) => call.closed), JSON.stringify(await modelCalls("How is a Wazwan served? #slow")));

  // ── the connection drops in the middle of an answer
  const tag = `#drop ${screen}`;
  const callsBefore = (await modelCalls(tag)).length;
  answer = await ask(`Tell me about the wazas ${tag}`, { timeout: 60000 });
  const sentences = answer.text.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.length > 30);
  check(screen, "a connection lost mid-answer is picked up again: the answer finishes, with nothing shown twice", answer.status === "done" && !answer.alert && answer.sourcesHeading && sentences.length >= 3 && new Set(sentences).size === sentences.length, JSON.stringify({ status: answer.status, alert: answer.alert, sentences: sentences.length, unique: new Set(sentences).size, text: answer.text.slice(0, 200) }));
  check(screen, "and the model was asked that question once, not once per connection", (await modelCalls(tag)).length - callsBefore === 1, `asked ${(await modelCalls(tag)).length - callsBefore} time(s)`);

  // ── a model that never answers
  answer = await ask("What is nadru yakhni? #hang", { timeout: 60000 });
  check(screen, "a model that never answers ends in a timeout message, not an endless spinner", answer.alert && /too long|try again/i.test(answer.alert) && answer.retry, JSON.stringify(answer));

  // ── the length limit
  answer = await ask("What is yakhni? #limit");
  check(screen, "an answer stopped at the length limit says it was cut short", answer.notes.some((note) => /cut short/i.test(note)), JSON.stringify(answer.notes));

  // ── too long to send
  await type("x".repeat(2001));
  await sleep(200);
  const long = await evaluate(`(() => ({ hint: /characters over the limit/.test(document.body.innerText), disabled: [...document.querySelectorAll('button[aria-label="Send message"]')].find((el) => el.offsetParent !== null)?.disabled }))()`);
  check(screen, "a message over the limit cannot be sent and says why", long.hint && long.disabled === true, JSON.stringify(long));
  await evaluate(`(() => { const input = [...document.querySelectorAll('input[aria-label="Message Waza AI"]')].find((el) => el.offsetParent !== null); const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set; set.call(input, ""); input.dispatchEvent(new Event("input", { bubbles: true })); return true; })()`);

  return users();
}

try {
  // ───────────────────────────────────────────── desktop: the panel
  const desktop = { width: 1440, height: 900 };
  await goto("/recipes", desktop);
  await evaluate("sessionStorage.clear(); localStorage.clear(); true");
  await goto("/recipes", desktop);
  check("desktop", "the Waza AI button is on the page", await waitFor(`Boolean(document.querySelector('button[aria-label="Open Waza AI Assistant"]'))`, { label: "FAB" }).catch(() => false));
  await clickLabel("Open Waza AI Assistant");
  await waitFor(`(() => { const s = ${STATE}; return s && s.messages.length === 1; })()`, { timeout: 8000, label: "panel open" });
  let s = await state();
  check("desktop", "the panel opens with a greeting and three first questions", /Salaam/.test(s.messages[0].text) && s.firstSuggestions.length === 3 && s.input?.visible, JSON.stringify(s));
  await shot("desktop-0-open");
  const asked = await conversation("desktop");

  // The conversation is still there after going to another page and coming back.
  await goto("/dishes", desktop);
  await clickLabel("Open Waza AI Assistant");
  await waitFor(`(() => { const s = ${STATE}; return s && s.messages.length > 1; })()`, { timeout: 8000, label: "restored" }).catch(() => null);
  s = await state();
  check("desktop", "the conversation is kept while the visitor moves around the site", s && s.messages.filter((message) => message.role === "user").length === asked, `users ${s?.messages.filter((message) => message.role === "user").length} (wanted ${asked})`);
  check("desktop", "an answer that failed with nothing in it is not kept; answers keep their text", s && s.messages.every((message) => message.text.length > 0), "");
  // The conversation is the server's: with this browser's copy thrown away (the id kept), it comes back.
  const savedId = await evaluate(`(() => { const saved = JSON.parse(localStorage.getItem("waza_ai_conversation_v3") || "null"); if (!saved) return null; localStorage.setItem("waza_ai_conversation_v3", JSON.stringify({ ...saved, messages: saved.messages.slice(0, 2) })); return saved.id; })()`);
  await goto("/recipes", desktop);
  await clickLabel("Open Waza AI Assistant");
  await waitFor(`(() => { const s = ${STATE}; return s && s.messages.filter((m) => m.role === "user").length >= ${asked}; })()`, { timeout: 10000, label: "restored from the server" }).catch(() => null);
  s = await state();
  check("desktop", "the conversation comes back from the server's record, with its sources, when this browser's copy is gone", Boolean(savedId) && s && s.messages.filter((message) => message.role === "user").length >= asked && s.messages.some((message) => message.sourcesHeading), `id ${savedId}, users ${s?.messages.filter((message) => message.role === "user").length} (wanted ${asked})`);
  await clickLabel("Start a new conversation");
  await sleep(400);
  s = await state();
  check("desktop", "New conversation clears it", s.messages.length === 1 && /Salaam/.test(s.messages[0].text), JSON.stringify(s.messages.length));

  // A link that carries a question opens the panel and asks it.
  await goto(`/waza-ai?prompt=${encodeURIComponent("Is rista the same as gushtaba?")}`, desktop);
  await waitFor(`(() => { const s = ${STATE}; return s && s.messages.some((m) => m.role === "user" && /rista the same as gushtaba/.test(m.text)); })()`, { timeout: 15000, label: "prompt link asked" }).catch(() => null);
  await waitFor(settled, { timeout: 30000, label: "prompt link answered" }).catch(() => null);
  s = await state();
  check("desktop", "a link carrying a question opens the panel and asks it once", s && s.messages.filter((message) => message.role === "user").length === 1 && s.messages.at(-1).role === "assistant" && s.messages.at(-1).text.length > 40, JSON.stringify(s?.messages.map((m) => [m.role, m.text.slice(0, 60)])));
  await shot("desktop-8-prompt-link");

  // ───────────────────────────────────────────── phone: the full screen
  const phone = { width: 390, height: 844 };
  await goto("/waza-ai", phone);
  // A fresh visitor: no conversation kept in this browser.
  await evaluate("sessionStorage.clear(); localStorage.clear(); true");
  await goto("/waza-ai", phone);
  await waitFor(`(() => { const s = ${STATE}; return s && s.input && s.firstSuggestions.length >= 3; })()`, { timeout: 10000, label: "phone chat ready" });
  s = await state();
  check("phone", "the screen opens on a welcome with questions to tap and the composer in view", s.messages.length === 0 && s.firstSuggestions.length >= 3 && s.input?.visible && s.overflowX <= 0, JSON.stringify(s));
  await shot("phone-0-open");
  await conversation("phone");
  // A tap on a welcome question asks it.
  await clickText("Start a new conversation");
  await waitFor(`(() => { const s = ${STATE}; return s && s.messages.length === 0 && s.firstSuggestions.length >= 3; })()`, { timeout: 8000, label: "phone welcome again" });
  await evaluate(`(() => { [...document.querySelectorAll("button h3")].find((el) => el.offsetParent !== null).closest("button").click(); return true; })()`);
  await waitFor(`(() => { const s = ${STATE}; return s && s.messages.length >= 2; })()`, { timeout: 10000, label: "welcome question asked" });
  await waitFor(settled, { timeout: 30000, label: "welcome question answered" });
  s = await state();
  check("phone", "New conversation returns to the welcome, and tapping one of its questions asks it", s.messages.filter((m) => m.role === "user").length === 1 && s.messages.at(-1).role === "assistant" && s.messages.at(-1).text.length > 40 && !s.messages.at(-1).alert, JSON.stringify(s.messages.map((m) => [m.role, m.text.slice(0, 50)])));
  await shot("phone-9-after-welcome-question");
  check("phone", "after a long conversation nothing overflows sideways and the composer is still in view", s.overflowX <= 0 && s.input?.visible, JSON.stringify({ overflowX: s.overflowX, input: s.input }));
} catch (error) {
  check("run", "the run completed", false, error.stack || error.message);
  await shot("failure").catch(() => {});
}

const unexpected = consoleErrors.filter((line) => !/Failed to load resource/.test(line));
check("both", "no script errors in the console", unexpected.length === 0, unexpected.slice(0, 5).join(" | "));
const failed = results.filter((result) => !result.pass);
fs.writeFileSync(path.join(OUT, "results.json"), JSON.stringify({ base: BASE, ranAt: new Date().toISOString(), passed: results.length - failed.length, failed: failed.length, results, consoleErrors }, null, 2));
console.log(`\n${results.length - failed.length} passed, ${failed.length} failed. Screenshots and results.json in ${OUT}`);
if (consoleErrors.length) console.log(`console (${consoleErrors.length}):`, [...new Set(consoleErrors)].slice(0, 8));
ws.close();
chrome.kill();
try {
  fs.rmSync(profile, { recursive: true, force: true });
} catch {
  // The profile is in the temp folder; the system clears it.
}
process.exit(failed.length ? 1 : 0);
