const fs = require('fs');

let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

// Step 5
code = code.replace(/desc: "Independent adventure exploring Kashmir at your own pace."/g, 'desc: "Independent adventure"');
code = code.replace(/desc: "Romantic getaway with private and cozy experiences."/g, 'desc: "Romantic getaway"');
code = code.replace(/desc: "All ages comfort with accessible routes and kid-friendly dining."/g, 'desc: "All ages comfort"');
code = code.replace(/desc: "Group exploration, active excursions, and fun group dining."/g, 'desc: "Group exploration"');
code = code.replace(/desc: "Work-friendly stays with premium amenities and quiet environments."/g, 'desc: "Work-friendly stays"');
code = code.replace(/h-28/g, 'h-auto py-5');

// Step 6
code = code.replace(/desc: "April to May \(Badamwari blossoms & vibrant tulip gardens\)"/g, 'desc: "April to May"');
code = code.replace(/desc: "June to August \(Lush green alpine meadows & pleasant weather\)"/g, 'desc: "June to August"');
code = code.replace(/desc: "September to November \(Golden Chinars & fresh saffron harvest\)"/g, 'desc: "Sept to Nov"');
code = code.replace(/desc: "December to March \(Snow resorts, skiing & warm Harissa\)"/g, 'desc: "Dec to March"');
code = code.replace(/desc: "Select specific arrival and departure dates for your itinerary"/g, 'desc: "Custom dates"');
code = code.replace(/h-36/g, 'h-auto py-5');

// Step 7
code = code.replace(/desc: "Local dhabas, street carts, and comfortable pocket-friendly stays"/g, 'desc: "Pocket-friendly stays"');
code = code.replace(/desc: "Standard family restaurants, cafes, and cozy hotel accommodations"/g, 'desc: "Cozy hotels & cafes"');
code = code.replace(/desc: "Comfort-focused dining, specialized cuisines, and boutique lodgings"/g, 'desc: "Boutique lodgings"');
code = code.replace(/desc: "Fine dining wazwan, exclusive transport, and five-star heritage resorts"/g, 'desc: "Five-star heritage resorts"');
code = code.replace(/desc: "Set a custom daily budget limit in ₹ INR for your entire trip"/g, 'desc: "Custom limit"');

// Step 8
code = code.replace(/desc: "Rogan Josh, Gushtaba, and multi-course sharing platters"/g, 'desc: "Multi-course platters"');
code = code.replace(/desc: "Khayam Chowk charcoal barbecue, seekh kebabs, and wraps"/g, 'desc: "Charcoal barbecue"');
code = code.replace(/desc: "Local baked breads \(Girda, Bakerkhani\) paired with morning tea"/g, 'desc: "Local baked breads"');
code = code.replace(/desc: "Saffron, green tea, cinnamon and almond sweet infusions"/g, 'desc: "Saffron & green tea"');
code = code.replace(/desc: "Fresh mountain stream trout shallow-fried in local spices"/g, 'desc: "Fresh mountain trout"');
code = code.replace(/desc: "Dum Aelve potatoes, Ruwangan Chaman cheese, and Haak greens"/g, 'desc: "Dum Aloo & Haak"');

fs.writeFileSync('frontend/app/plan/page.js', code);
console.log('Replacements completed.');
