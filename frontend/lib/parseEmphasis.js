import React, { Fragment } from "react";

/**
 * Parses a string containing **bold** markers and returns a React node
 * where the bolded text is wrapped in an <em> tag with a specific class.
 * 
 * @param {string} text - The input string, e.g. "Out of the city, into **pine**."
 * @returns {React.ReactNode} - The parsed React elements
 */
export function parseEmphasis(text) {
  if (!text) return null;

  // Split by **
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
          return (
            <em key={index} className="gold-em" style={{ color: "var(--gold-bright)", fontStyle: "italic" }}>
              {part.slice(2, -2)}
            </em>
          );
        }
        return <Fragment key={index}>{part}</Fragment>;
      })}
    </>
  );
}
