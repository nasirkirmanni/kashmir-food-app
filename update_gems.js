const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

// The block to replace
const targetBlock = `<div className="filmstrip-track">
      <div className="fcard fcard-lg"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Yusmarg</h4><span className="mono">Half Day · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div></div>
      <div className="fcard fcard-lg"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Doodhpathri</h4><span className="mono">1 Day · Moderate</span></div></div>
      <div className="fcard"><img src="/images/snow-jump.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Daksum</h4><span className="mono">2 Days · Low crowd</span></div></div>
    </div>`;

const replacementBlock = `<div className="filmstrip-track">
      <div className="fcard fcard-lg"><img src="/images/yusm.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Yusmarg</h4><span className="mono">Half Day · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/gurez.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Gurez Valley</h4><span className="mono">2 Days · Low crowd</span></div></div>
      <div className="fcard"><img src="/images/lolab.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Lolab Valley</h4><span className="mono">1 Day · Low crowd</span></div></div>
      <div className="fcard fcard-lg"><img src="/images/doodhpathri.png" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Doodhpathri</h4><span className="mono">1 Day · Moderate</span></div></div>
      <div className="fcard"><img src="/images/daksum.jpg" /><div className="fcard-tag">Hidden Gem</div><div className="fcard-copy"><h4>Daksum</h4><span className="mono">2 Days · Low crowd</span></div></div>
    </div>`;

js = js.replace(targetBlock, replacementBlock);
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
