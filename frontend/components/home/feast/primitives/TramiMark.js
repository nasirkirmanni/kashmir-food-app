/**
 * A copper trami seen from above: the Name band's disc (§5.1) until a credited photograph of one exists.
 * A Tram disc with Sarposh engraving and a darker rice centre; `topText` runs clockwise over the top and
 * `bottomText` along the foot, so every name reads upright and both stay clear of the word that crosses
 * the disc's left side. `ringClassName` goes on the group that holds the names: the section turns it once
 * on entry and hides it, with its caption, below 1024px, where the names would set under 11px. The styles
 * are inline because SVG presentation attributes do not take var(); the colours come from the feast tokens.
 */
export default function TramiMark({ topText, bottomText, className, ringClassName }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true" focusable="false">
      <defs>
        {/* clockwise over the top, 245° to 355°, r 266: glyphs stand outward, reading left to right */}
        <path id="feast-trami-top" d="M 187.6 58.9 A 266 266 0 0 1 565.0 276.8" />
        {/* counter-clockwise along the bottom, 165° to 15°, r 278: glyphs stand inward, upright */}
        <path id="feast-trami-bottom" d="M 31.5 371.9 A 278 278 0 0 0 568.5 371.9" />
      </defs>
      <circle cx="300" cy="300" r="299" style={{ fill: "var(--f-tram)" }} />
      <circle cx="300" cy="300" r="236" style={{ fill: "none", stroke: "var(--f-sarposh)", strokeOpacity: 0.55, strokeWidth: 1, vectorEffect: "non-scaling-stroke" }} />
      <circle cx="300" cy="300" r="214" strokeDasharray="2 6" style={{ fill: "none", stroke: "var(--f-sarposh)", strokeOpacity: 0.45, strokeWidth: 1, vectorEffect: "non-scaling-stroke" }} />
      <circle cx="300" cy="300" r="176" style={{ fill: "none", stroke: "var(--f-sarposh)", strokeOpacity: 0.3, strokeWidth: 1, vectorEffect: "non-scaling-stroke" }} />
      <circle cx="300" cy="300" r="96" style={{ fill: "var(--f-sarposh)", fillOpacity: 0.18 }} />
      <g className={ringClassName}>
        <text style={{ fontFamily: "var(--f-mono)", fontSize: 16, letterSpacing: 1, fill: "var(--f-kagaz)" }}>
          <textPath href="#feast-trami-top" startOffset="50%" textAnchor="middle">{topText}</textPath>
        </text>
        <text style={{ fontFamily: "var(--f-mono)", fontSize: 16, letterSpacing: 1, fill: "var(--f-kagaz)" }}>
          <textPath href="#feast-trami-bottom" startOffset="50%" textAnchor="middle">{bottomText}</textPath>
        </text>
      </g>
    </svg>
  );
}
