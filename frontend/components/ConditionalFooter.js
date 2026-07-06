"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // Hide footer on authentication pages to keep them compact
  const hideFooterRoutes = ["/login", "/signup", "/travel-agent/signup", "/travel-agent/login", "/forgot-password"];
  
  if (hideFooterRoutes.includes(pathname)) {
    return null;
  }

  return (
    <div className="hidden md:block">
      <Footer />
    </div>
  );
}
