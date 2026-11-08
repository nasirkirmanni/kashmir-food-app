"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { InlineBackButton } from "@/components/BackButton";
import { matchesQuery } from "@/lib/recipeSearch";
import styles from "@/app/recipes/recipes.module.css";

/**
 * The recipes page's one client island: a search box, a row of chips (one per section) and the
 * cards they filter. The index arrives built from the server; this file only narrows it. The view
 * is in the URL (?c=wazwan&q=kahwa) so a filtered page can be shared, without adding history
 * entries. The bar pins to the top of a phone screen and carries Back while it is pinned
 * (components/BackButton.js marks it data-pinned).
 */

const ALL = "all";
const SIZES = "(min-width: 1440px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw";

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function RecipeBrowser({ index }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState(ALL);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const c = params.get("c");
    const q = params.get("q");
    if (q) setQuery(q);
    else if (c && index.sections.some((s) => s.key === c)) setSection(c);
    setReady(true);
  }, [index.sections]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (section !== ALL) params.set("c", section);
    if (query.trim()) params.set("q", query.trim());
    const search = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${search ? `?${search}` : ""}`);
  }, [query, section, ready]);

  const needle = query.trim();
  const visible = useMemo(() => {
    const pool = section === ALL ? index.sections : index.sections.filter((s) => s.key === section);
    if (!needle) return pool;
    return pool
      .map((s) => ({ ...s, cards: s.cards.filter((card) => matchesQuery(card, needle)) }))
      .filter((s) => s.cards.length);
  }, [index.sections, section, needle]);

  const shown = visible.reduce((n, s) => n + s.cards.length, 0);
  const sectionTitle = index.sections.find((s) => s.key === section)?.title;
  const status = needle
    ? `${plural(shown, "recipe")} for “${needle}”${sectionTitle ? ` in ${sectionTitle}` : ""}`
    : sectionTitle
      ? `${shown} ${sectionTitle} ${shown === 1 ? "recipe" : "recipes"}`
      : plural(shown, "recipe");
  const suggestions = index.sections.flatMap((s) => s.cards).slice(0, 3);

  return (
    <>
      <div className={styles.toolbar} data-back-bar="">
        <div className={styles.container}>
          <div className={styles.toolbarRow}>
            <InlineBackButton className={styles.back} />
            <label className={styles.searchField}>
              <span className={styles.srOnly}>Search recipes</span>
              <Search className={styles.searchIcon} aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  // A search looks through every section, so a dish typed while a chip is pressed is still found.
                  setQuery(e.target.value);
                  if (e.target.value.trim()) setSection(ALL);
                }}
                placeholder={`Search ${index.count} recipes`}
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
          </div>
          <div className={styles.chips} data-h-scroll="" role="group" aria-label="Show">
            <button type="button" className={styles.chip} aria-pressed={section === ALL} onClick={() => setSection(ALL)}>
              All <span className={styles.chipCount}>{index.count}</span>
            </button>
            {index.sections.map((s) => (
              <button
                key={s.key}
                type="button"
                className={styles.chip}
                aria-pressed={section === s.key}
                onClick={() => setSection(section === s.key ? ALL : s.key)}
              >
                {s.title} <span className={styles.chipCount}>{s.cards.length}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.results}`}>
        <p className={styles.status} role="status" aria-live="polite">
          {status}
        </p>

        {shown === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>Nothing called &ldquo;{needle}&rdquo; here.</p>
            <p className={styles.emptyText}>Try another spelling, or start from one of these:</p>
            <div className={styles.emptyActions}>
              {suggestions.map((card) => (
                <button key={card.slug} type="button" className={styles.chip} onClick={() => setQuery(card.name)}>
                  {card.name}
                </button>
              ))}
              <button
                type="button"
                className={`${styles.chip} ${styles.chipStrong}`}
                onClick={() => {
                  setQuery("");
                  setSection(ALL);
                }}
              >
                Show all recipes
              </button>
            </div>
          </div>
        ) : (
          visible.map((s) => (
            <section key={s.key} className={styles.section} aria-labelledby={`recipes-${s.key}`}>
              <header className={styles.sectionHead}>
                <h2 id={`recipes-${s.key}`} className={styles.sectionTitle}>
                  {s.title}
                </h2>
                {s.note ? <p className={styles.sectionNote}>{s.note}</p> : null}
                <span className={styles.sectionCount}>{plural(s.cards.length, "recipe")}</span>
              </header>
              <ul className={styles.grid} key={`${s.key}:${needle}`}>
                {s.cards.map((card, i) => (
                  <li key={card.slug} className={styles.item} style={{ "--i": Math.min(i, 11) }}>
                    <RecipeCard card={card} />
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </>
  );
}

function RecipeCard({ card }) {
  return (
    // No prefetch: forty cards would otherwise ask the server for forty dish pages on every visit.
    <Link href={card.href} className={styles.card} prefetch={false}>
      <div className={styles.media}>
        {card.photo ? (
          <Image src={card.photo} alt="" fill sizes={SIZES} className={styles.photo} />
        ) : (
          <div className={styles.cover} aria-hidden="true">
            <span className={styles.coverName}>{card.kashmiriName || card.name}</span>
          </div>
        )}
      </div>
      <div className={styles.body}>
        <p className={styles.kicker}>
          {card.category}
          {card.essential ? <span className={styles.kickerNote}> · One of the seven</span> : null}
        </p>
        <h3 className={styles.name}>{card.name}</h3>
        {card.kashmiriName ? <p className={styles.kname}>{card.kashmiriName}</p> : null}
        {card.meta.length ? (
          <p className={styles.meta}>
            {card.meta.map(([term, value]) => (
              <span key={term} className={styles.metaItem}>
                <span className={styles.metaTerm}>{term}</span> {value}
              </span>
            ))}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
