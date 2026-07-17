"use client";

// Itinerary Builder — StepFlow engine (T4)
//
// Generic, data-driven multi-step flow. Renders ANY step from a declarative
// schema (see data/itineraryIntakeSchema.js). Owns: conditional visibility,
// progress, validation, back/continue, focus management, reduced-motion.
// Premium, mobile-first styling; accessible (aria-pressed options, labelled
// controls, progressbar, focus moves to each step heading).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const GOLD = "#C8A46A";

function isStepValid(step, answers) {
  if (!step) return false;
  const value = answers[step.key];
  if (typeof step.validate === "function" && !step.validate(value)) return false;
  if (!step.required) return true;

  switch (step.type) {
    case "multi-select":
      return Array.isArray(value) && value.length >= (step.min || 1);
    case "single-select":
      return typeof value === "string" && value.length > 0;
    case "duration":
      return typeof value === "number" && value >= step.min && value <= step.max;
    case "counter-group":
      return step.validate ? true : value && Object.values(value).some((n) => n > 0);
    case "text-group":
      return step.fields.filter((f) => f.required).every((f) => value?.[f.key]?.trim());
    case "date-range":
      return true; // dates never hard-required in this flow
    default:
      return value != null;
  }
}

export default function StepFlow({ schema, initial = {}, onComplete, onExit }) {
  const reduce = useReducedMotion();
  const [answers, setAnswers] = useState(initial);
  const [cursor, setCursor] = useState(0); // index into the full schema
  const [dir, setDir] = useState(1);
  const headingRef = useRef(null);

  const visibleSteps = useMemo(
    () => schema.filter((s) => (s.visibleWhen ? s.visibleWhen(answers) : true)),
    [schema, answers]
  );

  // Keep the cursor on a visible step.
  useEffect(() => {
    const step = schema[cursor];
    if (step && step.visibleWhen && !step.visibleWhen(answers)) {
      const nextVisible = schema.findIndex((s, i) => i > cursor && (!s.visibleWhen || s.visibleWhen(answers)));
      if (nextVisible !== -1) setCursor(nextVisible);
    }
  }, [answers, cursor, schema]);

  const step = schema[cursor];
  const posInVisible = visibleSteps.findIndex((s) => s.id === step?.id);
  const total = visibleSteps.length;
  const stepNumber = posInVisible + 1;
  const valid = isStepValid(step, answers);
  const isLast = posInVisible === total - 1;

  // Move focus to the heading on every step change (screen-reader orientation).
  useEffect(() => {
    if (headingRef.current) headingRef.current.focus({ preventScroll: true });
  }, [step?.id]);

  const setValue = useCallback((key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }, []);

  const goNext = () => {
    if (!valid) return;
    const nextIdx = schema.findIndex((s, i) => i > cursor && (!s.visibleWhen || s.visibleWhen(answers)));
    if (nextIdx === -1) {
      onComplete?.(answers);
    } else {
      setDir(1);
      setCursor(nextIdx);
    }
  };

  const goPrev = () => {
    const prevIdx = [...schema.keys()].reverse().find((i) => i < cursor && (!schema[i].visibleWhen || schema[i].visibleWhen(answers)));
    if (prevIdx === undefined) {
      onExit?.();
    } else {
      setDir(-1);
      setCursor(prevIdx);
    }
  };

  const variants = reduce
    ? { enter: { opacity: 1, x: 0 }, center: { opacity: 1, x: 0 }, exit: { opacity: 1, x: 0 } }
    : {
        enter: (d) => ({ opacity: 0, x: d > 0 ? 24 : -24 }),
        center: { opacity: 1, x: 0 },
        exit: (d) => ({ opacity: 0, x: d > 0 ? -24 : 24 }),
      };

  if (!step) return null;

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span
            className="text-[0.6rem] font-semibold uppercase tracking-[0.2em]"
            style={{ color: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
          >
            Step {stepNumber} of {total}
          </span>
          <span className="text-[0.6rem] text-white/40 tabular-nums" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
            {Math.round((stepNumber / total) * 100)}%
          </span>
        </div>
        <div
          className="h-1 w-full rounded-full bg-white/10 overflow-hidden"
          role="progressbar"
          aria-valuenow={stepNumber}
          aria-valuemin={1}
          aria-valuemax={total}
          aria-label={`Step ${stepNumber} of ${total}`}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: GOLD }}
            animate={{ width: `${(stepNumber / total) * 100}%` }}
            transition={reduce ? { duration: 0 } : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      {/* Step card */}
      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={step.id}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reduce ? { duration: 0 } : { duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl sm:text-3xl font-medium text-white outline-none leading-tight"
            style={{ fontFamily: "var(--font-bodoni, var(--font-display, serif))" }}
          >
            {step.title}
          </h2>
          {step.subtitle && <p className="text-white/55 text-sm mt-2 mb-6">{step.subtitle}</p>}
          {!step.subtitle && <div className="mb-6" />}

          <StepRenderer step={step} value={answers[step.key]} setValue={(v) => setValue(step.key, v)} />
        </motion.div>
      </AnimatePresence>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3 mt-8 pt-5 border-t border-white/10">
        <button
          type="button"
          onClick={goPrev}
          className="min-h-[44px] px-5 rounded-full text-xs font-semibold uppercase tracking-widest text-white/70 border border-white/15 hover:border-white/30 hover:text-white transition-colors"
          style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}
        >
          {posInVisible === 0 ? "Exit" : "← Back"}
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!valid}
          className="min-h-[44px] px-7 rounded-full text-xs font-bold uppercase tracking-widest text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: GOLD, fontFamily: "var(--font-jetbrains-mono, monospace)" }}
        >
          {isLast ? "Build my itinerary" : "Continue →"}
        </button>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
// Renderers
// --------------------------------------------------------------------------

function StepRenderer({ step, value, setValue }) {
  switch (step.type) {
    case "single-select":
      return <SelectGrid step={step} value={value} setValue={setValue} multi={false} />;
    case "multi-select":
      return <SelectGrid step={step} value={value || []} setValue={setValue} multi />;
    case "counter-group":
      return <CounterGroup step={step} value={value || {}} setValue={setValue} />;
    case "duration":
      return <DurationPicker step={step} value={value ?? step.default} setValue={setValue} />;
    case "date-range":
      return <DateRange step={step} value={value || {}} setValue={setValue} />;
    default:
      return null;
  }
}

function optionActive(multi, value, v) {
  return multi ? Array.isArray(value) && value.includes(v) : value === v;
}

function SelectGrid({ step, value, setValue, multi }) {
  const toggle = (v) => {
    if (multi) {
      const arr = Array.isArray(value) ? value : [];
      setValue(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
    } else {
      setValue(v);
    }
  };
  const cols = step.options.length > 6 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2";
  return (
    <div role="group" aria-label={step.title} className={`grid ${cols} gap-2.5`}>
      {step.options.map((opt) => {
        const active = optionActive(multi, value, opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={active}
            onClick={() => toggle(opt.value)}
            className={`min-h-[52px] text-left rounded-xl border px-4 py-3 transition-all ${
              active ? "text-black font-semibold" : "text-white bg-white/[0.03] border-white/10 hover:border-white/25"
            }`}
            style={active ? { background: GOLD, borderColor: GOLD } : undefined}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{opt.label}</span>
              {active && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            {opt.desc && <div className={`text-[0.68rem] mt-0.5 ${active ? "text-black/70" : "text-white/45"}`}>{opt.desc}</div>}
          </button>
        );
      })}
    </div>
  );
}

function CounterGroup({ step, value, setValue }) {
  const get = (k) => value[k] ?? step.items.find((i) => i.key === k)?.default ?? 0;
  const set = (k, n, min, max) => setValue({ ...value, [k]: Math.min(max, Math.max(min, n)) });
  return (
    <div className="flex flex-col gap-2.5">
      {step.items.map((item) => {
        const n = get(item.key);
        return (
          <div key={item.key} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div>
              <div className="text-sm font-medium text-white">{item.label}</div>
              {item.desc && <div className="text-[0.68rem] text-white/45">{item.desc}</div>}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => set(item.key, n - 1, item.min, item.max)}
                disabled={n <= item.min}
                aria-label={`Decrease ${item.label}`}
                className="w-11 h-11 rounded-full border border-white/15 text-white text-lg leading-none disabled:opacity-30 hover:border-white/35 transition-colors"
              >
                −
              </button>
              <span className="w-6 text-center text-white font-semibold tabular-nums" aria-live="polite">{n}</span>
              <button
                type="button"
                onClick={() => set(item.key, n + 1, item.min, item.max)}
                disabled={n >= item.max}
                aria-label={`Increase ${item.label}`}
                className="w-11 h-11 rounded-full border text-black text-lg leading-none disabled:opacity-30 transition-colors"
                style={{ background: GOLD, borderColor: GOLD }}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DurationPicker({ step, value, setValue }) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {step.presets.map((p) => {
          const active = value === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => setValue(p)}
              aria-pressed={active}
              className={`min-h-[52px] rounded-xl border transition-all ${
                active ? "text-black font-bold" : "text-white bg-white/[0.03] border-white/10 hover:border-white/25"
              }`}
              style={active ? { background: GOLD, borderColor: GOLD } : undefined}
            >
              <span className="text-base">{p}</span>
              <span className="block text-[0.6rem] opacity-70">{step.unit}</span>
            </button>
          );
        })}
      </div>
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-baseline justify-between mb-3">
          <label htmlFor="duration-slider" className="text-[0.6rem] uppercase tracking-widest text-white/50" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
            Custom
          </label>
          <span className="text-2xl font-medium" style={{ color: GOLD, fontFamily: "var(--font-bodoni, serif)" }}>
            {value} {step.unit}
          </span>
        </div>
        <input
          id="duration-slider"
          type="range"
          min={step.min}
          max={step.max}
          value={value}
          onChange={(e) => setValue(parseInt(e.target.value, 10))}
          aria-valuetext={`${value} ${step.unit}`}
          className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/10"
          style={{ accentColor: GOLD }}
        />
        <div className="flex justify-between text-[0.6rem] text-white/40 mt-2">
          <span>{step.min}</span>
          <span>{step.max} {step.unit}</span>
        </div>
      </div>
    </div>
  );
}

function DateRange({ value, setValue }) {
  const set = (k, v) => setValue({ ...value, [k]: v });
  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-widest text-white/50" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>Arrival</span>
          <input
            type="date"
            value={value.startDate || ""}
            onChange={(e) => set("startDate", e.target.value)}
            className="min-h-[48px] rounded-xl border border-white/10 bg-white/[0.03] px-3 text-white text-sm [color-scheme:dark]"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-[0.6rem] uppercase tracking-widest text-white/50" style={{ fontFamily: "var(--font-jetbrains-mono, monospace)" }}>Departure</span>
          <input
            type="date"
            value={value.endDate || ""}
            min={value.startDate || undefined}
            onChange={(e) => set("endDate", e.target.value)}
            className="min-h-[48px] rounded-xl border border-white/10 bg-white/[0.03] px-3 text-white text-sm [color-scheme:dark]"
          />
        </label>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={!!value.flexible}
        onClick={() => set("flexible", !value.flexible)}
        className={`min-h-[44px] rounded-xl border px-4 text-sm flex items-center justify-between transition-colors ${
          value.flexible ? "text-black font-semibold" : "text-white/70 bg-white/[0.03] border-white/10"
        }`}
        style={value.flexible ? { background: GOLD, borderColor: GOLD } : undefined}
      >
        My dates are flexible
        <span className={`text-xs ${value.flexible ? "text-black/70" : "text-white/40"}`}>{value.flexible ? "On" : "Off"}</span>
      </button>
    </div>
  );
}
