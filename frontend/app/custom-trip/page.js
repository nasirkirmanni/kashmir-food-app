"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Calendar, Users, Wallet, Utensils, AlertTriangle, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
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
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const totalDays = planData.days?.length || 0;

  const nextDay = () => setActiveDayIdx(p => Math.min(p + 1, totalDays - 1));
  const prevDay = () => setActiveDayIdx(p => Math.max(p - 1, 0));

  return (
    <div className="flex-1 flex flex-col items-center w-full h-auto">
      
      {/* Header Area */}
      <div className="w-full flex items-center gap-3 px-5 mb-5 max-w-[400px] mx-auto shrink-0 z-20 relative">
        <button onClick={onBack} className="text-white/70 hover:text-white transition-colors p-1 flex-shrink-0 -ml-1">
          <ArrowLeft size={20} />
        </button>
        <h3 className="text-[17px] font-display text-white truncate flex-1">{planData.title || "Your Custom Itinerary"}</h3>
      </div>

      <div className="w-full max-w-[400px] mx-auto flex flex-col z-20 flex-1 min-h-0 px-4">
        
        {/* Trip Summary Card */}
        {planData.summary && (
          <div className="bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[24px] p-4 mb-6 flex shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md shrink-0 divide-x divide-white/5">
            <div className="flex items-center gap-3 w-1/3 justify-center px-1">
              <Calendar size={18} className="text-[var(--saffron)] opacity-90 shrink-0" />
              <div className="flex flex-col items-start overflow-hidden">
                <p className="text-[9px] uppercase tracking-[1px] text-white/50 font-bold mb-1">Dates</p>
                <p className="text-[12px] text-white font-medium truncate w-full">{planData.summary.duration?.replace('days', 'days') || planData.summary.dates}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-1/3 justify-center px-1">
              <Users size={18} className="text-[var(--saffron)] opacity-90 shrink-0" />
              <div className="flex flex-col items-start overflow-hidden">
                <p className="text-[9px] uppercase tracking-[1px] text-white/50 font-bold mb-1">Group Size</p>
                <p className="text-[12px] text-white font-medium truncate w-full">{planData.summary.groupSize?.replace('people', 'ppl')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-1/3 justify-center px-1">
              <Wallet size={18} className="text-[var(--saffron)] opacity-90 shrink-0" />
              <div className="flex flex-col items-start overflow-hidden">
                <p className="text-[9px] uppercase tracking-[1px] text-white/50 font-bold mb-1">Budget</p>
                <p className="text-[12px] text-white font-medium truncate w-full">{planData.summary.budget || planData.summary.totalBudget}</p>
              </div>
            </div>
          </div>
        )}

        {/* Carousel Container */}
        <div className="w-full shrink min-h-0 flex flex-col bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md mb-6 overflow-hidden">
          
          {/* Static Header with Navigation */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b border-white/5 shrink-0 bg-black/20">
            <button 
              onClick={prevDay} 
              disabled={activeDayIdx === 0}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${activeDayIdx === 0 ? 'opacity-20 cursor-not-allowed text-white' : 'hover:bg-white/10 text-white'}`}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex flex-col items-center flex-1 px-3 text-center overflow-hidden">
              <h4 className="text-[12px] font-display text-[var(--saffron)] uppercase tracking-widest mb-1">Day {activeDayIdx + 1}</h4>
              <h5 className="text-[15px] text-white font-medium truncate w-full">{planData.days?.[activeDayIdx]?.title}</h5>
            </div>
            
            <button 
              onClick={nextDay} 
              disabled={activeDayIdx === totalDays - 1}
              className={`p-2 rounded-full transition-colors flex-shrink-0 ${activeDayIdx === totalDays - 1 ? 'opacity-20 cursor-not-allowed text-white' : 'hover:bg-white/10 text-white'}`}
            >
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Scrollable Activities */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
            <AnimatePresence mode="wait">
              {planData.days?.map((day, idx) => {
                if (idx !== activeDayIdx) return null;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col p-5 space-y-4"
                  >
                    {day.activities?.map((act, actIdx) => (
                      <div key={actIdx} className={`p-4 rounded-[16px] ${act.isFoodHighlight ? 'bg-[var(--saffron)]/10 border border-[var(--saffron)]/30' : 'bg-black/40 border border-white/5'}`}>
                        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                          <span className="text-[10px] uppercase tracking-[1px] bg-white/10 text-white/90 px-2.5 py-1 rounded text-center font-bold">
                            {act.timeOfDay}
                          </span>
                          {act.isFoodHighlight && (
                            <span className="text-[10px] uppercase tracking-[1px] bg-[var(--saffron)]/20 text-[var(--saffron)] px-2.5 py-1 rounded flex items-center gap-1.5 font-bold">
                              <Utensils size={10} /> Food
                            </span>
                          )}
                        </div>
                        <p className="text-white/80 leading-[1.6] text-[14px]">
                          {act.description}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 flex justify-center mt-auto pb-4 pt-2">
          <button onClick={onBook} className="w-[240px] h-[52px] rounded-full bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black font-bold text-[13px] tracking-[1.5px] uppercase flex items-center justify-center shadow-[0_0_24px_rgba(212,175,55,0.35)] hover:scale-105 transition-transform">
            Confirm Booking
          </button>
        </div>

      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default function CustomTripPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [step, setStep] = useState(1);
  
  // Strictly lock the body scroll on wizard steps to prevent parent containers from allowing bounce/scroll (except step 6 which needs native scrolling)
  useEffect(() => {
    if (step !== 6) {
      document.body.classList.add('is-locked-route');
    } else {
      document.body.classList.remove('is-locked-route');
    }
    return () => document.body.classList.remove('is-locked-route');
  }, [step]);
  const [people, setPeople] = useState(2);
  const [duration, setDuration] = useState("");
  const [vibe, setVibe] = useState("");
  const [budget, setBudget] = useState("");
  const [extras, setExtras] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Guest details state
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestPhone, setGuestPhone] = useState("");

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
    if (user) {
      router.push("/select-tour-partner");
    } else {
      setStep(7);
    }
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !guestPhone) {
      setErrorMsg("Please fill in all contact details.");
      return;
    }
    
    // Store guest details and the generated itinerary so the next page can use them
    sessionStorage.setItem("waza_guest_lead", JSON.stringify({
      name: guestName,
      email: guestEmail,
      phone: guestPhone,
      itinerary: result
    }));
    
    router.push("/select-tour-partner");
  };

  if (!mounted) return null;

  return (
    <div className={`wazwan-shell bg-[#0B0B0B] font-sans w-full flex flex-col relative z-10 ${step !== 6 ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh] pb-[calc(70px+env(safe-area-inset-bottom)+24px)]'}`}>
      {/* UNIFIED BACKGROUND SYSTEM */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[#0B0B0B]">
          
          {/* Top photo layer with CSS mask-image fade */}
          <div 
            className="absolute top-0 left-0 w-full h-[65%]"
            style={{
              backgroundImage: "url('/dal.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: step === 1 ? 0.35 : 0.15,
              WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 85%)',
              maskImage: 'linear-gradient(to bottom, black 0%, transparent 85%)',
              transition: 'opacity 0.5s ease'
            }}
          />

          {/* Floral motif layer with continuous repeat-x and mirrored mask */}
          <div 
            className="absolute bottom-0 left-0 w-full h-[45%]"
            style={{
              backgroundImage: "url('/kashmiri-floral-art.png')",
              backgroundSize: 'auto 100%',
              backgroundPosition: 'bottom',
              backgroundRepeat: 'repeat-x',
              opacity: step === 1 ? 0.12 : 0.04,
              mixBlendMode: 'screen',
              WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 85%)',
              maskImage: 'linear-gradient(to top, black 0%, transparent 85%)',
              filter: 'grayscale(1) sepia(1) saturate(2.5) hue-rotate(-15deg)',
              transition: 'opacity 0.5s ease'
            }}
          />

          {/* Subtle radial-gradient vignette */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at center, transparent 0%, rgba(11,11,11,0.85) 100%)'
            }}
          />
      </div>
      
      <div className={`relative z-10 w-full max-w-3xl mx-auto flex flex-col flex-1 ${step !== 6 ? 'pb-20' : ''}`}>
        {/* Header */}
        <div className="relative flex flex-col items-center justify-center pt-14 pb-8 px-5 w-full h-[140px] mb-6 shrink-0">
          {step > 1 ? (
            <div className="absolute top-14 left-5 z-20">
              <button onClick={() => setStep(prev => prev - 1)} className="text-white/70 hover:text-white transition-colors p-1">
                <ArrowLeft size={24} />
              </button>
            </div>
          ) : (
            <Link href="/" className="absolute top-14 left-5 z-20 text-white/70 hover:text-white transition-colors p-1">
              <ArrowLeft size={24} />
            </Link>
          )}
          <div className="flex flex-col items-center z-10">
            <p className="text-[11px] font-bold uppercase tracking-[3px] text-[var(--saffron)] mb-2.5">
              WAZA AI CONCIERGE
            </p>
            <h1 className="font-display text-[32px] font-medium text-white mb-3 leading-none">
              Trip Planner
            </h1>
            <div className="flex items-center gap-3 opacity-80 mt-1">
              <div className="w-8 h-[1px] bg-[var(--saffron)]"></div>
              <span className="text-[var(--saffron)] text-[12px] leading-none">❖</span>
              <div className="w-8 h-[1px] bg-[var(--saffron)]"></div>
            </div>
          </div>
        </div>

        {/* Wizard Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full px-4 md:px-0 flex-1 flex flex-col"
          >
            {/* Step 1: People */}
            {step === 1 && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-[400px] mx-auto bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md px-5 py-8 flex flex-col items-center z-20 relative">
                  <h3 className="text-[18px] font-display text-white mb-6 text-center">How many people are travelling?</h3>
                  
                  <div className="flex items-baseline justify-center gap-2 mb-[22px]">
                    <span className="text-[52px] font-display text-[var(--saffron)] leading-none">{people}</span>
                    <span className="text-[14px] text-white/50 uppercase tracking-[2px] font-medium">PEOPLE</span>
                  </div>
                  
                  <div className="w-full px-2 mb-[28px] relative">
                    <input 
                      type="range" 
                      min="1" 
                      max="15" 
                      value={people} 
                      onChange={e => setPeople(parseInt(e.target.value))} 
                      className="w-full h-1 rounded-full appearance-none cursor-pointer focus:outline-none"
                      style={{
                        background: `linear-gradient(to right, var(--saffron) ${(people-1)/14*100}%, rgba(255,255,255,0.15) ${(people-1)/14*100}%)`
                      }}
                    />
                    <style jsx>{`
                      input[type=range]::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        height: 20px;
                        width: 20px;
                        border-radius: 50%;
                        background: var(--saffron);
                        cursor: pointer;
                      }
                    `}</style>
                    <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-[1px] mt-4 font-bold">
                      <span>1 (Solo)</span>
                      <span>15+ (Group)</span>
                    </div>
                  </div>
  
                  <button 
                    onClick={() => setStep(2)}
                    className="w-[160px] h-[50px] rounded-full bg-[#1A1A1A] border border-[#333] text-white font-medium text-[13px] tracking-[2px] uppercase flex items-center justify-center gap-3 hover:bg-[#222] transition-colors"
                  >
                    CONTINUE <ArrowRight size={16} className="text-[var(--saffron)]" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Dates */}
            {step === 2 && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-[400px] mx-auto bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md px-5 py-8 flex flex-col z-20 relative">
                  <h3 className="text-[18px] font-display text-white mb-6 text-center">When do you want to visit Kashmir?</h3>
                  <input 
                    type="text" 
                    value={duration} 
                    onChange={e => { setDuration(e.target.value); setErrorMsg(""); }} 
                    onKeyDown={e => e.key === 'Enter' && handleNextStep(2, duration)} 
                    placeholder="e.g., 5 days in mid-July" 
                    className="w-full bg-black/50 border border-white/10 rounded-[14px] px-5 py-4 text-white placeholder-white/30 focus:outline-none focus:border-[var(--saffron)] transition-colors text-[15px] shadow-inner" 
                    autoFocus 
                  />
                  {errorMsg && <p className="text-red-400 text-[13px] mt-4 flex items-start gap-2 bg-red-400/10 p-3 rounded-xl"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{errorMsg}</p>}
                  <div className="mt-8 flex justify-between items-center">
                    <button onClick={() => setStep(1)} className="text-[12px] text-white/50 hover:text-white uppercase tracking-[2px] font-bold flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
                    <button onClick={() => handleNextStep(2, duration)} className="w-[140px] h-[44px] rounded-full bg-[#1A1A1A] border border-[#333] text-white font-medium text-[12px] tracking-[2px] uppercase flex items-center justify-center gap-2 hover:bg-[#222] transition-colors">
                      CONTINUE <ArrowRight size={14} className="text-[var(--saffron)]" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Vibe */}
            {step === 3 && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-[400px] mx-auto bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md px-5 py-8 flex flex-col z-20 relative">
                  <h3 className="text-[18px] font-display text-white mb-6 text-center">What vibe are you looking for?</h3>
                  <div className="flex flex-col gap-3">
                    {["Adventure & Trekking", "Romantic Getaway", "Family Vacation", "Cultural Deep Dive", "Luxury & Relaxation"].map(opt => (
                      <button key={opt} onClick={() => { setVibe(opt); handleNextStep(3, opt); }} className="p-4 rounded-2xl border border-white/10 bg-black/40 text-white hover:border-[var(--saffron)] hover:bg-[var(--saffron)]/10 transition-all font-medium text-left text-[14px] shadow-md">
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-start">
                    <button onClick={() => setStep(2)} className="text-[12px] text-white/50 hover:text-white uppercase tracking-[2px] font-bold flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Budget */}
            {step === 4 && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-[400px] mx-auto bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md px-5 py-8 flex flex-col z-20 relative">
                  <h3 className="text-[18px] font-display text-white mb-6 text-center">Estimated budget per person?</h3>
                  <div className="flex flex-col gap-3">
                    {["Under ₹10,000 (Backpacker)", "₹10,000 – ₹25,000 (Standard)", "₹25,000 – ₹50,000 (Premium)", "₹50,000+ (Luxury)"].map(opt => (
                      <button key={opt} onClick={() => { setBudget(opt); handleNextStep(4, opt); }} className="p-4 rounded-2xl border border-white/10 bg-black/40 text-white hover:border-[var(--saffron)] hover:bg-[var(--saffron)]/10 transition-all font-medium text-left text-[14px] shadow-md">
                        {opt}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-start">
                    <button onClick={() => setStep(3)} className="text-[12px] text-white/50 hover:text-white uppercase tracking-[2px] font-bold flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Extras */}
            {step === 5 && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-[400px] mx-auto bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md px-5 py-8 flex flex-col z-20 relative">
                  <h3 className="text-[18px] font-display text-white mb-6 text-center">Any special extras?</h3>
                  <div className="flex flex-col gap-3 mb-8">
                    {["Traditional Wazwan Feast", "Houseboat Stay on Dal Lake", "Gulmarg Gondola Ride", "Local Guide / Driver", "Photography Tour"].map(opt => (
                      <button key={opt} onClick={() => toggleExtra(opt)} className={`p-4 rounded-2xl border transition-all font-medium text-left flex justify-between items-center text-[14px] shadow-md ${extras.includes(opt) ? 'border-[var(--saffron)] bg-[var(--saffron)]/15 text-[var(--saffron)]' : 'border-white/10 bg-black/40 text-white hover:border-white/30'}`}>
                        <span>{opt}</span>
                        {extras.includes(opt) && <CheckCircle size={18} />}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-white/10">
                    <button onClick={() => setStep(4)} className="text-[12px] text-white/50 hover:text-white uppercase tracking-[2px] font-bold flex items-center gap-2"><ArrowLeft size={14} /> Back</button>
                    <button onClick={handleGenerate} className="h-[44px] px-6 rounded-full bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black font-bold text-[12px] tracking-[1px] uppercase flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform">
                      Generate ✨
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Loading & Result */}
            {step === 6 && (
              <div className="flex-1 flex flex-col w-full">
                {isLoading ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-16 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center flex-1 w-full max-w-[400px] mx-auto my-auto min-h-0 h-auto max-h-[500px]">
                    <div className="relative w-24 h-24 mb-10">
                      <div className="absolute inset-0 border-4 border-white/5 border-t-[var(--saffron)] rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-white/5 border-l-[var(--saffron)] rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                    </div>
                    <h3 className="text-3xl font-display text-white text-center">Crafting your itinerary...</h3>
                    <p className="text-white/50 text-base mt-4 text-center max-w-sm">Waza AI is consulting the best local spots and Wazwan experts to create your perfect trip.</p>
                  </div>
                ) : (
                  result?.fallback ? (
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl max-w-3xl mx-auto my-auto">
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
                    <div className="flex-1 flex flex-col w-full min-h-0">
                      <TripPlanResults planData={result} onBook={handleBook} onBack={() => setStep(5)} />
                    </div>
                  )
                )}
              </div>
            )}

            {/* Step 7: Guest Contact Details */}
            {step === 7 && (
              <div className="flex-1 flex flex-col items-center justify-center w-full">
                <div className="w-full max-w-[400px] mx-auto bg-[rgba(20,20,20,0.9)] border border-white/[0.05] rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.6)] backdrop-blur-md px-5 py-8 flex flex-col z-20 relative">
                  <h3 className="text-[18px] font-display text-[var(--saffron)] mb-3 text-center">Almost there!</h3>
                  <p className="text-white/60 text-center text-[13px] mb-6 leading-relaxed">Provide your details to get custom quotes from our travel partners.</p>
                  
                  <form onSubmit={handleGuestSubmit} className="space-y-4 w-full">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[1px] text-white/50 font-bold mb-1.5">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={guestName}
                        onChange={e => { setGuestName(e.target.value); setErrorMsg(""); }}
                        className="w-full bg-black/50 border border-white/10 rounded-[12px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[var(--saffron)] transition-colors" 
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[1px] text-white/50 font-bold mb-1.5">Email Address</label>
                      <input 
                        type="email" 
                        required
                        value={guestEmail}
                        onChange={e => { setGuestEmail(e.target.value); setErrorMsg(""); }}
                        className="w-full bg-black/50 border border-white/10 rounded-[12px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[var(--saffron)] transition-colors" 
                        placeholder="john@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[1px] text-white/50 font-bold mb-1.5">Phone Number</label>
                      <input 
                        type="tel" 
                        required
                        value={guestPhone}
                        onChange={e => { setGuestPhone(e.target.value); setErrorMsg(""); }}
                        className="w-full bg-black/50 border border-white/10 rounded-[12px] px-4 py-3 text-[14px] text-white focus:outline-none focus:border-[var(--saffron)] transition-colors" 
                        placeholder="+91 98765 43210"
                      />
                    </div>
  
                    {errorMsg && <p className="text-red-400 text-[13px] mt-2 flex items-start gap-2 bg-red-400/10 p-3 rounded-xl"><AlertTriangle size={16} className="mt-0.5 shrink-0" />{errorMsg}</p>}
  
                    <div className="mt-8 flex flex-col items-center gap-4 pt-4 border-t border-white/10">
                      <button type="submit" className="w-full h-[46px] rounded-full bg-gradient-to-r from-[var(--saffron)] to-[#e8c35e] text-black font-bold text-[12px] tracking-[1px] uppercase flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform">
                        Select Partner
                      </button>
                      <button type="button" onClick={() => setStep(6)} className="text-[11px] text-white/50 hover:text-white uppercase tracking-[1px] font-bold flex items-center gap-2">
                        <ArrowLeft size={14} /> Back
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
