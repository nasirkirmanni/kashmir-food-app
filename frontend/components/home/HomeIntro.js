import Link from "next/link";

const MONO = { fontFamily: "var(--font-jetbrains-mono, monospace)" };
const DISPLAY = { fontFamily: "var(--font-bodoni, serif)" };

/**
 * Plain-language introduction to the site and to Wazwan, shared by the mobile and
 * desktop homepage layouts (rendered once). The facts match the homepage FAQ.
 */
export default function HomeIntro() {
  return (
    <section
      aria-labelledby="home-intro-heading"
      className="relative border-y border-[rgba(200,164,106,0.16)] bg-[#050505] px-6 pt-16 pb-36 md:py-24"
    >
      <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:gap-16">
        <div>
          <p style={MONO} className="text-[0.62rem] font-medium uppercase tracking-[0.26em] text-[#C8A46A]">
            About Wazwan Way
          </p>
          <h2
            id="home-intro-heading"
            style={DISPLAY}
            className="mt-4 text-[clamp(1.9rem,4vw,2.8rem)] font-medium leading-[1.08] text-[#F4ECDF]"
          >
            A guide to Kashmiri food and travel
          </h2>
          <p className="mt-5 max-w-md text-[0.95rem] leading-relaxed text-white/65">
            Wazwan Way covers the dishes of the Wazwan and everyday Kashmiri cooking, the Srinagar restaurants that
            serve them, and destinations and itineraries for planning a trip to the valley.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/dishes"
              prefetch={false}
              style={MONO}
              className="inline-flex min-h-[44px] items-center rounded-full bg-[#C8A46A] px-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#050505] transition-transform active:scale-[0.97]"
            >
              Explore dishes
            </Link>
            <Link
              href="/restaurants"
              prefetch={false}
              style={MONO}
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#F4ECDF] transition-colors hover:border-[#C8A46A] hover:text-[#C8A46A]"
            >
              Find restaurants
            </Link>
            <Link
              href="/itineraries"
              prefetch={false}
              style={MONO}
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/20 px-5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#F4ECDF] transition-colors hover:border-[#C8A46A] hover:text-[#C8A46A]"
            >
              Plan a trip
            </Link>
          </div>
        </div>

        <div className="md:border-l md:border-white/10 md:pl-16">
          <h3 style={DISPLAY} className="text-xl font-medium text-[#F4ECDF] md:text-2xl">
            What is Wazwan?
          </h3>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-white/65">
            Wazwan is Kashmir&apos;s traditional multi-course feast, prepared by master chefs called wazas. A full Wazwan
            can run to as many as 36 courses, most of them meat dishes such as rista, rogan josh and gushtaba, served on a
            large copper plate — the trami — shared by four guests.
          </p>
          <Link
            href="/kashmiri-food/wazwan/guide/what-is-wazwan"
            prefetch={false}
            style={MONO}
            className="mt-6 inline-flex items-center gap-2 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#C8A46A] hover:text-[#E6C875]"
          >
            Read the full guide →
          </Link>
        </div>
      </div>
    </section>
  );
}
