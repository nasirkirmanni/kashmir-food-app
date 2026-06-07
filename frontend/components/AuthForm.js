"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const path = mode === "login" ? endpoints.login : endpoints.signup;
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : form;

      const data = await request(path, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      login(data);
      router.push("/");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[20px] border border-[var(--border)] bg-white/92 p-8 shadow-card">
      <div className="space-y-5">
        {mode === "signup" ? (
          <label className="block">
            <span className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--walnut-mid)]">Full name</span>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-md border border-[var(--border)] px-4 py-3 outline-none"
              required
            />
          </label>
        ) : null}

        <label className="block">
          <span className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--walnut-mid)]">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded-md border border-[var(--border)] px-4 py-3 outline-none"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[var(--walnut-mid)]">Password</span>
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-md border border-[var(--border)] px-4 py-3 outline-none"
            required
          />
        </label>

        {error ? <p className="text-sm text-[var(--crimson)]">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[var(--crimson)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60"
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </div>
    </form>
  );
}
