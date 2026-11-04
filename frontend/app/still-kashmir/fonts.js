import { Gilda_Display, Jost } from "next/font/google";

// Still Kashmir's own faces, as stillkashmir.com sets them: Gilda Display for display type and Jost for
// text. Self-hosted by next/font (the site's CSP blocks Google's font servers) and loaded on this page only.
export const skDisplay = Gilda_Display({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-sk-display",
});

export const skBody = Jost({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sk-body",
});
