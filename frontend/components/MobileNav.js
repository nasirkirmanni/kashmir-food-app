"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Utensils, MapPin, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isProfileIncomplete = user && (!user.phoneNumber || !user.address);

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/restaurants", icon: MapPin, label: "Restaurants" },
    { href: "/dishes", icon: Utensils, label: "Dishes" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-[400px]">
      <div className="flex items-center justify-between px-6 py-4 rounded-[32px] bg-[#1A1A1A]/90 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
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
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1A1A1A]"></span>
            )}
          </div>
        </Link>
      </div>
    </div>
  );
}
