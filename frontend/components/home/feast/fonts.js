import { Bodoni_Moda } from "next/font/google";

// The homepage's display face: Bodoni Moda with its optical-size axis, so headlines from about 60px
// up get the fine display cut the owner approved in the preview deck (the layout's --font-bodoni is
// the 11pt text cut). Upright for every headline, italic for the one gold word. Not preloaded and no
// generated fallback face: only the desktop tree (display:none on phones) uses it, so phones never
// fetch it, and while it loads the stack falls through to the layout's already-loaded Bodoni.
export const feastDisplay = Bodoni_Moda({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  variable: "--font-feast-display",
});
