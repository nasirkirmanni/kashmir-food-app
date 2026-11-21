import Image from "next/image";
import Link from "next/link";
import JsonLd, { buildBreadcrumbSchema, buildFaqSchema } from "@/components/JsonLd";
import Cited from "@/components/restaurants/Cited";
import EvidenceBadges from "@/components/restaurants/EvidenceBadges";
import DirectoryBrowser from "@/components/restaurants/DirectoryBrowser";
import OpenOnArrival from "@/components/restaurants/OpenOnArrival";
import Photograph, { PhotoCredit } from "@/components/restaurants/Photograph";
import styles from "@/components/restaurants/restaurants.module.css";
import { RESTAURANT_PHOTOS, SCENES } from "@/data/restaurantPhotos";
import {
  EVIDENCE,
  FORMATS,
  GOOGLE_LISTINGS,
  OTHER_PLACES,
  PLACE_TYPES,
  RESTAURANTS,
  SOURCES,
  WAZPORA,
  WAZWAN_PRICES,
} from "@/data/srinagarRestaurants";
import { DIRECTORY_FINDINGS, directoryFaq } from "@/data/srinagarRestaurantsCopy";
import { WAZWAN_IN_BRIEF } from "@/data/wazwanPillar";
import { inlineText } from "@/lib/markdownFaq";
import { dishName } from "@/lib/restaurantSchema";
import {
  CHECKED_LABEL,
  DIRECTORY_PATH,
  SITE,
  directoryCards,
  evidenceCounts,
  namedDishes,
  neighbourhoods,
  plainText,
  restaurantPath,
  streets,
} from "@/lib/srinagarRestaurants";

/**
 * /restaurants: the Srinagar Wazwan directory, laid out street by street. Server-rendered from
 * data/srinagarRestaurants.js so the full list, every link and every answer are in the HTML;
 * DirectoryBrowser only searches, filters, sorts and marks the street on screen. The record the
 * list rests on (findings, prices, Wazpora, the places left out, questions and method) follows it.
 * The metadata (title, description, canonical) is in ./layout.js.
 */

const count = (n) => n.toLocaleString("en-IN");

// The first two sentences of the site's own definition (data/wazwanPillar.js), as plain text.
const WAZWAN_IN_TWO_SENTENCES = inlineText(WAZWAN_IN_BRIEF.definition)
  .split(/(?<=\.)\s+/)
  .slice(0, 2)
  .join(" ");

// A reference section of the record, folded until asked for. Its content is in the HTML either way.
function Fold({ id, title, lead, children }) {
  return (
    <details className={styles.fold} id={id}>
      <summary className={styles.foldSummary}>
        <h3 className={styles.foldTitle}>{title}</h3>
        <span className={styles.foldLead}>{lead}</span>
        <span className={styles.foldMark} aria-hidden="true" />
      </summary>
      <div className={styles.foldBody}>{children}</div>
    </details>
  );
}

export default function RestaurantsPage() {
  const cards = directoryCards();
  const areas = neighbourhoods();
  const counts = evidenceCounts();
  const chapters = streets();
  const dishes = namedDishes(6);
  const faqs = directoryFaq({ places: RESTAURANTS.length, ...counts });
  const bands = RESTAURANTS.filter((place) => place.google?.perPerson)
    .map((place) => ({ slug: place.slug, name: place.name, band: place.google.perPerson, reports: place.google.perPersonReports }))
    .sort((a, b) => b.reports - a.reports);
  const hero = SCENES.degsOnTheFire;

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Wazwan restaurants in Srinagar",
    numberOfItems: RESTAURANTS.length,
    itemListElement: RESTAURANTS.map((place, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${SITE}${restaurantPath(place.slug)}`,
      name: place.name,
    })),
  };

  return (
    <div className={styles.page}>
      <JsonLd data={itemList} />
      <JsonLd data={buildFaqSchema(faqs.map((faq) => ({ question: faq.question, answer: plainText(faq.answer) })))} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", url: `${SITE}/` },
          { name: "Restaurants", url: `${SITE}${DIRECTORY_PATH}` },
        ])}
      />

      <header className={styles.hero}>
        <div className={styles.heroMedia}>
          <Image src={hero.src} alt={hero.alt} fill priority sizes="100vw" quality={80} />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`${styles.container} ${styles.heroInner}`}>
          <h1 className={styles.title}>Wazwan restaurants in Srinagar</h1>
          <div className={styles.heroSide}>
            <p className={styles.heroDek}>
              The {RESTAURANTS.length} restaurants, hotel restaurants and delivery kitchens in Srinagar where the evidence says you can eat
              Wazwan, Kashmir&apos;s multi-course feast of mutton dishes.
            </p>
            <ul className={styles.heroProof}>
              <li>
                <b>{RESTAURANTS.length}</b> places
              </li>
              <li>
                <b>{Object.keys(SOURCES).length}</b> sources
              </li>
              <li>Checked {CHECKED_LABEL}</li>
            </ul>
            <p className={styles.heroCredit}>
              {hero.caption} <PhotoCredit credit={hero.credit} />
            </p>
          </div>
        </div>
      </header>

      <OpenOnArrival />
      <DirectoryBrowser
        cards={cards}
        streets={chapters.map((street) => ({ id: street.id, name: street.name, intro: <Cited text={street.intro} /> }))}
        photos={{
          ahdoos: RESTAURANT_PHOTOS.ahdoos[0],
          mughalDarbar: RESTAURANT_PHOTOS["mughal-darbar"][0],
          boulevardRoad: SCENES.boulevardRoad,
          oldCity: SCENES.oldCity,
        }}
        types={PLACE_TYPES.map(({ id, label }) => ({ id, label }))}
        formats={FORMATS}
        areas={areas.map((area) => ({ name: area.name, count: area.places.length }))}
        evidence={EVIDENCE}
        suggestions={[...dishes.slice(0, 3).map((dish) => dish.words), "trami"]}
      />

      <section className={styles.kitchen} aria-labelledby="what-wazwan-is">
        <div className={`${styles.container} ${styles.kitchenInner}`}>
          <Photograph photo={SCENES.wazaAtTheDegs} frameClassName={styles.kitchenFrame} sizes="(min-width: 1080px) 640px, 100vw" />
          <div className={styles.kitchenBody}>
            <h2 className={styles.h2} id="what-wazwan-is">
              What Wazwan is
            </h2>
            <p className={styles.text}>{WAZWAN_IN_TWO_SENTENCES}</p>
            <p className={styles.text}>The dishes the sources name most often at these places, each with a page of its own:</p>
            <ul className={styles.dishIndex}>
              {dishes.map((dish) => (
                <li key={dish.slug}>
                  <Link href={`/dishes/${dish.slug}`} prefetch={false}>
                    <span className={styles.dishIndexName}>{dishName(dish.slug)}</span>
                    <span className={styles.dishIndexCount}>Named at {dish.places} places</span>
                  </Link>
                </li>
              ))}
            </ul>
            <ul className={styles.moreLinks}>
              <li>
                <Link href="/dishes" prefetch={false} className={styles.link}>
                  Every Wazwan dish
                </Link>
              </li>
              <li>
                <Link href="/how-to-experience" prefetch={false} className={styles.link}>
                  How a Wazwan is served and eaten
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} id="how-we-know" aria-labelledby="how-we-know-title">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="how-we-know-title">
            How to read this list
          </h2>
          <p className={styles.text}>
            Each place has a profile with its address, phone, hours, the Wazwan it serves and dated prices, and every fact links to where it
            came from. The {RESTAURANTS.length} places are in {areas.length} neighbourhoods; {counts.strong} have their own menu or a dated
            article behind them.
          </p>
        </div>
        <ul className={styles.proofList}>
          <li>Google figures are as seen on {CHECKED_LABEL}.</li>
          <li>No restaurant was phoned or visited.</li>
          <li>Every price carries its date.</li>
        </ul>
        <p className={styles.text}>The tags on each place say how we know it serves Wazwan:</p>
        <ul className={styles.legend}>
          {Object.entries(EVIDENCE).map(([id, ev]) => (
            <li key={id}>
              <EvidenceBadges evidence={[id]} />
              <span>{ev.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.container} ${styles.section}`} id="in-short" aria-labelledby="in-short-title">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="in-short-title">
            In short
          </h2>
        </div>
        <ul className={styles.findings}>
          {DIRECTORY_FINDINGS.map((finding) => (
            <li key={finding.lead}>
              <span>
                <b>{finding.lead}</b> <Cited text={finding.text} />
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.container} ${styles.section}`} id="questions" aria-labelledby="questions-title">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="questions-title">
            Questions about Wazwan in Srinagar
          </h2>
        </div>
        <div className={styles.faq}>
          {faqs.map((faq) => (
            <div key={faq.question} className={styles.faqItem}>
              <h3>{faq.question}</h3>
              <p>
                <Cited text={faq.answer} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} id="record" aria-labelledby="record-title">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="record-title">
            The record behind the list
          </h2>
          <p className={styles.text}>The prices, the places left out and the method, each with its sources. Open any of them.</p>
        </div>
        <div className={styles.folds}>
          <Fold
            id="prices"
            title="What Wazwan costs in Srinagar restaurants"
            lead={`${WAZWAN_PRICES.length} prices, each with its date and source, and what Google users say they paid.`}
          >
            <p className={styles.text}>
              Every Wazwan price found, the restaurants&apos; own figures first, then delivery apps, then estimates for two. None was checked
              by phone, so treat each as of its date.
            </p>
            <div className={styles.tableWrap} data-h-scroll="">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Place</th>
                    <th scope="col">What</th>
                    <th scope="col">Price</th>
                    <th scope="col">Kind of figure</th>
                    <th scope="col">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {WAZWAN_PRICES.map((row) => (
                    <tr key={`${row.place}-${row.item}-${row.source}`}>
                      <td>
                        {row.slug ? (
                          <Link href={restaurantPath(row.slug)} prefetch={false}>
                            {row.place}
                          </Link>
                        ) : (
                          row.place
                        )}
                      </td>
                      <td>{row.item}</td>
                      <td className={styles.num}>{row.price}</td>
                      <td>{row.kind}</td>
                      <td>
                        <Cited text={`[[${row.source}]]`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className={`${styles.h3} ${styles.subhead}`}>What Google users say they paid</h4>
            <p className={styles.text}>
              Google shows a per-person range with the number of people who reported it. These are self-reported and undated, as shown on{" "}
              {CHECKED_LABEL}.
            </p>
            <div className={styles.tableWrap} data-h-scroll="">
              <table className={`${styles.table} ${styles.tableNarrow}`}>
                <thead>
                  <tr>
                    <th scope="col">Place</th>
                    <th scope="col">Per person</th>
                    <th scope="col">Reports</th>
                  </tr>
                </thead>
                <tbody>
                  {bands.map((row) => (
                    <tr key={row.slug}>
                      <td>
                        <Link href={restaurantPath(row.slug)} prefetch={false}>
                          {row.name}
                        </Link>
                      </td>
                      <td className={styles.num}>{row.band}</td>
                      <td className={styles.num}>{count(row.reports)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Fold>

          <Fold id="wazpora" title="Wazpora, the waza quarter" lead={WAZPORA.intro}>
            <ul className={styles.plainList}>
              {WAZPORA.points.map((point) => (
                <li key={point.slice(0, 40)}>
                  <Cited text={point} />
                </li>
              ))}
            </ul>
            <p className={styles.text}>
              In Wazpora today:{" "}
              <Link href="/restaurants/jj-foods" prefetch={false} className={styles.link}>
                JJ Foods
              </Link>{" "}
              and{" "}
              <Link href="/restaurants/lazeez-wazwan" prefetch={false} className={styles.link}>
                Lazeez Wazwan
              </Link>
              .
            </p>
          </Fold>

          <Fold
            id="others"
            title="Closed, unconfirmed or too thin to list"
            lead={`${OTHER_PLACES.length} places the research came across without giving them a profile, and ${GOOGLE_LISTINGS.length} unchecked Google listings.`}
          >
            <p className={styles.text}>
              Places the research came across that don&apos;t have a profile, with the reason. Each could earn one once someone confirms it.
            </p>
            <div className={styles.tableWrap} data-h-scroll="">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Where</th>
                    <th scope="col">What was found</th>
                  </tr>
                </thead>
                <tbody>
                  {OTHER_PLACES.map((row) => (
                    <tr key={row.name}>
                      <th scope="row">{row.name}</th>
                      <td>{row.where}</td>
                      <td className={styles.wrapCell}>
                        <Cited text={row.note} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className={`${styles.h3} ${styles.subhead}`}>Google listings with Wazwan in the name</h4>
            <p className={styles.text}>Small listings found on Google Maps on {CHECKED_LABEL} and not checked further.</p>
            <div className={styles.tableWrap} data-h-scroll="">
              <table className={`${styles.table} ${styles.tableNarrow}`}>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Where</th>
                    <th scope="col">Google</th>
                    <th scope="col">Per person</th>
                  </tr>
                </thead>
                <tbody>
                  {GOOGLE_LISTINGS.map((row) => (
                    <tr key={row.name}>
                      <th scope="row">{row.name}</th>
                      <td>{row.where}</td>
                      <td className={styles.num}>{row.rating ? `${row.rating.toFixed(1)} (${count(row.reviews)})` : "Not noted"}</td>
                      <td className={styles.num}>{row.perPerson || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Fold>

          <Fold id="method" title="How this directory was made" lead="What was read, on which day, and what was not done.">
            <ul className={styles.plainList}>
              <li>
                <b>Google Maps.</b> Listings were read on {CHECKED_LABEL}: rating, review count, category, address, phone, hours, Google&apos;s
                per-person price range and how many people reported it, menu highlights, review topics with counts and Google&apos;s AI review
                summary. Owners and users supply some of these details and some are plainly wrong, so only the basic ones are used.
              </li>
              <li>
                <b>Websites, press and listings.</b> Restaurants&apos; and hotels&apos; own pages, Instagram bios, press and guide articles, blogs,
                and listing sites (Wanderlog, Sluurpy, ThreeBestRated, Justdial, Zomato, Swiggy, TripAdvisor) were read on the same day. Where a
                page couldn&apos;t be opened, the profile says the fact came from search results.
              </li>
              <li>
                <b>What wasn&apos;t done.</b> No restaurant was phoned or visited. Most prices are estimates for two, not menu prices, and each
                carries its date. Harissa and other dishes outside Wazwan are not counted as Wazwan.
              </li>
              <li>
                <b>No ranking.</b> Places are grouped by street and by the kind of evidence, not placed in order, and no place paid to be here.
              </li>
              <li>
                <b>Photographs.</b> Only photographs under an open licence, or sent with permission, are shown, each with its date and credit. A
                picture of a street is captioned as the street, and most places have no photograph yet. If you run one of them, you can{" "}
                <Link href="/list-restaurant" prefetch={false} className={styles.link}>
                  send us yours
                </Link>
                .
              </li>
              <li>
                <b>Corrections.</b> If you run one of these restaurants, or something here has changed,{" "}
                <Link href="/contact" prefetch={false} className={styles.link}>
                  tell us
                </Link>{" "}
                and we&apos;ll check it. An older page on the site, for{" "}
                <Link href="/restaurants/clove" prefetch={false} className={styles.link}>
                  Clove
                </Link>{" "}
                on the Boulevard, predates this research and hasn&apos;t been re-checked.
              </li>
            </ul>
          </Fold>
        </div>
      </section>


      <nav className={`${styles.container} ${styles.section}`} aria-labelledby="read-more">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="read-more">
            Before you go
          </h2>
        </div>
        <ul className={styles.related}>
          {[
            { href: "/restaurants/best-wazwan-srinagar", name: "Where to eat Kashmiri food in Srinagar", meta: "Bakeries, tea rooms and street food too" },
            { href: "/how-to-experience", name: "How to experience Wazwan", meta: "The trami, the order of dishes and the manners" },
            { href: "/kashmiri-food/wazwan/guide/restaurant-vs-wedding-vs-home", name: "Restaurant, wedding or home?", meta: "What changes between the three" },
            { href: "/kashmiri-food/wazwan/guide/cost-guide", name: "What a Wazwan costs", meta: "Restaurant, wedding and catering prices, dated" },
            { href: "/blog/core-seven", name: "The seven essential dishes", meta: "One story for each" },
            { href: "/dishes", name: "Every Wazwan dish", meta: "What each one is, and how it's made" },
          ].map((link) => (
            <li key={link.href}>
              <Link href={link.href} prefetch={false}>
                <span className={styles.relatedName}>{link.name}</span>
                <span className={styles.relatedMeta}>{link.meta}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
