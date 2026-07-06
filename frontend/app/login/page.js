"use client";

import AuthForm from "@/components/AuthForm";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { motion } from "framer-motion";

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
      <AuthForm mode="login" />
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="wazwan-shell min-h-screen flex flex-col items-center pt-32 pb-16 px-4">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <Suspense fallback={<div className="text-center text-white/60">Loading login form...</div>}>
          <LoginContent />
        </Suspense>
      </motion.section>
    </div>
  );
}
