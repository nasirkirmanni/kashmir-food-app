import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
      <section className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <span className="place-eyebrow mb-3 block">Join In</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">Create an account</h1>
          <p className="text-base leading-relaxed text-white/60">
            Build a shortlist of dishes, save dining rooms by destination, and turn the app into
            your own personal Wazwan guide across Kashmir.
          </p>
        </div>
        <AuthForm mode="signup" />
        
        <p className="mt-8 text-center text-base text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="text-[var(--saffron)] font-medium hover:underline transition-all">
            Log in
          </Link>
        </p>
        
        <div className="mt-12 text-center pt-8 border-t border-white/10">
          <p className="text-sm text-white/50 mb-2">Are you a travel company?</p>
          <Link href="/travel-agent/signup" className="inline-block border border-white/20 rounded-full px-6 py-2 text-sm text-white hover:bg-white/5 hover:border-[var(--saffron)] transition-all uppercase tracking-widest font-semibold">
            List your Travel Agency
          </Link>
        </div>
      </section>
    </div>
  );
}
