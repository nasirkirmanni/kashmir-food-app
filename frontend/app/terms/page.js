"use client";

import { motion } from "framer-motion";

export default function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(212,175,99,0.05),transparent_50%)] pointer-events-none z-0" />
      
      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">Legal</span>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Terms and Conditions</h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-invert prose-p:text-white/70 prose-headings:text-white prose-a:text-[var(--saffron)] max-w-none bg-black/40 border border-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-md shadow-2xl"
        >
          <div className="space-y-10">
            <section>
              <h2 className="text-2xl font-display mb-4 text-[var(--saffron)]">1. Introduction</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                Welcome to Wazwan Way. By accessing and using our website, services, and platform, you accept and agree to be bound by the terms and provisions of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display mb-4 text-[var(--saffron)]">2. Intellectual Property Rights</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                Other than the content you own, under these Terms, Wazwan Way and/or its licensors own all the intellectual property rights and materials contained in this Website. You are granted limited license only for purposes of viewing the material contained on this Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display mb-4 text-[var(--saffron)]">3. User Obligations</h2>
              <p className="text-white/70 leading-relaxed text-sm mb-3">
                As a user of Wazwan Way, you agree to:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white/70 text-sm marker:text-[var(--saffron)]">
                <li>Provide accurate, current, and complete information during the registration process.</li>
                <li>Maintain the security of your password and accept all risks of unauthorized access.</li>
                <li>Not use the platform for any illegal or unauthorized purpose.</li>
                <li>Respect the cultural heritage and traditional practices represented on our platform.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-display mb-4 text-[var(--saffron)]">4. Bookings and Reservations</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                When you make a booking or reservation through Wazwan Way, you agree to the specific terms provided by the third-party partner (restaurant or travel agency). Wazwan Way acts only as a facilitator and is not liable for disputes arising directly from third-party services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display mb-4 text-[var(--saffron)]">5. Limitation of Liability</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                In no event shall Wazwan Way, nor any of its officers, directors, and employees, be held liable for anything arising out of or in any way connected with your use of this Website. Wazwan Way shall not be held liable for any indirect, consequential, or special liability arising out of or in any way related to your use of this Website.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display mb-4 text-[var(--saffron)]">6. Modifications</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                Wazwan Way is permitted to revise these terms at any time as it sees fit, and by using this Website you are expected to review these terms on a regular basis.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-display mb-4 text-[var(--saffron)]">7. Governing Law</h2>
              <p className="text-white/70 leading-relaxed text-sm">
                These Terms will be governed by and interpreted in accordance with the laws of India, and you submit to the non-exclusive jurisdiction of the courts located in Jammu & Kashmir for the resolution of any disputes.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
