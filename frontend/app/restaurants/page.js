import Link from "next/link";
import JsonLd, { buildFaqSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import Cited from "@/components/restaurants/Cited";
import EvidenceBadges from "@/components/restaurants/EvidenceBadges";
import DirectoryBrowser from "@/components/restaurants/DirectoryBrowser";
import styles from "@/components/restaurants/restaurants.module.css";
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
import {
  CHECKED_LABEL,
  DIRECTORY_PATH,
  SITE,
  directoryCards,
  evidenceCounts,
  neighbourhoods,
  plainText,
  restaurantPath,
} from "@/lib/srinagarRestaurants";

/**
 * /restaurants: the Srinagar Wazwan directory. Server-rendered from data/srinagarRestaurants.js so the
 * full list, every link and every answer are in the HTML; DirectoryBrowser only filters and sorts.
 * The metadata (title, description, canonical) is in ./layout.js.
 */

const count = (n) => n.toLocaleString("en-IN");

export default function RestaurantsPage() {
  const cards = directoryCards();
  const areas = neighbourhoods();
  const counts = evidenceCounts();
  const faqs = directoryFaq({ places: RESTAURANTS.length, ...counts });
  const bands = RESTAURANTS.filter((place) => place.google?.perPerson)
    .map((place) => ({ slug: place.slug, name: place.name, band: place.google.perPerson, reports: place.google.perPersonReports }))
    .sort((a, b) => b.reports - a.reports);

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

      <header className={`${styles.container} ${styles.hero}`}>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Restaurants", href: DIRECTORY_PATH },
            ]}
          />
        </div>
        <p className={styles.eyebrow}>Srinagar · checked {CHECKED_LABEL}</p>
        <h1 className={styles.title}>Wazwan restaurants in Srinagar</h1>
        <p className={styles.lede}>
          The {RESTAURANTS.length} restaurants, hotel restaurants and delivery kitchens in Srinagar where the evidence says you
          can eat Wazwan, Kashmir&apos;s multi-course feast of mutton dishes. Each has a profile with its address, phone, hours,
          the Wazwan it serves and dated prices, and every fact links to where it came from.
        </p>
        <ul className={styles.metaLine}>
          <li>Google figures as seen {CHECKED_LABEL}</li>
          <li>No restaurant was phoned or visited</li>
          <li>Every price carries its date</li>
        </ul>
        <dl className={styles.stats}>
          <div>
            <dt>Places</dt>
            <dd>{RESTAURANTS.length}</dd>
          </div>
          <div>
            <dt>Neighbourhoods</dt>
            <dd>{areas.length}</dd>
          </div>
          <div>
            <dt>Own menu or press</dt>
            <dd>{counts.strong}</dd>
          </div>
          <div>
            <dt>Sources cited</dt>
            <dd>{Object.keys(SOURCES).length}</dd>
          </div>
        </dl>
      </header>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="in-short">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="in-short">
            In short
          </h2>
        </div>
        <ul className={styles.findings}>
          {DIRECTORY_FINDINGS.map((finding) => (
            <li key={finding.lead}>
              <b>{finding.lead}</b> <Cited text={finding.text} />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="directory">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2 className={styles.h2} id="directory">
              All {RESTAURANTS.length} places
            </h2>
            <p className={styles.text}>
              Search by name, neighbourhood or dish, or narrow the list by how the Wazwan is served. The labels say how we know
              each place serves it:
            </p>
          </div>
          <ul className={styles.legend}>
            {Object.entries(EVIDENCE).map(([id, ev]) => (
              <li key={id}>
                <EvidenceBadges evidence={[id]} /> {ev.description}
              </li>
            ))}
          </ul>
        </div>
        <DirectoryBrowser
          cards={cards}
          types={PLACE_TYPES.map(({ id, label }) => ({ id, label }))}
          formats={FORMATS}
          areas={areas.map((area) => ({ name: area.name, count: area.places.length }))}
          evidence={EVIDENCE}
        />
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="by-neighbourhood">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="by-neighbourhood">
            By neighbourhood
          </h2>
          <p className={styles.text}>Where each place is, as its Google listing or its own pages give it.</p>
        </div>
        <ul className={styles.areaList}>
          {areas.map((area) => (
            <li key={area.id} id={area.id}>
              <h3 className={styles.areaName}>
                {area.name} <span className={styles.chipCount}>({area.places.length})</span>
              </h3>
              <p className={styles.areaPlaces}>
                {area.places.map((place, i) => (
                  <span key={place.slug}>
                    {i > 0 ? ", " : ""}
                    <Link href={restaurantPath(place.slug)} prefetch={false}>
                      {place.name}
                    </Link>
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="two-mughal-darbars">
        <div className={styles.callout}>
          <div>
            <h2 className={styles.h3} id="two-mughal-darbars">
              Two Mughal Darbars on Residency Road
            </h2>
            <p className={styles.text}>
              One is upstairs and runs mughal-darbar.com; the other is on the ground floor near the GPO and runs mughaldarbar.in.
              They share no phone number, email or website, and most guides don&apos;t say which one they mean.
            </p>
          </div>
          <Link href="/restaurants/mughal-darbar" prefetch={false} className={styles.button}>
            Compare the two
          </Link>
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="prices">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="prices">
            What Wazwan costs in Srinagar restaurants
          </h2>
          <p className={styles.text}>
            Every Wazwan price found, the restaurants&apos; own figures first, then delivery apps, then estimates for two. None
            was checked by phone, so treat each as of its date.
          </p>
        </div>
        <div className={styles.tableWrap}>
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

        <h3 className={`${styles.h3} ${styles.subhead}`}>
          What Google users say they paid
        </h3>
        <p className={styles.text}>
          Google shows a per-person range with the number of people who reported it. These are self-reported and undated, as
          shown on {CHECKED_LABEL}.
        </p>
        <div className={styles.tableWrap}>
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
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="wazpora">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="wazpora">
            Wazpora, the waza quarter
          </h2>
          <p className={styles.text}>{WAZPORA.intro}</p>
        </div>
        <ul className={styles.plainList}>
          {WAZPORA.points.map((point) => (
            <li key={point.slice(0, 40)}>
              <Cited text={point} />
            </li>
          ))}
        </ul>
        <p className={styles.text}>
          In Wazpora today: <Link href="/restaurants/jj-foods" prefetch={false} className={styles.link}>JJ Foods</Link> and{" "}
          <Link href="/restaurants/lazeez-wazwan" prefetch={false} className={styles.link}>Lazeez Wazwan</Link>.
        </p>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="others">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="others">
            Closed, unconfirmed or too thin to list
          </h2>
          <p className={styles.text}>
            Places the research came across that don&apos;t have a profile, with the reason. Each could earn one once someone
            confirms it.
          </p>
        </div>
        <div className={styles.tableWrap}>
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
                  <td>
                    <Cited text={row.note} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className={`${styles.h3} ${styles.subhead}`}>
          Google listings with Wazwan in the name
        </h3>
        <p className={styles.text}>Small listings found on Google Maps on {CHECKED_LABEL} and not checked further.</p>
        <div className={styles.tableWrap}>
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
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="questions">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="questions">
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

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="method">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="method">
            How this directory was made
          </h2>
        </div>
        <ul className={styles.plainList}>
          <li>
            <b>Google Maps.</b> Listings were read on {CHECKED_LABEL}: rating, review count, category, address, phone, hours,
            Google&apos;s per-person price range and how many people reported it, menu highlights, review topics with counts and
            Google&apos;s AI review summary. Owners and users supply some of these details and some are plainly wrong, so only
            the basic ones are used.
          </li>
          <li>
            <b>Websites, press and listings.</b> Restaurants&apos; and hotels&apos; own pages, Instagram bios, press and guide
            articles, blogs, and listing sites (Wanderlog, Sluurpy, ThreeBestRated, Justdial, Zomato, Swiggy, TripAdvisor) were
            read on the same day. Where a page couldn&apos;t be opened, the profile says the fact came from search results.
          </li>
          <li>
            <b>What wasn&apos;t done.</b> No restaurant was phoned or visited. Most prices are estimates for two, not menu
            prices, and each carries its date. Harissa and other dishes outside Wazwan are not counted as Wazwan.
          </li>
          <li>
            <b>No ranking.</b> Places are grouped by the kind of evidence, not placed in order, and no place paid to be here.
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
