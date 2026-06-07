export default function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <div className="rounded-[28px] bg-white p-6 shadow-card">
        <p className="text-sm text-slate-600">No reviews yet. Be the first tourist to share a tip.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <article key={review._id} className="rounded-[24px] bg-white p-5 shadow-card">
          <div className="flex items-center justify-between gap-3">
            <h4 className="font-semibold text-pine">{review.user?.name || "Traveler"}</h4>
            <span className="text-sm font-semibold text-saffron">{review.rating} / 5</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{review.comment}</p>
        </article>
      ))}
    </div>
  );
}
