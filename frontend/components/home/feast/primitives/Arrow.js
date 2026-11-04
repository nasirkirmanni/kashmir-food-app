/**
 * The page's one arrow, drawn in currentColor. The arrow character is in neither the Inter nor the Bodoni
 * latin subset, so it is never set as text in this tree.
 */
export default function Arrow({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor"
      strokeWidth="1.6" strokeLinecap="square" aria-hidden="true" focusable="false">
      <path d="M3 12h17M14 6l6 6-6 6" />
    </svg>
  );
}
