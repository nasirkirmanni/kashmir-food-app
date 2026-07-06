"use client";

import AuthForm from "@/components/AuthForm";
import { motion } from "framer-motion";

export default function SignupPage() {
  return (
    <div className="wazwan-shell min-h-screen flex flex-col items-center pt-32 pb-16 px-4">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <AuthForm mode="signup" />
      </motion.section>
    </div>
  );
}
