import "./globals.css";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";
import GlobalBackground from "@/components/GlobalBackground";
import WazaAI from "@/components/WazaAI";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"]
});

export const metadata = {
  title: "WazwanWay",
  description: "Discover authentic Kashmiri dishes, local restaurants, and trusted travel food tips.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${cormorant.variable} font-body bg-[#0B0B0B] text-white antialiased relative`}>
        <GlobalBackground />
        <AuthProvider>
          <div className="min-h-screen relative z-10 pb-24 md:pb-0">
            <SplashScreen />
            <Navbar />
            <main>{children}</main>
            <Footer />
            <WazaAI />
            <MobileNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
