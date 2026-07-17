/*!
 * liquid-glass — Apple-style liquid glass refraction for any element.
 * Ported to an ES module from the `liquid-glass` skill (deepika-builds/liquid-glass, MIT).
 * Optics unchanged; the only edits are the ESM wrapper and a lazy, SSR-safe
 * support check (the original computed `supported` at load time via `navigator`,
 * which crashes Next.js server rendering).
 *
 * API: liquidGlass(el, { scale, chroma, border, mapBlur, blur, saturate,
 *                        radius, fallbackBlur }) -> { supported, refresh, destroy }
 */

const SVG_NS = "http://www.w3.org/2000/svg";
let uid = 0;
let svgDefs = null;
let _supported = null;

// Chromium can apply SVG filters via backdrop-filter; Safari and Firefox
// silently no-op, so they get the frosted fallback instead. Computed lazily
// (first call happens in a client effect) so importing this on the server is safe.
function getSupported() {
  if (_supported !== null) return _supported;
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  if (isSafari || isFirefox) return (_supported = false);
  if (!CSS.supports("backdrop-filter", "url(#lg)")) return (_supported = false);
  try {
    const c = document.createElement("canvas");
    c.width = c.height = 4;
    c.getContext("2d").getImageData(0, 0, 1, 1);
    return (_supported = true);
  } catch (_) {
    return (_supported = false);
  }
}

function ensureDefs() {
  if (svgDefs) return svgDefs;
  const svg = document.createElementNS(SVG_NS, "svg");
  // width/height 0 keeps it renderable (display:none would break feImage)
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.setAttribute("aria-hidden", "true");
  svg.style.position = "absolute";
  svgDefs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(svgDefs);
  document.body.appendChild(svg);
  return svgDefs;
}

// Displacement map, gradient-difference method: a red left->right ramp encodes
// X displacement, a blue top->bottom ramp encodes Y ("difference" keeps both
// since the channels are disjoint). A blurred, inset 50%-gray rounded rect
// neutralizes the interior, confining the refraction bulge to an edge band
// whose curvature is set by the blur radius.
function makeMap(w, h, radius, border, mapBlur) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  const gx = ctx.createLinearGradient(0, 0, w, 0);
  gx.addColorStop(0, "rgb(0,0,0)");
  gx.addColorStop(1, "rgb(255,0,0)");
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, w, h);

  const gy = ctx.createLinearGradient(0, 0, 0, h);
  gy.addColorStop(0, "rgb(0,0,0)");
  gy.addColorStop(1, "rgb(0,0,255)");
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, w, h);

  ctx.globalCompositeOperation = "source-over";
  const inset = border * Math.min(w, h);
  ctx.filter = "blur(" + mapBlur + "px)";
  ctx.fillStyle = "rgba(128,128,128,0.93)";
  ctx.beginPath();
  ctx.roundRect(inset, inset, w - inset * 2, h - inset * 2, Math.max(radius - inset, 2));
  ctx.fill();
  ctx.filter = "none";
  return canvas.toDataURL();
}

// Three displacement passes at staggered scales (R strongest), channels
// isolated with feColorMatrix and recombined with screen blends — the faint
// prism fringe at the rim.
function buildFilter(id, scales) {
  const filter = document.createElementNS(SVG_NS, "filter");
  filter.setAttribute("id", id);
  filter.setAttribute("x", "0");
  filter.setAttribute("y", "0");
  filter.setAttribute("width", "100%");
  filter.setAttribute("height", "100%");
  // Load-bearing: filters default to linearRGB, which re-maps the map's neutral
  // gray 128 to ~0.216 and injects a constant phantom displacement.
  filter.setAttribute("color-interpolation-filters", "sRGB");

  const feImage = document.createElementNS(SVG_NS, "feImage");
  feImage.setAttribute("x", "0");
  feImage.setAttribute("y", "0");
  feImage.setAttribute("result", "map");
  feImage.setAttribute("preserveAspectRatio", "none");
  filter.appendChild(feImage);

  const keep = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0",
  ];
  const channels = [];
  for (let i = 0; i < 3; i++) {
    const disp = document.createElementNS(SVG_NS, "feDisplacementMap");
    disp.setAttribute("in", "SourceGraphic");
    disp.setAttribute("in2", "map");
    disp.setAttribute("scale", scales[i]);
    disp.setAttribute("xChannelSelector", "R");
    disp.setAttribute("yChannelSelector", "B");
    disp.setAttribute("result", "d" + i);
    filter.appendChild(disp);

    const cm = document.createElementNS(SVG_NS, "feColorMatrix");
    cm.setAttribute("in", "d" + i);
    cm.setAttribute("type", "matrix");
    cm.setAttribute("values", keep[i]);
    cm.setAttribute("result", "c" + i);
    filter.appendChild(cm);
    channels.push("c" + i);
  }

  const blend1 = document.createElementNS(SVG_NS, "feBlend");
  blend1.setAttribute("in", channels[0]);
  blend1.setAttribute("in2", channels[1]);
  blend1.setAttribute("mode", "screen");
  blend1.setAttribute("result", "c01");
  filter.appendChild(blend1);

  const blend2 = document.createElementNS(SVG_NS, "feBlend");
  blend2.setAttribute("in", "c01");
  blend2.setAttribute("in2", channels[2]);
  blend2.setAttribute("mode", "screen");
  filter.appendChild(blend2);

  ensureDefs().appendChild(filter);
  return { filter, feImage };
}

function resolveRadius(el, w, h, override) {
  if (override != null) return override;
  const raw = getComputedStyle(el).borderTopLeftRadius || "0px";
  const v = parseFloat(raw) || 0;
  return raw.trim().endsWith("%") ? (v / 100) * Math.min(w, h) : v;
}

export function liquidGlass(el, opts) {
  const o = Object.assign(
    { scale: -112, chroma: 6, border: 0.07, mapBlur: 12, blur: 3, saturate: 1.5, radius: null, fallbackBlur: 16 },
    opts
  );

  if (!getSupported()) {
    const frosted = "blur(" + o.fallbackBlur + "px) saturate(" + o.saturate + ")";
    el.style.backdropFilter = frosted;
    el.style.webkitBackdropFilter = frosted;
    el.classList.add("lg-fallback");
    return {
      supported: false,
      refresh: function () {},
      destroy: function () {
        el.style.backdropFilter = "";
        el.style.webkitBackdropFilter = "";
        el.classList.remove("lg-fallback");
      },
    };
  }

  const id = "lg-filter-" + (++uid);
  const scales = [o.scale, o.scale + o.chroma, o.scale + 2 * o.chroma];
  const parts = buildFilter(id, scales);

  function refresh() {
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!w || !h) return;
    const radius = resolveRadius(el, w, h, o.radius);
    parts.feImage.setAttribute("href", makeMap(w, h, radius, o.border, o.mapBlur));
    parts.feImage.setAttribute("width", w);
    parts.feImage.setAttribute("height", h);
  }

  refresh();
  el.style.backdropFilter = "url(#" + id + ") blur(" + o.blur + "px) saturate(" + o.saturate + ")";

  let timer = null;
  const ro = new ResizeObserver(function () {
    clearTimeout(timer);
    timer = setTimeout(refresh, 120);
  });
  ro.observe(el);

  return {
    supported: true,
    refresh: refresh,
    destroy: function () {
      ro.disconnect();
      clearTimeout(timer);
      parts.filter.remove();
      el.style.backdropFilter = "";
    },
  };
}
