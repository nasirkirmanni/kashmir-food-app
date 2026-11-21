import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import JsonLd, { buildFaqSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import Cited from "@/components/restaurants/Cited";
import EvidenceBadges from "@/components/restaurants/EvidenceBadges";
import Photograph from "@/components/restaurants/Photograph";
import styles from "@/components/restaurants/restaurants.module.css";
import { photosFor } from "@/data/restaurantPhotos";
import { MUGHAL_DARBAR } from "@/data/srinagarRestaurants";
import { MUGHAL_DARBAR_FAQ } from "@/data/srinagarRestaurantsCopy";
import { CHECKED_LABEL, DIRECTORY_PATH, SITE, citedSources, plainText, restaurantBySlug, restaurantPath, streetPath } from "@/lib/srinagarRestaurants";

/**
 * /restaurants/mughal-darbar: two separate businesses trade as Mughal Darbar on Residency Road. This
 * address used to show one database record that mixed them up (the upstairs restaurant's history
 * with the ground floor's phone and address), and the homepage and two stories still link here, so
 * the page now sets the two side by side and sends readers to each one's own profile.
 */

const PATH = "/restaurants/mughal-darbar";
const TITLE = "Srinagar's Two Mughal Darbars, Compared";
const DESCRIPTION =
  "Two Mughal Darbars trade on Residency Road, Srinagar: upstairs and ground floor. Websites, phones, founders and Wazwan prices compared, checked 10 Nov 2026.";

export const metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE}${PATH}` },
  openGraph: {
    type: "article",
    url: `${SITE}${PATH}`,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Wazwan Way",
    images: [{ url: "/wazwan-hero.jpg", width: 1024, height: 1024, alt: "Wazwan Way" }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: ["/wazwan-hero.jpg"] },
};

const SIDES = [
  { key: "upstairs", slug: "mughal-darbar-upstairs", heading: "Upstairs", site: "mughal-darbar.com" },
  { key: "ground", slug: "mughal-darbar-ground-floor", heading: "Ground floor", site: "mughaldarbar.in" },
];

export default function MughalDarbarPage() {
  const places = SIDES.map((side) => ({ ...side, place: restaurantBySlug(side.slug) }));
  const texts = [MUGHAL_DARBAR.intro, ...MUGHAL_DARBAR.rows.flatMap((row) => [row.upstairs, row.ground]), ...MUGHAL_DARBAR_FAQ.map((f) => f.answer)];
  const sources = citedSources(texts);
  const photos = photosFor("mughal-darbar");

  const list = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "The two Mughal Darbar restaurants on Residency Road, Srinagar",
    numberOfItems: places.length,
    itemListElement: places.map(({ place }, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Restaurant",
        "@id": `${SITE}${restaurantPath(place.slug)}#place`,
        name: place.name,
        url: `${SITE}${restaurantPath(place.slug)}`,
        address: {
          "@type": "PostalAddress",
          ...place.postalAddress,
          addressLocality: "Srinagar",
          addressRegion: "Jammu and Kashmir",
          addressCountry: "IN",
        },
      },
    })),
  };

  return (
    <div className={styles.page}>
      <JsonLd data={list} />
      <JsonLd data={buildFaqSchema(MUGHAL_DARBAR_FAQ.map((faq) => ({ question: faq.question, answer: plainText(faq.answer) })))} />

      <header className={`${styles.container} ${styles.profileHero}`}>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Restaurants", href: DIRECTORY_PATH },
              { name: "Mughal Darbar", href: PATH },
            ]}
          />
        </div>
        <h1 className={`${styles.profileTitle} ${styles.profileTitleLong}`}>Mughal Darbar: two restaurants, one name</h1>
        <ul className={styles.profileMeta}>
          <li>
            <Link href={streetPath("residency-road")} prefetch={false}>
              Residency Road
            </Link>
            , Srinagar
          </li>
          <li>Checked {CHECKED_LABEL}</li>
        </ul>
        <p className={styles.lede}>
          <Cited text={MUGHAL_DARBAR.intro} />
        </p>
        {photos.length ? (
          <div className={photos.length > 1 ? `${styles.photoSet} ${styles.photoSetTwo} ${styles.heroPlate}` : `${styles.photoSet} ${styles.heroPlate}`}>
            {photos.map((photo, index) => (
              <Photograph key={photo.src} photo={photo} priority={index === 0} sizes="(min-width: 900px) 620px, 100vw" />
            ))}
          </div>
        ) : null}
      </header>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="which-one">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="which-one">
            Which one is which
          </h2>
        </div>
        <div className={styles.compare}>
          {places.map(({ key, site, place }) => (
            <article key={key} className={styles.compareSide} aria-labelledby={`side-${key}`}>
              <h3 className={styles.rowName} id={`side-${key}`}>
                <Link href={restaurantPath(place.slug)} prefetch={false} className={styles.rowLink}>
                  {place.name}
                </Link>
              </h3>
              <p className={styles.compareWhich}>{place.address}</p>
              <dl className={styles.rowFacts}>
                <div>
                  <dt>Website</dt>
                  <dd>{site}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{place.phone || <span className={styles.notVerified}>Not verified</span>}</dd>
                </div>
                <div>
                  <dt>Prices</dt>
                  <dd>{place.price}</dd>
                </div>
                <div>
                  <dt>Google</dt>
                  <dd className={styles.google}>
                    {place.google ? (
                      <>
                        <b>{place.google.rating.toFixed(1)}</b> from {place.google.reviews.toLocaleString("en-IN")} reviews
                      </>
                    ) : (
                      "No Srinagar listing found"
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Known from</dt>
                  <dd>
                    <EvidenceBadges evidence={place.evidence} />
                  </dd>
                </div>
              </dl>
              <p className={styles.rowSummary}>{place.summary.split(". ")[0]}.</p>
              <ArrowUpRight className={styles.rowArrow} aria-hidden="true" />
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="side-by-side">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="side-by-side">
            Side by side
          </h2>
          <p className={styles.text}>What each business says about itself, and what others say about it, with the source for each line.</p>
        </div>
        <div className={styles.tableWrap} data-h-scroll="">
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">
                  <span className={styles.srOnly}>Detail</span>
                </th>
                <th scope="col">Upstairs</th>
                <th scope="col">Ground floor</th>
              </tr>
            </thead>
            <tbody>
              {MUGHAL_DARBAR.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td className={styles.wrapCell}>
                    <Cited text={row.upstairs} />
                  </td>
                  <td className={styles.wrapCell}>
                    <Cited text={row.ground} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="questions">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="questions">
            Questions about Mughal Darbar
          </h2>
        </div>
        <div className={styles.faq}>
          {MUGHAL_DARBAR_FAQ.map((faq) => (
            <div key={faq.question} className={styles.faqItem}>
              <h3>{faq.question}</h3>
              <p>
                <Cited text={faq.answer} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="sources">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="sources">
            Sources
          </h2>
          <p className={styles.text}>
            As read on {CHECKED_LABEL}. Nobody from Wazwan Way phoned or visited either restaurant; if something has changed,{" "}
            <Link href="/contact" prefetch={false}>
              tell us
            </Link>
            .
          </p>
        </div>
        <ul className={styles.sources}>
          {sources.map((source) => (
            <li key={source.key}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
              <span className={styles.sourceHost}>{new URL(source.url).hostname.replace(/^www\./, "")}</span>
            </li>
          ))}
        </ul>
      </section>

      <nav className={`${styles.container} ${styles.section}`} aria-labelledby="nearby">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="nearby">
            Also on Residency Road
          </h2>
        </div>
        <ul className={styles.related}>
          {["ahdoos", "kareema", "habib-restaurant", "grand-hotel"].map((slug) => {
            const place = restaurantBySlug(slug);
            return (
              <li key={slug}>
                <Link href={restaurantPath(slug)} prefetch={false}>
                  <span className={styles.relatedName}>{place.name}</span>
                  <span className={styles.relatedMeta}>{place.area}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <Link href={DIRECTORY_PATH} prefetch={false}>
              <span className={styles.relatedName}>All Wazwan restaurants in Srinagar</span>
              <span className={styles.relatedMeta}>Search by name, street or dish</span>
            </Link>
          </li>
          <li>
            <Link href="/restaurants/best-wazwan-srinagar" prefetch={false}>
              <span className={styles.relatedName}>Where to eat Kashmiri food in Srinagar</span>
              <span className={styles.relatedMeta}>Bakeries, tea rooms and street food too</span>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
