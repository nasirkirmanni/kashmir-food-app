"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function ReviewList({ reviews = [] }) {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  if (!reviews.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl text-center">
        <p className="text-sm text-white/60">No reviews yet. Be the first tourist to share a tip.</p>
      </div>
    );
  }

  const firstReview = reviews[0];
  const secondReview = reviews[1];

  return (
    <div className="space-y-4">
      {/* First Review */}
      <article className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl transition-colors hover:border-[var(--saffron)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-white font-display text-2xl font-medium tracking-tight">
            {firstReview.user?.name || "Traveler"}
          </h3>
          <span className="text-sm font-semibold text-[var(--saffron)]">{firstReview.rating} / 5</span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/60">{firstReview.comment}</p>
      </article>

      {/* Second Review (Blurred Preview) */}
      {secondReview && (
        <div className="relative overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md">
          <article className="p-8 select-none pointer-events-none filter blur-[5px] opacity-30">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-white font-display text-2xl font-medium tracking-tight">
                {secondReview.user?.name || "Traveler"}
              </h3>
              <span className="text-sm font-semibold text-[var(--saffron)]">{secondReview.rating} / 5</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/60">{secondReview.comment}</p>
          </article>

          {/* Overlay Actions */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center">
            {user ? (
              <button
                onClick={() => setShowModal(true)}
                className="rounded-full bg-[var(--saffron)] hover:bg-[#b08b53] px-8 py-3 text-sm font-bold uppercase tracking-[0.15em] text-black transition-all hover:scale-105 shadow-[0_0_35px_rgba(200,164,106,0.3)]"
              >
                Explore all {reviews.length} reviews
              </button>
            ) : (
              <div className="space-y-4">
                <p className="text-white font-medium text-base drop-shadow-md">
                  Sign in to read all the reviews
                </p>
                <Link
                  href="/login"
                  className="inline-flex rounded-full bg-[var(--saffron)] hover:bg-[#b08b53] px-6 py-2.5 text-xs font-bold uppercase tracking-[0.15em] text-black transition-all hover:scale-105 shadow-[0_0_20px_rgba(200,164,106,0.2)]"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Popup for Signed In Users */}
      {showModal && user && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-opacity duration-300"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="relative w-full max-w-2xl max-h-[85vh] rounded-[32px] border border-white/10 bg-[#121212] p-6 md:p-8 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <span className="text-[var(--saffron)] text-xs font-bold uppercase tracking-widest">Traveler Reviews</span>
                <h3 className="text-2xl md:text-3xl font-display text-white mt-1">All {reviews.length} Reviews</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {reviews.map((review) => (
                <article key={review._id} className="rounded-[20px] border border-white/5 bg-white/5 p-6 shadow-lg">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white font-display text-lg font-medium tracking-tight">
                      {review.user?.name || "Traveler"}
                    </h3>
                    <span className="text-xs font-semibold text-[var(--saffron)]">{review.rating} / 5</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-white/70">{review.comment}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
