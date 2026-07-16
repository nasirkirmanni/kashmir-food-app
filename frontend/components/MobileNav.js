"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Home, MapPin, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMobileNavigation } from "@/context/MobileNavigationContext";

const BowlFoodIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Bowl */}
    <path d="M2 12h20a10 10 0 0 1-20 0Z" />
    {/* Food piled inside */}
    <path d="M5 12a7 7 0 0 1 14 0" />
    <path d="M12 6v2" />
    <path d="M8.5 7.5l1.5 1.5" />
    <path d="M15.5 7.5l-1.5 1.5" />
  </svg>
);

const ChefAIIcon = ({ size = 24, strokeWidth = 2, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {/* Chef Hat Outline */}
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <path d="M6 17h12" />
    {/* 'AI' text inside the lower part of the hat */}
    <path d="M9 14.5l1.5-3.5l1.5 3.5" />
    <path d="M9.8 13.5h1.4" />
    <path d="M14 11v3.5" />
  </svg>
);

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { activeIndex, setActiveIndex, isMobile } = useMobileNavigation();

  const isProfileIncomplete = user && (!user.phoneNumber || !user.address);

  // NOTE: "/login" is intentionally excluded — it's an auth route rendered via
  // the route overlay (LoginClient), not a swipeable tab screen. See
  // MobileSwipeContainer.js for the matching exclusion.
  const isSwipeableRoute = [
    "/",
    "/restaurants",
    "/waza-ai",
    "/kashmiri-food",
    "/profile",
  ].includes(pathname);

  const isActiveTab = (index) => isSwipeableRoute && activeIndex === index;

  const handleNavClick = (index, e) => {
    if (isMobile) {
      if (!isSwipeableRoute) {
        // Let Next.js <Link> handle it normally to exit the non-swipeable page
        setActiveIndex(index);
        return;
      }
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  // Scroll listener for compact state
  useEffect(() => {
    const navEl = document.getElementById("mobile-nav-pill");
    if (!navEl) return;

    let scrollTarget = window;
    
    if (isSwipeableRoute) {
      // Find the active .screen container. 
      // MobileSwipeContainer statically renders exactly 5 .screen divs in sequence.
      const screens = document.querySelectorAll('.screen');
      if (screens && screens.length > activeIndex) {
        scrollTarget = screens[activeIndex];
      }
    }

    let scrollTimer = null;
    let isCompact = false;

    const onScroll = () => {
      if (!isCompact) {
        navEl.classList.add("nav-compact");
        isCompact = true;
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        navEl.classList.remove("nav-compact");
        isCompact = false;
      }, 240);
    };

    scrollTarget.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      scrollTarget.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimer);
      if (isCompact) {
        navEl.classList.remove("nav-compact");
      }
    };
  }, [activeIndex, isSwipeableRoute]);

  return (
    <nav id="mobile-nav-pill" className="md:hidden nav-pill">
      <Link 
        href="/" 
        prefetch={false}
        aria-label="Home"
        className={`nav-icon-pill ${isActiveTab(0) ? "active" : ""}`}
        onClick={(e) => {
          window.dispatchEvent(new Event('close-all-modals'));
          handleNavClick(0, e);
        }}
      >
        <Home size={24} strokeWidth={isActiveTab(0) ? 2.5 : 2} />
        {isActiveTab(0) && <span className="nav-dot" />}
      </Link>

      <Link 
        href="/restaurants" 
        prefetch={false}
        aria-label="Restaurants"
        className={`nav-icon-pill ${isActiveTab(1) ? "active" : ""}`}
        onClick={(e) => handleNavClick(1, e)}
      >
        <MapPin size={24} strokeWidth={isActiveTab(1) ? 2.5 : 2} />
        {isActiveTab(1) && <span className="nav-dot" />}
      </Link>

      <Link 
        href="/waza-ai"
        prefetch={false}
        aria-label="Waza AI Concierge"
        className={`nav-icon-pill ${isActiveTab(2) ? "active" : ""}`}
        onClick={(e) => handleNavClick(2, e)}
      >
        <ChefAIIcon size={24} strokeWidth={2.5} />
        {isActiveTab(2) && <span className="nav-dot" />}
      </Link>

      <Link 
        href="/kashmiri-food" 
        prefetch={false}
        aria-label="Kashmiri Food"
        className={`nav-icon-pill ${isActiveTab(3) ? "active" : ""}`}
        onClick={(e) => handleNavClick(3, e)}
      >
        <BowlFoodIcon size={24} strokeWidth={isActiveTab(3) ? 2.5 : 2} />
        {isActiveTab(3) && <span className="nav-dot" />}
      </Link>

      <Link 
        href={user ? "/profile" : "/login"} 
        prefetch={false}
        aria-label="Profile"
        className={`nav-icon-pill ${isActiveTab(4) ? "active" : ""}`}
        onClick={(e) => handleNavClick(4, e)}
      >
        <User size={24} strokeWidth={isActiveTab(4) ? 2.5 : 2} />
        {isProfileIncomplete && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-transparent"></span>
        )}
        {isActiveTab(4) && <span className="nav-dot" />}
      </Link>
    </nav>
  );
}
