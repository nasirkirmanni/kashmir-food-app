"use client";

import { useEffect } from "react";

/**
 * The directory keeps its reference sections folded (<details>). A link that points at one of them,
 * or at something inside one, should arrive with it open: this opens the fold the address names,
 * on arrival and whenever the address changes. Renders nothing.
 */
export default function OpenOnArrival() {
  useEffect(() => {
    const open = () => {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return;
      }
      if (!id) return;
      const target = document.getElementById(id);
      const fold = target?.closest("details");
      if (!fold || fold.open) return;
      fold.open = true;
      target.scrollIntoView({ block: "start" });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);
  return null;
}
