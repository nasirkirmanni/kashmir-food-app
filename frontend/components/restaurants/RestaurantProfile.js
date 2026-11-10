import Link from "next/link";
import { ExternalLink, MapPin } from "lucide-react";
import JsonLd, { buildFaqSchema } from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import Cited from "./Cited";
import EvidenceBadges from "./EvidenceBadges";
import RestaurantReviews from "./RestaurantReviews";
import styles from "./restaurants.module.css";
import { SOURCES } from "@/data/srinagarRestaurants";
import { dishName, restaurantSchema } from "@/lib/restaurantSchema";
import {
  CHECKED_LABEL,
  DIRECTORY_PATH,
  FACT_SECTIONS,
  SITE,
  STATUS_LABELS,
  areaId,
  citedSources,
  formatsOf,
  googleMapsUrl,
  openingText,
  plainText,
  relatedRestaurants,
  restaurantFaq,
  restaurantPath,
  typeLabel,
} from "@/lib/srinagarRestaurants";




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

export default function RestaurantProfile({ place }) {
  const url = `${SITE}${restaurantPath(place.slug)}`;
  const faqs = restaurantFaq(place, dishName);
  const formats = formatsOf(place);
  const status = STATUS_LABELS[place.status];
  const related = relatedRestaurants(place);
  const groups = FACT_SECTIONS.map((section) => ({
    ...section,
    facts: place.facts.filter((fact) => section.labels.includes(fact.label)),
  }));
  const wazwanFacts = groups[0].facts;
  const sources = citedSources(
    [place.addressCite, place.phoneCite, place.phoneNote, place.hours, place.hoursCite, place.wazwan, ...place.facts.map((f) => f.text), ...faqs.map((f) => f.answer)].filter(Boolean),
    place
  );
  const area = place.neighbourhoods[0];

  return (
    <div className={styles.page}>
      <JsonLd data={restaurantSchema(place)} />
      <JsonLd data={buildFaqSchema(faqs.map((faq) => ({ question: faq.question, answer: plainText(faq.answer, place) })))} />

      <header className={`${styles.container} ${styles.hero}`}>
        <div className={styles.crumbs}>
          <Breadcrumbs
            items={[
              { name: "Home", href: "/" },
              { name: "Restaurants", href: DIRECTORY_PATH },
              { name: place.name, href: restaurantPath(place.slug) },
            ]}
          />
        </div>
        <p className={styles.eyebrow}>
          {typeLabel(place.type)}
          {area ? ` · ${area}` : ""}
        </p>
        <h1 className={styles.title}>{place.name}</h1>
        {place.otherNames.length ? <p className={styles.otherNames}>Also listed as {place.otherNames.join(", ")}</p> : null}
        <div className={styles.heroBadges}>
          <EvidenceBadges evidence={place.evidence} />
          {status ? <span className={styles.status}>{status}</span> : null}
        </div>
        <p className={styles.lede}>{openingText(place)}</p>
      </header>

      <div className={`${styles.container} ${styles.profileGrid}`}>
        <div className={styles.profileMain}>
          <section className={styles.answer} aria-labelledby="serves-wazwan">
            <h2 id="serves-wazwan">Does {place.name} serve Wazwan?</h2>
            <p>
              <Cited text={place.wazwan} place={place} />
            </p>
          </section>

          <section className={styles.section} aria-labelledby="wazwan">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="wazwan">
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
            <p className={styles.text}>
              <b>Dishes named in the research:</b> {place.dishesNamed}.
            </p>
            {place.dishes.length ? (
              <>
                <p className={styles.text}>Read about each dish:</p>
                <ul className={styles.dishChips}>
                  {place.dishes.map((slug) => (
                    <li key={slug}>
                      <Link href={`/dishes/${slug}`} prefetch={false} className={styles.dishChip}>
                        {dishName(slug)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {wazwanFacts.length ? <FactRows facts={wazwanFacts} place={place} /> : null}
          </section>

          {groups.slice(1).map((group) =>
            group.facts.length || (group.id === "eating" && place.topics.length) ? (
              <section key={group.id} className={styles.section} aria-labelledby={`facts-${group.id}`}>
                <div className={styles.sectionHead}>
                  <h2 className={styles.h2} id={`facts-${group.id}`}>
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
            ) : null
          )}

          <section className={styles.section} aria-labelledby="questions">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="questions">
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

          <section className={styles.section} aria-labelledby="sources">
            <div className={styles.sectionHead}>
              <h2 className={styles.h2} id="sources">
                Sources
              </h2>
              <p className={styles.text}>
                Everything on this page, as read on {CHECKED_LABEL}. Nobody from Wazwan Way phoned or visited {place.name}; if
                something has changed, <Link href="/contact" prefetch={false}>tell us</Link>.
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

        <aside className={styles.aside} aria-label={`${place.name} at a glance`}>
          <dl className={styles.keyFacts}>
            <div>
              <dt>Address</dt>
              <dd>
                {place.address} {place.addressCite ? <Cited text={place.addressCite} place={place} /> : null}
                {place.addressNote ? <span className={styles.small}>{place.addressNote}</span> : null}
                {place.alsoAt ? <span className={styles.small}>{place.alsoAt}</span> : null}
                {place.mapsQuery ? (
                  <a className={styles.mapLink} href={googleMapsUrl(place.mapsQuery)} target="_blank" rel="noopener noreferrer">
                    <MapPin aria-hidden="true" /> Open in Google Maps
                  </a>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                {place.phone ? (
                  <>
                    {place.phone} <Cited text={place.phoneCite} place={place} />
                  </>
                ) : (
                  <NotVerified note={place.phoneNote} place={place} />
                )}
              </dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>
                {place.hours ? <Cited text={`${place.hours} ${place.hoursCite || ""}`.trim()} place={place} /> : <NotVerified />}
              </dd>
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
                    {place.google.rating.toFixed(1)} from {place.google.reviews.toLocaleString("en-IN")} reviews
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
            {place.links.length ? (
              <div>
                <dt>Website and social</dt>
                <dd>
                  {place.links.map((link) => (
                    <a
                      key={link.source}
                      className={styles.mapLink}
                      href={SOURCES[link.source].url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink aria-hidden="true" /> {link.label}
                    </a>
                  ))}
                </dd>
              </div>
            ) : null}
            <div>
              <dt>Checked</dt>
              <dd>{CHECKED_LABEL}</dd>
            </div>
          </dl>
        </aside>
      </div>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="more-places">
        <div className={styles.sectionHead}>
          <h2 className={styles.h2} id="more-places">
            More Wazwan in Srinagar
          </h2>
        </div>
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
          {area ? (
            <li>
              <Link href={`${DIRECTORY_PATH}#${areaId(area)}`} prefetch={false}>
                <span className={styles.relatedName}>Everything in {area}</span>
                <span className={styles.relatedMeta}>The directory, by neighbourhood</span>
              </Link>
            </li>
          ) : null}
          <li>
            <Link href={DIRECTORY_PATH} prefetch={false}>
              <span className={styles.relatedName}>All Wazwan restaurants in Srinagar</span>
              <span className={styles.relatedMeta}>Search and filter the whole list</span>
            </Link>
          </li>
          <li>
            <Link href="/destinations/srinagar" prefetch={false}>
              <span className={styles.relatedName}>Srinagar</span>
              <span className={styles.relatedMeta}>The city, its lakes and gardens</span>
            </Link>
          </li>
          <li>
            <Link href="/how-to-experience" prefetch={false}>
              <span className={styles.relatedName}>How to experience Wazwan</span>
              <span className={styles.relatedMeta}>The trami, the order of dishes and the manners</span>
            </Link>
          </li>
        </ul>
      </section>

      {place.dbId ? <RestaurantReviews restaurantId={place.dbId} name={place.name} /> : null}
    </div>
  );
}
