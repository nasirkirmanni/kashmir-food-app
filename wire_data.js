const fs = require('fs');
let code = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

// 1. Collections Grid
const collGridRegex = /<div className="collections-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
const newCollGrid = `<div className="collections-grid">
      {data.collections?.slice(0, 1).map((c, i) => (
        <div key={i} className="collection-hero reveal tilt-card">
          <img src={c.image || 'DATA_URI'} alt={c.name} />
          <div className="collection-hero-scrim"></div>
          <span className="pill">{c.itemsCount} Locations</span>
          <div className="collection-hero-copy">
            <h3 className="serif">{c.name}</h3>
            <p>{c.description || 'Where the valley turns silent and white.'}</p>
            <div className="stat-row mono">
              <span>{c.itemsCount} STOPS</span><span>·</span><span>3 DAYS</span><span>·</span><span>MODERATE</span>
            </div>
          </div>
        </div>
      ))}
      <div className="collection-list reveal" style={{transitionDelay: ".2s"}}>
        {data.collections?.slice(1, 4).map((c, i) => (
          <div key={i} className="collection-list-item tilt-card group">
            <img src={c.image || 'DATA_URI'} alt={c.name} />
            <div className="collection-list-scrim"></div>
            <div className="collection-list-copy">
              <span className="mono">{c.itemsCount} LOCATIONS</span>
              <h4>{c.name}</h4>
              <p>{c.description || 'Step back in time through the old city.'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>`;

code = code.replace(collGridRegex, newCollGrid);

fs.writeFileSync('frontend/app/explore/ExploreClient.js', code);
