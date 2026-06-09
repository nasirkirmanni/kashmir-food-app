"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPin, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isProfileIncomplete = user && (!user.phoneNumber || !user.address);

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/restaurants", icon: MapPin, label: "Restaurants" },
    { href: "/dishes", icon: BowlFoodIcon, label: "Dishes" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
      <div 
        className="flex items-center justify-between px-6 py-4 rounded-[32px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
        style={{
          background: "rgba(20, 20, 20, 0.4)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
        }}
      >
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="relative group">
              <div className={`p-2 transition-colors ${isActive ? "text-white" : "text-white/40 hover:text-white/80"}`}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </Link>
          );
        })}

        <Link href={user ? "/profile" : "/login"} className="relative group">
          <div className={`p-2 transition-colors ${pathname === "/profile" ? "text-white" : "text-white/40 hover:text-white/80"}`}>
            <User size={24} strokeWidth={pathname === "/profile" ? 2.5 : 2} />
            {isProfileIncomplete && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black/40"></span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
