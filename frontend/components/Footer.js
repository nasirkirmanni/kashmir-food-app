export default function Footer() {
  return (
    <footer className="bg-[var(--charcoal)] px-4 py-16 text-center text-white">
      <div className="page-shell">
        <div className="font-display text-4xl font-bold text-white">
          Wazwan <span className="italic text-[var(--saffron)]">Way</span>
        </div>
        <p className="font-accent mt-3 text-lg text-white/45">
          Your guide to Kashmir&apos;s greatest feast
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-8 text-xs uppercase tracking-[0.1em] text-white/40">
          <a href="/#dishes" className="hover:text-[var(--saffron)]">Dishes</a>
          <a href="/#restaurants" className="hover:text-[var(--saffron)]">Restaurants</a>
          <a href="/#tips" className="hover:text-[var(--saffron)]">Guide</a>
          <a href="/login" className="hover:text-[var(--saffron)]">Login</a>
          <a href="/signup" className="hover:text-[var(--saffron)]">Join</a>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/25">
          © 2026 Wazwan Way · Made with love for Kashmir&apos;s culinary heritage
        </p>
      </div>
    </footer>
  );
}
