"use client";

import React from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { prepareAnswer } from "@/lib/wazaStream";

/**
 * A conversation with Waza AI as it is shown: the visitor's questions, Waza's answers with the
 * pages they came from, anything the visitor should check, and what to ask next. Used by the
 * desktop panel and the phone screen, which differ only in their frame and avatar.
 */

const GOLD = "#D4A15A";

function AnswerLink({ href = "", children, sources, onNavigate }) {
  const source = /^#waza-source-(\d+)$/.exec(href);
  if (source) {
    const found = sources.find((item) => item.n === Number(source[1]));
    const label = `Source ${source[1]}${found ? `: ${found.title}` : ""}`;
    const chip = "ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[rgba(212,161,90,0.4)] px-1 align-[1px] text-[10px] font-semibold leading-none text-[#D4A15A] no-underline";
    if (!found?.url) return <span className={chip} title={label} aria-label={label}>{children}</span>;
    return (
      <Link href={found.url} prefetch={false} className={`${chip} hover:bg-[rgba(212,161,90,0.15)]`} title={label} aria-label={label} onClick={onNavigate}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} prefetch={false} className="text-[#D4A15A] underline underline-offset-2" onClick={onNavigate}>
        {children}
      </Link>
    );
  }
  // The model is told not to write web addresses; one that slips through opens away from the site.
  if (/^https?:\/\//.test(href)) return <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="text-[#D4A15A] underline underline-offset-2">{children}</a>;
  return <span>{children}</span>;
}

const markdownFor = (sources, onNavigate) => ({
  p: ({ node, ...props }) => <p className="mb-3 last:mb-0 text-[13.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.84)" }} {...props} />,
  ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-3 last:mb-0 space-y-1.5 text-[13.5px]" style={{ color: "rgba(255,255,255,0.8)" }} {...props} />,
  ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-3 last:mb-0 space-y-1.5 text-[13.5px]" style={{ color: "rgba(255,255,255,0.8)" }} {...props} />,
  li: ({ node, ...props }) => <li className="pl-0.5 leading-relaxed" {...props} />,
  strong: ({ node, ...props }) => <strong className="font-semibold" style={{ color: GOLD }} {...props} />,
  h1: ({ node, ...props }) => <p className="text-[15px] font-bold mt-4 mb-2 first:mt-0" style={{ color: GOLD }} {...props} />,
  h2: ({ node, ...props }) => <p className="text-[14.5px] font-bold mt-3 mb-1.5 first:mt-0" style={{ color: GOLD }} {...props} />,
  h3: ({ node, ...props }) => <p className="text-[11px] font-bold uppercase tracking-[0.14em] mt-4 mb-1.5 first:mt-0" style={{ color: GOLD }} {...props} />,
  code: ({ node, ...props }) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono" style={{ color: GOLD }} {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="border-l-2 pl-3 italic my-3" style={{ borderColor: GOLD, color: "rgba(255,255,255,0.55)" }} {...props} />,
  a: ({ node, href, children }) => <AnswerLink href={href} sources={sources} onNavigate={onNavigate}>{children}</AnswerLink>,
});

function Waiting({ message }) {
  const count = message.sources?.filter((source) => source.url).length || 0;
  const line = message.phase === "reading" && count ? `Reading ${count} ${count === 1 ? "page" : "pages"} of Wazwan Way` : "Looking through Wazwan Way";
  return (
    <span className="flex items-center gap-2.5" role="status" aria-live="polite">
      <span className="text-[12.5px] italic" style={{ color: "rgba(255,255,255,0.5)" }}>{line}</span>
      <span className="flex items-center gap-1" aria-hidden="true">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse" style={{ background: GOLD, animationDelay: `${dot * 180}ms` }} />
        ))}
      </span>
    </span>
  );
}

function Sources({ message, onNavigate }) {
  const linked = (message.sources || []).filter((source) => source.url);
  if (!linked.length) return null;
  const cited = (message.cited || []).map((n) => linked.find((source) => source.n === n)).filter(Boolean);
  // What the answer cited; where it cited nothing, the pages it was given.
  const shown = (cited.length ? cited : linked).filter((source, i, list) => list.findIndex((other) => other.url.replace(/#.*$/, "") === source.url.replace(/#.*$/, "")) === i).slice(0, 4);
  return (
    <div className="mt-3 border-t border-white/[0.07] pt-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: "rgba(255,255,255,0.4)" }}>{cited.length ? "From Wazwan Way" : "Related on Wazwan Way"}</p>
      <ul className="mt-1.5 flex flex-col gap-1">
        {shown.map((source) => (
          <li key={source.url} className="flex items-baseline gap-2 text-[12.5px] leading-snug">
            {cited.length ? <span className="shrink-0 text-[10px] font-semibold tabular-nums" style={{ color: GOLD }}>{source.n}</span> : null}
            <Link href={source.url} prefetch={false} onClick={onNavigate} className="underline decoration-white/20 underline-offset-2 hover:decoration-[#D4A15A]" style={{ color: "rgba(255,255,255,0.78)" }}>
              {source.title}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Card({ card, onNavigate }) {
  const line = card.kind === "restaurant" ? [card.type, card.area].filter(Boolean).join(" · ") : card.kind === "dish" ? [card.second, card.category, card.diet].filter(Boolean).join(" · ") : [card.area, card.season].filter(Boolean).join(" · ");
  const more = card.kind === "restaurant" ? "What the sources say" : card.kind === "dish" ? (card.hasRecipe ? "The dish and its recipe" : "The dish page") : "The place";
  return (
    <Link href={card.url} prefetch={false} onClick={onNavigate} className="block rounded-[14px] border border-white/[0.08] bg-white/[0.03] px-3.5 py-3 transition-colors hover:border-[rgba(212,161,90,0.4)]">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[13.5px] font-semibold" style={{ color: "#F4ECDF" }}>{card.name}</span>
        {card.status ? <span className="shrink-0 rounded-full border border-[rgba(226,182,108,0.5)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#E2B66C" }}>{card.status}</span> : null}
      </span>
      {line ? <span className="mt-0.5 block text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>{line}</span> : null}
      {card.kind === "restaurant" && (card.phone || card.hours) ? (
        <span className="mt-1.5 block text-[12px] leading-snug" style={{ color: "rgba(255,255,255,0.7)" }}>
          {[card.hours, card.phone].filter(Boolean).join(" · ")}
          <span style={{ color: "rgba(255,255,255,0.4)" }}> (checked {card.checked})</span>
        </span>
      ) : null}
      <span className="mt-1.5 block text-[11.5px] font-medium" style={{ color: GOLD }}>{more} →</span>
    </Link>
  );
}

const WazaMessage = React.memo(function WazaMessage({ message, avatar, isLast, busy, onRetry, onSuggestion, onNavigate }) {
  if (message.role === "user") {
    return (
      <div className="flex w-full justify-end" data-waza-message="user">
        <div className="max-w-[84%] whitespace-pre-wrap break-words rounded-[18px] rounded-tr-[4px] bg-gradient-to-br from-[#D4A15A] to-[#B8892A] px-4 py-3 text-[14px] font-medium leading-relaxed text-[#0B0B0B] shadow-[0_4px_16px_rgba(212,161,90,0.2)]">
          {message.content}
        </div>
      </div>
    );
  }
  const waiting = message.status === "streaming" && !message.content;
  const sources = message.sources || [];
  return (
    <div className="flex w-full justify-start" data-waza-message="assistant" data-waza-status={message.status}>
      <div className="mr-3 mt-1 shrink-0">{avatar}</div>
      <div className="min-w-0 max-w-[86%]">
        <div className="rounded-[18px] rounded-tl-[4px] border border-white/5 border-l-2 border-l-[#D4A15A] bg-[#111111] px-4 py-3 text-white/90 shadow-sm">
          {waiting ? (
            <Waiting message={message} />
          ) : message.content ? (
            <ReactMarkdown components={markdownFor(sources, onNavigate)}>{prepareAnswer(message.content, sources)}</ReactMarkdown>
          ) : null}
          {message.status === "stopped" ? <p className="mt-2 text-[11.5px] italic" style={{ color: "rgba(255,255,255,0.45)" }}>You stopped this answer.</p> : null}
          {(message.notices || []).map((notice) => (
            <p key={notice.code + notice.message} role="note" className="mt-3 rounded-[10px] border border-[rgba(226,182,108,0.35)] bg-[rgba(226,182,108,0.07)] px-3 py-2 text-[12px] leading-snug" style={{ color: "#EBCB94" }}>
              {notice.message}
            </p>
          ))}
          {message.status === "error" ? (
            <div role="alert" className={`${message.content ? "mt-3 border-t border-white/[0.07] pt-3" : ""}`}>
              <p className="text-[13px] leading-snug" style={{ color: "#F0B8A8" }}>{message.error?.message}</p>
              {message.error?.retryable && isLast ? (
                <button type="button" onClick={onRetry} disabled={busy} className="mt-2.5 rounded-full border border-[rgba(212,161,90,0.5)] px-3.5 py-1.5 text-[12px] font-semibold text-[#D4A15A] transition-colors hover:bg-[rgba(212,161,90,0.12)] disabled:opacity-40">
                  Try again
                </button>
              ) : null}
            </div>
          ) : null}
          {message.status === "done" && !message.greeting ? <Sources message={message} onNavigate={onNavigate} /> : null}
        </div>
        {message.status === "done" && message.cards?.length ? (
          <div className="mt-2 flex flex-col gap-2">
            {message.cards.map((card) => (
              <Card key={card.url} card={card} onNavigate={onNavigate} />
            ))}
          </div>
        ) : null}
        {isLast && !busy && message.status === "done" && message.suggestions?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion) => (
              <button key={suggestion} type="button" onClick={() => onSuggestion(suggestion)} className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-left text-[12.5px] font-medium text-white/80 transition-colors hover:border-[rgba(212,161,90,0.4)] hover:bg-[rgba(212,161,90,0.1)] hover:text-white">
                {suggestion}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default function WazaThread({ messages, busy, avatar, onRetry, onSuggestion, onNavigate, firstSuggestions = [] }) {
  return (
    <div className="flex flex-col gap-5" role="log" aria-live="polite" aria-relevant="additions text">
      {messages.map((message, i) => (
        <WazaMessage key={message.id} message={message} avatar={avatar} isLast={i === messages.length - 1} busy={busy} onRetry={onRetry} onSuggestion={onSuggestion} onNavigate={onNavigate} />
      ))}
      {messages.length === 1 && !busy && firstSuggestions.length ? (
        <div className="flex flex-wrap gap-2">
          {firstSuggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => onSuggestion(suggestion)} className="relative z-10 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white/80 transition-colors hover:border-[rgba(212,161,90,0.4)] hover:bg-[rgba(212,161,90,0.1)] hover:text-white">
              {suggestion}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The box a question is typed into, with send, and stop while an answer is arriving. */
export function WazaComposer({ value, onChange, onSend, onStop, busy, className = "", inputClassName = "", icon = null, style }) {
  const tooLong = value.length > 2000;
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy && value.trim() && !tooLong) onSend(value);
      }}
      className={className}
      style={style}
    >
      {icon}
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Ask about a dish, recipe or place…"
        aria-label="Message Waza AI"
        aria-invalid={tooLong || undefined}
        enterKeyHint="send"
        autoComplete="off"
        maxLength={2200}
        className={inputClassName}
        style={{ caretColor: GOLD }}
      />
      {busy ? (
        <button type="button" onClick={onStop} aria-label="Stop the answer" className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(212,161,90,0.5)] text-[#D4A15A] transition-colors hover:bg-[rgba(212,161,90,0.12)]">
          <span aria-hidden="true" className="block h-3 w-3 rounded-[2px] bg-current" />
        </button>
      ) : (
        <button
          type="submit"
          disabled={!value.trim() || tooLong}
          aria-label="Send message"
          className="absolute right-2 flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200"
          style={{
            background: value.trim() && !tooLong ? "linear-gradient(135deg, #D4A15A 0%, #B8892A 100%)" : "rgba(255,255,255,0.08)",
            color: value.trim() && !tooLong ? "#0B0B0B" : "rgba(255,255,255,0.2)",
            boxShadow: value.trim() && !tooLong ? "0 2px 12px rgba(212,161,90,0.3)" : "none",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
          </svg>
        </button>
      )}
      {tooLong ? <span className="absolute -top-5 right-3 text-[11px]" style={{ color: "#F0B8A8" }}>{value.length - 2000} characters over the limit</span> : null}
    </form>
  );
}
