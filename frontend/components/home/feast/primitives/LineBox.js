import f from "../feast.module.css";

/**
 * One display line in a box that clips it, as tall as the line: the line can rise into place on entry
 * (FeastMotion). It fits its column at default spacing and wraps, growing its box, only when a reader's
 * text-spacing override makes it longer (feast.module.css). `index` staggers lines that rise together;
 * `descender` gives lines with j, y, p, g or a display-size comma the deeper box. When a heading uses two
 * LineBoxes, put {" "} between them so the heading reads with its space.
 */
export default function LineBox({ index = 0, descender = false, className = "", children }) {
  return (
    <span className={`${f.lineBox} ${descender ? f.lineBoxDesc : ""} ${className}`}>
      <span className={f.lineInner} style={{ "--i": index }}>{children}</span>
    </span>
  );
}
