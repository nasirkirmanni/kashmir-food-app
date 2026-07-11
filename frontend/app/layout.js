import "./globals.css";
import { Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import ConditionalFooter from "@/components/ConditionalFooter";
import GlobalBackground from "@/components/GlobalBackground";
import dynamic from "next/dynamic";
const WazaAI = dynamic(() => import("@/components/WazaAI"), { ssr: false });
import { MobileNavigationProvider } from "@/context/MobileNavigationContext";
import MobileSwipeContainer from "@/components/MobileSwipeContainer";
import CapacitorListeners from "@/components/CapacitorListeners";
const GlobalSearchModal = dynamic(() => import("@/components/GlobalSearchModal"), { ssr: false });
import NextTopLoader from "nextjs-toploader";


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  adjustFontFallback: false
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
  adjustFontFallback: false
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
  adjustFontFallback: false
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
    apple: "/icon.png",
  },
  verification: {
    // google: "YOUR_GOOGLE_VERIFICATION_CODE", // Add your Google Search Console code here
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="dns-prefetch" href="https://api.wazwanway.com" />
      </head>
      <body className={`${inter.variable} ${cormorant.variable} ${playfair.variable} font-body bg-[#0B0B0B] text-white antialiased relative overflow-x-hidden`}>
        <NextTopLoader
          color="#C8A46A"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #C8A46A, 0 0 5px #C8A46A"
        />
        <CapacitorListeners />
        <GlobalBackground />
        <AuthProvider>
          <MobileNavigationProvider>
            <div className="min-h-screen relative z-10 pb-24 md:pb-0">
              <Navbar />
              <MobileSwipeContainer>
                <main>{children}</main>
              </MobileSwipeContainer>
              <ConditionalFooter />
              <WazaAI />
              <GlobalSearchModal />
              <MobileNav />

            </div>
          </MobileNavigationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
