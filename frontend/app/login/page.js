import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">Welcome Back</span>
          <h1>Log in to keep your Wazwan trail organized.</h1>
          <p>
            Sign in to save favorite dishes, track restaurants across Kashmir, and leave practical
            notes for fellow travelers following the Wazwan route.
          </p>
        </div>
        <AuthForm mode="login" />
      </section>
    </div>
  );
}
