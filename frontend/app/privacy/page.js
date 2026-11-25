"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, FileText, Cookie } from "lucide-react";
import CookieSettingsButton from "@/components/CookieSettingsButton";
import { GA_MEASUREMENT_ID, necessaryStorage } from "@/lib/consent";

export default function PrivacyPage() {
  const sections = [
    {
      title: "1. Information We Collect",
      icon: <Eye className="w-5 h-5 text-[var(--saffron)]" />,
      content: "We collect information you provide directly to us when you contact us or send us a restaurant listing. This may include your name, email address, telephone number, restaurant details, and photos you send."
    },
    {
      title: "2. How We Use Your Information",
      icon: <Shield className="w-5 h-5 text-[var(--saffron)]" />,
      content: "We use the collected information to reply to you, and to verify and publish restaurant listings."
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
          <p className="text-white/60 text-xs md:text-sm uppercase tracking-wider">Last Updated: November 25, 2026</p>
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

            <section id="cookies" className="space-y-3 scroll-mt-32">
              <div className="flex items-center gap-3">
                <Cookie className="w-5 h-5 text-[var(--saffron)]" />
                <h2 className="font-display text-xl text-white font-bold">5. Cookies</h2>
              </div>
              <div className="text-white/50 text-sm leading-relaxed pl-8 space-y-3">
                <p>
                  <strong className="text-white/80">What the site needs.</strong> One cookie, and a few notes kept in your
                  browser&rsquo;s own storage. The site does not work without them, so they are always on:
                </p>
                <ul className="space-y-2">
                  {necessaryStorage().map((item) => (
                    <li key={item.name}>
                      <code className="text-white/80">{item.name}</code> ({item.kind.toLowerCase()}). {item.purpose} Kept {item.kept}.
                    </li>
                  ))}
                </ul>
                {GA_MEASUREMENT_ID ? (
                  <>
                    <p>
                      <strong className="text-white/80">Analytics, only if you accept.</strong> If you accept, Google Analytics 4
                      counts visits and shows us which pages are read. It records the pages you open, roughly where you are
                      (country and city, worked out from your internet address, which Google Analytics does not store) and the
                      kind of device and browser you use, but not what you type or choose on a page: a search or a filter is
                      left out of the page address we send. It sets the cookies <code>_ga</code> and <code>_ga_…</code>, kept for
                      up to two years. The statistics are held by Google, which provides them to us; Google&rsquo;s advertising
                      features are switched off for this site. If you decline, Google Analytics is not loaded at all.
                    </p>
                    <p>
                      <strong className="text-white/80">Your choice.</strong> When you first visit you can accept, decline, or
                      open Manage to see each item and switch analytics on or off. We remember the choice in your
                      browser&rsquo;s storage rather than in a cookie, and you can change it at any time. If your browser sends a
                      Global Privacy Control signal, we treat it as a refusal.
                    </p>
                    <CookieSettingsButton className="mt-1 inline-flex min-h-[44px] items-center rounded-full border border-[var(--saffron)]/50 px-5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:border-[var(--saffron)]">
                      Change cookie settings
                    </CookieSettingsButton>
                  </>
                ) : (
                  <p>We do not use analytics or advertising cookies.</p>
                )}
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center">
            <p className="text-white/40 text-xs leading-relaxed">
              Wazwan Way no longer has user accounts. If you created one in the past and want its details deleted, or want anything else you have sent us deleted, please reach out to us at <a href="mailto:privacy@wazwanway.com" className="text-[var(--saffron)] hover:underline">privacy@wazwanway.com</a>.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
