const fs = require('fs');
let js = fs.readFileSync('frontend/app/explore/ExploreClient.js', 'utf8');

// replace <br> with <br />
js = js.replace(/<br>/g, '<br />');

// replace <hr> with <hr />
js = js.replace(/<hr>/g, '<hr />');

// replace <img> without self-closing
js = js.replace(/<img([^>]*?)([^\/])>/g, '<img$1$2 />');

// replace <input> without self-closing
js = js.replace(/<input([^>]*?)([^\/])>/g, '<input$1$2 />');

// Also fix stroke-width etc if they were missed in fix_client.js
js = js.replace(/stroke-width/g, 'strokeWidth')
  .replace(/stroke-dasharray/g, 'strokeDasharray')
  .replace(/stroke-dashoffset/g, 'strokeDashoffset')
  .replace(/stroke-linecap/g, 'strokeLinecap')
  .replace(/stroke-linejoin/g, 'strokeLinejoin')
  .replace(/fill-opacity/g, 'fillOpacity')
  .replace(/stroke-opacity/g, 'strokeOpacity')
  .replace(/for=/g, 'htmlFor=');

fs.writeFileSync('frontend/app/explore/ExploreClient.js', js);
