import "./globals.css";
import { Cormorant_Garamond, DM_Sans, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SplashScreen from "@/components/SplashScreen";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-accent",
  weight: ["300", "400", "500", "600", "700"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body"
});

export const metadata = {
  title: "WazwanWay",
  description: "Discover authentic Kashmiri dishes, local restaurants, and trusted travel food tips."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${cormorant.variable} ${dmSans.variable}`}>
        <AuthProvider>
          <div className="min-h-screen bg-snow">
            <SplashScreen />
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
