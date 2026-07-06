const fs = require('fs');

let code = fs.readFileSync('frontend/app/plan/page.js', 'utf8');

// 1. Remove Google Review link
const googleReviewRegex = /\{viewingAgency\.googleReviewLink && \([\s\S]*?<\/a>\s*\)}/;
code = code.replace(googleReviewRegex, '');

// Also remove it from the fallback check
const fallbackRegex = /!viewingAgency\.googleReviewLink &&/g;
code = code.replace(fallbackRegex, '');

// 2. Add currentDayIndex state if not exists
if (!code.includes('currentDayIndex')) {
  code = code.replace('const [result, setResult] = useState(null);', 'const [result, setResult] = useState(null);\n  const [currentDayIndex, setCurrentDayIndex] = useState(0);');
}

// 3. Add updateDayPlan function
if (!code.includes('updateDayPlan =')) {
  const updateFunc = `
  const updateDayPlan = (dayIdx, field, value) => {
    setResult(prev => {
      const newDayByDay = [...prev.dayByDay];
      newDayByDay[dayIdx] = { ...newDayByDay[dayIdx], [field]: value };
      return { ...prev, dayByDay: newDayByDay };
    });
  };
`;
  code = code.replace('const handleGeneratePlan =', updateFunc + '\n  const handleGeneratePlan =');
}

// 4. Update the "Day-by-Day Timeline map" block
const dayCardsStart = '{/* Day-by-Day Timeline map */}';
const dayCardsEndStr = '                {/* Recommendations Grid Panels */}';
const dayCardsStartIndex = code.indexOf(dayCardsStart);
const dayCardsEndIndex = code.indexOf(dayCardsEndStr, dayCardsStartIndex);

if (dayCardsStartIndex !== -1 && dayCardsEndIndex !== -1) {
  const newDayCardsCode = `{/* Day-by-Day Timeline map */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between pl-1">
                    <h3 className="text-xl font-display text-white font-medium">
                      Day-by-Day Concierge Route
                    </h3>
                    <div className="text-[var(--saffron)] text-xs font-bold uppercase tracking-widest border border-[var(--saffron)]/20 px-3 py-1 rounded-full bg-[var(--saffron)]/5">
                      {currentDayIndex < result.dayByDay.length ? \`Editing \${currentDayIndex + 1} of \${result.dayByDay.length}\` : 'Final Review'}
                    </div>
                  </div>
                  <div className="relative border-l border-white/10 pl-6 sm:pl-8 space-y-8 ml-3 sm:ml-4">
                    {currentDayIndex < result.dayByDay.length ? (() => {
                      const dayPlan = result.dayByDay[currentDayIndex];
                      return (
                        <div key={dayPlan.day} className="relative animate-fade-in">
                          {/* Day Bubble */}
                          <div className="absolute -left-[35px] sm:-left-[43px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-[var(--saffron)] text-black font-bold font-display text-[0.7rem] shadow-[0_0_12px_rgba(212,175,55,0.35)] transition-all">
                            {dayPlan.day}
                          </div>
                          <div className="rounded-xl border border-[var(--saffron)]/30 bg-white/5 hover:border-[var(--saffron)]/60 p-5 transition-all shadow-[0_0_30px_rgba(212,175,55,0.05)]">
                            <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-2">
                              <div className="w-full mr-4">
                                <span className="text-[var(--saffron)] text-[0.55rem] font-bold uppercase tracking-wider block mb-1">
                                  Day 0{dayPlan.day} Destination
                                </span>
                                <input
                                  type="text"
                                  value={dayPlan.destination || ''}
                                  onChange={(e) => updateDayPlan(currentDayIndex, 'destination', e.target.value)}
                                  className="w-full bg-transparent text-white text-base font-display font-bold border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5 transition-colors"
                                  placeholder="Enter destination..."
                                />
                              </div>
                              <div className="whitespace-nowrap flex flex-col items-end">
                                <span className="text-[var(--saffron)] font-mono text-[0.65rem] uppercase tracking-wider block mb-1">Budget</span>
                                <input 
                                  type="text"
                                  value={dayPlan.estBudget || ''}
                                  onChange={(e) => updateDayPlan(currentDayIndex, 'estBudget', e.target.value)}
                                  className="w-16 text-right bg-transparent text-white font-mono text-xs border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs mt-4">
                              <div className="space-y-4">
                                <div>
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.6rem]">Morning Attraction</span>
                                  <textarea
                                    value={dayPlan.attraction || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'attraction', e.target.value)}
                                    rows={2}
                                    className="w-full bg-transparent text-white/90 border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none resize-none transition-colors"
                                    placeholder="Add morning activity..."
                                  />
                                </div>
                                <div>
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.6rem]">Recommended Dining</span>
                                  <input
                                    type="text"
                                    value={dayPlan.restaurant || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'restaurant', e.target.value)}
                                    className="w-full bg-transparent text-white font-medium border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5 transition-colors"
                                    placeholder="Select restaurant..."
                                  />
                                </div>
                              </div>

                              <div className="space-y-4">
                                <div>
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.6rem]">Must-Try Dish</span>
                                  <input
                                    type="text"
                                    value={dayPlan.dish || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'dish', e.target.value)}
                                    className="w-full bg-transparent text-white/90 border-b border-dashed border-white/20 focus:border-[var(--saffron)] outline-none pb-0.5 transition-colors"
                                    placeholder="Enter must-try dish..."
                                  />
                                </div>
                                <div className="bg-[var(--saffron-pale)] rounded-lg p-3 border border-[var(--saffron)]/20 relative group">
                                  <span className="text-[var(--saffron)] font-bold block mb-1.5 uppercase tracking-widest text-[0.55rem]">Travel Tip</span>
                                  <textarea
                                    value={dayPlan.travelTip || ''}
                                    onChange={(e) => updateDayPlan(currentDayIndex, 'travelTip', e.target.value)}
                                    rows={2}
                                    className="w-full bg-transparent text-white/95 leading-relaxed text-[0.7rem] border-b border-dashed border-[var(--saffron)]/30 focus:border-[var(--saffron)] outline-none resize-none transition-colors"
                                    placeholder="Enter travel tip..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })() : (
                      /* Final Confirmation Screen integrated into timeline styling */
                      <div className="relative animate-fade-in">
                        <div className="absolute -left-[35px] sm:-left-[43px] top-0 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-[#0e0d0b] font-bold shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                          ✓
                        </div>
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 md:p-8 text-center shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                          <h2 className="text-3xl font-display font-medium text-white mb-3">
                            Itinerary Complete
                          </h2>
                          <p className="text-white/60 mb-8 max-w-sm mx-auto text-xs leading-relaxed">
                            Your custom itinerary is ready to be sent to our travel partner. They will arrange premium bookings, transport, and contact you directly.
                          </p>

                          <div className="max-w-md mx-auto w-full">
                            {querySent ? (
                              <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm rounded-xl backdrop-blur-sm">
                                <strong className="text-emerald-400 block mb-1">Booking Request Sent!</strong>
                                <p className="text-[10px] text-white/60 uppercase tracking-wider mt-2">The agency will contact {userEmail}</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {queryError && <p className="text-[10px] uppercase tracking-widest text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{queryError}</p>}
                                <button
                                  onClick={handleSendToTeam}
                                  disabled={sendingQuery}
                                  className="wazwan-btn-primary w-full py-4 rounded-full text-xs font-bold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform disabled:opacity-50"
                                >
                                  {sendingQuery ? "Sending Request..." : "Send Booking Request"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Wizard Navigation */}
                  <div className="pt-6 flex justify-between items-center pl-1 mt-4">
                    <button
                      onClick={() => setCurrentDayIndex(prev => prev - 1)}
                      disabled={currentDayIndex === 0}
                      className="px-5 py-2.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest text-white/50 border border-white/10 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      &larr; Previous Day
                    </button>
                    {currentDayIndex < result.dayByDay.length && (
                      <button
                        onClick={() => setCurrentDayIndex(prev => prev + 1)}
                        className="px-6 py-2.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest text-black bg-white hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform"
                      >
                        {currentDayIndex === result.dayByDay.length - 1 ? 'Review Final Step &rarr;' : 'Next Day &rarr;'}
                      </button>
                    )}
                  </div>
                </div>

`;
  code = code.substring(0, dayCardsStartIndex) + newDayCardsCode + code.substring(dayCardsEndIndex);
}

// 5. Safely remove the "Grid of actions at the bottom" without breaking the closing tags or page content
const actionsStart = '{/* Grid of actions at the bottom */}';
const actionsEndStr = '            </motion.div>\\n          )}\\n            </AnimatePresence>';

// Let's use a safe substring match
const startActionIdx = code.indexOf(actionsStart);
const endActionMatch = '</motion.div>\\n          )}\\n            </AnimatePresence>'; // Actually this has spaces before it
// Instead of a rigid string match for the end, I'll find the first `</motion.div>` AFTER actionsStart
const endMotionIdx = code.indexOf('</motion.div>', startActionIdx);

if (startActionIdx !== -1 && endMotionIdx !== -1) {
  // We slice from 0 to startActionIdx, then append from endMotionIdx to end
  code = code.substring(0, startActionIdx) + code.substring(endMotionIdx - 12); // include some whitespace
}

fs.writeFileSync('frontend/app/plan/page.js', code);
console.log("Successfully replaced Day cards and removed actions properly!");
