const fs = require('fs');

let css = fs.readFileSync('frontend/app/kashmiri-food/kashmiri.css', 'utf8');

// Fix the image paths
css = css.replace(/image_3\.jpg/g, 'wazwan.webp');
css = css.replace(/image_4\.jpg/g, 'beverages.webp');
css = css.replace(/image_5\.jpg/g, 'bakery.webp');
css = css.replace(/image_6\.jpg/g, 'street-food.webp');

// Append chapter dial css if not present
if (!css.includes('.chapter-dial')) {
  css += `
/* ---------------- CHAPTER DIAL (floating round nav) ---------------- */
.chapter-dial{
  position:fixed; top:96px; right:40px; z-index:85;
  width:104px; height:104px;
  opacity:0; transform:translateY(-12px) scale(0.94);
  pointer-events:none;
  transition:opacity .45s ease, transform .45s ease;
}
.chapter-dial.visible{ opacity:1; transform:translateY(0) scale(1); pointer-events:auto; }
.dial-ring{ position:absolute; inset:0; width:100%; height:100%; transform:rotate(-90deg); }
.dial-ring-bg{ fill:none; stroke:var(--line, rgba(244,236,223,0.12)); stroke-width:2.5; }
.dial-ring-fill{
  fill:none; stroke:var(--gold, #d4a256); stroke-width:2.5; stroke-linecap:round;
  stroke-dasharray:264; stroke-dashoffset:264;
  transition:stroke-dashoffset .6s cubic-bezier(.16,1,.3,1);
}
.dial-face{
  position:absolute; inset:16px; border-radius:50%;
  background:rgba(18,14,11,0.72);
  backdrop-filter:blur(10px);
  border:1px solid var(--line, rgba(244,236,223,0.12));
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; gap:2px;
}
.dial-name{ font-family:var(--font-mono, 'IBM Plex Mono', monospace); font-size:0.62rem; letter-spacing:0.05em; text-transform:uppercase; color:var(--gold, #d4a256); transition:opacity .2s ease; }
.dial-count{ font-family:var(--font-mono, 'IBM Plex Mono', monospace); font-size:0.52rem; color:var(--ivory-dim, #cfc4b3); }
.dial-stop{
  position:absolute; top:50%; left:50%; width:11px; height:11px;
  margin:-5.5px; border-radius:50%;
  background:var(--charcoal-900, #16110d); border:1.5px solid var(--gold-soft, rgba(212,162,86,0.45));
  transform:translate(-50%,-50%) rotate(var(--angle)) translate(52px) rotate(calc(-1 * var(--angle)));
  cursor:pointer; padding:0;
  transition:background .25s ease, border-color .25s ease, transform .3s ease;
}
.dial-stop:hover{ border-color:var(--gold, #d4a256); }
.dial-stop.active{ background:var(--gold, #d4a256); border-color:var(--gold, #d4a256); }
@media (max-width:900px){ .chapter-dial{ display:none; } }
`;
}

fs.writeFileSync('frontend/app/kashmiri-food/kashmiri.css', css);
console.log('CSS Patched successfully');
