// SVG presentation attributes do not take var(), so each ring styles itself inline and strokes in
// currentColor: the element the vessel sits in sets its colour.
const RING = { fill: "none", stroke: "currentColor", strokeWidth: 1, vectorEffect: "non-scaling-stroke" };

/**
 * The vessel, seen from above: the four engraved rings of the dish pages' empty-vessel mark (DishPhoto,
 * which stays as it is), drawn here for the seven's panel. `part` picks the rings: "rim" is the faint outer
 * ring and the solid one (r 97 and 86 of 100), drawn over a photograph to frame it; "well" is the dashed
 * ring and the faint inner one (r 73 and 46), which would cross a photograph, so only an empty vessel shows
 * them; anything else draws all four. Decorative; a 1:1 viewBox, sized by its className.
 */
export default function Vessel({ className, part = "all" }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true" focusable="false">
      {part === "well" ? null : (
        <>
          <circle cx="100" cy="100" r="97" opacity="0.35" style={RING} />
          <circle cx="100" cy="100" r="86" style={RING} />
        </>
      )}
      {part === "rim" ? null : (
        <>
          <circle cx="100" cy="100" r="73" strokeDasharray="2 5" style={RING} />
          <circle cx="100" cy="100" r="46" opacity="0.35" style={RING} />
        </>
      )}
    </svg>
  );
}
