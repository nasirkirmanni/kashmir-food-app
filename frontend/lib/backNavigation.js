import { CORE_SEVEN_HUB, coreSevenStory } from "../data/coreSevenSeries";

/**
 * Where the site's Back button goes (components/BackButton.js).
 *
 * With an earlier Wazwan Way page in this tab's history, Back steps to it, like the browser's own
 * button. A visitor who arrived from a search result or another site has no such page, and the
 * browser's back would take them off the site, so Back goes up a level instead: to the page above
 * this one in its breadcrumb trail.
 */

// The page above anything nested under each section.
const SECTION_PARENTS = {
  dishes: "/dishes",
  restaurants: "/restaurants",
  blog: "/blog",
  destinations: "/destinations",
  itineraries: "/itineraries",
  "scenic-drives": "/scenic-drives",
  "my-itineraries": "/profile",
  trails: "/explore",
  collections: "/explore",
};

/** The page one level up from `pathname`; null for the home page, which has nothing above it. */
export function parentPath(pathname) {
  const segments = String(pathname || "/")
    .split(/[?#]/)[0]
    .split("/")
    .filter(Boolean);
  if (segments.length === 0) return null;
  if (segments.length === 1) return "/";

  const [section, category, kind] = segments;
  if (section === "blog" && segments.length === 2 && coreSevenStory(category)) return CORE_SEVEN_HUB;
  if (section === "kashmiri-food") {
    // A guide sits in its category's guide list; the Wazwan list sits under the main Wazwan page
    // (the old Wazwan category address redirects there), the others under their category.
    if (kind === "guide" && segments.length > 3) return `/kashmiri-food/${category}/guide`;
    if (kind === "guide") return category === "wazwan" ? "/dishes" : `/kashmiri-food/${category}`;
    return "/kashmiri-food";
  }
  return SECTION_PARENTS[section] ?? "/";
}

/*
 * Browsers without the Navigation API (Safari before 26.2, older Firefox) can't be asked whether
 * the previous history entry is a Wazwan Way page, so the button keeps a trail of the site's pages
 * seen in this tab: the paths in order, which one is showing, and whether the first was itself
 * opened from a Wazwan Way page.
 */

export function startTrail(path, cameFromSite) {
  return { paths: [path], index: 0, cameFromSite: Boolean(cameFromSite) };
}

/** A new page: like browser history, it replaces any pages ahead of the current one. */
export function recordVisit(trail, path) {
  if (trail.paths[trail.index] === path) return trail;
  const paths = [...trail.paths.slice(0, trail.index + 1), path];
  return { ...trail, paths, index: paths.length - 1 };
}

/** The browser's back or forward button: find the neighbour it moved to. */
export function recordPop(trail, path) {
  const { paths, index } = trail;
  if (paths[index] === path) return trail;
  if (paths[index - 1] === path) return { ...trail, index: index - 1 };
  if (paths[index + 1] === path) return { ...trail, index: index + 1 };
  // Lost track (a jump of several pages): assume no site page behind this one.
  return startTrail(path, false);
}

/** The current page swapped for another without a new history entry. */
export function recordReplace(trail, path) {
  const paths = [...trail.paths];
  paths[trail.index] = path;
  return { ...trail, paths };
}

export function trailCanGoBack(trail) {
  return trail.index > 0 || trail.cameFromSite;
}
