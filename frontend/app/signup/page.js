import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
      <section className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <span className="place-eyebrow mb-3 block">Join In</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">Create an account</h1>
          <p className="text-sm leading-relaxed text-white/60">
            Build a shortlist of dishes, save dining rooms by destination, and turn the app into
            your own personal Wazwan guide across Kashmir.
          </p>
        </div>
        <AuthForm mode="signup" />
      </section>
    </div>
  );
}
