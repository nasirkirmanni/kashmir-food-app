const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

const regex = /<div className="collections-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;

const correctJsx = `<div className="collections-grid">
      <div className="collection-hero reveal tilt-card">
        <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2MDAgNDAwIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAiIHkxPSIwIiB4Mj0iMSIgeTI9IjEiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjMTcxYjEzIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iNTUlIiBzdG9wLWNvbG9yPSIjMjAyNDFhIi8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzJiMjIxNiIvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjYwMCIgaGVpZ2h0PSI0MDAiIGZpbGw9InVybCgjZykiLz4KICA8cGF0aCBkPSJNLTIwLDMyMCBRMTUwLDI4MCAzMDAsMzIwIFQ2MjAsMzEwIiBmaWxsPSJub25lIiBzdHJva2U9IiNjZmM3YWUiIHN0cm9rZS1vcGFjaXR5PSIwLjA5IiBzdHJva2Utd2lkdGg9IjEuNCIgc3Ryb2tlLWRhc2hhcnJheT0iMiAxMCIvPgogIDxwYXRoIGQ9Ik0tMjAsMzU1IFExNTAsMzE4IDMwMCwzNTUgVDYyMCwzNDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NmYzdhZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDYiIHN0cm9rZS13aWR0aD0iMS40IiBzdHJva2UtZGFzaGFycmF5PSIyIDEwIi8+CiAgPHBhdGggZD0iTS0yMCw0MDAgTC0yMCwzMDAgTDgwLDIzMCBMMTcwLDI5MCBMMjYwLDIwMCBMMzUwLDI4MCBMNDQwLDE5MCBMNTMwLDI3MCBMNjIwLDI0MCBMNjIwLDQwMCBaIiBmaWxsPSIjMGMwZjBiIiBmaWxsLW9wYWNpdHk9IjAuNTUiLz4KICA8cGF0aCBkPSJNLTIwLDQwMCBMLTIwLDM0MCBMMTAwLDI3MCBMMjEwLDMzMCBMMzIwLDI1MCBMNDMwLDMyMCBMNTQwLDI2MCBMNjIwLDMwMCBMNjIwLDQwMCBaIiBmaWxsPSIjMGMwZjBiIiBmaWxsLW9wYWNpdHk9IjAuOSIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjE3NiIgcj0iNSIgZmlsbD0iI2NlN2MzZSIvPgogIDxjaXJjbGUgY3g9IjMwMCIgY3k9IjE3NiIgcj0iMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2NlN2MzZSIgc3Ryb2tlLW9wYWNpdHk9IjAuNCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KPC9zdmc+" alt="Snow destinations" />
        <div className="collection-hero-scrim"></div>
        <span className="pill">4 Locations</span>
        <div className="collection-hero-copy">
          <h3 className="serif">Snow Destinations</h3>
          <p>Where the valley turns silent and white.</p>
          <div className="stat-row mono">
            <span>4 STOPS</span><span>·</span><span>3 DAYS</span><span>·</span><span>MODERATE</span>
          </div>
          <a href="#" className="collection-link">Explore collection <span>→</span></a>
        </div>
      </div>

      <ul className="collection-list reveal">
        <li className="active"><span className="mono">02</span><div><p>Hidden Gems</p><small>Untouched valleys, quietly kept</small></div><span className="arrow">→</span></li>
        <li><span className="mono">03</span><div><p>Photography Spots</p><small>Light worth waiting for</small></div><span className="arrow">→</span></li>
        <li><span className="mono">04</span><div><p>Scenic Drives</p><small>Winding valleys, endless stories</small></div><span class="arrow">→</span></li>
        <li><span className="mono">05</span><div><p>Food Trails</p><small>The seven-course wazwan tradition</small></div><span className="arrow">→</span></li>
        <li><span className="mono">06</span><div><p>Trekking &amp; Camping</p><small>Sleep under deodar pines</small></div><span className="arrow">→</span></li>
        <li><span className="mono">07</span><div><p>Best By Season</p><small>Winter wonderland, mapped</small></div><span className="arrow">→</span></li>
      </ul>
    </div>
  </div>
</section>`;

js = js.replace(regex, correctJsx);
fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
