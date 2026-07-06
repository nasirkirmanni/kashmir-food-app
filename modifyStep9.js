const fs = require('fs');
let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

// 1. Add removeSpot and removeDish
if (!code.includes('removeSpot = ')) {
  const addStr = `const [result, setResult] = useState(null);
  
  const removeSpot = (spotIdx) => {
    setResult(prev => ({
      ...prev,
      spots: prev.spots.filter((_, i) => i !== spotIdx)
    }));
  };

  const removeDish = (dishIdx) => {
    setResult(prev => ({
      ...prev,
      dishesToTry: prev.dishesToTry.filter((_, i) => i !== dishIdx)
    }));
  };`;
  code = code.replace('const [result, setResult] = useState(null);', addStr);
}

// 2. Make spots removable
const spotsRegex = /\{result\.spots\.map\(\(spot, idx\) => \([\s\S]*?<\/li>\n\s*\)\)}/;
const spotsReplacement = `{result.spots.map((spot, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start text-xs text-white/85 group">
                          <span className="text-[var(--saffron)] font-bold text-sm leading-none">•</span>
                          <div className="flex-1 flex justify-between items-start">
                            <div>
                              <span className="font-semibold text-white block">{spot}</span>
                              <span className="text-white/40 text-[0.65rem]">Audited Destination Spot</span>
                            </div>
                            <button 
                              onClick={() => removeSpot(idx)} 
                              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity ml-2"
                              title="Remove spot"
                            >
                              ✕
                            </button>
                          </div>
                        </li>
                      ))}`;
code = code.replace(spotsRegex, spotsReplacement);

// 3. Make dishes removable
const dishesRegex = /\{result\.dishesToTry\.map\(\(dish, idx\) => \([\s\S]*?<\/li>\n\s*\)\)}/;
const dishesReplacement = `{result.dishesToTry.map((dish, idx) => (
                        <li key={idx} className="flex gap-3 items-center text-xs text-white/80 group justify-between">
                          <div className="flex gap-3 items-center">
                            <input
                              type="checkbox"
                              id={\`dish-\${idx}\`}
                              className="rounded border-white/10 bg-black/40 text-[var(--saffron)] focus:ring-[var(--saffron)] cursor-pointer h-4 w-4"
                            />
                            <label htmlFor={\`dish-\${idx}\`} className="cursor-pointer font-medium hover:text-[var(--saffron)] transition-colors">
                              {dish}
                            </label>
                          </div>
                          <button 
                            onClick={() => removeDish(idx)} 
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity ml-2"
                            title="Remove dish"
                          >
                            ✕
                          </button>
                        </li>
                      ))}`;
code = code.replace(dishesRegex, dishesReplacement);

// 4. Replace bottom actions grid with single CTA
const gridRegex = /\{\/\* Grid of actions at the bottom \*\/\}\s*<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/motion.div>/;

const singleCTAReplacement = `{/* Single action at the bottom */}
              <div className="mt-8 flex justify-center">
                <div className="rounded-2xl border border-[var(--saffron)]/20 bg-white/5 p-6 md:p-8 backdrop-blur-md text-center w-full max-w-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--saffron)]/5 to-transparent pointer-events-none" />
                  <div>
                    <span className="text-xs text-[var(--saffron)] font-bold uppercase tracking-[0.25em] block mb-2">
                      📬 Final Step
                    </span>
                    <h3 className="text-xl font-display text-white mb-2">Send Custom Itinerary & Confirm Bookings</h3>
                    <p className="text-white/65 text-xs mx-auto mb-6 leading-relaxed">
                      Send this finalized itinerary directly to your selected travel partner. They will arrange premium bookings, transport, and contact you directly.
                    </p>
                  </div>
                  
                  <div className="flex justify-center mt-auto w-full">
                    {querySent ? (
                      <div className="p-4 bg-green-500/20 border border-green-500/30 text-green-200 text-xs rounded-xl w-full">
                        <strong>✓ Sent Successfully!</strong>
                        <p className="text-[11px] mt-1 text-white/80">The agency has received your itinerary and will contact you via phone ({userPhone}) or email ({userEmail}) shortly.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 w-full">
                        {queryError && (
                          <p className="text-xs text-red-400">{queryError}</p>
                        )}
                        <button
                          onClick={handleSendToTeam}
                          disabled={sendingQuery}
                          className="wazwan-btn-primary rounded-full px-8 py-3.5 text-xs uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform disabled:opacity-50 w-full"
                        >
                          {sendingQuery ? "Sending..." : "Send Itinerary & Confirm"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </div>
            </div>
            </motion.div>`;

code = code.replace(gridRegex, singleCTAReplacement);

fs.writeFileSync('frontend/app/plan/page.js', code);
