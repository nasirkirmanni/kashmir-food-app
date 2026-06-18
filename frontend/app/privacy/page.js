"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: <Eye className="w-5 h-5 text-[var(--saffron)]" />,
      content: "We collect information you provide directly to us when creating an account, saving favorites, posting reviews, or submitting a restaurant listing. This may include your name, email address, telephone number, restaurant details, and photos you upload."
    },
    {
      title: "2. How We Use Your Information",
      icon: <Shield className="w-5 h-5 text-[var(--saffron)]" />,
      content: "We use the collected information to personalize your culinary journey, display authentic local reviews, sync your saved dishes across devices, verify restaurant listings, and communicate important platform updates or features like Waza AI."
    },
    {
      title: "3. Location Services & Map Integrations",
      icon: <Lock className="w-5 h-5 text-[var(--saffron)]" />,
      content: "To help you navigate to authentic restaurants in Gulmarg, Pahalgam, and Srinagar, our application utilizes location markers. This location data is processed locally on your device or via secure mapping API calls, and is never sold or stored on our servers longer than necessary."
    },
    {
      title: "4. Data Security",
      icon: <Lock className="w-5 h-5 text-[var(--saffron)]" />,
      content: "We implement industry-standard encryption protocols and secure server gateways to protect your personal data. While no method of transmission is 100% secure, we continuously monitor and refine our infrastructure to safeguard your information."
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <div className="w-full max-w-3xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">Legal Documents</span>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Privacy Policy</h1>
          <p className="text-white/60 text-xs md:text-sm uppercase tracking-wider">Last Updated: June 18, 2026</p>
        </motion.div>

        {/* Content Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 sm:p-12 shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/10">
            <FileText className="w-6 h-6 text-[var(--saffron)]" />
            <span className="text-white font-bold tracking-widest text-xs uppercase">Wazwan Way Commitment</span>
          </div>

          <p className="text-white/70 text-sm leading-relaxed mb-8">
            At Wazwan Way, accessible from our application, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by Wazwan Way and how we use it. If you have additional questions or require more information, do not hesitate to contact us.
          </p>

          <div className="space-y-8">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  {section.icon}
                  <h2 className="font-display text-xl text-white font-bold">{section.title}</h2>
                </div>
                <p className="text-white/50 text-sm leading-relaxed pl-8">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/40 text-xs leading-relaxed">
              If you wish to request deletion of your account and associated favorite history, please reach out to us at <a href="mailto:privacy@wazwanway.com" className="text-[var(--saffron)] hover:underline">privacy@wazwanway.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
