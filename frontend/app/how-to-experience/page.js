import Image from "next/image";
import Link from "next/link";
import dishes from "@/data/dishes.json";
import { ESSENTIALS, FURTHER_READING, HERO_PHOTO, SERVED_GUIDE, TRAMI_NOTES } from "@/data/howToExperience";
import { resolveContentPhoto } from "@/lib/contentImages";
import { DISH_PHOTOS } from "@/lib/wazwanSequence";
import EssentialsProgress from "./EssentialsProgress";
import PageMotion from "./PageMotion";
import WazaDemo from "./WazaDemo";
import styles from "./HowToExperience.module.css";

const number = (index) => String(index + 1).padStart(2, "0");

// An eight-pointed star of two squares, after the geometry of Kashmiri khatamband ceilings.
function Star({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="4" y="4" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(45 8 8)" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" />
    </svg>
  );
}

function Ornament() {
  return (
    <div className={styles.ornament} aria-hidden="true">
      <Star className={styles.ornamentStar} />
    </div>
  );
}

function Arrow({ down = false }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={down ? "M12 5v14M6 13l6 6 6-6" : "M5 12h14M13 6l6 6-6 6"} />
    </svg>
  );
}

function Photo({ photo, sizes, className = "" }) {
  return (
    <figure className={`${styles.photo} ${className}`}>
      <div className={styles.photoFrame}>
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={sizes}
          className={styles.photoImg}
          style={photo.position ? { objectPosition: photo.position } : undefined}
        />
      </div>
      {photo.caption ? <figcaption className={styles.caption}>{photo.caption}</figcaption> : null}
    </figure>
  );
}

// The four dishes to start with, each photograph leading to the dish's page.
function Classics({ slugs }) {
  const tiles = slugs
    .map((slug) => {
      const dish = dishes.find((entry) => entry.slug === slug);
      const src = resolveContentPhoto(dish?.image);
      return src ? { slug, name: dish.name, src, framing: DISH_PHOTOS[src] } : null;
    })
    .filter(Boolean);
  return (
    <ul className={styles.classics}>
      {tiles.map((tile) => (
        <li key={tile.slug}>
          <Link href={`/dishes/${tile.slug}`} className={styles.classic}>
            <Image
              src={tile.src}
              alt={tile.framing?.alt || tile.name}
              fill
              sizes="(min-width: 1100px) 320px, 50vw"
              className={tile.framing?.framed ? `${styles.photoImg} ${styles.framed}` : styles.photoImg}
              style={tile.framing?.focal ? { objectPosition: tile.framing.focal } : undefined}
            />
            <span className={styles.classicName}>{tile.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

const NOTE_ICONS = {
  // Four seated round one trami.
  seated: (
    <>
      <circle cx="16" cy="16" r="6.5" />
      <circle cx="16" cy="4.5" r="2" />
      <circle cx="27.5" cy="16" r="2" />
      <circle cx="16" cy="27.5" r="2" />
      <circle cx="4.5" cy="16" r="2" />
    </>
  ),
  // Course after course, to the last.
  order: (
    <>
      <path d="M16 4v20" />
      <circle cx="16" cy="6" r="2" />
      <circle cx="16" cy="13" r="2" />
      <circle cx="16" cy="20" r="2" />
      <circle cx="16" cy="27" r="3" />
    </>
  ),
  // Water from the ewer over the hands.
  respectfully: (
    <>
      <path d="M9 5h9l-1.5 3.5h3.5l3 3-3 1" />
      <path d="M10.5 8.5c-2 2-2.5 5.5-.5 8h8c2-2.5 1.5-6-.5-8" />
      <path d="M21 15v3M21 21v1.5" />
      <path d="M6 23c2 4 5 5.5 10 5.5S24 27 26 23z" />
    </>
  ),
  // The trami under its cover, the sarposh.
  expect: (
    <>
      <path d="M6 22a10 10 0 0 1 20 0" />
      <path d="M16 12v-2.5" />
      <circle cx="16" cy="8" r="1.5" />
      <path d="M3.5 22h25M7 26h18" />
    </>
  ),
};

export default function HowToExperiencePage() {
  const steps = ESSENTIALS.map(({ id, title }) => ({ id, title }));
  return (
    <div id="how-to-experience" className={styles.page}>
      <PageMotion rootId="how-to-experience" />
      <EssentialsProgress sectionId="essentials" steps={steps} />

      <section className={styles.hero} aria-labelledby="hte-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>The art of Kashmiri Wazwan</p>
            <h1 id="hte-title" className={styles.heroTitle}>
              <span className={styles.heroDisplay}>
                A Feast Beyond the <em>Ordinary</em>
              </span>
              <span className={styles.srOnly}>: </span>
              <span className={styles.heroKicker}>
                How to experience Wazwan, a <span className={styles.nowrap}>first-timer&rsquo;s</span> guide
              </span>
            </h1>
            <p className={styles.heroLead}>
              Wazwan is Kashmir&rsquo;s formal feast: course after course, cooked through the night by teams of
              wazas and shared four to a copper trami. Here is everything you should know before you sit at the trami.
            </p>
            <div className={styles.heroActions}>
              <Link href="/dishes" className={styles.btnPrimary}>
                Discover the Wazwan Tradition
              </Link>
              <a href="#essentials" className={styles.textLink}>
                Explore the Six Essentials <Arrow down />
              </a>
            </div>
          </div>

          <figure className={styles.heroFigure}>
            <div className={styles.heroMat}>
              <div className={styles.heroFrame}>
                <Image
                  src={HERO_PHOTO.src}
                  alt={HERO_PHOTO.alt}
                  fill
                  priority
                  sizes="(min-width: 1100px) 680px, 100vw"
                  className={styles.photoImg}
                  style={{ objectPosition: HERO_PHOTO.position }}
                />
              </div>
              <Star className={`${styles.corner} ${styles.cornerTL}`} />
              <Star className={`${styles.corner} ${styles.cornerTR}`} />
              <Star className={`${styles.corner} ${styles.cornerBL}`} />
              <Star className={`${styles.corner} ${styles.cornerBR}`} />
            </div>
            <figcaption className={styles.caption}>{HERO_PHOTO.caption}</figcaption>
          </figure>
        </div>
      </section>

      <section id="essentials" className={styles.essentials} aria-labelledby="essentials-title">
        <header className={styles.sectionHead} data-reveal="">
          <Ornament />
          <p className={styles.eyebrow}>Six things to know</p>
          <h2 id="essentials-title" className={styles.sectionTitle}>
            Before you sit at the trami
          </h2>
          <ol className={styles.index}>
            {ESSENTIALS.map((step, index) => (
              <li key={step.id}>
                <a href={`#${step.id}`}>
                  <span className={styles.indexNumber}>{number(index)}</span>
                  {step.title}
                </a>
              </li>
            ))}
          </ol>
        </header>

        {ESSENTIALS.map((step, index) => (
          <article
            key={step.id}
            id={step.id}
            className={styles.step}
            data-flip={index % 2 === 1 ? "" : undefined}
            aria-labelledby={`${step.id}-title`}
          >
            <div className={styles.stepMedia} data-reveal="">
              {step.dishes ? (
                <Classics slugs={step.dishes} />
              ) : step.photos.length > 1 ? (
                <div className={styles.pair}>
                  <Photo photo={step.photos[0]} sizes="(min-width: 1100px) 620px, 90vw" className={styles.pairMain} />
                  <Photo photo={step.photos[1]} sizes="(min-width: 1100px) 300px, 45vw" className={styles.pairInset} />
                </div>
              ) : (
                <Photo photo={step.photos[0]} sizes="(min-width: 1100px) 700px, 100vw" />
              )}
            </div>
            <div className={styles.stepCopy} data-reveal="">
              <p className={styles.stepNumber}>
                <span className={styles.stepNumeral}>{number(index)}</span>
                <span className={styles.stepOf}>of {number(ESSENTIALS.length - 1)}</span>
              </p>
              <h3 id={`${step.id}-title`} className={styles.stepTitle}>
                {step.title}
              </h3>
              <p className={styles.stepText}>{step.text}</p>
              <div className={styles.tip}>
                <p className={styles.tipLabel}>Why it matters</p>
                <p className={styles.tipText}>{step.why}</p>
              </div>
              <Link href={step.link.href} className={styles.stepLink}>
                {step.link.label} <Arrow />
              </Link>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.manners} aria-labelledby="manners-title">
        <header className={styles.sectionHead} data-reveal="">
          <p className={styles.eyebrow}>At the trami</p>
          <h2 id="manners-title" className={styles.sectionTitle}>
            The manners of the feast
          </h2>
          <p className={styles.sectionLead}>What happens once you sit down, from the hand-washing to the last course.</p>
        </header>
        <ul className={styles.cards}>
          {TRAMI_NOTES.map((note) => (
            <li key={note.id} className={styles.card} data-reveal="">
              <svg
                className={styles.cardIcon}
                viewBox="0 0 32 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {NOTE_ICONS[note.id]}
              </svg>
              <h3 className={styles.cardTitle}>{note.title}</h3>
              {note.lines.map((line) => (
                <p key={line} className={styles.cardText}>
                  {line}
                </p>
              ))}
            </li>
          ))}
        </ul>
        <p className={styles.mannersSource} data-reveal="">
          From our guide, which cites its sources: <Link href={SERVED_GUIDE}>How Wazwan is served</Link>
        </p>
      </section>

      <section id="waza-ai" className={styles.waza} aria-labelledby="waza-title">
        <div className={styles.wazaInner}>
          <div className={styles.wazaCopy} data-reveal="">
            <p className={styles.eyebrow}>Waza AI</p>
            <h2 id="waza-title" className={styles.sectionTitle}>
              Your personal <em>Waza</em>
            </h2>
            <p className={styles.sectionLead}>
              Not sure what to order? Our Waza AI understands the weather, your spice tolerance, and the traditional
              course rules to guide you perfectly.
            </p>
            <Link href="/waza-ai" className={styles.btnGhost}>
              Ask Waza AI
            </Link>
          </div>
          <div data-reveal="">
            <WazaDemo />
          </div>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <Image src="/redesign/img/night-dal.webp" alt="" fill sizes="100vw" className={styles.closingImg} />
        <div className={styles.closingShade} aria-hidden="true" />
        <div className={styles.closingInner} data-reveal="">
          <Ornament />
          <h2 id="closing-title" className={styles.closingTitle}>
            Now, Experience <em>Wazwan</em>
          </h2>
          <p className={styles.closingText}>
            Discover the restaurants, traditions, and unforgettable flavours that make Kashmir&rsquo;s culinary heritage
            extraordinary.
          </p>
          <div className={styles.closingActions}>
            <Link href="/restaurants" className={styles.btnPrimary}>
              Explore Wazwan Restaurants
            </Link>
            <Link href="/kashmiri-food" className={styles.btnGhost}>
              Discover Kashmiri Dishes
            </Link>
          </div>
          <nav className={styles.further} aria-label="Further reading">
            <p className={styles.furtherLabel}>Further reading</p>
            <ul>
              {FURTHER_READING.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>
    </div>
  );
}
