import { Fragment } from "react";
import dishesData from "@/data/dishes.json";
import { sanitizeDish } from "@/lib/dishContent";
import { arrangeWazwan, vesselIndex } from "@/lib/wazwanSequence";
import WazwanHero from "@/components/wazwan/WazwanHero";
import ChapterNav from "@/components/wazwan/ChapterNav";
import ServiceOrder from "@/components/wazwan/ServiceOrder";
import Chapter from "@/components/wazwan/Chapter";
import { Coda, Interlude, LastCourse } from "@/components/wazwan/Closing";
import PageEnhancements from "@/components/wazwan/PageEnhancements";
import styles from "@/components/wazwan/wazwan.module.css";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://kashmir-food-app-api.onrender.com").replace(/\/+$/, "");

// Regenerated at most hourly, so catalogue edits reach the page without a redeploy.
export const revalidate = 3600;

// Photographs between chapters, keyed by the chapter they introduce.
const INTERLUDES = {
  "the-gravies": {
    src: "/images/kashmiri-food/wazwan.webp",
    alt: "A cook ladles liquid into one of several pots set over an open wood fire",
    caption: "Pots over a wood fire",
    focal: "50% 45%",
  },
  "the-last-course": {
    src: "/redesign/img/door-feast.webp",
    alt: "Meat pounded by hand with a wooden mallet on a stone slab",
    caption: "Meat pounded by hand, as it is for rista and gushtaba",
    focal: "50% 35%",
  },
};

/**
 * The live Wazwan catalogue, which the page used to fetch in the browser. If the
 * API can't be reached, the committed dishes.json snapshot is used instead and
 * the failure is logged.
 */
async function loadWazwanDishes() {
  try {
    const res = await fetch(`${API_BASE}/api/dishes?categoryType=wazwan`, {
      next: { revalidate },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const records = await res.json();
    if (!Array.isArray(records) || records.length === 0) throw new Error("empty response");
    return records;
  } catch (err) {
    console.error(`[dishes] /api/dishes?categoryType=wazwan unavailable (${err.message}); using dishes.json`);
    return dishesData.filter((dish) => dish.categoryType === "wazwan");
  }
}

export default async function TraditionalWazwanPage() {
  const dishes = (await loadWazwanDishes()).map(sanitizeDish);
  const chapters = arrangeWazwan(dishes);
  const total = chapters.reduce((sum, chapter) => sum + chapter.dishes.length, 0);
  const navItems = [
    { id: "service", label: "How it’s served" },
    ...chapters.map(({ id, number, navLabel }) => ({ id, number, label: navLabel })),
  ];

  return (
    <div id="traditional-wazwan" className={styles.page}>
      <PageEnhancements rootId="traditional-wazwan" />
      <WazwanHero total={total} index={vesselIndex(chapters)} />
      <ChapterNav items={navItems} />
      <ServiceOrder />
      {chapters.map((chapter) => (
        <Fragment key={chapter.id}>
          {INTERLUDES[chapter.id] ? <Interlude {...INTERLUDES[chapter.id]} /> : null}
          {chapter.layout === "finale" && chapter.dishes.length === 1 ? (
            <LastCourse chapter={chapter} />
          ) : (
            <Chapter chapter={chapter} />
          )}
        </Fragment>
      ))}
      <Coda />
    </div>
  );
}
