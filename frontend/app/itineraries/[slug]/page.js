import Link from "next/link";
import { notFound } from "next/navigation";
import ItineraryArtifact from "@/components/itineraryBuilder/ItineraryArtifact";

// Canonical itinerary detail (T9). Indexable server component with SEO metadata,
// TouristTrip JSON-LD, the shared artifact, and a crawlable related rail (T10).

const BASE_URL = "https://wazwanway.com";

const getApiBase = () => {
  if (typeof window === "undefined" && process.env.NEXT_PUBLIC_API_URL?.includes("localhost")) {
    return process.env.NEXT_PUBLIC_API_URL.replace("localhost", "127.0.0.1");
  }
  return process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";
};

async function getItinerary(slug) {
  try {
    const res = await fetch(`${getApiBase()}/api/itineraries/canonical/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getList() {
  try {
    const res = await fetch(`${getApiBase()}/api/itineraries/canonical`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()).itineraries || [];
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const list = await getList();
  return list.map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }) {
  const data = await getItinerary(params.slug);
  if (!data) return { title: "Kashmir Itinerary | Wazwan Way" };
  const url = `${BASE_URL}/itineraries/${params.slug}`;
  return {
    title: `${data.meta.seoTitle} | Wazwan Way`,
    description: data.meta.seoDescription,
    alternates: { canonical: url },
    openGraph: {
      title: data.meta.seoTitle,
      description: data.meta.seoDescription,
      url,
      images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: data.meta.seoTitle }],
    },
  };
}

export default async function CanonicalItineraryPage({ params }) {
  const data = await getItinerary(params.slug);
  if (!data) notFound();

  const { meta, plan } = data;
  const url = `${BASE_URL}/itineraries/${params.slug}`;
  const related = (await getList()).filter((i) => i.slug !== params.slug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: meta.seoTitle,
    description: meta.seoDescription,
    url,
    itinerary: {
      "@type": "ItemList",
      numberOfItems: plan.days.length,
      itemListElement: plan.days.map((d, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: d.title,
        item: { "@type": "TouristDestination", name: d.baseTown },
      })),
    },
    ...(plan.estimatedCost?.total
      ? { offers: { "@type": "Offer", price: plan.estimatedCost.total, priceCurrency: "INR" } }
      : {}),
  };

  return (
    <div className="min-h-[100dvh] bg-[#0A0A0A] text-white px-4 pt-24 pb-28">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* breadcrumb (crawlable) */}
      <nav className="max-w-2xl mx-auto mb-4 text-[0.68rem] text-white/40" aria-label="Breadcrumb">
        <Link href="/itineraries" className="hover:text-white/70">Itineraries</Link>
        <span className="mx-1.5">/</span>
        <span className="text-white/60">{plan.lengthDays}-day plan</span>
      </nav>

      <ItineraryArtifact plan={plan} planHref="/itinerary-builder" />

      {/* Related itineraries (internal linking) */}
      {related.length > 0 && (
        <section className="max-w-2xl mx-auto mt-12">
          <h2 className="text-[0.62rem] uppercase tracking-[0.2em] mb-4" style={{ color: "#C8A46A", fontFamily: "var(--font-jetbrains-mono, monospace)" }}>
            Related itineraries
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {related.map((r) => (
              <Link key={r.slug} href={`/itineraries/${r.slug}`} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:border-white/25 transition-colors">
                <div className="text-[0.55rem] uppercase tracking-wider text-white/40 mb-1">{r.lengthDays} days · {r.regionsCovered?.join(" · ")}</div>
                <div className="text-sm font-medium" style={{ fontFamily: "var(--font-bodoni, serif)" }}>{r.seoTitle.replace(/ —.*$/, "")}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
