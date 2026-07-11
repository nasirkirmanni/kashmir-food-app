const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

const targetBlock = `<div className="filmstrip reveal" id="photo-strip" style={{"marginTop":"56px"}}>
    <div className="filmstrip-track">
      <div className="fcard fcard-lg"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Srinagar</h4><span className="mono">2–3 Days · High crowd</span></div></div>
      <div className="fcard"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Gulmarg</h4><span className="mono">1–2 Days · High crowd</span></div></div>
      <div className="fcard"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div></div>
      <div className="fcard fcard-lg"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Adventure</div><div className="fcard-copy"><h4>Aru Valley</h4><span className="mono">1 Day · Moderate</span></div></div>
    </div>
  </div>`;

const replacementBlock = `<div className="filmstrip reveal" id="photo-strip" style={{"marginTop":"56px"}}>
    <div className="filmstrip-track">
      <div className="fcard fcard-lg"><img src="/images/srinagar.jpg" /><div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Srinagar</h4><span className="mono">2–3 Days · High crowd</span></div></div>
      <div className="fcard"><img src="/images/gul.jpg" /><div className="fcard-tag">Family</div><div className="fcard-copy"><h4>Gulmarg</h4><span className="mono">1–2 Days · High crowd</span></div></div>
      <div className="fcard"><img src="/images/gurez.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/lolab.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div></div>
      <div className="fcard fcard-lg"><img src="/images/aru.png" /><div className="fcard-tag">Adventure</div><div className="fcard-copy"><h4>Aru Valley</h4><span className="mono">1 Day · Moderate</span></div></div>
    </div>
  </div>`;

js = js.replace(targetBlock, replacementBlock);
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
