import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
      <section className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <span className="place-eyebrow mb-3 block">Welcome Back</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">Log in to your account</h1>
          <p className="text-sm leading-relaxed text-white/60">
            Sign in to save favorite dishes, track restaurants across Kashmir, and leave practical
            notes for fellow travelers following the Wazwan route.
          </p>
        </div>
        <AuthForm mode="login" />
      </section>
    </div>
  );
}
