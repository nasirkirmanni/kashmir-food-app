export default function SectionTitle({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-saffron">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="font-display text-3xl text-pine sm:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
