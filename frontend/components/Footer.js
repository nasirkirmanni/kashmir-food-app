import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[rgba(212,175,55,0.15)] px-4 pt-20 pb-10 text-center text-[#F5F5F0]">
      <div className="page-shell">
        <div className="mb-8">
          <Link href="/" className="font-display text-[2.5rem] font-semibold uppercase leading-[0.9] tracking-[0.15em] text-[#F5F5F0]">
            <span className="block">Wazwan</span>
            <span className="block text-[#D4AF37]">Way</span>
          </Link>
        </div>
        <p className="mx-auto max-w-md font-display text-xl font-light italic text-[#F5F5F0]/70">
          The definitive guide to Kashmir&apos;s greatest culinary heritage.
        </p>
        <div className="mt-16 mb-16 flex flex-wrap justify-center gap-10 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#F5F5F0]/60">
          <Link href="/dishes" className="transition-colors duration-300 hover:text-[#D4AF37]">Dishes</Link>
          <Link href="/restaurants" className="transition-colors duration-300 hover:text-[#D4AF37]">Restaurants</Link>
          <Link href="/#tips" className="transition-colors duration-300 hover:text-[#D4AF37]">Guide</Link>
          <Link href="/login" className="transition-colors duration-300 hover:text-[#D4AF37]">Login</Link>
          <Link href="/signup" className="transition-colors duration-300 hover:text-[#D4AF37]">Join</Link>
        </div>
        <div className="border-t border-[#F5F5F0]/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row text-[0.7rem] uppercase tracking-widest text-[#F5F5F0]/40">
          <p>© 2026 Wazwan Way. All rights reserved.</p>
          <p>Designed for the culture.</p>
        </div>
      </div>
    </footer>
  );
}
