"use client";
import { useEffect, useRef } from "react";

/**
 * The Ask section's ways into Waza AI. Waza's panel (components/WazaAI.js, mounted by the layout) listens for
 * two window events: "open-waza-ai-prompt" opens it and sends the event's text at once, and
 * "open-waza-ai-intro" opens its introduction. The panel handles sending, errors and limits itself.
 * - AskButton asks one of the section's questions.
 * - AskForm sends a typed question. Its input has no name, so typed text never goes into a URL, and the text
 *   stays in the box after sending. Without JavaScript the form opens the Waza AI page, which describes Waza.
 * - OpenWaza opens the introduction; without JavaScript, or with a modifier key held, it is a plain link to
 *   the Waza AI page.
 * The panel never takes focus itself, so each way in carries keyboard focus into it and back (follow, below).
 * Waza loads on the client only, so an event sent before it mounts is dropped, as it is for the top bar's
 * WAZA AI button. Nothing typed is lost: the field is never cleared.
 */

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" aria-hidden="true" focusable="false">
    <path d="M3 12h17M14 6l6 6-6 6" />
  </svg>
);
const send = (text) => window.dispatchEvent(new CustomEvent("open-waza-ai-prompt", { detail: text }));

// After a way in fires, focus moves onto the panel's Close button once Waza draws it (at once for a question,
// after the 2.5s introduction for OpenWaza; it waits 8s at most), and back to the control that opened the
// panel once that button leaves the page, which is when the panel closes. OpenWaza on an open panel swaps its
// chat, Close button and all, for the introduction, so that watch (fresh) waits for the new button. It never
// takes focus from where a reader has moved it: the Close button only takes it from the opener or <body>, and
// the opener only gets it back from <body>. Watches the page as SearchTrigger does; one watch at a time, a
// new one replacing the old.
const CLOSE = 'button[aria-label="Close Chat Window"]';
let watch = null;

function follow(opener, owner, fresh = false) {
  watch?.stop();
  const leaving = fresh ? document.querySelector(CLOSE) : null; // an open chat's button, on its way out
  let shown = false;
  let timer = 0;
  const mo = new MutationObserver(() => check());
  const stop = () => {
    mo.disconnect();
    clearTimeout(timer);
    if (watch?.stop === stop) watch = null;
  };
  const check = () => {
    const found = document.querySelector(CLOSE);
    const close = found === leaving ? null : found;
    const active = document.activeElement;
    const idle = !active || active === document.body;
    if (!shown) {
      if (!close) return;
      shown = true;
      clearTimeout(timer);
      if (idle || active === opener) close.focus({ preventScroll: true });
    } else if (!close) {
      stop();
      if (idle && opener?.isConnected) opener.focus({ preventScroll: true });
    }
  };
  watch = { stop, owner };
  mo.observe(document.body, { childList: true, subtree: true });
  timer = setTimeout(stop, 8000);
  check();
}

/** Each way in follows the panel; its watch stops when it unmounts. */
function useFollow() {
  const owner = useRef({});
  useEffect(() => () => { if (watch?.owner === owner.current) watch.stop(); }, []);
  return (opener, fresh) => follow(opener, owner.current, fresh);
}

export function AskButton({ prompt, label, srContext, className }) {
  const followPanel = useFollow();
  return (
    <button type="button" className={className} onClick={(e) => { send(prompt); followPanel(e.currentTarget); }}>
      {label}<span className="sr-only">: {srContext}</span><Arrow />
    </button>
  );
}

export function AskForm({ labels, classNames, children }) {
  const input = useRef(null);
  const followPanel = useFollow();
  return (
    <form action="/waza-ai" method="get" className={classNames.form}
      onSubmit={(e) => {
        e.preventDefault();
        const text = input.current.value.trim();
        if (!text) { input.current.focus(); return; }
        // The opener is the field or the button, whichever had focus; the button if neither (a click in Safari).
        const active = document.activeElement;
        const opener = e.currentTarget.contains(active) ? active : e.nativeEvent.submitter || input.current;
        send(text); // the text stays in the box; Waza's panel shows what was sent
        followPanel(opener);
      }}>
      <label htmlFor="feast-ask-input" className={classNames.label}>{labels.fieldLabel}</label>
      {/* no name attribute: typed text never goes into a URL */}
      <input ref={input} id="feast-ask-input" type="text" required autoComplete="off" enterKeyHint="send" className={classNames.input} />
      <div className={classNames.row}>
        <button type="submit" className={classNames.submit}>{labels.submit}<Arrow /></button>
        {children}
      </div>
    </form>
  );
}

export function OpenWaza({ href, label, className }) {
  const followPanel = useFollow();
  return (
    <a href={href} className={className}
      onClick={(e) => {
        // A modified or non-primary click (a new tab or window) keeps the plain link, and opens no panel.
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        window.dispatchEvent(new Event("open-waza-ai-intro"));
        followPanel(e.currentTarget, true);
      }}>
      {label}<Arrow />
    </a>
  );
}
