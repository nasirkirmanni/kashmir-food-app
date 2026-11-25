"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ANALYTICS_STORAGE,
  CONSENT_CHANGED,
  GA_MEASUREMENT_ID,
  NECESSARY_STORAGE,
  OPEN_COOKIE_SETTINGS,
  browserStorage,
  gpcSignal,
  initialConsent,
  readConsent,
  writeConsent,
} from "@/lib/consent";
import styles from "./consent.module.css";

function StorageList({ items }) {
  return (
    <ul className={styles.stored}>
      {items.map((item) => (
        <li key={item.name}>
          <span className={styles.storedName}>
            <code>{item.name}</code> {item.kind}
          </span>
          <span>{item.purpose}</span>
          <span className={styles.storedKept}>Kept {item.kept}.</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * The cookie question. On a first visit it asks once: Decline and Accept all carry the same weight,
 * with Manage beside them. Manage, or "Cookie settings" anywhere on the site
 * (components/CookieSettingsButton.js), shows the same panel on its settings: what is always stored,
 * and a switch for analytics. It is a panel in a corner of the screen, not a dialog over the page:
 * nothing on the site waits for an answer, and analytics stays off until there is one.
 */
export default function ConsentBanner() {
  // null: closed. "ask": the first question. "manage": the settings.
  const [view, setView] = useState(null);
  const [analyticsOn, setAnalyticsOn] = useState(false);
  // The settings were reached from the question (Back returns to it) and not from "Cookie settings".
  const [fromQuestion, setFromQuestion] = useState(false);
  const [gpc, setGpc] = useState(false);
  // Counts the deliberate openings and changes of view; each one moves keyboard focus to the heading.
  const [moves, setMoves] = useState(0);
  const heading = useRef(null);
  // Whatever opened the settings, to hand focus back to afterwards.
  const opener = useRef(null);

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return undefined;
    setGpc(gpcSignal(navigator));
    if (initialConsent(browserStorage(), navigator) === null) setView("ask");
    const openSettings = () => {
      opener.current = document.activeElement;
      setAnalyticsOn(readConsent(browserStorage()) === "granted");
      setFromQuestion(false);
      setView("manage");
      setMoves((count) => count + 1);
    };
    window.addEventListener(OPEN_COOKIE_SETTINGS, openSettings);
    return () => window.removeEventListener(OPEN_COOKIE_SETTINGS, openSettings);
  }, []);

  // Opened or changed on purpose, so keyboard focus moves to the panel's heading. A first visit leaves
  // focus alone.
  useEffect(() => {
    if (moves) heading.current?.focus();
  }, [moves]);

  const close = () => {
    opener.current?.focus?.();
    opener.current = null;
    setView(null);
  };

  const choose = (analytics) => {
    writeConsent(browserStorage(), analytics);
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED, { detail: analytics }));
    close();
  };

  const manage = () => {
    setAnalyticsOn(false);
    setFromQuestion(true);
    setView("manage");
    setMoves((count) => count + 1);
  };

  // Leaving the settings without saving: back to the question it came from, or simply closed.
  const leave = () => {
    if (!fromQuestion) return close();
    setView("ask");
    setMoves((count) => count + 1);
    return undefined;
  };

  if (!view) return null;

  if (view === "ask") {
    return (
      <section className={styles.panel} aria-labelledby="consent-title" aria-describedby="consent-text">
        <h2 ref={heading} tabIndex={-1} id="consent-title" className={styles.title}>
          Cookies on Wazwan Way
        </h2>
        <p id="consent-text" className={styles.text}>
          The site needs one cookie to work. With your permission we would also use Google Analytics cookies, to count visits
          and see which pages are read. Nothing optional is set unless you accept. <Link href="/privacy#cookies">Privacy policy</Link>
        </p>
        <div className={styles.choices}>
          <button type="button" className={styles.quiet} onClick={manage}>
            Manage
          </button>
          <button type="button" className={styles.choice} onClick={() => choose("denied")}>
            Decline
          </button>
          <button type="button" className={styles.choice} onClick={() => choose("granted")}>
            Accept all
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.panel} ${styles.settings}`}
      aria-labelledby="consent-title"
      onKeyDown={(event) => {
        if (event.key === "Escape") leave();
      }}
    >
      <div>
        <h2 ref={heading} tabIndex={-1} id="consent-title" className={styles.title}>
          Cookie settings
        </h2>
        <p className={styles.text}>
          Choose what Wazwan Way may keep in this browser. You can come back to this at any time from “Cookie settings”, at
          the foot of a page or in the menu.
        </p>
      </div>

      <div className={styles.groups}>
        <div className={styles.group}>
          <div className={styles.groupHead}>
            <h3 className={styles.groupName}>Necessary</h3>
            <span className={styles.always}>Always on</span>
          </div>
          <p className={styles.groupText}>
            One security cookie, and a few notes this browser keeps so the site remembers what you have already seen or chosen.
            The site does not work without them.
          </p>
          <details className={styles.details}>
            <summary>What is stored</summary>
            <StorageList items={NECESSARY_STORAGE} />
          </details>
        </div>

        <div className={styles.group}>
          <div className={styles.groupHead}>
            <h3 className={styles.groupName} id="consent-analytics">
              Analytics
            </h3>
            <button
              type="button"
              role="switch"
              aria-checked={analyticsOn}
              aria-labelledby="consent-analytics"
              className={styles.switch}
              onClick={() => setAnalyticsOn((on) => !on)}
            >
              <span className={styles.switchState}>{analyticsOn ? "On" : "Off"}</span>
              <span className={styles.track} aria-hidden="true">
                <span className={styles.thumb} />
              </span>
            </button>
          </div>
          <p className={styles.groupText}>
            Google Analytics counts visits and shows us which pages are read, which helps us improve the guides. Its advertising
            features are switched off. It is not loaded at all unless this is on.
          </p>
          {gpc ? (
            <p className={styles.note}>
              Your browser sends a Global Privacy Control signal, so this stays off unless you switch it on here.
            </p>
          ) : null}
          <details className={styles.details}>
            <summary>What is stored</summary>
            <StorageList items={ANALYTICS_STORAGE} />
          </details>
        </div>
      </div>

      <div>
        <div className={styles.actions}>
          <button type="button" className={styles.quiet} onClick={leave}>
            {fromQuestion ? "Back" : "Close"}
          </button>
          <button type="button" className={styles.save} onClick={() => choose(analyticsOn ? "granted" : "denied")}>
            Save choices
          </button>
        </div>
        <p className={styles.foot}>
          <Link href="/privacy#cookies">Privacy policy</Link>
        </p>
      </div>
    </section>
  );
}
