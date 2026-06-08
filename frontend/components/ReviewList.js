export default function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl text-center">
        <p className="text-sm text-white/60">No reviews yet. Be the first tourist to share a tip.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review._id} className="rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-md p-8 shadow-2xl transition-colors hover:border-[var(--saffron)]">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-white font-display text-2xl font-medium tracking-tight">{review.user?.name || "Traveler"}</h4>
            <span className="text-sm font-semibold text-[var(--saffron)]">{review.rating} / 5</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/60">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}
