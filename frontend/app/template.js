"use client";

import { motion } from "framer-motion";

export default function Template({ children }) {
  // Entrance animates OPACITY ONLY — deliberately no `filter` or `transform`.
  // Either of those (even a resting `blur(0px)` / `translate(0)`) makes this
  // wrapper the containing block for every `position: fixed` descendant, which
  // breaks the homepage's scroll-pinned hero (the stage pins to this div and
  // scrolls away instead of staying fixed to the viewport). framer re-writes the
  // resting `animate` value to inline style on every re-render, so a filter here
  // can't be reliably cleared after the fact. Opacity creates a stacking context
  // but NOT a fixed-containing block, so the pin is always safe.
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
