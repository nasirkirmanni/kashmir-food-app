import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import destinationIds from "@/destinations-static-ids.json";
import styles from "./still-kashmir.module.css";

// Visit Kashmir's page: the coming-soon gateway to Still Kashmir, Wazwan Way's own travel agency
// (see lib/stillKashmir.js). It says only what's settled (Still Kashmir is Wazwan Way's agency and
// it opens soon) and points to the site's own planning guides in the meantime. No launch date,
// sign-up form or service list until those exist.

const DESCRIPTION =
  "Still Kashmir is Wazwan Way's own travel agency, and it opens soon. Your journey to Kashmir begins here.";

export const metadata = {
  title: "Still Kashmir: Coming Soon",
  description: DESCRIPTION,
  alternates: { canonical: "https://wazwanway.com/still-kashmir" },
  openGraph: {
    title: "Still Kashmir: Coming Soon",
    description: DESCRIPTION,
    url: "https://wazwanway.com/still-kashmir",
    images: [
      {
        url: "/images/still-kashmir/og.jpg",
        width: 1200,
        height: 630,
        alt: "A shikara and a fountain on Dal Lake in Srinagar, under a pink sky",
      },
    ],
  },
};

const MEANTIME = [
  {
    href: "/itineraries",
    title: "Kashmir itineraries",
    text: "Day-by-day plans with routes, Wazwan stops, stays and costs. Or build your own.",
    action: "See the itineraries",
  },
  {
    href: "/destinations",
    title: "Destinations",
    text: `${destinationIds.length} places across Kashmir: where each one is, when to go and what to know before you set out.`,
    action: "Explore destinations",
  },
  {
    href: "/blog/what-to-eat-in-kashmir",
    title: "What to eat",
    text: "A first-timer's guide to the Valley's food, from everyday rice and haakh to Wazwan and noon chai.",
    action: "Read the guide",
  },
];

export default function StillKashmirPage() {
  return (
    <div className={styles.root}>
      <section className={styles.hero} aria-labelledby="still-kashmir-title">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Visit Kashmir</p>
          <p className={styles.status}>
            <span className={styles.dot} aria-hidden="true" />
            Coming soon
          </p>
          <h1 id="still-kashmir-title" className={styles.wordmark}>
            Still <em>Kashmir</em>
          </h1>
          <p className={styles.tagline}>Your journey to Kashmir begins here.</p>
          <p className={styles.lede}>
            Still Kashmir is Wazwan Way&apos;s own travel agency, and it opens soon. When it does, planning your
            trip to Kashmir will start right here.
          </p>
          <div className={styles.ctas}>
            <Link href="/itineraries" className={styles.btnPrimary}>
              Browse itineraries
            </Link>
            <Link href="/destinations" className={styles.btnGhost}>
              Explore destinations
            </Link>
          </div>
        </div>

        <figure className={styles.media}>
          <Image
            src="/dal.jpg"
            alt="A shikara and a fountain on Dal Lake in Srinagar, under a pink sky"
            fill
            priority
            sizes="(min-width: 1024px) 46vw, 100vw"
            className={styles.photo}
          />
          <figcaption className={styles.caption}>Dal Lake, Srinagar</figcaption>
        </figure>
      </section>

      <section className={styles.meantime} aria-labelledby="still-kashmir-meantime">
        <div className={styles.inner}>
          <header className={styles.sectionHead}>
            <p className={styles.eyebrow}>Until Still Kashmir opens</p>
            <h2 id="still-kashmir-meantime" className={styles.sectionTitle}>
              Start planning with Wazwan Way
            </h2>
          </header>

          <ol className={styles.cards}>
            {MEANTIME.map((item, index) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.card}>
                  <span className={styles.cardNum}>{String(index + 1).padStart(2, "0")}</span>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardText}>{item.text}</p>
                  <span className={styles.cardGo}>
                    {item.action}
                    <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          <p className={styles.signoff}>
            <span>Still Kashmir</span>
            <span aria-hidden="true" className={styles.signoffDot} />
            <span>Opening soon</span>
          </p>
        </div>
      </section>
    </div>
  );
}
