"use client";

import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const isRegisteredSuccess = searchParams.get("registered") === "success";

  return (
    <>
      {isRegisteredSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
          Agency successfully listed! Please log in to access your dashboard.
        </div>
      )}
      <div className="text-center mb-8">
        <span className="place-eyebrow mb-3 block">Travel Partner Portal</span>
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">Agent Login</h1>
        <p className="text-sm leading-relaxed text-white/60">
          Sign in to manage your listed agency details and connect with travelers.
        </p>
      </div>
      
      {/* We can reuse the AuthForm since login endpoint is the same. The form handles redirection or context updating */}
      {/* We pass a redirect prop to AuthForm if we want to ensure they go to dashboard */}
      <AuthForm mode="login" redirectPath="/travel-agent/dashboard" />
      
      <p className="mt-8 text-center text-sm text-white/60">
        Haven&apos;t listed your agency yet?{" "}
        <Link href="/travel-agent/signup" className="text-[var(--saffron)] font-medium hover:underline transition-all">
          Register now
        </Link>
      </p>

      <div className="mt-12 text-center pt-8 border-t border-white/10">
        <Link href="/login" className="text-xs text-white/40 hover:text-white uppercase tracking-widest font-semibold transition-colors">
          &larr; Normal User Login
        </Link>
      </div>
    </>
  );
}

export default function TravelAgentLoginPage() {
  return (
    <div className="wazwan-shell min-h-screen flex items-center justify-center pt-20 pb-16">
      <div className="w-full max-w-md px-4">
        <Suspense fallback={<div className="text-center text-white/60">Loading login form...</div>}>
          <LoginContent />
        </Suspense>
      </div>
    </div>
  );
}
