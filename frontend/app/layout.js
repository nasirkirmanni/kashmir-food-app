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

const BASE_URL = "https://wazwanway.com";

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Wazwan Way | Discover Authentic Kashmiri Cuisine",
    template: "%s | Wazwan Way",
  },
  description:
    "Discover authentic Kashmiri dishes, Wazwan restaurants, traditional recipes, and cultural food guides. Your premium guide to Kashmir's royal culinary heritage.",
  keywords: [
    "Kashmiri food",
    "Wazwan",
    "Kashmir restaurants",
    "Kashmiri cuisine",
    "Rogan Josh",
    "Gushtaba",
    "Kashmir travel food",
    "authentic Kashmiri recipes",
  ],
  authors: [{ name: "Wazwan Way", url: BASE_URL }],
  creator: "Wazwan Way",
  publisher: "Wazwan Way",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Wazwan Way",
    title: "Wazwan Way | Discover Authentic Kashmiri Cuisine",
    description:
      "Your premium guide to Kashmir's royal culinary heritage — dishes, restaurants, recipes, and culture.",
    images: [
      {
        url: "/wazwan-hero.jpg",
        width: 1200,
        height: 630,
        alt: "Wazwan Way — Authentic Kashmiri Cuisine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@wazwanway",
    creator: "@wazwanway",
    title: "Wazwan Way | Discover Authentic Kashmiri Cuisine",
    description:
      "Your premium guide to Kashmir's royal culinary heritage — dishes, restaurants, recipes, and culture.",
    images: ["/wazwan-hero.jpg"],
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
  verification: {
    // google: "YOUR_GOOGLE_VERIFICATION_CODE", // Add your Google Search Console code here
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
