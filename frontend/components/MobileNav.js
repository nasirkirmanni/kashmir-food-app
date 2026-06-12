"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  const handleNavClick = (index, e) => {
    if (isMobile) {
      e.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <div className="md:hidden bottom-bar">
      <Link 
        href="/" 
        aria-label="Home"
        className={`nav-icon ${activeIndex === 0 ? "active" : ""}`}
        onClick={(e) => {
          window.dispatchEvent(new Event('close-all-modals'));
          handleNavClick(0, e);
        }}
      >
        <Home size={22} strokeWidth={activeIndex === 0 ? 2.5 : 2} />
      </Link>

      <Link 
        href="/restaurants" 
        aria-label="Restaurants"
        className={`nav-icon ${activeIndex === 1 ? "active" : ""}`}
        onClick={(e) => handleNavClick(1, e)}
      >
        <MapPin size={22} strokeWidth={activeIndex === 1 ? 2.5 : 2} />
      </Link>

      <Link 
        href="/waza-ai"
        aria-label="Waza AI Concierge"
        className={`nav-icon ${activeIndex === 2 ? "active" : ""}`}
        onClick={(e) => handleNavClick(2, e)}
      >
        <ChefAIIcon size={22} strokeWidth={2.5} />
      </Link>

      <Link 
        href="/kashmiri-food" 
        aria-label="Kashmiri Food"
        className={`nav-icon ${activeIndex === 3 ? "active" : ""}`}
        onClick={(e) => handleNavClick(3, e)}
      >
        <BowlFoodIcon size={22} strokeWidth={activeIndex === 3 ? 2.5 : 2} />
      </Link>

      <Link 
        href={user ? "/profile" : "/login"} 
        aria-label="Profile"
        className={`nav-icon ${activeIndex === 4 ? "active" : ""}`}
        onClick={(e) => handleNavClick(4, e)}
      >
        <User size={22} strokeWidth={activeIndex === 4 ? 2.5 : 2} />
        {isProfileIncomplete && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-transparent"></span>
        )}
      </Link>
    </div>
  );
}
