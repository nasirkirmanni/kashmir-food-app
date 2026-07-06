const fs = require('fs');
let content = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

// The BACK buttons
content = content.replace(/className="wazwan-btn-ghost text-xs uppercase tracking-widest font-bold px-6 py-3/g, 
  'className="wazwan-btn-ghost text-[10px] sm:text-xs uppercase tracking-widest font-bold px-4 py-2 sm:px-6 sm:py-3');

// The NEXT buttons
content = content.replace(/className="wazwan-btn-primary rounded-full px-8 py-3 text-xs uppercase/g, 
  'className="wazwan-btn-primary rounded-full px-5 py-2 sm:px-8 sm:py-3 text-[10px] sm:text-xs uppercase');

// specific to step 8 next button since I just changed it to px-6 py-3
content = content.replace(/className="wazwan-btn-primary rounded-full px-6 py-3 text-xs uppercase/g, 
  'className="wazwan-btn-primary rounded-full px-5 py-2 sm:px-6 sm:py-3 text-[10px] sm:text-xs uppercase');

fs.writeFileSync('frontend/app/plan/page.js', content);
