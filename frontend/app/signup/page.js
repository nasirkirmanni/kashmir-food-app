import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="wazwan-shell">
      <section className="place-hero">
        <div>
          <span className="place-eyebrow">Join In</span>
          <h1>Create an account before the trip begins.</h1>
          <p>
            Build a shortlist of dishes, save dining rooms by destination, and turn the app into
            your own personal Wazwan guide across Kashmir.
          </p>
        </div>
        <AuthForm mode="signup" />
      </section>
    </div>
  );
}
