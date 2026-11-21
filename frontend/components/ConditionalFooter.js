"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Explore ends with its own footer (app/explore/sections/ExploreFooter.js).
  const hideFooterRoutes = ["/explore"];
  
  if (hideFooterRoutes.includes(pathname) || pathname.startsWith("/scenic-drives/")) {
    return null;
  }

  return (
    <div className="hidden md:block">
      <Footer />
    </div>
  );
}
