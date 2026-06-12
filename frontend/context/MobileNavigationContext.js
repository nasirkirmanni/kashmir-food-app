"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const MobileNavigationContext = createContext(null);

const routeIndexMap = {
  "/": 0,
  "/restaurants": 1,
  "/waza-ai": 2,
  "/kashmiri-food": 3,
  "/dishes": 3,
  "/profile": 4,
  "/login": 4,
};

const indexRouteMap = [
  "/",
  "/restaurants",
  "/waza-ai",
  "/kashmiri-food",
  "/profile",
];

export function MobileNavigationProvider({ children }) {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Sync activeIndex with initial pathname
  useEffect(() => {
    if (pathname in routeIndexMap) {
      setActiveIndex(routeIndexMap[pathname]);
    }
  }, [pathname]);

  const navigateToTab = (index) => {
    if (index === activeIndex) return;
    setActiveIndex(index);
    const targetRoute = indexRouteMap[index];
    window.history.pushState(null, "", targetRoute);
  };

  return (
    <MobileNavigationContext.Provider
      value={{
        activeIndex,
        setActiveIndex: navigateToTab,
        isMobile,
      }}
    >
      {children}
    </MobileNavigationContext.Provider>
  );
}

export function useMobileNavigation() {
  const context = useContext(MobileNavigationContext);
  if (!context) {
    throw new Error(
      "useMobileNavigation must be used within a MobileNavigationProvider"
    );
  }
  return context;
}
