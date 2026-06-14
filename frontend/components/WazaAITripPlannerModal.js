"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Calendar, Users, Wallet, Utensils, AlertTriangle, CheckCircle } from "lucide-react";

// Anti-gibberish validation logic
const isValidInput = (text) => {
  if (!text || text.trim().length < 2) return false;
  // Keyboard mashing/repeats (e.g. aaaaa)
  if (/^(.)\1{3,}$/.test(text.trim())) return false;
  // If it's a longer string with absolutely no vowels/numbers, it's likely gibberish
  if (text.length > 5 && !/[aeiouy0-9]/i.test(text)) return false;
  return true;
};

const TripPlanResults = ({ planData, onBook, onClose }) => {
  return (
    <div className="flex-1 flex flex-col relative w-full h-full max-h-full min-h-0 overflow-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-xl pb-4 pt-2 mb-6 border-b border-white/5 flex justify-between items-center -mt-2">
        <h3 className="text-xl font-display text-white truncate pr-4">{planData.title || "Your Custom Itinerary"}</h3>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-8">
        {/* Summary Card */}
        {planData.summary && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8 flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-[var(--saffron)]">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Dates</p>
                <p className="text-sm text-white font-medium">{planData.summary.duration || planData.summary.dates}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-[var(--saffron)]">
                <Users size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Group Size</p>
                <p className="text-sm text-white font-medium">{planData.summary.groupSize}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg text-[var(--saffron)]">
                <Wallet size={18} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">Budget</p>
                <p className="text-sm text-white font-medium">{planData.summary.budget || planData.summary.totalBudget}</p>
              </div>
            </div>
          </div>
        )}

        {/* Days List */}
        <div className="space-y-6">
          {planData.days?.map((day, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--saffron)] to-transparent opacity-50" />
              <h4 className="text-lg font-display text-white mb-4 pl-2">Day {day.dayNumber} — {day.title}</h4>
              <div className="space-y-4 pl-2">
                {day.activities?.map((act, actIdx) => (
                  <div key={actIdx} className={`p-4 rounded-xl text-sm ${act.isFoodHighlight ? 'bg-[var(--saffron)]/10 border border-[var(--saffron)]/20' : 'bg-black/30'}`}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] uppercase tracking-widest bg-white/10 text-white/70 px-2 py-0.5 rounded text-center">
                        {act.timeOfDay}
                      </span>
                      {act.isFoodHighlight && (
                        <span className="text-[10px] uppercase tracking-widest bg-[var(--saffron)]/20 text-[var(--saffron)] px-2 py-0.5 rounded text-center flex items-center gap-1 font-bold">
                          <Utensils size={10} /> Food Highlight
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 leading-relaxed max-w-[65ch]">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Confirm Booking CTA */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center">
          <p className="text-white/60 text-sm mb-4">Love this itinerary? Let our concierge make it a reality.</p>
          <button onClick={onBook} className="w-full md:w-auto bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default function WazaAITripPlannerModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(1);
  const [people, setPeople] = useState(2);
  const [duration, setDuration] = useState("");
  const [vibe, setVibe] = useState("");
  const [budget, setBudget] = useState("");
  const [extras, setExtras] = useState([]);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Booking Form State
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingEmail, setBookingEmail] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  const toggleExtra = (extra) => {
    if (extras.includes(extra)) {
      setExtras(extras.filter(e => e !== extra));
    } else {
      setExtras([...extras, extra]);
    }
  };

  const handleNextStep = (currentStep, valueToCheck) => {
    setErrorMsg("");
    if (currentStep === 2) {
      if (!isValidInput(valueToCheck)) {
        setErrorMsg("⚠️ That doesn't look like a valid answer. Please answer the question above so Waza AI can plan your perfect trip!");
        return;
      }
    }
    setStep(currentStep + 1);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setStep(6); // Result state
    
    const promptText = `I want you to act as an expert Kashmir Trip Planner. 
Here are my trip details:
- Number of People: ${people}
- Travel Dates: ${duration}
- Vibe / Interests: ${vibe}
- Budget: ${budget}
- Extras: ${extras.join(', ') || 'None'}

You MUST return the response strictly in JSON format matching the following structure exactly (do not wrap in markdown tags like \`\`\`json):
{
  "title": "A catchy title for the trip",
  "summary": { "duration": "...", "budget": "...", "groupSize": "..." },
  "days": [
    {
      "dayNumber": 1,
      "title": "Day Title",
      "activities": [
        { "timeOfDay": "Morning", "description": "...", "isFoodHighlight": false }
      ]
    }
  ]
}`;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: promptText }] })
      });

      const data = await response.json();
      if (data.reply) {
        try {
          let jsonString = data.reply.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(jsonString);
          setResult(parsed);
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
          setResult({ fallback: data.reply });
        }
      } else {
        setResult({ fallback: "I'm sorry, I couldn't generate a plan right now. Please try again later." });
      }
    } catch (error) {
      console.error("Error generating trip plan:", error);
      setResult({ fallback: "An error occurred while generating the plan. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setIsSubmittingBooking(true);
    try {
      await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingName,
          phone: bookingPhone,
          email: bookingEmail,
          notes: bookingNotes,
          tripDetails: { people, duration, vibe, budget, extras }
        })
      });
      setStep(8); // Success
    } catch (err) {
      console.error(err);
      alert("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  const handleClose = () => {
    setTimeout(() => {
      setStep(1);
      setPeople(2);
      setDuration("");
      setVibe("");
      setBudget("");
      setExtras([]);
      setResult(null);
      setErrorMsg("");
      setBookingName("");
      setBookingEmail("");
      setBookingPhone("");
      setBookingNotes("");
      setIsLoading(false);
    }, 300);
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="waza-ai-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8 backdrop-blur-[40px] overflow-y-auto"
          onClick={handleClose}
        >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-white/10 bg-[#0a0a0a]/70 backdrop-blur-3xl shadow-[0_0_80px_rgba(212,175,55,0.2)] flex flex-col max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Dynamic Glows */}
          <div className="absolute -top-20 left-1/4 w-1/2 h-40 bg-[var(--saffron)]/20 blur-[80px] pointer-events-none z-0 rounded-full" />
          <div className="absolute -bottom-20 right-1/4 w-1/2 h-40 bg-[var(--saffron)]/10 blur-[80px] pointer-events-none z-0 rounded-full" />
          
          {/* Header */}
          <div className="relative z-10 flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-5 shrink-0">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)]">
                Waza AI Concierge
              </p>
              <h2 className="font-display text-xl md:text-2xl font-medium tracking-tight text-white mt-1">
                Custom Trip Planner
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white backdrop-blur-md transition hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)]"
            >
              &times;
            </button>
          </div>

          {/* Body */}
          <div className="relative z-10 p-6 md:p-8 flex-1 overflow-y-hidden flex flex-col">
            
            {/* Step 1: People */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-2xl font-display text-white mb-6">How many people are travelling?</h3>
                <div className="bg-black/40 border border-white/10 rounded-2xl p-8 text-center flex flex-col items-center">
                  <div className="mb-8">
                    <span className="text-6xl font-display text-[var(--saffron)]">{people}{people == 15 ? '+' : ''}</span>
                    <span className="text-white/50 text-xl ml-2 uppercase tracking-widest">{people == 1 ? 'Person' : 'People'}</span>
                  </div>
                  
                  <div className="w-full max-w-sm px-2">
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={people} 
                      onChange={e => setPeople(parseInt(e.target.value))} 
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--saffron)]" 
                    />
                    <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-widest mt-3 font-bold">
                      <span>1 (Solo)</span>
                      <span>15+ (Group)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button onClick={() => handleNextStep(1, people)} className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--saffron)] hover:text-black transition-colors">Next</button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-2xl font-display text-white mb-6">When do you want to visit Kashmir?</h3>
                <input type="text" value={duration} onChange={e => { setDuration(e.target.value); setErrorMsg(""); }} onKeyDown={e => e.key === 'Enter' && handleNextStep(2, duration)} placeholder="e.g., 5 days in mid-July" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[var(--saffron)] transition-colors text-lg" autoFocus />
                {errorMsg && <p className="text-red-400 text-sm mt-3 flex items-start gap-2 bg-red-400/10 p-3 rounded-lg"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{errorMsg}</p>}
                <div className="mt-8 flex justify-between">
                  <button onClick={() => setStep(1)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest font-bold">Back</button>
                  <button onClick={() => handleNextStep(2, duration)} className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--saffron)] hover:text-black transition-colors">Next</button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Vibe */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-2xl font-display text-white mb-6">What vibe are you looking for?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {["Adventure", "Romantic", "Family", "Cultural", "Relaxation"].map(opt => (
                    <button key={opt} onClick={() => { setVibe(opt); handleNextStep(3, opt); }} className="p-4 rounded-xl border border-white/10 bg-white/5 text-white hover:border-[var(--saffron)] hover:bg-[var(--saffron)]/10 transition-all font-medium text-left">
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-start">
                  <button onClick={() => setStep(2)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest font-bold">Back</button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-2xl font-display text-white mb-6">What's your budget per person?</h3>
                <div className="flex flex-col gap-3">
                  {["Under ₹10K", "₹10K–₹20K", "₹20K–₹50K", "50K+"].map(opt => (
                    <button key={opt} onClick={() => { setBudget(opt); handleNextStep(4, opt); }} className="p-4 rounded-xl border border-white/10 bg-white/5 text-white hover:border-[var(--saffron)] hover:bg-[var(--saffron)]/10 transition-all font-medium text-left">
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-8 flex justify-start">
                  <button onClick={() => setStep(3)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest font-bold">Back</button>
                </div>
              </motion.div>
            )}

            {/* Step 5: Extras */}
            {step === 5 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h3 className="text-2xl font-display text-white mb-6">Any extras you'd like?</h3>
                <div className="flex flex-col gap-3 mb-8">
                  {["Wazwan dining experience", "Houseboat stay", "Snow trek", "Local guide", "Photography tour"].map(opt => (
                    <button key={opt} onClick={() => toggleExtra(opt)} className={`p-4 rounded-xl border transition-all font-medium text-left flex justify-between items-center ${extras.includes(opt) ? 'border-[var(--saffron)] bg-[var(--saffron)]/10 text-[var(--saffron)]' : 'border-white/10 bg-white/5 text-white hover:border-white/30'}`}>
                      <span>{opt}</span>
                      {extras.includes(opt) && <CheckCircle size={18} />}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(4)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest font-bold">Back</button>
                  <button onClick={handleGenerate} className="bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-8 py-3.5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    Generate Plan ✨
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 6: Loading & Result */}
            {step === 6 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col min-h-0">
                {isLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center min-h-[350px]">
                    <div className="relative w-20 h-20 mb-8">
                      <div className="absolute inset-0 border-4 border-white/5 border-t-[var(--saffron)] rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-white/5 border-l-[var(--saffron)] rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    </div>
                    <h3 className="text-2xl font-display text-white">Waza AI is crafting your itinerary...</h3>
                    <p className="text-white/50 text-sm mt-3">Consulting the best local spots and Wazwan experts.</p>
                  </div>
                ) : (
                  result?.fallback ? (
                    <div className="flex-1 overflow-y-auto pr-2 pb-8">
                      <div className="prose prose-invert prose-p:text-white/80 prose-headings:text-white prose-a:text-[var(--saffron)] max-w-none">
                        <div className="mb-8 p-5 bg-gradient-to-r from-[var(--saffron)]/10 to-transparent border-l-2 border-[var(--saffron)] rounded-r-2xl">
                          <p className="text-[var(--saffron)] font-medium text-sm m-0 flex items-center gap-2">
                            <span className="text-lg">✨</span> Here is your custom itinerary!
                          </p>
                        </div>
                        <ReactMarkdown>{result.fallback}</ReactMarkdown>
                      </div>
                      <div className="mt-12 pt-6 border-t border-white/5 flex flex-col items-center">
                        <button onClick={() => setStep(7)} className="w-full md:w-auto bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-4">
                          Confirm Booking
                        </button>
                        <button onClick={handleClose} className="border border-white/10 bg-white/5 text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all">
                          Close Plan
                        </button>
                      </div>
                    </div>
                  ) : (
                    <TripPlanResults planData={result} onBook={() => setStep(7)} onClose={handleClose} />
                  )
                )}
              </motion.div>
            )}

            {/* Step 7: Booking Form */}
            {step === 7 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="overflow-y-auto pr-2">
                <h3 className="text-2xl font-display text-white mb-2">Complete Your Booking</h3>
                <p className="text-white/50 text-sm mb-6">Our Wazwan Way concierge will review your custom itinerary and reach out within 24 hours.</p>
                
                <form onSubmit={submitBooking} className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[var(--saffron)] font-bold mb-2 block">Full Name</label>
                    <input type="text" required value={bookingName} onChange={e => setBookingName(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--saffron)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[var(--saffron)] font-bold mb-2 block">Phone Number</label>
                    <input type="tel" required value={bookingPhone} onChange={e => setBookingPhone(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--saffron)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[var(--saffron)] font-bold mb-2 block">Email Address</label>
                    <input type="email" required value={bookingEmail} onChange={e => setBookingEmail(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--saffron)] transition-colors" />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest text-[var(--saffron)] font-bold mb-2 block">Special Requests (Optional)</label>
                    <textarea value={bookingNotes} onChange={e => setBookingNotes(e.target.value)} rows={3} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[var(--saffron)] transition-colors resize-none"></textarea>
                  </div>
                  
                  <div className="mt-8 flex justify-between items-center pt-4">
                    <button type="button" onClick={() => setStep(6)} className="text-xs text-white/50 hover:text-white uppercase tracking-widest font-bold">Back to Plan</button>
                    <button type="submit" disabled={isSubmittingBooking} className="bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-8 py-3.5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-none flex items-center gap-2">
                      {isSubmittingBooking ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Step 8: Success */}
            {step === 8 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-[var(--saffron)]/20 rounded-full flex items-center justify-center mb-6 border border-[var(--saffron)]">
                  <CheckCircle size={40} className="text-[var(--saffron)]" />
                </div>
                <h3 className="text-3xl font-display text-white mb-4">Shukraan! 🙏</h3>
                <p className="text-white/80 leading-relaxed mb-10 max-w-sm">
                  Your booking request has been received. Our Wazwan Way team will reach out to you shortly to confirm your journey to Kashmir.
                </p>
                <button onClick={handleClose} className="border border-white/20 text-white px-10 py-3.5 rounded-full font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                  Return to Home
                </button>
              </motion.div>
            )}

          </div>
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
