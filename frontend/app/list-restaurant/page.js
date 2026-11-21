import Link from "next/link";
import CopyAddress from "./CopyAddress";
import styles from "./listRestaurant.module.css";

// A restaurant is listed from an e-mail, not a form: the owner sends the details and photos below
// to this address, and Wazwan Way reviews them. The page shows the shape of a listing with every
// part left blank, so an owner can see what to send. Nothing here is submitted to the site.
const ADDRESS = "hello@wazwanway.com";

const PHOTOS = [
  "The dining room or the shopfront",
  "Your Wazwan on the table",
  "The kitchen, or the waza at work",
  "Your menu",
];

const DETAILS = [
  { term: "Address", blank: "Street, landmark and area, with a Google Maps link" },
  { term: "Phone", blank: "The number guests should call" },
  { term: "Opening hours", blank: "The days and times you are open" },
  { term: "Wazwan and dishes", blank: "What you serve: a trami, a thali or plates, and your main dishes" },
  { term: "Prices", blank: "Your menu, or what a Wazwan trami or plate costs" },
  { term: "About", blank: "Your specialities, your history, and what makes your Wazwan your own" },
  { term: "Owner or manager", blank: "A name and a number we can reach you on" },
];

// The e-mail opens with the same blanks, ready to fill in.
const MAIL_BODY = [
  "Restaurant name:",
  "Area and city:",
  ...DETAILS.map((detail) => `${detail.term}:`),
  "",
  "Photos attached:",
].join("\r\n");
const MAILTO = `mailto:${ADDRESS}?subject=${encodeURIComponent("Restaurant listing")}&body=${encodeURIComponent(MAIL_BODY)}`;

function PhotoGlyph() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 16l-5-5-8 8" />
    </svg>
  );
}

export default function ListRestaurantPage() {
  return (
    <div className={styles.page}>
      <header className={`${styles.container} ${styles.hero}`}>
        <p className={styles.eyebrow}>For restaurant owners</p>
        <h1 className={styles.h1}>List your restaurant</h1>
        <p className={styles.lede}>
          Serve Wazwan or Kashmiri food? Send us your restaurant&apos;s details and photos by e-mail, and we&apos;ll review it for a
          listing on Wazwan Way.
        </p>
        <div className={styles.send}>
          <a className={styles.button} href={MAILTO}>
            E-mail your details
          </a>
          <CopyAddress address={ADDRESS} />
        </div>
      </header>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="what-to-send">
        <h2 className={styles.h2} id="what-to-send">
          What to send
        </h2>
        <p className={styles.text}>This is the shape of a listing. Each blank is something to send us.</p>

        <div className={styles.sample}>
          <p className={styles.sampleTag}>A listing, with the blanks to fill</p>

          <ul className={styles.photos} aria-label="Photos to send">
            {PHOTOS.map((caption) => (
              <li key={caption} className={styles.photo}>
                <span className={styles.photoFrame}>
                  <PhotoGlyph />
                  <span className={styles.photoWord}>Photo</span>
                </span>
                <span className={styles.photoCaption}>{caption}</span>
              </li>
            ))}
          </ul>
          <p className={styles.note}>Your own photos, attached to the e-mail as JPG or PNG files.</p>

          <div className={styles.sampleHead}>
            <p className={styles.blankName}>Your restaurant&apos;s name</p>
            <p className={styles.blankArea}>Area and city</p>
          </div>

          <dl className={styles.details}>
            {DETAILS.map((detail) => (
              <div key={detail.term} className={styles.detail}>
                <dt>{detail.term}</dt>
                <dd>{detail.blank}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={`${styles.container} ${styles.section}`} aria-labelledby="how-to-send">
        <h2 className={styles.h2} id="how-to-send">
          How to send it
        </h2>
        <ol className={styles.steps}>
          {/* Each step's words sit in one element: the list item is a grid of number and words. */}
          <li>
            <span>Write the details above in an e-mail.</span>
          </li>
          <li>
            <span>Attach your photos.</span>
          </li>
          <li>
            <span>
              Send it to <a href={MAILTO}>{ADDRESS}</a>.
            </span>
          </li>
        </ol>
        <p className={styles.text}>We&apos;ll review it for a listing on Wazwan Way.</p>
        <div className={styles.actions}>
          <a className={styles.button} href={MAILTO}>
            E-mail your details
          </a>
          <Link className={styles.buttonGhost} href="/restaurants" prefetch={false}>
            See the restaurants listed
          </Link>
        </div>
      </section>
    </div>
  );
}
