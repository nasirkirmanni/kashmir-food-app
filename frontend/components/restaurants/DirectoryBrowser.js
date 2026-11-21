"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { InlineBackButton } from "@/components/BackButton";
import Photograph from "./Photograph";
import PlaceRow from "./PlaceRow";
import styles from "./restaurants.module.css";
import { DIRECTORY_SORTS, EMPTY_FILTERS, filterCards, filtersToSearch, hasFilters, inPlace, searchToFilters, sortCards } from "@/lib/directorySearch";

/**
 * The directory's one client island: the finder (search, the street index, filters, sorting) and the
 * list it narrows. Every place is in the server HTML, so the list is complete without JavaScript;
 * this only hides, reorders and marks the street on screen. Putting the cursor in the search field
 * offers a few searches to try (dishes the sources name most, and "trami"). The view is kept in the URL
 * (?q=rista&format=trami&area=Wazpora) so a filtered list can be shared, without adding history
 * entries. The finder pins to the top of the screen and, on phones, carries Back while pinned
 * (components/BackButton.js marks it data-pinned). It imports nothing from the research file: the
 * cards, the street photographs and the chapter openings arrive as props.
 */

const ALL = "all";

// A link within the page is a plain anchor, so the browser announces the move and a folded section
// it points at can open (OpenOnArrival.js); a link to another page goes through the router.
function Jump({ href, className, children }) {
  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} prefetch={false} className={className}>
      {children}
    </Link>
  );
}
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

function Rows({ cards, evidence, className = "", heading = "h3" }) {
  return (
    <ul className={[styles.rows, className].filter(Boolean).join(" ")}>
      {cards.map((card) => (
        <PlaceRow key={card.slug} card={card} evidence={evidence} heading={heading} />
      ))}
    </ul>
  );
}

// Each street is laid out its own way: the road with two signboards to show, the road beside the
// lake under its panorama, the old city beside its bridge, and the long tail set tight, two abreast.
function StreetBody({ street, cards, evidence, photos, compareHref, wazporaHref }) {
  if (street.id === "residency-road") {
    return (
      <div className={styles.chapterBody}>
        <div className={styles.diptych}>
          <Photograph photo={photos.ahdoos} frameClassName={styles.pairFrame} sizes="(min-width: 1080px) 440px, (min-width: 720px) 50vw, 100vw" />
          <Photograph photo={photos.mughalDarbar} frameClassName={styles.pairFrame} sizes="(min-width: 1080px) 440px, (min-width: 720px) 50vw, 100vw" />
          <p className={styles.note} id="two-mughal-darbars">
            <b>Two Mughal Darbars.</b> One is upstairs and the other on the ground floor near the GPO. They share no phone number or
            website.{" "}
            <Link href={compareHref} prefetch={false} className={styles.link}>
              Compare the two
            </Link>
          </p>
        </div>
        <Rows cards={cards} evidence={evidence} />
      </div>
    );
  }
  if (street.id === "boulevard-road") {
    return (
      <div className={styles.chapterBody}>
        <Photograph photo={photos.boulevardRoad} frameClassName={styles.wideFrame} sizes="(min-width: 1400px) 1280px, 100vw" />
        <Rows cards={cards} evidence={evidence} className={styles.rowsTwo} />
      </div>
    );
  }
  if (street.id === "old-city") {
    return (
      <div className={`${styles.chapterBody} ${styles.chapterSplitReverse}`}>
        <div className={styles.chapterAside}>
          <Photograph photo={photos.oldCity} frameClassName={styles.tallFrame} sizes="(min-width: 1080px) 500px, 100vw" />
          <p className={styles.note}>
            <b>Wazpora.</b> The quarter of the waza cooks, and what the press has written about it.{" "}
            <Jump href={wazporaHref} className={styles.link}>
              Read the note
            </Jump>
          </p>
        </div>
        <Rows cards={cards} evidence={evidence} className={styles.rowsNarrow} />
      </div>
    );
  }
  return <Rows cards={cards} evidence={evidence} className={styles.rowsCompact} />;
}

export default function DirectoryBrowser({
  cards,
  streets,
  photos,
  types,
  formats,
  areas,
  evidence,
  suggestions = [],
  legendHref = "#how-we-know",
  wazporaHref = "#wazpora",
  compareHref = "/restaurants/mughal-darbar",
}) {
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sort, setSort] = useState("street");
  const [panelOpen, setPanelOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [onScreen, setOnScreen] = useState(null);
  const [hinting, setHinting] = useState(false);
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const indexRef = useRef(null);
  const fieldRef = useRef(null);
  const pendingStreet = useRef(null);

  const allowed = useMemo(
    () => ({ formats: formats.map((format) => format.id), types: types.map((type) => type.id), areas: areas.map((area) => area.name) }),
    [formats, types, areas]
  );

  // The view the address asks for, once, after the server's full list has been shown.
  useEffect(() => {
    const view = searchToFilters(window.location.search, allowed);
    setFilters(view.filters);
    setSort(view.sort);
    if (view.filters.formats.length || view.filters.type !== ALL || view.filters.area !== ALL || view.filters.strong) setPanelOpen(true);
    setReady(true);
  }, [allowed]);

  useEffect(() => {
    if (!ready) return;
    const search = filtersToSearch(filters, sort);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`);
  }, [filters, sort, ready]);

  const set = (patch) => setFilters((current) => ({ ...current, ...patch }));
  const toggleFormat = (id) =>
    setFilters((current) => ({
      ...current,
      formats: current.formats.includes(id) ? current.formats.filter((other) => other !== id) : [...current.formats, id],
    }));
  const reset = () => {
    setFilters(EMPTY_FILTERS);
    setSort("street");
  };

  const filtered = hasFilters(filters);
  const visible = useMemo(() => sortCards(filterCards(cards, filters), sort), [cards, filters, sort]);
  const byStreet = useMemo(() => {
    const map = new Map(streets.map((street) => [street.id, []]));
    for (const card of visible) map.get(card.street)?.push(card);
    return map;
  }, [visible, streets]);
  const formatCounts = useMemo(
    () => Object.fromEntries(formats.map((format) => [format.id, cards.filter((card) => card.formats.some((f) => f.id === format.id)).length])),
    [cards, formats]
  );

  const grouped = sort === "street";
  const viewKey = `${sort}|${filtersToSearch(filters, "street")}`;
  const panelFilters = filters.formats.length + (filters.type !== ALL) + (filters.area !== ALL) + (filters.strong ? 1 : 0);

  // "/" puts the cursor in the search field, from anywhere on the page.
  useEffect(() => {
    const onKey = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target?.isContentEditable) return;
      if (!rootRef.current || rootRef.current.offsetParent === null) return;
      event.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Photographs draw in as their street is reached. Without JavaScript, or with motion turned
  // down, they are simply there.
  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || typeof IntersectionObserver === "undefined") return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    root.classList.add(styles.motion);
    const plates = [...root.querySelectorAll("[data-plate]")];
    const viewport = window.innerHeight;
    for (const plate of plates) {
      const box = plate.getBoundingClientRect();
      if (box.top < viewport && box.bottom > 0) plate.classList.add(styles.seen);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add(styles.seen);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    plates.filter((plate) => !plate.classList.contains(styles.seen)).forEach((plate) => observer.observe(plate));
    return () => observer.disconnect();
  }, [grouped, filtered]);

  // The street on screen, for the index.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !grouped || typeof IntersectionObserver === "undefined") {
      setOnScreen(null);
      return undefined;
    }
    const sections = [...root.querySelectorAll("[data-street]")];
    const inView = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target.dataset.street);
          else inView.delete(entry.target.dataset.street);
        }
        const first = sections.find((section) => inView.has(section.dataset.street));
        setOnScreen(first ? first.dataset.street : null);
      },
      { rootMargin: "-30% 0px -55% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [grouped, viewKey]);

  // On phones the index scrolls sideways: keep the marked street in view. Never moves the page.
  useEffect(() => {
    const list = indexRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const link = list.querySelector('[aria-current="true"]');
    if (!link) return;
    const within = link.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    const target = within - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, target), behavior: "auto" });
  }, [onScreen]);

  // A street chosen while the list was in another order: go back to streets, then to that street.
  useEffect(() => {
    if (!grouped || !pendingStreet.current) return;
    const target = document.getElementById(pendingStreet.current);
    pendingStreet.current = null;
    target?.scrollIntoView({ block: "start" });
  }, [grouped]);

  // Closes the filters and brings the top of the list under the finder.
  const showResults = () => {
    setPanelOpen(false);
    window.requestAnimationFrame(() => document.getElementById("directory")?.scrollIntoView({ block: "start" }));
  };

  const onStreet = (event, id, count) => {
    if (!count) {
      event.preventDefault();
      return;
    }
    if (!grouped) {
      event.preventDefault();
      pendingStreet.current = id;
      setSort("street");
    }
  };

  const total = cards.length;
  const query = filters.query.trim();

  return (
    <div ref={rootRef}>
      <div className={styles.finder} data-back-bar="">
        <div className={`${styles.container} ${styles.finderBar}`}>
          <nav aria-label="Streets">
            <ul className={styles.streetIndex} ref={indexRef} data-h-scroll="">
              {streets.map((street) => {
                const count = byStreet.get(street.id)?.length || 0;
                return (
                  <li key={street.id}>
                    <a
                      href={`#${street.id}`}
                      className={styles.streetLink}
                      aria-current={grouped && onScreen === street.id ? "true" : undefined}
                      aria-disabled={count ? undefined : "true"}
                      tabIndex={count ? undefined : -1}
                      onClick={(event) => onStreet(event, street.id, count)}
                    >
                      {street.name}
                      <span className={styles.streetCount}>
                        {count}
                        <span className={styles.srOnly}> {count === 1 ? "place" : "places"}</span>
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.finderRow}>
            <InlineBackButton className={styles.back} />
            <div
              className={styles.searchWrap}
              ref={fieldRef}
              onBlur={(event) => {
                if (!fieldRef.current?.contains(event.relatedTarget)) setHinting(false);
              }}
            >
              <label className={styles.searchField}>
                <span className={styles.srOnly}>Search the directory by name, street or dish</span>
                <Search className={styles.searchIcon} aria-hidden="true" />
                <input
                  ref={inputRef}
                  type="search"
                  value={filters.query}
                  onChange={(event) => set({ query: event.target.value })}
                  onFocus={() => setHinting(true)}
                  onClick={() => setHinting(true)}
                  onKeyDown={(event) => {
                    if (event.key === "Escape" && filters.query) {
                      event.preventDefault();
                      set({ query: "" });
                    }
                  }}
                  placeholder="Name, street or dish"
                  className={styles.searchInput}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={80}
                  enterKeyHint="search"
                  aria-keyshortcuts="/"
                />
                {filters.query ? (
                  <button
                    type="button"
                    onClick={() => {
                      set({ query: "" });
                      inputRef.current?.focus();
                    }}
                    className={styles.clear}
                    aria-label="Clear the search"
                  >
                    <X aria-hidden="true" />
                  </button>
                ) : (
                  <kbd className={styles.keyHint} aria-hidden="true">
                    /
                  </kbd>
                )}
              </label>
              {hinting && !filters.query && suggestions.length ? (
                <div className={styles.hints} role="group" aria-label="Suggested searches">
                  <span className={styles.label}>Try</span>
                  {suggestions.map((words) => (
                    <button
                      key={words}
                      type="button"
                      className={styles.hint}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        set({ query: words });
                        inputRef.current?.focus();
                      }}
                    >
                      {words}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className={styles.filtersToggle}
              aria-expanded={panelOpen}
              aria-controls="directory-filters"
              onClick={() => setPanelOpen((open) => !open)}
            >
              <SlidersHorizontal aria-hidden="true" />
              <span>Filters</span>
              {panelFilters ? (
                <span className={styles.filterCount}>
                  {panelFilters}
                  <span className={styles.srOnly}> chosen</span>
                </span>
              ) : null}
            </button>
          </div>
        </div>

        {panelOpen ? (
          <div className={styles.container}>
            <div className={styles.panel} id="directory-filters">
              <fieldset className={styles.panelGroup}>
                <legend className={styles.label}>Wazwan served as</legend>
                <div className={styles.chips}>
                  {formats.map((format) => (
                    <button
                      key={format.id}
                      type="button"
                      className={styles.chip}
                      aria-pressed={filters.formats.includes(format.id)}
                      onClick={() => toggleFormat(format.id)}
                    >
                      {format.label}
                      <span className={styles.chipCount}>{formatCounts[format.id]}</span>
                    </button>
                  ))}
                  <button type="button" className={styles.chip} aria-pressed={filters.strong} onClick={() => set({ strong: !filters.strong })}>
                    Own menu or press only
                  </button>
                </div>
              </fieldset>
              <div className={styles.fields}>
                <label className={styles.field}>
                  <span className={styles.label}>Neighbourhood</span>
                  <select className={styles.select} value={filters.area} onChange={(event) => set({ area: event.target.value })}>
                    <option value={ALL}>All neighbourhoods</option>
                    {areas.map((area) => (
                      <option key={area.name} value={area.name}>
                        {area.name} ({area.count})
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.label}>Kind of place</span>
                  <select className={styles.select} value={filters.type} onChange={(event) => set({ type: event.target.value })}>
                    <option value={ALL}>All kinds</option>
                    {types.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className={styles.panelFoot}>
                <button type="button" className={styles.button} onClick={showResults}>
                  {visible.length ? `Show ${visible.length} ${visible.length === 1 ? "place" : "places"}` : "No place matches"}
                </button>
                {panelFilters ? (
                  <button type="button" className={styles.reset} onClick={() => setFilters((current) => ({ ...EMPTY_FILTERS, query: current.query }))}>
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className={`${styles.container} ${styles.results}`} id="directory">
        <div className={styles.resultsBar}>
          <p className={styles.statusText} role="status" aria-live="polite">
            {filtered ? (
              <>
                <b>{visible.length}</b> of {total} places{query ? ` for “${query}”` : ""}
                {filters.area !== ALL ? ` ${inPlace(filters.area)}` : ""}
              </>
            ) : (
              <>
                <b>{total}</b> places.{" "}
                <Jump href={legendHref} className={styles.link}>
                  How we know each one serves Wazwan
                </Jump>
              </>
            )}
          </p>
          <div className={styles.resultsTools}>
            {filtered || !grouped ? (
              <button type="button" className={styles.reset} onClick={reset}>
                Clear all
              </button>
            ) : null}
            <label className={styles.sortField}>
              <span className={styles.label}>Order</span>
              <select className={styles.select} value={sort} onChange={(event) => setSort(event.target.value)}>
                {DIRECTORY_SORTS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div key={viewKey} className={filtered || !grouped ? styles.swap : undefined}>
          {visible.length === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{query ? `Nothing matches “${query}”.` : "No place matches these filters."}</p>
              <p className={styles.emptyText}>
                Try a street, such as Boulevard Road, a dish, such as gushtaba, or fewer filters. The directory covers Srinagar only.
              </p>
              <div className={styles.emptyActions}>
                <button type="button" className={styles.button} onClick={reset}>
                  Show all {total} places
                </button>
                {suggestions.slice(0, 3).map((words) => (
                  <button
                    key={words}
                    type="button"
                    className={styles.buttonGhost}
                    onClick={() => {
                      setFilters({ ...EMPTY_FILTERS, query: words });
                      setSort("street");
                    }}
                  >
                    {words}
                  </button>
                ))}
              </div>
            </div>
          ) : grouped ? (
            streets.map((street) => {
              const inStreet = byStreet.get(street.id) || [];
              if (!inStreet.length) return null;
              return (
                <section
                  key={street.id}
                  id={street.id}
                  data-street={street.id}
                  className={filtered ? `${styles.chapter} ${styles.chapterSlim}` : styles.chapter}
                  aria-labelledby={`${street.id}-name`}
                >
                  <div className={styles.chapterHead}>
                    <h2 className={styles.chapterName} id={`${street.id}-name`}>
                      {street.name}
                      <span className={styles.chapterCount}>
                        {inStreet.length} {inStreet.length === 1 ? "place" : "places"}
                      </span>
                    </h2>
                    {filtered ? null : <p className={styles.chapterIntro}>{street.intro}</p>}
                  </div>
                  {filtered ? (
                    <Rows cards={inStreet} evidence={evidence} />
                  ) : (
                    <StreetBody street={street} cards={inStreet} evidence={evidence} photos={photos} compareHref={compareHref} wazporaHref={wazporaHref} />
                  )}
                </section>
              );
            })
          ) : (
            <section className={`${styles.chapter} ${styles.chapterSlim}`} aria-label="Places, in the chosen order">
              <Rows cards={visible} evidence={evidence} heading="h2" />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
