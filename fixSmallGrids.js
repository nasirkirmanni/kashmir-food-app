const fs = require('fs');
let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

// Step 4
const step4Regex = /\{\/\* STEP 4: Travel Style \(Multi-select\) \*\/\}([\s\S]*?)<div className=\"grid grid-cols-2 gap-[^\"]* mb-8\">([\s\S]*?)<\/div>\s*<div className=\"flex justify-between border-t border-white\/5 pt-6\">/m;

const correctStep4Grid = `
                  {[
                    { label: "Food Lover", value: "Food Lover", desc: "Authentic cuisine" },
                    { label: "Luxury", value: "Luxury Traveler", desc: "Premium resorts" },
                    { label: "Adventure", value: "Adventure Seeker", desc: "Active trekking" },
                    { label: "Family", value: "Family Vacation", desc: "Kid-friendly" },
                    { label: "Couple", value: "Couple / Honeymoon", desc: "Romantic getaways" },
                    { label: "Culture", value: "Cultural Explorer", desc: "Heritage sites" }
                  ].map((item) => {
                    const isSelected = selectedStyles.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleStyle(item.value)}
                        className={\`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-start items-start gap-1 h-full \${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }\`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-black/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-black">✓</span>
                          </div>
                        )}
                        <h4 className={\`text-sm font-bold pr-4 leading-tight tracking-wide \${isSelected ? "text-black" : "text-white"}\`}>
                          {item.label}
                        </h4>
                        <p className={\`text-[10px] leading-snug \${isSelected ? "text-black/80 font-semibold" : "text-white/60"}\`}>
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
`;

code = code.replace(step4Regex, '{/* STEP 4: Travel Style (Multi-select) */}$1<div className="grid grid-cols-2 gap-3 mb-8">\n' + correctStep4Grid + '                </div>\n\n                <div className="flex justify-between border-t border-white/5 pt-6">');

// Now fix Step 8
const step8Regex = /\{\/\* STEP 8: Culinary Interests \(Multi-select\) \*\/\}([\s\S]*?)<div className=\"grid grid-cols-2 gap-[^\"]* mb-8\">([\s\S]*?)<\/div>\s*<div className=\"flex justify-between border-t border-white\/5 pt-6\">/m;

const correctStep8Grid = `
                  {[
                    { label: "Wazwan", value: "Traditional Wazwan", desc: "Multi-course platters" },
                    { label: "Street Food", value: "Street Food", desc: "Charcoal barbecue" },
                    { label: "Bakery", value: "Kandur Bakery", desc: "Local baked breads" },
                    { label: "Kahwa", value: "Kahwa Experiences", desc: "Saffron & green tea" },
                    { label: "Trout", value: "Trout & Mountain Cuisine", desc: "Fresh mountain trout" },
                    { label: "Vegetarian", value: "Vegetarian Kashmiri Cuisine", desc: "Dum Aloo & Haak" }
                  ].map((item) => {
                    const isSelected = selectedInterests.includes(item.value);
                    return (
                      <button
                        key={item.value}
                        onClick={() => toggleInterest(item.value)}
                        className={\`relative p-4 rounded-2xl border text-left transition-all flex flex-col justify-start items-start gap-1 h-full \${
                          isSelected
                            ? "bg-[var(--saffron)] border-[var(--saffron)] text-black shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "bg-black/40 border-white/10 hover:border-white/20 hover:bg-white/5"
                        }\`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-black/10 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-black">✓</span>
                          </div>
                        )}
                        <h4 className={\`text-sm font-bold pr-4 leading-tight tracking-wide \${isSelected ? "text-black" : "text-white"}\`}>
                          {item.label}
                        </h4>
                        <p className={\`text-[10px] leading-snug \${isSelected ? "text-black/80 font-semibold" : "text-white/60"}\`}>
                          {item.desc}
                        </p>
                      </button>
                    );
                  })}
`;

code = code.replace(step8Regex, '{/* STEP 8: Culinary Interests (Multi-select) */}$1<div className="grid grid-cols-2 gap-3 mb-8">\n' + correctStep8Grid + '                </div>\n\n                <div className="flex justify-between border-t border-white/5 pt-6">');

fs.writeFileSync('frontend/app/plan/page.js', code);
console.log('Fixed Step 4 and Step 8 Grids sizes and descriptions.');
