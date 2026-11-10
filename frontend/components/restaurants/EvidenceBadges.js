import { EVIDENCE } from "@/data/srinagarRestaurants";
import styles from "./restaurants.module.css";

/** How the research knows a place serves Wazwan, as small labelled pills (the text says it, not just the colour). */
export default function EvidenceBadges({ evidence }) {
  return (
    <span className={styles.badges}>
      {evidence.map((id) => (
        <span key={id} className={`${styles.badge} ${styles[`ev-${id}`]}`} title={EVIDENCE[id].description}>
          {EVIDENCE[id].label}
        </span>
      ))}
    </span>
  );
}
