import { notFound } from 'next/navigation';
import { scenicDrives } from '@/data/scenicDrivesData';
import RouteDetailClient from './RouteDetailClient';

export async function generateStaticParams() {
  return scenicDrives.map((route) => ({
    slug: route.slug,
  }));
}

export function generateMetadata({ params }) {
  const route = scenicDrives.find((r) => r.slug === params.slug);
  if (!route) return {};

  const canonicalUrl = `https://wazwanway.com/scenic-drives/${route.slug}`;
  const title = `${route.title} | Kashmir Scenic Drive`;
  const description = `${route.title} road trip guide — ${route.distance}, ${route.duration} drive. Route conditions, elevation profile, and the best stops along the way.`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: "article",
      url: canonicalUrl,
      title,
      description,
      images: [{ url: "/wazwan-hero.jpg", width: 1200, height: 630, alt: route.title }],
      siteName: "Wazwan Way",
    },
  };
}

export default function ScenicDriveRoutePage({ params }) {
  const route = scenicDrives.find((r) => r.slug === params.slug);

  if (!route) {
    notFound();
  }

  return (
    <main style={{ background: '#08080a', color: '#F3ECDD', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
      <RouteDetailClient route={route} />
    </main>
  );
}
