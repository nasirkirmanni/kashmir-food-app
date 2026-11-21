import Link from "next/link";
import { ExternalLink, MapPin, Phone } from "lucide-react";
import JsonLd, { buildFaqSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import Cited from "./Cited";
import EvidenceBadges from "./EvidenceBadges";
import Photograph from "./Photograph";
import ProfileContents from "./ProfileContents";
import styles from "./restaurants.module.css";
import { photosFor } from "@/data/restaurantPhotos";
import { RESTAURANTS, SOURCES } from "@/data/srinagarRestaurants";
import { dishName, restaurantSchema } from "@/lib/restaurantSchema";
import {
  CHECKED_LABEL,
  DIRECTORY_PATH,
  FACT_SECTIONS,
  STATUS_LABELS,
  citedSources,
  formatsOf,
  googleMapsUrl,
  kindOf,
  nearbyHeading,
  openingText,
  plainText,
  relatedRestaurants,
  restaurantFaq,
  restaurantPath,
  sameStreet,
  streetLinkLabel,
  streetOf,
  streetPath,
} from "@/lib/srinagarRestaurants";

/**
 * One restaurant's page, built from its record in data/srinagarRestaurants.js alone: what it is,
 * whether and how it serves Wazwan, the dishes its sources name, where it is and how each fact is
 * known. A photograph appears only where a real, licensed one of the place exists; a fact the record
 * does not hold reads "Not verified".
 *
 * The page is one grid. In the source, and on phones, the order is: the name and opening, the facts,
 * the contents bar, then the sections. On wide screens the facts and the contents list share a side
 * column that runs the height of the page, and the sections start straight under the opening.
 */

// A fact whose label only repeats its section's heading is printed without it.
function FactRows({ facts, place, heading }) {
  return (
    <dl className={styles.factList}>
      {facts.map((fact) => (
        <div key={fact.label + fact.text.slice(0, 24)} className={fact.label === heading ? `${styles.fact} ${styles.noLabel}` : styles.fact}>
          <dt className={fact.label === heading ? styles.srOnly : undefined}>{fact.label}</dt>
          <dd>
            <Cited text={fact.text} place={place} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function NotVerified({ note, place }) {
  return (
    <>
      <span className={styles.notVerified}>Not verified</span>
      {note && note !== "Not found." ? (
        <span className={styles.small}>
          <Cited text={note} place={place} />
        </span>
      ) : null}
    </>
  );
}

const count = (n) => n.toLocaleString("en-IN");
const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export default function RestaurantProfile({ place }) {
  const faqs = restaurantFaq(place, dishName);
  const formats = formatsOf(place);
  const status = STATUS_LABELS[place.status];
  const related = relatedRestaurants(place);
  const street = streetOf(place);
  const neighbours = sameStreet(place);
  const photos = photosFor(place.slug);
  const [lead, ...morePhotos] = photos;
  const groups = FACT_SECTIONS.map((section) => ({
    ...section,
    facts: place.facts.filter((fact) => section.labels.includes(fact.label)),
  }));
  const wazwanFacts = groups[0].facts;
  const laterGroups = groups.slice(1).filter((group) => group.facts.length || (group.id === "eating" && place.topics.length));
  const sources = citedSources(
    [place.addressCite, place.phoneCite, place.phoneNote, place.hours, place.hoursCite, place.wazwan, ...place.facts.map((f) => f.text), ...faqs.map((f) => f.answer)].filter(Boolean),
    place
  );
  const area = place.neighbourhoods[0];
  const website = place.links[0];

  const contents = [
    { id: "serves-wazwan", label: "Wazwan here" },
    { id: "dishes", label: "Dishes" },
    ...laterGroups.map((group) => ({ id: `facts-${group.id}`, label: group.title })),
    { id: "where", label: "Where it is" },
    { id: "questions", label: "Questions" },
    { id: "sources", label: "Sources" },
  ];

  return (
    <div className={styles.page}>
      <JsonLd data={restaurantSchema(place)} />
      <JsonLd data={buildFaqSchema(faqs.map((faq) => ({ question: faq.question, answer: plainText(faq.answer, place) })))} />

      <div className={`${styles.container} ${styles.profileHero}`}>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Restaurants", href: DIRECTORY_PATH },
              { name: place.name, href: restaurantPath(place.slug) },
            ]}
          />
        </div>
      </div>

      <div className={styles.profileGrid}>
        <header className={`${styles.container} ${styles.profileHead}`}>
          <h1 className={styles.profileTitle}>{place.name}</h1>
          <ul className={styles.profileMeta}>
            <li>{kindOf(place)}</li>
            <li>
              <Link href={streetPath(street.id)} prefetch={false}>
                {street.neighbourhoods ? street.name : area || "Srinagar"}
              </Link>
            </li>
          </ul>
          {place.google ? (
            <p className={styles.profileGoogle}>
              Google <b>{place.google.rating.toFixed(1)}</b> from {count(place.google.reviews)} reviews, as seen {CHECKED_LABEL}
            </p>
          ) : null}
          {place.otherNames.length ? <p className={styles.otherNames}>Also listed as {place.otherNames.join(", ")}</p> : null}
          {status ? (
            <p className={styles.rowFlags}>
              <span className={styles.status}>{status}</span>
            </p>
          ) : null}
          <p className={styles.lede}>{openingText(place)}</p>
          <div className={styles.actions}>
            {place.mapsQuery ? (
              <a className={styles.button} href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">
                <MapPin aria-hidden="true" /> Open in Google Maps
              </a>
            ) : null}
            {place.phone ? (
              <a className={styles.buttonGhost} href={telHref(place.phone)}>
                <Phone aria-hidden="true" /> Call {place.phone}
              </a>
            ) : null}
            {website ? (
              <a className={styles.buttonGhost} href={SOURCES[website.source].url} target="_blank" rel="noopener noreferrer">
                <ExternalLink aria-hidden="true" /> {website.label}
              </a>
            ) : null}
          </div>
        </header>

        <div className={styles.profileSide}>
          <aside className={`${styles.container} ${styles.aside}`} aria-label={`${place.name} at a glance`}>
            <dl className={styles.keyFacts}>
              <div>
                <dt>Address</dt>
                <dd>
                  {place.address} {place.addressCite ? <Cited text={place.addressCite} place={place} /> : null}
                  {place.addressNote ? <span className={styles.small}>{place.addressNote}</span> : null}
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  {place.phone ? (
                    <>
                      <a href={telHref(place.phone)}>{place.phone}</a> <Cited text={place.phoneCite} place={place} />
                    </>
                  ) : (
                    <NotVerified note={place.phoneNote} place={place} />
                  )}
                </dd>
              </div>
              <div>
                <dt>Hours</dt>
                <dd>{place.hours ? <Cited text={`${place.hours} ${place.hoursCite || ""}`.trim()} place={place} /> : <NotVerified />}</dd>
              </div>
              <div>
                <dt>Price</dt>
                <dd>{place.price}</dd>
              </div>
              <div>
                <dt>On Google</dt>
                <dd>
                  {place.google ? (
                    <>
                      {place.google.rating.toFixed(1)} from {count(place.google.reviews)} reviews
                      {place.google.category ? <span className={styles.small}>Listed as {place.google.category}</span> : null}
                      {place.google.perPerson ? (
                        <span className={styles.small}>
                          {place.google.perPerson} per person, from {place.google.perPersonReports} reports
                        </span>
                      ) : null}
                      <span className={styles.small}>As shown on {CHECKED_LABEL}</span>
                    </>
                  ) : (
                    <span className={styles.notVerified}>No Google listing used</span>
                  )}
                </dd>
              </div>
              <div>
                <dt>Known from</dt>
                <dd>
                  <EvidenceBadges evidence={place.evidence} />
                </dd>
              </div>
              <div>
                <dt>Checked</dt>
                <dd>{CHECKED_LABEL}</dd>
              </div>
            </dl>
          </aside>
          <ProfileContents items={contents} />
        </div>

        <div className={`${styles.container} ${styles.profileMain}`}>
          {lead ? (
            <Photograph
              photo={lead}
              priority
              className={styles.leadPlate}
              frameClassName={styles.heroPlateFrame}
              sizes="(min-width: 1080px) 760px, 100vw"
            />
          ) : null}

          <section className={styles.answer} id="serves-wazwan" aria-labelledby="serves-wazwan-title">
            <h2 className={styles.h2} id="serves-wazwan-title">
              Does {place.name} serve Wazwan?
            </h2>
            <p className={styles.answerText}>
              <Cited text={place.wazwan} place={place} />
            </p>
          </section>

          <section className={styles.section} id="wazwan" aria-labelledby="wazwan-title">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="wazwan-title">
                Wazwan at {place.name}
              </h2>
            </div>
            {formats.length ? (
              <dl className={styles.formatGrid}>
                {formats.map((format) => (
                  <div key={format.id}>
                    <dt>{format.label}</dt>
                    <dd>{format.value.toLowerCase() === format.label.toLowerCase() ? "Yes" : format.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {wazwanFacts.length ? <FactRows facts={wazwanFacts} place={place} /> : null}
          </section>

          <section className={styles.section} id="dishes" aria-labelledby="dishes-title">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="dishes-title">
                Dishes named at {place.name}
              </h2>
              <p className={styles.text}>
                <b>In the research:</b> {place.dishesNamed}.
              </p>
            </div>
            {place.dishes.length ? (
              <>
                <p className={styles.text}>Each of these has a page of its own, with what the dish is and how it is made:</p>
                <ul className={styles.dishLinks}>
                  {place.dishes.map((slug) => (
                    <li key={slug}>
                      <Link href={`/dishes/${slug}`} prefetch={false} className={styles.dishLink}>
                        <span className={styles.dishName}>{dishName(slug)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </section>

          {laterGroups.map((group) => (
            <section key={group.id} className={styles.section} id={`facts-${group.id}`} aria-labelledby={`facts-${group.id}-title`}>
              <div className={styles.sectionHead}>
                <h2 className={styles.h2} id={`facts-${group.id}-title`}>
                  {group.title}
                </h2>
              </div>
              {group.facts.length ? <FactRows facts={group.facts} place={place} heading={group.title} /> : null}
              {group.id === "eating" && place.topics.length ? (
                <dl className={styles.factList}>
                  <div className={styles.fact}>
                    <dt>What Google reviewers mention</dt>
                    <dd>
                      <ul className={styles.topics}>
                        {place.topics.map(([topic, n]) => (
                          <li key={topic}>
                            {topic}
                            <b>{n}</b>
                          </li>
                        ))}
                      </ul>
                      <span className={styles.small}>
                        Google&apos;s review topics, with the number of reviews that mention each, {CHECKED_LABEL}.{" "}
                        <Cited text="[[g]]" place={place} />
                      </span>
                    </dd>
                  </div>
                </dl>
              ) : null}
            </section>
          ))}

          <section className={styles.section} id="where" aria-labelledby="where-title">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="where-title">
                Where it is
              </h2>
              <p className={styles.text}>
                {place.address} {place.addressCite ? <Cited text={place.addressCite} place={place} /> : null}
              </p>
              {place.alsoAt ? <p className={styles.text}>{place.alsoAt}</p> : null}
              <p className={styles.text}>
                We hold no map coordinates for {place.name}, so there is no map of our own here.{" "}
                {place.mapsQuery ? (
                  <a className={styles.link} href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">
                    Open it in Google Maps
                  </a>
                ) : (
                  "Its location is not verified."
                )}
              </p>
            </div>
            {neighbours.length ? (
              <>
                <h3 className={`${styles.h3} ${styles.subhead}`}>{nearbyHeading(place)}</h3>
                <ul className={styles.related}>
                  {neighbours.slice(0, 5).map((other) => (
                    <li key={other.slug}>
                      <Link href={restaurantPath(other.slug)} prefetch={false}>
                        <span className={styles.relatedName}>{other.name}</span>
                        <span className={styles.relatedMeta}>{other.area}</span>
                      </Link>
                    </li>
                  ))}
                  <li>
                    <Link href={streetPath(street.id)} prefetch={false}>
                      <span className={styles.relatedName}>{streetLinkLabel(place)}</span>
                      <span className={styles.relatedMeta}>The directory, street by street</span>
                    </Link>
                  </li>
                </ul>
              </>
            ) : null}
            {morePhotos.length ? (
              <div className={morePhotos.length > 1 ? `${styles.photoSet} ${styles.photoSetTwo}` : styles.photoSet}>
                {morePhotos.map((photo) => (
                  <Photograph key={photo.src} photo={photo} sizes="(min-width: 900px) 600px, 100vw" />
                ))}
              </div>
            ) : null}
            {photos.length ? null : (
              <p className={styles.text}>
                No photograph of {place.name} is licensed to us yet, so this page has none. If you run it, you can{" "}
                <Link href="/list-restaurant" prefetch={false}>
                  send us yours
                </Link>
                .
              </p>
            )}
          </section>

          <section className={styles.section} id="questions" aria-labelledby="questions-title">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="questions-title">
                Questions about {place.name}
              </h2>
            </div>
            <div className={styles.faq}>
              {faqs.map((faq) => (
                <div key={faq.question} className={styles.faqItem}>
                  <h3>{faq.question}</h3>
                  <p>
                    <Cited text={faq.answer} place={place} />
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} id="sources" aria-labelledby="sources-title">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="sources-title">
                Sources
              </h2>
              <p className={styles.text}>
                Everything on this page, as read on {CHECKED_LABEL}. Nobody from Wazwan Way phoned or visited {place.name}; if something has
                changed, <Link href="/contact" prefetch={false}>tell us</Link>.
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
        </div>
      </div>

      <section className={styles.closing} aria-labelledby="more-places">
        <div className={`${styles.container} ${styles.closingInner}`}>
          <h2 className={styles.h2} id="more-places">
            More Wazwan in Srinagar
          </h2>
          <ul className={styles.related}>
            {related.map((other) => (
              <li key={other.slug}>
                <Link href={restaurantPath(other.slug)} prefetch={false}>
                  <span className={styles.relatedName}>{other.name}</span>
                  <span className={styles.relatedMeta}>
                    {other.reason} · {other.area}
                  </span>
                </Link>
              </li>
            ))}
            <li>
              <Link href={DIRECTORY_PATH} prefetch={false}>
                <span className={styles.relatedName}>All {RESTAURANTS.length} Wazwan restaurants in Srinagar</span>
                <span className={styles.relatedMeta}>Search by name, street or dish</span>
              </Link>
            </li>
            <li>
              <Link href="/dishes" prefetch={false}>
                <span className={styles.relatedName}>Every Wazwan dish</span>
                <span className={styles.relatedMeta}>What each one is, and how it&apos;s made</span>
              </Link>
            </li>
            <li>
              <Link href="/how-to-experience" prefetch={false}>
                <span className={styles.relatedName}>How to experience Wazwan</span>
                <span className={styles.relatedMeta}>The trami, the order of dishes and the manners</span>
              </Link>
            </li>
            <li>
              <Link href="/kashmiri-food/wazwan/guide/cost-guide" prefetch={false}>
                <span className={styles.relatedName}>What a Wazwan costs</span>
                <span className={styles.relatedMeta}>Restaurant, wedding and catering prices, dated</span>
              </Link>
            </li>
            <li>
              <Link href="/destinations/srinagar" prefetch={false}>
                <span className={styles.relatedName}>Srinagar</span>
                <span className={styles.relatedMeta}>The city, its lakes and gardens</span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
