"use client";

import { useRouter } from "next/navigation";

/** Goes back like the browser, or to the food hub when there is no history to return to. */
export default function BackLink({ className, arrowClassName, fallbackHref = "/kashmiri-food" }) {
  const router = useRouter();

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button type="button" onClick={goBack} className={className}>
      <span className={arrowClassName} aria-hidden="true">
        ←
      </span>
      Back
    </button>
  );
}
