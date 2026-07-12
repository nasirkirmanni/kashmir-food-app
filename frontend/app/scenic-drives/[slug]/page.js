import { notFound } from 'next/navigation';
import { scenicDrives } from '@/data/scenicDrivesData';
import RouteDetailClient from './RouteDetailClient';

export async function generateStaticParams() {
  return scenicDrives.map((route) => ({
    slug: route.slug,
  }));
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
