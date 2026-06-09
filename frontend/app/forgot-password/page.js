import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
      <section className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <span className="place-eyebrow mb-3 block">Secure Reset</span>
          <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">Reset your password</h1>
          <p className="text-sm leading-relaxed text-white/60">
            Enter the email address associated with your Wazwan Way account, and we'll send you a secure verification code to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
      </section>
    </div>
  );
}
