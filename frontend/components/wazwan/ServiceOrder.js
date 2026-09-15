import Link from "next/link";
import styles from "./wazwan.module.css";

// Each step restates what the site's sourced guides say about service order.
const STEPS = [
  {
    number: "I",
    title: "The trami arrives",
    target: "the-trami",
    text: "Rice comes piled on the copper trami with the first dishes, such as seekh kebab and tabak maaz, for four diners to share.",
  },
  {
    number: "II",
    title: "The gravies follow",
    target: "the-gravies",
    text: "The wazas bring the meat courses to the trami one by one; rista, rogan josh and aab gosht are among them.",
  },
  {
    number: "III",
    title: "Gushtaba comes last",
    target: "the-last-course",
    text: "The meal always ends with gushtaba, meatballs of pounded mutton in a yoghurt gravy.",
  },
];

// A trami seen from above: the engraved rim, rice at the centre, four places around it.
function TramiFigure() {
  const seats = [0, 90, 180, 270].map((degrees) => {
    const radians = ((degrees - 90) * Math.PI) / 180;
    return { degrees, x: (120 + Math.cos(radians) * 110).toFixed(1), y: (120 + Math.sin(radians) * 110).toFixed(1) };
  });

  return (
    <figure className={styles.trami} data-reveal>
      <svg viewBox="0 0 240 240" className={styles.tramiSvg} aria-hidden="true" focusable="false">
        <circle cx="120" cy="120" r="92" className={styles.tramiRim} />
        <circle cx="120" cy="120" r="84" className={styles.tramiRimInner} />
        <circle cx="120" cy="120" r="70" className={styles.tramiEngrave} />
        <circle cx="120" cy="120" r="38" className={styles.tramiRice} />
        {seats.map((seat) => (
          <circle key={seat.degrees} cx={seat.x} cy={seat.y} r="4.5" className={styles.tramiSeat} />
        ))}
      </svg>
      <figcaption className={styles.tramiCaption}>
        <span className={styles.tramiCaptionTitle}>One trami, four diners</span>
        <span>Everyone at the trami eats from the same copper platter.</span>
      </figcaption>
    </figure>
  );
}

export default function ServiceOrder() {
  return (
    <section id="service" aria-labelledby="service-title" className={styles.service}>
      <div className={`${styles.container} ${styles.serviceGrid}`}>
        <div className={styles.serviceLead} data-reveal>
          <p className={styles.label}>How the feast is served</p>
          <h2 id="service-title" className={styles.serviceTitle}>
            The number of courses changes from feast to feast. What stays constant is the order.
          </h2>
          <TramiFigure />
        </div>

        <div className={styles.serviceSide}>
          <ol className={styles.steps}>
            {STEPS.map((step) => (
              <li key={step.number} className={styles.step} data-reveal>
                <span className={styles.stepNumber} aria-hidden="true">
                  {step.number}
                </span>
                <div>
                  <h3 className={styles.stepTitle}>
                    <a href={`#${step.target}`}>{step.title}</a>
                  </h3>
                  <p className={styles.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className={styles.stepAside} data-reveal>
            Vegetarian dishes are served <a href="#alongside" className={styles.inlineLink}>alongside</a> the meats.
          </p>
          <div className={styles.essentialsNote} data-reveal>
            <p className={`${styles.label} ${styles.essential}`}>Essential</p>
            <p className={styles.essentialsText}>
              Seven dishes are commonly listed as essential to a Wazwan: tabak maaz, rista, rogan josh, daniwal
              korma, aab gosht, marchwangan korma and gushtaba. They’re marked on this page.{" "}
              <Link href="/blog/kashmiri-cuisine-explained" className={styles.inlineLink}>
                Where that list comes from
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
