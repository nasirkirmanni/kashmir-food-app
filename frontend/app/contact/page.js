"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Send, Check } from "lucide-react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate message submit
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1200);
  };

  return (
    <div className="min-h-screen pt-28 pb-32 px-6 page-shell flex flex-col items-center">
      <div className="absolute inset-0 bg-radial-gradient from-amber-500/5 via-transparent to-transparent pointer-events-none z-0" />
      
      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="text-[var(--saffron)] font-bold tracking-[0.2em] uppercase text-[0.65rem] mb-3 block">Connect With Us</span>
          <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Reach Out to Wazwan Way</h1>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Whether you want to partner with us, list your traditional restaurant, or ask a question about Kashmiri food etiquette—we are here to help.
          </p>
        </motion.div>

        {/* Contact Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Info Details Panel */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="md:col-span-1 space-y-6 flex flex-col justify-center"
          >
            {/* Email */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--saffron)]/10 border border-[var(--saffron)]/20 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-[var(--saffron)]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Email Us</h3>
                <a href="mailto:hello@wazwanway.com" className="text-white/50 text-xs hover:text-[var(--saffron)] transition-colors">
                  hello@wazwanway.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--saffron)]/10 border border-[var(--saffron)]/20 flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5 text-[var(--saffron)]" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-1">Call Support</h3>
                <a href="tel:+917889717920" className="text-white/50 text-xs hover:text-[var(--saffron)] transition-colors">
                  +91 78897 17920
                </a>
              </div>
            </div>
          </motion.div>

          {/* Contact Form Panel */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl"
          >
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="font-display text-2xl text-white mb-3">Message Sent!</h2>
                <p className="text-white/60 text-xs max-w-xs mx-auto mb-8">
                  Thank you for reaching out. A representative from the Wazwan Way team will respond shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="rounded-full bg-[var(--saffron)] px-6 py-3 text-xs font-bold uppercase tracking-widest text-black transition-all hover:scale-105"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Name */}
                  <label className="block text-left">
                    <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Your Name *</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Nasir"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors shadow-inner"
                    />
                  </label>

                  {/* Email */}
                  <label className="block text-left">
                    <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Your Email *</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@domain.com"
                      required
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors shadow-inner"
                    />
                  </label>
                </div>

                {/* Subject */}
                <label className="block text-left">
                  <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Subject *</span>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors shadow-inner"
                  />
                </label>

                {/* Message */}
                <label className="block text-left">
                  <span className="mb-2 block text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[var(--saffron)]">Message *</span>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Write your thoughts..."
                    rows={4}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[var(--saffron)] transition-colors resize-none shadow-inner"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[var(--saffron)] py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-black shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : (
                    <>
                      Send Message <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
