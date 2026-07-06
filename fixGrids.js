const fs = require('fs');
let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

// The messed up step 4
const step4Regex = /\{\/\* STEP 4: Travel Style \(Multi-select\) \*\/\}([\s\S]*?)<div className=\"grid grid-cols-2 gap-4 mb-8\">([\s\S]*?)<\/div>\s*<div className=\"flex justify-between border-t border-white\/5 pt-6\">/m;

// Let's replace the grid content of step 4
const correctStep4Grid = `
                  {[
                    { label: "Food Lover", value: "Food Lover", desc: "Authentic cuisine" },
                    { label: "Luxury Traveler", value: "Luxury Traveler", desc: "Premium resorts" },
                    { label: "Adventure Seeker", value: "Adventure Seeker", desc: "Active trekking" },
                    { label: "Family Vacation", value: "Family Vacation", desc: "Kid-friendly" },
                    { label: "Couple / Honeymoon", value: "Couple / Honeymoon", desc: "Romantic getaways" },
                    { label: "Cultural Explorer", value: "Cultural Explorer", desc: "Heritage sites" }
                  ].map((item) => {
                    const isSelected = selectedStyles.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleStyle(item.value)}
                        className={\`relative p-5 rounded-2xl border text-left transition-all flex flex-col justify-start items-start gap-2.5 h-full \${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }\`}
                      >
                        {isSelected && (
                          <div className="absolute top-5 right-5 w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-black">✓</span>
                          </div>
                        )}
                        <h4 className={\`text-base font-bold pr-6 leading-snug tracking-wide \${isSelected ? "text-black" : "text-white"}\`}>
                          {item.label}
                        </h4>
                        <p className={\`text-xs leading-relaxed \${isSelected ? "text-black/80 font-medium" : "text-white/60"}\`}>
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
`;

code = code.replace(step4Regex, '{/* STEP 4: Travel Style (Multi-select) */}$1<div className="grid grid-cols-2 gap-4 mb-8">\n' + correctStep4Grid + '                </div>\n\n                <div className="flex justify-between border-t border-white/5 pt-6">');

// Now fix Step 8
const step8Regex = /\{\/\* STEP 8: Culinary Interests \(Multi-select\) \*\/\}([\s\S]*?)<div className=\"grid grid-cols-2 gap-4 mb-8\">([\s\S]*?)<\/div>\s*<div className=\"flex justify-between border-t border-white\/5 pt-6\">/m;

const correctStep8Grid = `
                  {[
                    { label: "Traditional Wazwan", value: "Traditional Wazwan", desc: "Rogan Josh, Gushtaba, and multi-course sharing platters" },
                    { label: "Street Food & Tujji", value: "Street Food", desc: "Khayam Chowk charcoal barbecue, seekh kebabs, and wraps" },
                    { label: "Kandur Bakery", value: "Kandur Bakery", desc: "Local baked breads (Girda, Bakerkhani) paired with morning tea" },
                    { label: "Kahwa Experiences", value: "Kahwa Experiences", desc: "Saffron, green tea, cinnamon and almond sweet infusions" },
                    { label: "Trout & River Fish", value: "Trout & Mountain Cuisine", desc: "Fresh mountain stream trout shallow-fried in local spices" },
                    { label: "Vegetarian Cuisine", value: "Vegetarian Kashmiri Cuisine", desc: "Dum Aelve potatoes, Ruwangan Chaman cheese, and Haak greens" }
                  ].map((item) => {
                    const isSelected = selectedInterests.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleInterest(item.value)}
                        className={\`relative p-5 rounded-2xl border text-left transition-all flex flex-col justify-start items-start gap-2.5 h-full \${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }\`}
                      >
                        {isSelected && (
                          <div className="absolute top-5 right-5 w-5 h-5 rounded-full bg-black/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-black">✓</span>
                          </div>
                        )}
                        <h4 className={\`text-base font-bold pr-6 leading-snug tracking-wide \${isSelected ? "text-black" : "text-white"}\`}>
                          {item.label}
                        </h4>
                        <p className={\`text-xs leading-relaxed \${isSelected ? "text-black/80 font-medium" : "text-white/60"}\`}>
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
`;

code = code.replace(step8Regex, '{/* STEP 8: Culinary Interests (Multi-select) */}$1<div className="grid grid-cols-2 gap-4 mb-8">\n' + correctStep8Grid + '                </div>\n\n                <div className="flex justify-between border-t border-white/5 pt-6">');

fs.writeFileSync('frontend/app/plan/page.js', code);
console.log('Fixed Step 4 and Step 8 Grids.');
