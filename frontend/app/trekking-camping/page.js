import './trekking-camping.css';
import TrekkingCampingClient from '@/components/trekking-camping/TrekkingCampingClient';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com";

async function getTreks() {
  try {
    const res = await fetch(`${API_BASE}/api/treks`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error("Failed to fetch treks");
    return await res.json();
  } catch (error) {
    console.error("Error fetching treks:", error);
    return [];
  }
}

async function getCamps() {
  try {
    const res = await fetch(`${API_BASE}/api/camps`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) throw new Error("Failed to fetch camps");
    return await res.json();
  } catch (error) {
    console.error("Error fetching camps:", error);
    return [];
  }
}

export const metadata = {
  alternates: { canonical: "https://wazwanway.com/trekking-camping" },
  title: "Trekking & Camping in Kashmir | Alpine Trails & Wild Basecamps",
  description: "Five legendary treks and five untouched basecamps in Kashmir — mapped by elevation, difficulty, and the silence that waits at the top."
};

export default async function TrekkingCampingPage() {
  const [treks, camps] = await Promise.all([getTreks(), getCamps()]);

  if (!treks.length && !camps.length) {
    return (
      <div className="tc-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#948C7D' }}>Failed to load trekking & camping data.</p>
      </div>
    );
  }

  return <TrekkingCampingClient treks={treks} camps={camps} />;
}
