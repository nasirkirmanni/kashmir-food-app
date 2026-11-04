import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import destinationIds from "@/destinations-static-ids.json";
import { STILL_KASHMIR_PLAN, STILL_KASHMIR_SITE } from "@/lib/stillKashmir";
import {
  STILL_KASHMIR_CHECKED,
  STILL_KASHMIR_CONTACT,
  STILL_KASHMIR_DRIVES,
  STILL_KASHMIR_INCLUDES,
  STILL_KASHMIR_JOURNEYS_HREF,
  STILL_KASHMIR_PROMISE,
  STILL_KASHMIR_TAGLINE,
  STILL_KASHMIR_WAYS,
  STILL_KASHMIR_WAYS_INTRO,
} from "@/data/stillKashmir";
import { skBody, skDisplay } from "./fonts";
import styles from "./still-kashmir.module.css";

// Visit Kashmir's page: the gateway to Still Kashmir, Wazwan Way's own travel agency, which is live at
// stillkashmir.com (see lib/stillKashmir.js). It is set in the agency's own look (its ink, ivory, plum and
// copper, Gilda Display and Jost) so the step across to its site feels like one journey. Everything it says
// about the agency is the agency's own wording, quoted from its site (data/stillKashmir.js), and every
// path leads there; Wazwan Way's own planning guides follow for readers who want to start here.

const INTRO = "Still Kashmir is Wazwan Way's own travel agency, now live at stillkashmir.com.";
const DESCRIPTION = `${INTRO} Private journeys through the Kashmir valley. Your journey to Kashmir begins here.`;
const TITLE = "Still Kashmir: Wazwan Way's Travel Agency";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://wazwanway.com/still-kashmir" },
  openGraph: {
    title: TITLE,
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

const PLANNING = [
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

const pad = (n) => String(n).padStart(2, "0");

// The agency's two ways in, used at the top and the foot of the page.
function Ctas({ tone }) {
  return (
    <div className={styles.ctas}>
      <a href={STILL_KASHMIR_SITE} className={`${styles.btn} ${tone === "ink" ? styles.btnOnInk : styles.btnOnIvory}`}>
        <span>Visit stillkashmir.com</span>
        <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
      </a>
      <a href={STILL_KASHMIR_PLAN} className={`${styles.btn} ${styles.btnGhost}`}>
        <span>Plan your journey</span>
        <ArrowUpRight aria-hidden="true" size={18} strokeWidth={1.5} />
      </a>
    </div>
  );
}

export default function StillKashmirPage() {
  const { whatsapp, call, email, office, hours } = STILL_KASHMIR_CONTACT;
  return (
    <div className={`${skDisplay.variable} ${skBody.variable} ${styles.root}`}>
      {/* Keeps the glass top bar dark over the light sections below the hero. */}
      <span className={styles.barUnder} aria-hidden="true" />

      <section className={styles.hero} aria-labelledby="still-kashmir-title">
        <div className={`${styles.inner} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <span>Visit Kashmir</span>
              <span aria-hidden="true" className={styles.eyebrowRule} />
              <span className={styles.status}>
                <span className={styles.dot} aria-hidden="true" />
                Now live
              </span>
            </p>
            <h1 id="still-kashmir-title" className={styles.wordmark}>
              <span className={styles.wordLine}>Still</span>
              <span className={styles.wordLine}>Kashmir</span>
            </h1>
            <p className={styles.tagline}>{STILL_KASHMIR_TAGLINE}</p>
            <p className={styles.lede}>
              {INTRO} Start a journey there, or begin with Wazwan Way&apos;s own guides further down this page.
            </p>
            <Ctas tone="ink" />
            <p className={styles.heroContact}>
              <a href={whatsapp.href} className={styles.inlineLink}>
                WhatsApp {whatsapp.label}
              </a>
              <span aria-hidden="true" className={styles.sep} />
              <a href={`mailto:${email}`} className={styles.inlineLink}>
                {email}
              </a>
            </p>
          </div>

          <figure className={styles.arch}>
            <div className={styles.archFrame}>
              <Image
                src="/dal.jpg"
                alt="A shikara and a fountain on Dal Lake in Srinagar, under a pink sky"
                fill
                priority
                sizes="(min-width: 1024px) 38vw, 92vw"
                className={styles.archPhoto}
              />
            </div>
            <figcaption className={styles.archCaption}>Dal Lake, Srinagar</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.ways} aria-labelledby="sk-ways-title">
        <div className={styles.inner}>
          <header className={styles.head}>
            <p className={styles.kicker}>From stillkashmir.com</p>
            <h2 id="sk-ways-title" className={styles.h2}>
              Eight ways to begin
            </h2>
            <p className={styles.headIntro}>{STILL_KASHMIR_WAYS_INTRO}</p>
          </header>
          <ol className={styles.waysList}>
            {STILL_KASHMIR_WAYS.map((way, index) => (
              <li key={way.href}>
                <a href={way.href} className={styles.way}>
                  <span className={styles.wayNum}>{pad(index + 1)}</span>
                  <span className={styles.wayTitle}>{way.title}</span>
                  <span className={styles.wayLine}>{way.line}</span>
                  <span className={styles.wayGo}>
                    Explore
                    <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
                  </span>
                  <span className="sr-only"> on stillkashmir.com</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.promise} aria-labelledby="sk-promise-title">
        <div className={styles.inner}>
          <h2 id="sk-promise-title" className={styles.kicker}>
            Designed as a journey, not a tour
          </h2>
          <figure className={styles.promiseFigure}>
            <blockquote className={styles.promiseQuote}>
              <p>{STILL_KASHMIR_PROMISE}</p>
            </blockquote>
            <figcaption className={styles.promiseCite}>Still Kashmir</figcaption>
          </figure>
        </div>
      </section>

      <section className={styles.includes} aria-labelledby="sk-includes-title">
        <div className={styles.inner}>
          <header className={styles.headSplit}>
            <h2 id="sk-includes-title" className={styles.h2}>
              Every journey includes
            </h2>
            <a href={STILL_KASHMIR_JOURNEYS_HREF} className={styles.textLink}>
              See the journeys
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
              <span className="sr-only"> on stillkashmir.com</span>
            </a>
          </header>
          <ol className={styles.includeList}>
            {STILL_KASHMIR_INCLUDES.map((item, index) => (
              <li key={item.title} className={styles.include}>
                <span className={styles.includeNum} aria-hidden="true">
                  {pad(index + 1)}
                </span>
                <h3 className={styles.includeTitle}>{item.title}</h3>
                <p className={styles.includeLine}>{item.line}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.drives} aria-labelledby="sk-drives-title">
        <div className={`${styles.inner} ${styles.drivesGrid}`}>
          <header className={styles.drivesHead}>
            <h2 id="sk-drives-title" className={styles.drivesTitle}>
              <span className={styles.kicker}>Drive times from</span>{" "}
              <span className={styles.drivesFrom}>{STILL_KASHMIR_DRIVES.from.name}</span>
            </h2>
            <p className={styles.drivesNote}>{STILL_KASHMIR_DRIVES.from.note}</p>
            <a href={STILL_KASHMIR_DRIVES.from.href} className={`${styles.textLink} ${styles.drivesLink}`}>
              {STILL_KASHMIR_DRIVES.from.name} on stillkashmir.com
              <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.5} />
            </a>
          </header>
          <ol className={styles.driveList}>
            {STILL_KASHMIR_DRIVES.places.map((place) => (
              <li key={place.href}>
                <a href={place.href} className={styles.drive}>
                  <span className={styles.driveName}>{place.name}</span>
                  <span className={styles.driveLeader} aria-hidden="true" />
                  <span className={styles.driveTime}>
                    <span className="sr-only">, </span>
                    {place.time}
                    <span className="sr-only"> by road, on stillkashmir.com</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <p className={styles.drivesSource}>As stillkashmir.com gives them, checked {STILL_KASHMIR_CHECKED}.</p>
        </div>
      </section>

      <section className={styles.planning} aria-labelledby="sk-planning-title">
        <div className={styles.inner}>
          <header className={styles.head}>
            <p className={styles.kicker}>Before you go</p>
            <h2 id="sk-planning-title" className={styles.h2}>
              Start planning with Wazwan Way
            </h2>
          </header>
          <ol className={styles.planList}>
            {PLANNING.map((item, index) => (
              <li key={item.href}>
                <Link href={item.href} className={styles.planRow}>
                  <span className={styles.planNum}>{pad(index + 1)}</span>
                  <span className={styles.planTitle}>{item.title}</span>
                  <span className={styles.planText}>{item.text}</span>
                  <span className={styles.planGo}>
                    {item.action}
                    <ArrowRight aria-hidden="true" size={16} strokeWidth={1.5} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.finale} aria-labelledby="sk-finale-title">
        <div className={styles.inner}>
          <h2 id="sk-finale-title" className={styles.finaleTitle}>
            Your journey to Kashmir begins here.
          </h2>
          <Ctas tone="ink" />
          <dl className={styles.contact}>
            <div>
              <dt>WhatsApp</dt>
              <dd>
                <a href={whatsapp.href} className={styles.inlineLink}>
                  {whatsapp.label}
                </a>
              </dd>
            </div>
            <div>
              <dt>Write</dt>
              <dd>
                <a href={`mailto:${email}`} className={styles.inlineLink}>
                  {email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Office</dt>
              <dd>{office}</dd>
            </div>
            <div>
              <dt>Call</dt>
              <dd>
                <a href={call.href} className={styles.inlineLink}>
                  {call.label}
                </a>
                <span className={styles.hours}>{hours}</span>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
