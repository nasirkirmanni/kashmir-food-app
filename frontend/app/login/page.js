"use client";

import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const isResetSuccess = searchParams.get("reset") === "success";

  return (
    <>
      {isResetSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
          Your password has been successfully reset. Please log in with your new password.
        </div>
      )}
      <div className="text-center mb-8">
        <span className="place-eyebrow mb-3 block">Welcome Back</span>
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-white mb-4">Log in to your account</h1>
        <p className="text-sm leading-relaxed text-white/60">
          Sign in to save favorite dishes, track restaurants across Kashmir, and leave practical
          notes for fellow travelers following the Wazwan route.
        </p>
      </div>
      <AuthForm mode="login" />
      
      <p className="mt-8 text-center text-sm text-white/60">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-[var(--saffron)] font-medium hover:underline transition-all">
          Join now
        </Link>
      </p>
    </>
  );
}

export default function LoginPage() {
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
