"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    // Redirect if not logged in
    if (user === null) {
      router.push("/login");
    } else if (user) {
      // Fetch saved dishes count
      request(endpoints.favorites)
        .then((data) => setSavedCount(data.length || 0))
        .catch((err) => console.error("Failed to load favorites count", err));
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) return null;

  // Generate initials for Avatar fallback
  const initials = (user.name || "User").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  // TODO: backend field not yet implemented
  const roleTag = "Cultural Explorer · Srinagar";
  
  // TODO: backend field not yet implemented
  const levelText = "Level 6 · Explorer";
  const xpText = "1,240 XP";
  const xpUntilNext = "340 XP until Master Explorer";
  
  // TODO: backend field not yet implemented
  const memberSince = "Member since July 2026";
  
  // Mocked counts (except savedCount which is real)
  const dishesCount = 31;
  const restaurantsCount = 9;
  const placesCount = 14;
  const aiChatsCount = 42;

  return (
    <div className="min-h-screen bg-[var(--profile-bg)] text-[var(--profile-text)] font-sans flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-[var(--profile-bg)] relative overflow-hidden px-[26px] pt-16 pb-[120px]">
        
        {/* faint signature motif */}
        <div className="absolute -top-10 -right-15 w-[320px] h-[320px] opacity-[0.06] pointer-events-none">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <g stroke="#C9A063" strokeWidth="0.6">
              <circle cx="100" cy="100" r="70" strokeDasharray="2 6"/>
              <path d="M100 30 C 120 55, 120 75, 100 100 C 80 75, 80 55, 100 30 Z"/>
              <path d="M170 100 C 145 120, 125 120, 100 100 C 125 80, 145 80, 170 100 Z"/>
              <path d="M100 170 C 80 145, 80 125, 100 100 C 120 125, 120 145, 100 170 Z"/>
              <path d="M30 100 C 55 80, 75 80, 100 100 C 75 120, 55 120, 30 100 Z"/>
            </g>
          </svg>
        </div>

        {/* header */}
        <div className="flex items-end justify-between relative z-10 mb-11">
          <div>
            <div className="text-[10px] tracking-[2.5px] uppercase text-[var(--profile-gold-dim)] mb-2">Your Wazwan Journey</div>
            <h1 className="font-serif italic font-normal text-[34px] tracking-[0.3px]" style={{fontFamily: "'Cormorant Garamond', serif"}}>Profile</h1>
          </div>
          <div className="w-5 h-5 opacity-55">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]">
              <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 01-3.4 0"/>
            </svg>
          </div>
        </div>

        {/* identity */}
        <div className="flex items-center gap-5 relative z-10">
          <div className="relative w-[76px] h-[76px] flex-shrink-0">
            <div className="absolute -top-1 -left-1 -right-1 -bottom-1 rounded-full border border-[rgba(201,160,99,0.18)]"></div>
            {user.avatar ? (
               <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover shadow-[0_0_0_1px_rgba(201,160,99,0.3)]" />
            ) : (
               <div className="w-full h-full rounded-full bg-[var(--profile-surface)] shadow-[0_0_0_1px_rgba(201,160,99,0.3)] flex items-center justify-center text-[var(--profile-gold)] text-2xl font-serif">{initials}</div>
            )}
          </div>
          <div>
            <div className="text-[24px] font-medium text-[var(--profile-text)] leading-[1.15]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{user.name || "Guest User"}</div>
            <div className="mt-1 text-[12px] text-[var(--profile-text-muted)] tracking-[0.2px]">{roleTag}</div>
          </div>
        </div>

        {/* level + xp */}
        <div className="mt-7 relative z-10">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-[11px] tracking-[1.5px] uppercase text-[var(--profile-gold)]">{levelText}</span>
            <span className="italic text-[15px] text-[var(--profile-text-muted)]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{xpText}</span>
          </div>
          <div className="w-full h-[1.5px] bg-[var(--profile-line)] relative rounded-sm overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-[78%] bg-[var(--profile-gold)]"></div>
          </div>
          <div className="mt-2.5 text-[11px] text-[var(--profile-text-muted)] tracking-[0.2px]">{xpUntilNext}</div>
          <div className="mt-[18px] text-[11px] text-[var(--profile-text-muted)] tracking-[0.3px]">{memberSince}</div>
        </div>

        <div className="h-[1px] bg-[var(--profile-line)] my-9"></div>

        {/* stats */}
        <div className="text-[10.5px] tracking-[2.5px] uppercase text-[var(--profile-gold-dim)] mb-5">Overview</div>
        <div className="flex justify-between relative z-10 mb-9">
          <div className="text-center flex-1">
            <div className="italic text-[22px] text-[var(--profile-gold)]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{savedCount}</div>
            <div className="mt-1.5 text-[9.5px] tracking-[1px] uppercase text-[var(--profile-text-muted)]">Saved</div>
          </div>
          <div className="text-center flex-1">
            <div className="italic text-[22px] text-[var(--profile-gold)]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{dishesCount}</div>
            <div className="mt-1.5 text-[9.5px] tracking-[1px] uppercase text-[var(--profile-text-muted)]">Dishes</div>
          </div>
          <div className="text-center flex-1">
            <div className="italic text-[22px] text-[var(--profile-gold)]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{restaurantsCount}</div>
            <div className="mt-1.5 text-[9.5px] tracking-[1px] uppercase text-[var(--profile-text-muted)]">Restaurants</div>
          </div>
          <div className="text-center flex-1">
            <div className="italic text-[22px] text-[var(--profile-gold)]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{placesCount}</div>
            <div className="mt-1.5 text-[9.5px] tracking-[1px] uppercase text-[var(--profile-text-muted)]">Places</div>
          </div>
          <div className="text-center flex-1">
            <div className="italic text-[22px] text-[var(--profile-gold)]" style={{fontFamily: "'Cormorant Garamond', serif"}}>{aiChatsCount}</div>
            <div className="mt-1.5 text-[9.5px] tracking-[1px] uppercase text-[var(--profile-text-muted)]">AI Chats</div>
          </div>
        </div>

        <div className="h-[1px] bg-[var(--profile-line)] my-9"></div>

        {/* actions list */}
        <div className="text-[10.5px] tracking-[2.5px] uppercase text-[var(--profile-gold-dim)] mb-5">Your Space</div>
        <div className="relative z-10">
          <Link href="/favorites" className="flex items-center gap-4 py-4 border-b border-[var(--profile-line)] cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-[18px] h-[18px] text-[var(--profile-gold)] flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-gold)]"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 000-7.8z"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-[15px] text-[var(--profile-text)]">Saved</div>
              <div className="text-[11.5px] text-[var(--profile-text-muted)] mt-0.5">Your favorite dishes & places</div>
            </div>
            <div className="w-[14px] h-[14px] opacity-40 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </Link>
          
          <div className="flex items-center gap-4 py-4 border-b border-[var(--profile-line)] cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-[18px] h-[18px] text-[var(--profile-gold)] flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-gold)]"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-[15px] text-[var(--profile-text)]">Trips & Plans</div>
              <div className="text-[11.5px] text-[var(--profile-text-muted)] mt-0.5">Your itineraries</div>
            </div>
            <div className="w-[14px] h-[14px] opacity-40 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 border-b border-[var(--profile-line)] cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-[18px] h-[18px] text-[var(--profile-gold)] flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-gold)]"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-[15px] text-[var(--profile-text)]">Explore History</div>
              <div className="text-[11.5px] text-[var(--profile-text-muted)] mt-0.5">Wazwan heritage</div>
            </div>
            <div className="w-[14px] h-[14px] opacity-40 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          <div className="flex items-center gap-4 py-4 border-b border-[var(--profile-line)] cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-[18px] h-[18px] text-[var(--profile-gold)] flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-gold)]"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.04 1.56V21a2 2 0 01-4 0v-.09A1.7 1.7 0 009 19.35a1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.7 1.7 0 004.65 15a1.7 1.7 0 00-1.56-1.04H3a2 2 0 010-4h.09A1.7 1.7 0 004.65 9a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06A1.7 1.7 0 009 4.65a1.7 1.7 0 001.04-1.56V3a2 2 0 014 0v.09A1.7 1.7 0 0015 4.65a1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.35 9c.36.62.99 1.03 1.6 1.04H21a2 2 0 010 4h-.09A1.7 1.7 0 0019.4 15z"/></svg>
            </div>
            <div className="flex-1">
              <div className="text-[15px] text-[var(--profile-text)]">Settings & Preferences</div>
              <div className="text-[11.5px] text-[var(--profile-text-muted)] mt-0.5">Notifications, language, theme</div>
            </div>
            <div className="w-[14px] h-[14px] opacity-40 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>

          <Link href={user.role === 'agent' || user.isAdmin ? "/travel-agent/dashboard" : "/travel-agent/signup"} className="flex items-center gap-4 py-4 border-b border-[var(--profile-line)] cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-[18px] h-[18px] text-[var(--profile-gold)] flex-shrink-0">
               {user.role === 'agent' || user.isAdmin ? (
                 <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-gold)]">
                   <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                 </svg>
               ) : (
                 <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-gold)]">
                   <path d="M12 4v16m8-8H4" />
                 </svg>
               )}
            </div>
            <div className="flex-1">
              <div className="text-[15px] text-[var(--profile-text)]">{user.role === 'agent' || user.isAdmin ? 'Agent Dashboard' : 'Register Travel Agency'}</div>
              <div className="text-[11.5px] text-[var(--profile-text-muted)] mt-0.5">Manage your agency portal</div>
            </div>
            <div className="w-[14px] h-[14px] opacity-40 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </Link>

          <div onClick={handleLogout} className="flex items-center gap-4 py-4 cursor-pointer hover:bg-white/5 transition-colors group">
            <div className="w-[18px] h-[18px] flex-shrink-0">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-red-500/70"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </div>
            <div className="flex-1">
              <div className="text-[15px] text-red-500/90">Logout</div>
              <div className="text-[11.5px] text-red-500/50 mt-0.5">Sign out of your account</div>
            </div>
            <div className="w-[14px] h-[14px] opacity-40 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-red-500/50"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>

        {/* bottom floating nav */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-52px)] max-w-[340px] bg-[rgba(19,17,16,0.65)] backdrop-blur-[16px] border border-[rgba(201,160,99,0.12)] rounded-full flex items-center justify-around py-3.5 px-4.5 z-50">
          <Link href="/" className="w-[18px] h-[18px] opacity-45 relative hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/></svg>
          </Link>
          <Link href="/explore" className="w-[18px] h-[18px] opacity-45 relative hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><circle cx="12" cy="12" r="9"/><path d="M14.5 9.5l-6 2.5 2.5 6 3.5-6 6-2.5z"/></svg>
          </Link>
          <Link href="/plan" className="w-[18px] h-[18px] opacity-45 relative hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M4 18h16M6 18V9a2 2 0 012-2h8a2 2 0 012 2v9"/><path d="M9 7V5a3 3 0 016 0v2"/></svg>
          </Link>
          <Link href="/favorites" className="w-[18px] h-[18px] opacity-45 relative hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-text)]"><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z"/><path d="M9 4v14M15 6v14"/></svg>
          </Link>
          <Link href="/profile" className="w-[18px] h-[18px] opacity-100 relative group">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full stroke-[var(--profile-gold)]"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-[3.5px] h-[3.5px] rounded-full bg-[var(--profile-gold)]"></div>
          </Link>
        </div>

      </div>
    </div>
  );
}
