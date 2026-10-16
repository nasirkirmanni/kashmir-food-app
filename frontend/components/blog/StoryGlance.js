import Image from "next/image";
import InlineMarkdown from "./InlineMarkdown";

/**
 * The fact box at the top of a core-seven story: a one-paragraph answer and a two-column table
 * of the dish's essentials, each line restating something the story below sources. A plain HTML
 * table, so readers, search engines and answer engines can all lift a line on its own.
 */
export default function StoryGlance({ name, facts }) {
  if (!facts) return null;
  const { answer, glance, photo } = facts;

  return (
    <section
      aria-labelledby="at-a-glance"
      className="my-12 overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]"
    >
      <div className={photo ? "md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" : undefined}>
        {photo ? (
          <figure className="relative m-0 aspect-[4/3] md:aspect-auto md:min-h-full">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(min-width: 768px) 300px, 100vw"
              className="object-cover"
            />
          </figure>
        ) : null}
        <div className="p-6 sm:p-8">
          <h2
            id="at-a-glance"
            className="scroll-mt-28 font-display text-2xl sm:text-3xl text-[var(--saffron)] mb-4"
          >
            {name} at a glance
          </h2>
          <p className="mb-6 text-base sm:text-lg leading-relaxed text-white/85">{answer}</p>
          <table className="w-full border-collapse text-left text-[0.95rem] leading-snug">
            <caption className="sr-only">{name}: the essentials</caption>
            <tbody>
              {glance.map(([label, value]) => (
                <tr key={label} className="border-t border-white/10">
                  <th
                    scope="row"
                    className="w-[6.5rem] sm:w-[9rem] py-3 pr-3 sm:pr-5 align-top text-[0.65rem] sm:text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white/50"
                  >
                    {label}
                  </th>
                  <td className="py-3 align-top text-white/80">
                    <InlineMarkdown text={value} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-5 text-xs leading-relaxed text-white/45">
            Every line is sourced in the story below. The calories come from a 2012 study of a
            single Srinagar wedding, so read them as one kitchen&apos;s numbers.
          </p>
        </div>
      </div>
    </section>
  );
}
