"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Calendar, Users, Wallet, Utensils, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { request, streamRequest, endpoints } from "@/lib/api";
import { jsonrepair } from "jsonrepair";
import Link from "next/link";

// Anti-gibberish validation logic
const isValidInput = (text) => {
  if (!text || text.trim().length < 2) return false;
  if (/^(.)\1{3,}$/.test(text.trim())) return false;
  if (text.length > 5 && !/[aeiouy0-9]/i.test(text)) return false;
  return true;
};

const TripPlanResults = ({ planData, onBook, onBack }) => {
  return (
    <div className="flex-1 flex flex-col relative w-full max-w-4xl mx-auto pb-20">
      <div className="sticky top-0 z-20 bg-[#0a0a0a]/90 backdrop-blur-xl pb-4 pt-8 mb-6 border-b border-white/5 flex items-center gap-4 px-4 md:px-0">
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h3 className="text-2xl font-display text-white truncate flex-1">{planData.title || "Your Custom Itinerary"}</h3>
      </div>

      <div className="px-4 md:px-0">
        {/* Summary Card */}
        {planData.summary && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-10 flex flex-wrap gap-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-[var(--saffron)]/10 p-3 rounded-xl text-[var(--saffron)]">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Dates</p>
                <p className="text-base text-white font-medium">{planData.summary.duration || planData.summary.dates}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[var(--saffron)]/10 p-3 rounded-xl text-[var(--saffron)]">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Group Size</p>
                <p className="text-base text-white font-medium">{planData.summary.groupSize}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-[var(--saffron)]/10 p-3 rounded-xl text-[var(--saffron)]">
                <Wallet size={24} />
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Budget</p>
                <p className="text-base text-white font-medium">{planData.summary.budget || planData.summary.totalBudget}</p>
              </div>
            </div>
          </div>
        )}

        {/* Days List */}
        <div className="space-y-8">
          {planData.days?.map((day, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[var(--saffron)] to-transparent opacity-80" />
              <h4 className="text-2xl font-display text-[var(--saffron)] mb-6 pl-4">Day {day.dayNumber} — {day.title}</h4>
              <div className="space-y-5 pl-4">
                {day.activities?.map((act, actIdx) => (
                  <div key={actIdx} className={`p-5 rounded-2xl text-base ${act.isFoodHighlight ? 'bg-[var(--saffron)]/10 border border-[var(--saffron)]/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]' : 'bg-black/40 border border-white/5'}`}>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className="text-xs uppercase tracking-widest bg-white/10 text-white/80 px-3 py-1 rounded-md text-center font-bold shadow-sm">
                        {act.timeOfDay}
                      </span>
                      {act.isFoodHighlight && (
                        <span className="text-xs uppercase tracking-widest bg-[var(--saffron)]/20 text-[var(--saffron)] px-3 py-1 rounded-md text-center flex items-center gap-1.5 font-bold shadow-sm">
                          <Utensils size={12} /> Food Highlight
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 leading-relaxed max-w-[70ch]">
                      {act.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Confirm Booking CTA */}
        <div className="mt-16 pt-10 border-t border-white/10 flex flex-col items-center pb-20">
          <p className="text-white/60 text-base mb-6 text-center max-w-lg">Love this itinerary? Let our verified local travel partners make it a reality.</p>
          <button onClick={onBook} className="w-full md:w-auto bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-14 py-5 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_40px_rgba(212,175,55,0.4)] text-lg">
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default function CustomTripPage() {
  const router = useRouter();
  const { user } = useAuth();
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
      const response = await streamRequest(endpoints.chat, {
        method: "POST",
        body: JSON.stringify({ 
          messages: [{ role: "user", content: promptText }],
          isTripPlanner: true 
        })
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let fullReply = "";
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "").trim();
              if (dataStr === "[DONE]") continue;
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.reply) {
                  fullReply += parsed.reply;
                } else if (parsed.error) {
                  throw new Error(parsed.error);
                }
              } catch (e) {
                // Ignore invalid JSON lines
              }
            }
          }
        }
      }

      if (fullReply) {
        try {
          let jsonString = fullReply;
          const startIdx = jsonString.indexOf('{');
          const endIdx = jsonString.lastIndexOf('}');
          
          if (startIdx !== -1 && endIdx !== -1) {
            jsonString = jsonString.substring(startIdx, endIdx + 1);
          } else {
            jsonString = jsonString.replace(/```json/gi, '').replace(/```/g, '').trim();
          }
          
          try {
            const repairedJson = jsonrepair(jsonString);
            const parsed = JSON.parse(repairedJson);
            setResult(parsed);
          } catch (repairErr) {
            const parsed = JSON.parse(jsonString);
            setResult(parsed);
          }
        } catch (e) {
          console.error("Failed to parse JSON response:", e);
          setResult({ fallback: fullReply });
        }
      } else {
        setResult({ fallback: "I'm sorry, I couldn't generate a plan right now. Please try again later." });
      }
    } catch (error) {
      console.error("Error generating trip plan:", error);
      setResult({ fallback: error.message && error.message !== "Failed to fetch" && error.message !== "Streaming request failed" ? error.message : "An error occurred while generating the plan. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBook = () => {
    // If authenticated, go straight to select tour partner.
    // If not, go to signup with redirect.
    if (user) {
      router.push("/select-tour-partner");
    } else {
      router.push("/signup?redirect=/select-tour-partner");
    }
  };

  if (!mounted) return null;

  return (
    <div className="wazwan-shell min-h-screen bg-[#0a0a0a] pt-24 md:pt-32 pb-16 px-4">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-1/2 h-96 bg-[var(--saffron)]/10 blur-[120px] pointer-events-none z-0 rounded-full" />
      
      <div className="relative z-10 max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-[0.7rem] md:text-xs font-bold uppercase tracking-[0.3em] text-[var(--saffron)] mb-2">
            Waza AI Concierge
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white">
            Custom Trip Planner
          </h1>
          <p className="text-white/60 mt-4 max-w-xl mx-auto">Let our intelligent concierge craft the perfect Kashmiri getaway tailored exclusively to your preferences.</p>
        </div>

        {/* Wizard Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {/* Step 1: People */}
            {step === 1 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                <h3 className="text-2xl md:text-3xl font-display text-white mb-8 text-center">How many people are travelling?</h3>
                <div className="bg-black/50 border border-white/10 rounded-2xl p-10 text-center flex flex-col items-center">
                  <div className="mb-10">
                    <span className="text-7xl font-display text-[var(--saffron)]">{people}{people == 15 ? '+' : ''}</span>
                    <span className="text-white/50 text-xl ml-3 uppercase tracking-widest">{people == 1 ? 'Person' : 'People'}</span>
                  </div>
                  
                  <div className="w-full max-w-md px-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={people} 
                      onChange={e => setPeople(parseInt(e.target.value))} 
                      className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[var(--saffron)]" 
                    />
                    <div className="flex justify-between text-xs text-white/40 uppercase tracking-widest mt-4 font-bold">
                      <span>1 (Solo)</span>
                      <span>15+ (Group)</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10 flex justify-end">
                  <button onClick={() => handleNextStep(1, people)} className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)] transition-all text-sm shadow-lg">Continue</button>
                </div>
              </div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                <h3 className="text-2xl md:text-3xl font-display text-white mb-8 text-center">When do you want to visit Kashmir?</h3>
                <input 
                  type="text" 
                  value={duration} 
                  onChange={e => { setDuration(e.target.value); setErrorMsg(""); }} 
                  onKeyDown={e => e.key === 'Enter' && handleNextStep(2, duration)} 
                  placeholder="e.g., 5 days in mid-July" 
                  className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-5 text-white placeholder-white/30 focus:outline-none focus:border-[var(--saffron)] transition-colors text-xl shadow-inner" 
                  autoFocus 
                />
                {errorMsg && <p className="text-red-400 text-sm mt-4 flex items-start gap-2 bg-red-400/10 p-4 rounded-xl"><AlertTriangle size={18} className="mt-0.5 shrink-0" />{errorMsg}</p>}
                <div className="mt-10 flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-sm text-white/50 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                  <button onClick={() => handleNextStep(2, duration)} className="bg-white/10 text-white border border-white/20 px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-[var(--saffron)] hover:text-black hover:border-[var(--saffron)] transition-all text-sm shadow-lg">Continue</button>
                </div>
              </div>
            )}

            {/* Step 3: Vibe */}
            {step === 3 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                <h3 className="text-2xl md:text-3xl font-display text-white mb-8 text-center">What vibe are you looking for?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["Adventure & Trekking", "Romantic Getaway", "Family Vacation", "Cultural Deep Dive", "Luxury & Relaxation"].map(opt => (
                    <button key={opt} onClick={() => { setVibe(opt); handleNextStep(3, opt); }} className="p-6 rounded-2xl border border-white/10 bg-black/40 text-white hover:border-[var(--saffron)] hover:bg-[var(--saffron)]/10 transition-all font-medium text-left text-lg shadow-md">
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-10 flex justify-start">
                  <button onClick={() => setStep(2)} className="text-sm text-white/50 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                </div>
              </div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                <h3 className="text-2xl md:text-3xl font-display text-white mb-8 text-center">What's your estimated budget per person?</h3>
                <div className="flex flex-col gap-4 max-w-xl mx-auto">
                  {["Under ₹10,000 (Backpacker)", "₹10,000 – ₹25,000 (Standard)", "₹25,000 – ₹50,000 (Premium)", "₹50,000+ (Luxury)"].map(opt => (
                    <button key={opt} onClick={() => { setBudget(opt); handleNextStep(4, opt); }} className="p-6 rounded-2xl border border-white/10 bg-black/40 text-white hover:border-[var(--saffron)] hover:bg-[var(--saffron)]/10 transition-all font-medium text-left text-lg shadow-md">
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="mt-10 flex justify-start">
                  <button onClick={() => setStep(3)} className="text-sm text-white/50 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                </div>
              </div>
            )}

            {/* Step 5: Extras */}
            {step === 5 && (
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl">
                <h3 className="text-2xl md:text-3xl font-display text-white mb-8 text-center">Any special extras?</h3>
                <div className="flex flex-col gap-4 max-w-xl mx-auto mb-10">
                  {["Traditional Wazwan Feast", "Houseboat Stay on Dal Lake", "Gulmarg Gondola Ride", "Local Guide / Driver", "Photography Tour"].map(opt => (
                    <button key={opt} onClick={() => toggleExtra(opt)} className={`p-5 rounded-2xl border transition-all font-medium text-left flex justify-between items-center text-lg shadow-md ${extras.includes(opt) ? 'border-[var(--saffron)] bg-[var(--saffron)]/15 text-[var(--saffron)]' : 'border-white/10 bg-black/40 text-white hover:border-white/30'}`}>
                      <span>{opt}</span>
                      {extras.includes(opt) && <CheckCircle size={22} />}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-6 border-t border-white/10">
                  <button onClick={() => setStep(4)} className="text-sm text-white/50 hover:text-white uppercase tracking-widest font-bold flex items-center gap-2"><ArrowLeft size={16} /> Back</button>
                  <button onClick={handleGenerate} className="bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.4)] text-sm flex items-center gap-2">
                    Generate Plan ✨
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Loading & Result */}
            {step === 6 && (
              <div className="w-full">
                {isLoading ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-16 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center min-h-[500px]">
                    <div className="relative w-24 h-24 mb-10">
                      <div className="absolute inset-0 border-4 border-white/5 border-t-[var(--saffron)] rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-white/5 border-l-[var(--saffron)] rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    </div>
                    <h3 className="text-3xl font-display text-white text-center">Crafting your itinerary...</h3>
                    <p className="text-white/50 text-base mt-4 text-center max-w-sm">Waza AI is consulting the best local spots and Wazwan experts to create your perfect trip.</p>
                  </div>
                ) : (
                  result?.fallback ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                      <div className="prose prose-invert prose-p:text-white/80 prose-headings:text-white prose-a:text-[var(--saffron)] max-w-none">
                        <div className="mb-8 p-6 bg-gradient-to-r from-[var(--saffron)]/10 to-transparent border-l-2 border-[var(--saffron)] rounded-r-2xl">
                          <p className="text-[var(--saffron)] font-medium text-base m-0 flex items-center gap-3">
                            <span className="text-xl">✨</span> Here is your custom itinerary!
                          </p>
                        </div>
                        <ReactMarkdown>{result.fallback}</ReactMarkdown>
                      </div>
                      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col items-center">
                        <button onClick={handleBook} className="w-full md:w-auto bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black px-12 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_rgba(212,175,55,0.4)] mb-4">
                          Confirm Booking
                        </button>
                        <button onClick={() => setStep(5)} className="text-white/50 hover:text-white font-bold uppercase tracking-widest text-sm underline">
                          Go Back to Edit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="-mx-4 md:mx-0">
                      <TripPlanResults planData={result} onBook={handleBook} onBack={() => setStep(5)} />
                    </div>
                  )
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
