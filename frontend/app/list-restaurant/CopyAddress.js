"use client";

import { useRef, useState } from "react";
import styles from "./listRestaurant.module.css";

/**
 * The address as text a visitor can select, with a button that copies it: an e-mail link does
 * nothing on a computer with no mail program set up, and the address must still be reachable there.
 */
export default function CopyAddress({ address }) {
  const [copied, setCopied] = useState(false);
  const textRef = useRef(null);
  const timer = useRef(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2400);
    } catch {
      // No clipboard here (an older browser, or permission refused): select the address instead.
      const range = document.createRange();
      range.selectNodeContents(textRef.current);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  return (
    <p className={styles.address}>
      <span className={styles.addressLabel}>Send everything to</span>
      <span className={styles.addressRow}>
        <span ref={textRef} className={styles.addressText}>
          {address}
        </span>
        <button type="button" className={styles.copy} onClick={copy}>
          {copied ? "Copied" : "Copy"}
        </button>
      </span>
      <span className={styles.srOnly} role="status" aria-live="polite">
        {copied ? "Address copied" : ""}
      </span>
    </p>
  );
}
