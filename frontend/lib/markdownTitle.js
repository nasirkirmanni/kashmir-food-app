// Article markdown often opens with "# <title>", which the page already renders as
// its <h1>; drop that line so the heading isn't repeated.
export function stripLeadingTitle(markdown, title) {
  const normalise = (s) => (s || "").replace(/\s+/g, " ").trim().toLowerCase();
  return (markdown || "").replace(/^\s*#\s+([^\n]*)\n/, (line, heading) =>
    normalise(heading) === normalise(title) ? "" : line
  );
}
