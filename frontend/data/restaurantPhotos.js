/**
 * Photographs on the restaurant pages (components/restaurants/Photograph.js).
 *
 * Rules (lib/restaurantPhotos.test.js checks them):
 * - A photograph is here only if we may use it: an open licence read on the file's own page (CC0,
 *   public domain, CC BY, CC BY-SA or the Pexels licence), or the written permission of the
 *   restaurant or the person who took it. Nothing is copied from Google Maps, a listing site, social
 *   media, a news site or a restaurant's own website without that permission, and none is generated.
 * - Each says what it shows (`shows`): the place itself, food served there, a street, or cooking.
 *   The caption says the same in words, with the month it was taken where that is known. Where only
 *   the month of publication is known the caption says "published".
 * - A street or cooking photograph is never put on one restaurant's page as if it showed that
 *   restaurant: RESTAURANT_PHOTOS holds only pictures of the place or of food served there.
 * - The credit carries what the licence asks for: who took it, the title it was published under,
 *   where it is published, the licence, and whether we changed it. A photograph sent by a restaurant
 *   is credited to the restaurant, with `permission` saying so in place of a licence.
 * - The file is our own copy under /images/places/, cropped or sized from the original, with a
 *   .json beside it that records where it came from. (Not /images/restaurants/: that folder is for
 *   pictures the database's records point at, and its files are listed in a generated manifest.)
 *   Licences were last read on the files' own pages on 22 November 2026.
 *
 * RESTAURANT_PHOTOS keys are profile slugs (data/srinagarRestaurants.js), plus "mughal-darbar" for the
 * page that sets the two Mughal Darbars side by side.
 */

const COMMONS = "Wikimedia Commons";
const FLICKR = "Flickr";
const PEXELS = "Pexels";

const CC_BY_2 = { name: "CC BY 2.0", url: "https://creativecommons.org/licenses/by/2.0/" };
const CC_BY_SA_2 = { name: "CC BY-SA 2.0", url: "https://creativecommons.org/licenses/by-sa/2.0/" };
const CC_BY_SA_4 = { name: "CC BY-SA 4.0", url: "https://creativecommons.org/licenses/by-sa/4.0/" };
const PEXELS_LICENCE = { name: "Pexels licence", url: "https://www.pexels.com/license/" };

// ---------------------------------------------------------------- the places themselves

const AHDOOS_STREET = {
  src: "/images/places/ahdoos-residency-road-2016.webp",
  width: 800,
  height: 450,
  alt: "Residency Road in Srinagar, in black and white, with the signboard of Ahdoo's Hotel and Restaurant on a brick building beside the road",
  caption: "Ahdoo's Hotel and Restaurant, under its signboard on Residency Road, on a morning in April 2016.",
  shows: "place",
  taken: "2016-04-23",
  credit: {
    author: "Sarkaaaar",
    title: "Hotel Residency",
    source: COMMONS,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Hotel_Residency.JPG",
    licence: CC_BY_SA_4,
    changes: "cropped and converted to black and white",
  },
};

const MUGHAL_DARBAR_BUILDING = {
  src: "/images/places/mughal-darbar-residency-road-2016.webp",
  width: 960,
  height: 540,
  alt: "A building on Residency Road in Srinagar, in black and white, with Mughal Darbar Restaurant boards along its upper floor and a Mughal Darbar sign at street level",
  caption: "Residency Road in March 2016: Mughal Darbar Restaurant boards on the upper floor, and a second Mughal Darbar sign at street level, on the right.",
  shows: "place",
  taken: "2016-03-29",
  credit: {
    author: "Sarkaaaar",
    title: "Residency Road Buildings",
    source: COMMONS,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Residency_Road_Buildings.JPG",
    licence: CC_BY_SA_4,
    changes: "cropped and converted to black and white",
  },
};

const MUGHAL_DARBAR_TRAMI = {
  src: "/images/places/mughal-darbar-wazwan-trami-2014.webp",
  width: 1200,
  height: 674,
  alt: "A metal trami of rice topped with pieces of meat, with bowls of meatballs in red gravy and in pale gravy beside it",
  caption: "A Wazwan trami photographed at Mughal Darbar, Srinagar, in July 2014. The photographer does not say which of the two restaurants it was.",
  shows: "food",
  taken: "2014-07-26",
  credit: {
    author: "Aakash Goyal",
    title: "Kashmiri Warzwan 02",
    source: COMMONS,
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Kashmiri_Warzwan_02.jpg",
    licence: CC_BY_SA_4,
  },
};

export const RESTAURANT_PHOTOS = {
  ahdoos: [AHDOOS_STREET],
  "mughal-darbar": [MUGHAL_DARBAR_BUILDING, MUGHAL_DARBAR_TRAMI],
  "mughal-darbar-upstairs": [MUGHAL_DARBAR_BUILDING],
  "mughal-darbar-ground-floor": [MUGHAL_DARBAR_BUILDING],
};

/** The photographs for a profile, or for the Mughal Darbar comparison page. */
export const photosFor = (slug) => RESTAURANT_PHOTOS[slug] || [];

/** The one that shows the place itself, for the Restaurant markup and the directory's rows. */
export const placePhotoFor = (slug) => photosFor(slug).find((photo) => photo.shows === "place");

// ---------------------------------------------------------------- streets and cooking

/**
 * Photographs of Srinagar's streets and of Wazwan being cooked, used on the directory only. None
 * shows a restaurant in the directory, and the captions say what each one is.
 */
export const SCENES = {
  // The camera's clock was never set, so the day it was taken is unknown; Pexels listed it on 14 June 2024.
  degsOnTheFire: {
    src: "/images/places/wazwan-degs-on-the-fire.webp",
    width: 2400,
    height: 1083,
    alt: "Three soot-blackened metal cooking pots, each covered with a metal plate, over a wood fire in front of a brick wall, with flames rising between them",
    caption: "Lidded degs over a wood fire in Srinagar. Photograph published in June 2024. It does not show a restaurant in this directory.",
    shows: "cooking",
    published: "2024-06-14",
    credit: {
      author: "Amjed wani",
      title: "Close-up of Pots Standing in the Fire",
      source: PEXELS,
      sourceUrl: "https://www.pexels.com/photo/close-up-of-pots-standing-in-the-fire-26244137/",
      licence: PEXELS_LICENCE,
      changes: "cropped",
    },
  },
  wazaAtTheDegs: {
    src: "/images/places/wazwan-waza-at-the-degs.webp",
    width: 2000,
    height: 1335,
    alt: "A cook in a green shalwar kameez and a dark waistcoat lifts a lid with a red cloth and stirs one of a row of steaming metal pots set over burning logs, beside a soot-blackened brick wall",
    caption: "A cook stirs degs over a wood fire in Srinagar. Photograph published in June 2024. It does not show a restaurant in this directory.",
    shows: "cooking",
    published: "2024-06-14",
    credit: {
      author: "Amjed wani",
      title: "A Man Stirring the Food in the Pots Standing on the Fire",
      source: PEXELS,
      sourceUrl: "https://www.pexels.com/photo/a-man-stirring-the-food-in-the-pots-standing-on-the-fire-26244112/",
      licence: PEXELS_LICENCE,
    },
  },
  boulevardRoad: {
    src: "/images/places/boulevard-road-dal-lake-2014.webp",
    width: 2600,
    height: 527,
    alt: "A wide view from a rooftop over a lakeside road with lamp posts and moored boats to a broad lake, with houseboats along the far shore and mountains behind",
    caption: "Boulevard Road and Dal Lake from a rooftop, May 2014.",
    shows: "street",
    taken: "2014-05-09",
    credit: {
      author: "Ankur Panchbudhe",
      title: "Srinagar - Boulevard road panorama",
      source: FLICKR,
      sourceUrl: "https://www.flickr.com/photos/ankurp/15538209519/",
      licence: CC_BY_SA_2,
      changes: "cropped",
    },
  },
  oldCity: {
    src: "/images/places/old-city-habba-kadal-2011.webp",
    width: 1920,
    height: 1200,
    alt: "An old wooden bridge on timber piers crosses a brown river, with cars and people on it. Behind it stand old brick and timber houses with tin roofs and a building with a copper-coloured dome, under an overcast sky",
    caption: "The wooden Habba Kadal bridge over the Jhelum in the old city, June 2011.",
    shows: "street",
    taken: "2011-06-01",
    credit: {
      author: "Varun Shiv Kapur",
      title: "Habba Kadal area",
      source: FLICKR,
      sourceUrl: "https://www.flickr.com/photos/72155957@N00/6133991724/",
      licence: CC_BY_2,
      changes: "cropped",
    },
  },
};

/** Every photograph the restaurant pages can show, once each. */
export const ALL_PHOTOS = [...new Set([...Object.values(RESTAURANT_PHOTOS).flat(), ...Object.values(SCENES)])];
