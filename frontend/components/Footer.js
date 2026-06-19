import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[rgba(212,175,55,0.15)] px-4 pt-20 pb-10 text-center text-[#F5F5F0]">
      <div className="page-shell">
        <div className="mb-8">
          <Link href="/" className="font-display text-[2.5rem] font-semibold uppercase leading-[0.9] tracking-[0.15em] text-[#F5F5F0]">
            <span className="block">Wazwan</span>
            <span className="block text-[#C8A46A]">Way</span>
          </Link>
        </div>
        <p className="mx-auto max-w-md font-display text-xl font-light italic text-[#F5F5F0]/70">
          The definitive guide to Kashmir&apos;s greatest culinary heritage.
        </p>
        <div className="mt-16 mb-16 flex flex-wrap justify-center gap-x-8 gap-y-6 text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[#F5F5F0]/80 max-w-4xl mx-auto leading-loose">
          <Link href="/how-to-experience" className="transition-colors duration-300 hover:text-[#C8A46A]">Experience</Link>
          <Link href="/kashmiri-food" className="transition-colors duration-300 hover:text-[#C8A46A]">Kashmiri Food</Link>
          <Link href="/dishes" className="transition-colors duration-300 hover:text-[#C8A46A]">Dishes</Link>
          <Link href="/restaurants" className="transition-colors duration-300 hover:text-[#C8A46A]">Restaurants</Link>
          <Link href="/recipes" className="transition-colors duration-300 hover:text-[#C8A46A]">Recipes</Link>
          <Link href="/plan" className="transition-colors duration-300 hover:text-[#C8A46A]">Visit Kashmir</Link>
          <Link href="/blog" className="transition-colors duration-300 hover:text-[#C8A46A]">Blog</Link>
          <Link href="/about" className="transition-colors duration-300 hover:text-[#C8A46A]">About</Link>
          <Link href="/contact" className="transition-colors duration-300 hover:text-[#C8A46A]">Contact</Link>
          <Link href="/privacy" className="transition-colors duration-300 hover:text-[#C8A46A]">Privacy Policy</Link>
          <Link href="/login" className="transition-colors duration-300 hover:text-[#C8A46A]">Login</Link>
        </div>
        <div className="border-t border-[#F5F5F0]/10 pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row text-[0.7rem] uppercase tracking-widest text-[#F5F5F0]/70">
          <p>© 2026 Wazwan Way. All rights reserved.</p>
          <p>Designed for the culture.</p>
        </div>
      </div>
    </footer>
  );
}
