"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { InlineBackButton } from "@/components/BackButton";
import styles from "./restaurants.module.css";

/**
 * The directory's one client island: search, filters and the cards they narrow. Every card is in
 * the server HTML, so the list is complete without JavaScript; this only hides and reorders. The
 * view is kept in the URL (?q=rista&format=trami&area=Wazpora) so a filtered list can be shared,
 * without adding history entries. The bar pins to the top of a phone screen and carries Back while
 * pinned (components/BackButton.js marks it data-pinned).
 */

const ALL = "all";
const SORTS = [
  { id: "type", label: "Type of place" },
  { id: "reviews", label: "Most Google reviews" },
  { id: "rating", label: "Highest Google rating" },
  { id: "name", label: "Name, A to Z" },
];

const fold = (s) => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const count = (n) => n.toLocaleString("en-IN");

// Grouped by type, the group heading names the type, so the card leaves it out.
function Card({ card, evidence, nameTag: NameTag, showType }) {
  return (
    <article className={styles.card} aria-labelledby={`card-${card.slug}`}>
      <div className={styles.cardTop}>
        {showType ? <span className={styles.cardType}>{card.typeLabel}</span> : null}
        {card.status ? <span className={styles.status}>{card.status}</span> : null}
      </div>
      <div>
        <NameTag className={styles.cardName} id={`card-${card.slug}`}>
          <Link href={card.href} prefetch={false} className={styles.cardLink}>
            {card.name}
          </Link>
        </NameTag>
        <p className={styles.cardArea}>{card.area}</p>
      </div>
      <span className={styles.badges}>
        {card.evidence.map((id) => (
          <span key={id} className={`${styles.badge} ${styles[`ev-${id}`]}`} title={evidence[id].description}>
            {evidence[id].label}
          </span>
        ))}
      </span>
      <dl className={styles.cardFacts}>
        {card.formats.length ? (
          <div>
            <dt>Wazwan</dt>
            <dd>
              <ul className={styles.formats}>
                {card.formats.map((format) => (
                  <li key={format.id}>
                    <span className={styles.formatLabel}>{format.label}:</span>{" "}
                    {format.value.toLowerCase() === format.label.toLowerCase() ? "Yes" : format.value}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ) : null}
        <div>
          <dt>Dishes</dt>
          <dd>{card.dishesNamed}</dd>
        </div>
        <div>
          <dt>Price</dt>
          <dd>{card.price}</dd>
        </div>
      </dl>
      <div className={styles.cardFoot}>
        <span className={styles.rating}>
          {card.google ? (
            <>
              Google <b>{card.google.rating.toFixed(1)}</b> · {count(card.google.reviews)} reviews
            </>
          ) : (
            "No Google listing used"
          )}
        </span>
        <span className={styles.more} aria-hidden="true">
          Profile →
        </span>
      </div>
    </article>
  );
}

export default function DirectoryBrowser({ cards, types, formats, areas, evidence }) {
  const [query, setQuery] = useState("");
  const [needs, setNeeds] = useState([]);
  const [type, setType] = useState(ALL);
  const [area, setArea] = useState(ALL);
  const [strong, setStrong] = useState(false);
  const [sort, setSort] = useState("type");
  const [panelOpen, setPanelOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
    const f = (params.get("format") || "").split(",").filter((id) => formats.some((format) => format.id === id));
    if (f.length) setNeeds(f);
    const t = params.get("type");
    if (t && types.some((x) => x.id === t)) setType(t);
    const a = params.get("area");
    if (a && areas.some((x) => x.name === a)) setArea(a);
    if (params.get("strong") === "1") setStrong(true);
    const s = params.get("sort");
    if (s && SORTS.some((x) => x.id === s)) setSort(s);
    setReady(true);
  }, [areas, formats, types]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (needs.length) params.set("format", needs.join(","));
    if (type !== ALL) params.set("type", type);
    if (area !== ALL) params.set("area", area);
    if (strong) params.set("strong", "1");
    if (sort !== "type") params.set("sort", sort);
    const search = params.toString();
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }, [query, needs, type, area, strong, sort, ready]);

  const needle = fold(query);
  const visible = useMemo(() => {
    const kept = cards.filter(
      (card) =>
        (!needle || fold(card.search).includes(needle)) &&
        needs.every((id) => card.formats.some((format) => format.id === id)) &&
        (type === ALL || card.type === type) &&
        (area === ALL || card.neighbourhoods.includes(area)) &&
        (!strong || card.strong)
    );
    if (sort === "reviews") return [...kept].sort((a, b) => (b.google?.reviews || 0) - (a.google?.reviews || 0));
    if (sort === "rating")
      return [...kept].sort(
        (a, b) => (b.google?.rating || 0) - (a.google?.rating || 0) || (b.google?.reviews || 0) - (a.google?.reviews || 0)
      );
    if (sort === "name") return [...kept].sort((a, b) => a.name.localeCompare(b.name));
    return kept;
  }, [cards, needle, needs, type, area, strong, sort]);

  const panelFilters = (type !== ALL) + (area !== ALL) + (sort !== "type");
  const filtered = Boolean(needle) || needs.length > 0 || type !== ALL || area !== ALL || strong;
  const reset = () => {
    setQuery("");
    setNeeds([]);
    setType(ALL);
    setArea(ALL);
    setStrong(false);
    setSort("type");
  };
  const toggleNeed = (id) => setNeeds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));

  const status = `Showing ${visible.length} of ${cards.length} places${needle ? ` for “${query.trim()}”` : ""}${area !== ALL ? ` in ${area}` : ""}`;
  const grouped = sort === "type";

  return (
    <>
      <div className={styles.toolbar} data-back-bar="">
        <div className={styles.container}>
          <div className={styles.toolbarRow}>
            <InlineBackButton className={styles.back} />
            <label className={styles.searchField}>
              <span className={styles.srOnly}>Search restaurants</span>
              <Search className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Name, neighbourhood or dish"
                className={styles.searchInput}
                autoComplete="off"
                enterKeyHint="search"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} className={styles.clear} aria-label="Clear search">
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </label>
            <button
              type="button"
              className={styles.filtersToggle}
              aria-expanded={panelOpen}
              aria-controls="directory-filters"
              onClick={() => setPanelOpen((open) => !open)}
            >
              <SlidersHorizontal aria-hidden="true" />
              <span>Filters</span>
              {panelFilters ? <span className={styles.filterCount}>{panelFilters}</span> : null}
            </button>
          </div>

          <div className={styles.chips} data-h-scroll="" role="group" aria-label="Wazwan served as">
            {formats.map((format) => (
              <button
                key={format.id}
                type="button"
                className={styles.chip}
                aria-pressed={needs.includes(format.id)}
                onClick={() => toggleNeed(format.id)}
              >
                {format.label}
              </button>
            ))}
            <button type="button" className={styles.chip} aria-pressed={strong} onClick={() => setStrong((on) => !on)}>
              Own menu or press only
            </button>
          </div>

          {panelOpen ? (
            <div className={styles.panel} id="directory-filters">
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Neighbourhood</span>
                <select className={styles.select} value={area} onChange={(e) => setArea(e.target.value)}>
                  <option value={ALL}>All neighbourhoods</option>
                  {areas.map((a) => (
                    <option key={a.name} value={a.name}>
                      {a.name} ({a.count})
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Type of place</span>
                <select className={styles.select} value={type} onChange={(e) => setType(e.target.value)}>
                  <option value={ALL}>All types</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.fieldLabel}>Sort by</span>
                <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value)}>
                  {SORTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ) : null}
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.resultsBar}>
          <p className={styles.statusText} role="status" aria-live="polite">
            {status}
          </p>
          {filtered || sort !== "type" ? (
            <button type="button" className={styles.reset} onClick={reset}>
              Clear all
            </button>
          ) : null}
        </div>

        {visible.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No place matches these filters.</p>
            <p className={styles.emptyText}>
              Try fewer filters, or another spelling of the dish or the neighbourhood.
            </p>
            <button type="button" className={styles.reset} onClick={reset}>
              Show all {cards.length} places
            </button>
          </div>
        ) : grouped ? (
          types.map((t) => {
            const inType = visible.filter((card) => card.type === t.id);
            if (!inType.length) return null;
            return (
              <section key={t.id} aria-labelledby={`type-${t.id}`}>
                <h3 className={styles.groupTitle} id={`type-${t.id}`}>
                  {t.label}
                  <span>{inType.length}</span>
                </h3>
                <ul className={styles.grid}>
                  {inType.map((card) => (
                    <li key={card.slug}>
                      <Card card={card} evidence={evidence} nameTag="h4" showType={false} />
                    </li>
                  ))}
                </ul>
              </section>
            );
          })
        ) : (
          <ul className={styles.grid}>
            {visible.map((card) => (
              <li key={card.slug}>
                <Card card={card} evidence={evidence} nameTag="h3" showType />
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
