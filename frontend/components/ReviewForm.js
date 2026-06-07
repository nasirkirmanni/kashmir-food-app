"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { endpoints, request } from "@/lib/api";

export default function ReviewForm({ restaurantId, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!user) {
      setError("Please log in to submit a review.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await request(endpoints.reviews, {
        method: "POST",
        body: JSON.stringify({
          restaurantId,
          rating: Number(form.rating),
          comment: form.comment
        })
      });
      setForm({ rating: 5, comment: "" });
      onSuccess?.();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[20px] border border-[var(--border)] bg-white p-6 shadow-card">
      <span className="place-eyebrow">Share Your Experience</span>
      <h3 className="font-display text-3xl text-[var(--walnut)]">Leave a review</h3>
      <div className="mt-5 space-y-4">
        <select
          value={form.rating}
          onChange={(event) => setForm({ ...form, rating: event.target.value })}
          className="w-full rounded-md border border-[var(--border)] px-4 py-3"
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>
        <textarea
          value={form.comment}
          onChange={(event) => setForm({ ...form, comment: event.target.value })}
          placeholder="Share a practical tip for future tourists"
          className="w-full rounded-md border border-[var(--border)] px-4 py-3"
          rows={4}
          required
        />
        {error ? <p className="text-sm text-[var(--crimson)]">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-[var(--crimson)] px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Post review"}
        </button>
      </div>
    </form>
  );
}
