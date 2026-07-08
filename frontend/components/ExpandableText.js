"use client";

import { useState } from "react";

export default function ExpandableText({ text, className = "", threshold = 120 }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const isLong = text.length > threshold;

  return (
    <div className="relative w-full">
      <p className={`${className} ${isLong && !isExpanded ? 'line-clamp-2 md:line-clamp-none' : ''}`}>
        {text}
      </p>
      {isLong && (
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-[var(--saffron)] font-bold text-[0.65rem] uppercase tracking-widest mt-2 md:hidden transition-colors hover:text-white"
        >
          {isExpanded ? "Show Less" : "Read More"}
        </button>
      )}
    </div>
  );
}
