import Link from "next/link";
import Image from "next/image";
import { MapPin, ChefHat, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const LandingCanvas = dynamic(() => import("@/components/LandingCanvas"), { ssr: false });
const SaffronAnimation = dynamic(() => import("@/components/SaffronAnimation"), { ssr: false });

export default function HomePageHero() {
  const featureIconsGrid = (
    <div className="grid grid-cols-4 w-full">
      <div className="flex flex-col items-center text-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Authentic</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Handpicked experiences</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Premium</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Curated luxury dining</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Top Locations</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Across iconic places</p>
      </div>
      <div className="flex flex-col items-center text-center relative border-l border-white/10">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 md:h-8 md:w-8 text-[var(--saffron)] mb-2 md:mb-3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
        <p className="text-[0.45rem] md:text-xs font-bold uppercase tracking-wider text-white">Trusted</p>
        <p className="mt-1 text-[0.45rem] md:text-xs leading-tight text-white/50 px-1">Selected for quality</p>
      </div>
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════
          MOBILE HERO (below md)
          ═══════════════════════════════════════════════════════ */}
      <div className="relative block md:hidden pt-6 pb-10 min-h-[calc(100svh-72px)] flex flex-col overflow-hidden">
        <SaffronAnimation />
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="text-center px-5 pt-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--saffron)] bg-[#0B0B0B]/80 backdrop-blur-md px-5 py-2 text-[0.55rem] font-bold uppercase tracking-[0.22em] text-[var(--saffron)] shadow-[0_0_15px_rgba(212,175,55,0.15)]">
              <span className="text-xs">❖</span>
              Welcome to the Royal Cuisine of Kashmir
            </div>
            <h1 className="mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight text-white drop-shadow-lg">
              The <em className="text-[var(--saffron)] not-italic">Royal</em> Table
              <br />
              of Kashmir
            </h1>
            
            <div className="flex justify-center mt-4">
              <div className="flex items-center gap-3 text-[var(--saffron)] drop-shadow-md">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[var(--saffron)]/60"></div>
                <span className="text-xs">❖</span>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[var(--saffron)]/60"></div>
              </div>
            </div>

            <p className="mt-5 text-[0.85rem] leading-relaxed text-[#D1D5DB] mx-auto max-w-sm drop-shadow-md px-2">
              Wazwan is not just a meal. It is a cinematic experience of tradition, hospitality, storytelling, and unforgettable dishes from the kitchens of Kashmir to the traveler&apos;s table.
            </p>
          </div>

          <div className="mt-16 flex flex-row gap-3 px-4 sm:px-5 z-20 relative">
            {/* PRIMARY CARD: Explore Restaurants */}
            <Link 
              href="/restaurants" 
              className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-[#D4AF37]/30 bg-[#050505]/40 backdrop-blur-[24px] backdrop-saturate-[150%] transition-all duration-300 hover:bg-[#050505]/30 hover:border-[#D4AF37]/50 shadow-[inset_0_1px_0_0_rgba(212,175,55,0.2),_0_12px_40px_rgba(0,0,0,0.6)] flex-[1.2] min-h-[220px]"
            >
              <div className="absolute inset-0 pointer-events-none rounded-[32px] overflow-hidden mix-blend-overlay opacity-50 group-hover:opacity-70 transition-opacity duration-300">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-[#D4AF37]/10 to-transparent rotate-[35deg] transform translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-4 transition-transform duration-700 ease-out blur-md" />
                <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-gradient-to-bl from-white/10 to-transparent opacity-30" />
              </div>

              <div className="absolute top-[20%] right-[20%] w-1 h-1 bg-[#D4AF37] rounded-full blur-[1px] opacity-40 animate-pulse" />
              <div className="absolute bottom-[30%] left-[10%] w-1.5 h-1.5 bg-[#D4AF37] rounded-full blur-[2px] opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />

              <div className="relative z-10 p-5 pb-0 flex justify-between items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-[16px] bg-white/5 backdrop-blur-md border border-[#D4AF37]/20 shadow-[inset_0_1px_0_0_rgba(212,175,55,0.3)]">
                  <MapPin className="w-6 h-6 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" strokeWidth={1.5} />
                </div>
              </div>

              <div className="relative z-10 p-5 flex flex-col items-start text-left">
                <h2 className="font-display text-[1.35rem] sm:text-2xl font-medium text-[#D4AF37] leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-1.5">
                  Explore<br/>Restaurants
                </h2>
                <p className="text-[0.65rem] sm:text-xs text-[#D4AF37]/70 font-light leading-snug pr-4">
                  Find the finest dining experiences in Kashmir
                </p>
                
                <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-[#D4AF37]/10 backdrop-blur-md border border-[#D4AF37]/30 flex items-center justify-center transform group-hover:translate-x-1.5 transition-transform duration-300 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" strokeWidth={2} />
                </div>
              </div>
            </Link>
            
            {/* SECONDARY CARD: Discover the Dishes */}
            <Link 
              href="/dishes" 
              className="group relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-white/15 bg-[#050505]/40 backdrop-blur-[24px] backdrop-saturate-[150%] transition-all duration-300 hover:bg-[#050505]/30 hover:border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),_0_12px_40px_rgba(0,0,0,0.6)] flex-1 min-h-[220px]"
            >
              <div className="absolute inset-0 pointer-events-none rounded-[32px] overflow-hidden mix-blend-overlay opacity-40 group-hover:opacity-60 transition-opacity duration-300">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-[35deg] transform translate-y-10 group-hover:translate-x-8 group-hover:-translate-y-4 transition-transform duration-700 ease-out blur-md" />
                <div className="absolute top-0 right-0 w-[100%] h-[100%] bg-gradient-to-bl from-white/10 to-transparent opacity-20" />
              </div>

              <div className="relative z-10 p-5 pb-0 flex justify-between items-start">
                <div className="flex items-center justify-center w-12 h-12 rounded-[16px] bg-white/5 backdrop-blur-md border border-white/10 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]">
                  <ChefHat className="w-6 h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" strokeWidth={1.5} />
                </div>
              </div>

              <div className="relative z-10 p-5 flex flex-col items-start text-left">
                <h2 className="font-display text-[1.2rem] sm:text-xl font-medium text-white leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-1.5">
                  Discover<br/>the Dishes
                </h2>
                <p className="text-[0.6rem] sm:text-[0.65rem] text-white/60 font-light leading-snug pr-4">
                  Explore authentic Kashmiri flavors
                </p>
                
                <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform group-hover:translate-x-1.5 transition-transform duration-300 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                  <ArrowRight className="w-4 h-4 text-white" strokeWidth={2} />
                </div>
              </div>
            </Link>
          </div>
          
          <div className="mt-10 flex flex-col items-center justify-center text-white/50 pb-6 z-20 relative">
            <span className="text-[0.65rem] uppercase tracking-[0.2em] font-medium mb-2">Scroll</span>
            <div className="animate-bounce">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
            </div>
          </div>

        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          DESKTOP HERO (md and above)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative hidden md:flex min-h-screen items-center justify-start pt-20 overflow-hidden bg-[#0B0B0B]">
        <div className="absolute inset-0 z-0 flex justify-end">
          <div className="relative w-full h-full">
            <Image priority fetchPriority="high" fill src="/wazwan-hero.jpg" alt="Kashmiri Wazwan feast" className="object-cover object-right lg:object-center" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0B] via-[#0B0B0B]/60 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#0B0B0B] to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0B0B0B] to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_55%,rgba(212,175,55,0.05),transparent_55%)]" />
          </div>
        </div>
        
        {/* Decorative non-blocking Canvas */}
        <div className="hidden md:block absolute inset-0 z-0">
          <LandingCanvas />
        </div>
        
        <div className="page-shell relative z-10 w-full flex items-center">
          <div className="max-w-2xl text-left">
            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-[var(--saffron)]/40 bg-black/40 px-4 py-1.5 text-[0.55rem] font-bold uppercase tracking-[0.25em] text-[var(--saffron)] backdrop-blur-xl">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                <path d="M12 2C12 2 8 6 8 12C8 18 12 22 12 22C12 22 16 18 16 12C16 6 12 2 12 2Z" />
                <path d="M12 22C12 22 4 18 4 12C4 6 12 2 12 2" fillOpacity="0.5"/>
                <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2" fillOpacity="0.5"/>
              </svg>
              Welcome to the Royal Cuisine of Kashmir
            </div>
            
            <h1 className="mt-8 font-display text-6xl lg:text-[7rem] font-medium leading-[1.05] tracking-tight text-white drop-shadow-2xl">
              The <em className="text-[var(--saffron)] not-italic">Royal</em> Table
              <br />
              of Kashmir
            </h1>
            
            <div className="mt-8 flex justify-start">
              <svg width="60" height="12" viewBox="0 0 60 12" fill="none" className="text-[var(--saffron)]" aria-hidden="true">
                <path d="M30 0L35 6L30 12L25 6L30 0Z" fill="currentColor"/>
                <path d="M0 6H20" stroke="currentColor" strokeWidth="1"/>
                <path d="M40 6H60" stroke="currentColor" strokeWidth="1"/>
              </svg>
            </div>

            <p className="mt-6 max-w-lg font-body text-lg leading-relaxed text-white/80 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              Wazwan is not just a meal. It is a cinematic experience of tradition, hospitality, storytelling, and unforgettable dishes carried from the kitchens of Kashmir to the traveler&apos;s table.
            </p>
            
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/restaurants"
                aria-label="Explore Restaurants"
                className="group flex items-center gap-2 rounded-full border border-[var(--saffron)]/40 bg-black/20 pl-1 pr-3 py-1 text-[0.65rem] font-bold tracking-wide text-[var(--saffron)] backdrop-blur-xl shadow-[0_0_30px_rgba(212,175,55,0.15)] transition-all duration-300 hover:bg-black/40 hover:scale-105"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--saffron)]/20 text-[var(--saffron)] backdrop-blur-md">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                </div>
                Explore Restaurants
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
              
              <Link
                href="/dishes"
                aria-label="Discover the Dishes"
                className="hidden md:flex group items-center gap-2 rounded-full border border-white/20 bg-white/5 pl-1 pr-3 py-1 text-[0.65rem] font-semibold tracking-wide text-white backdrop-blur-md transition duration-300 hover:bg-white/10 hover:border-white/40"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--saffron)] text-[var(--saffron)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3 h-3" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/></svg>
                </div>
                Discover the Dishes
                <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
              </Link>
            </div>
            
            <div className="mt-16">
              {featureIconsGrid}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
