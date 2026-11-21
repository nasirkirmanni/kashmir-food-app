/**
 * The dishes that have a page but no record in the dish database: who they are, in a few fields.
 * Their pages are written in data/addedDishes.js and served by lib/addedDishes.js.
 *
 * This file is kept small on purpose. It is the only part that reaches the browser (the search box
 * and the "Dishes in this article" links read it), so nothing long belongs here.
 *
 * `name` is the dish's name in plain letters. `gloss` says what it is in English and is printed
 * under the name. `kashmiriName` is a second name the dish goes by. `also` holds other spellings
 * for the search boxes: the reference's, the Hindi name, and the spelling our own articles use.
 *
 * Categories are the catalogue's. "Street Food" holds the three kantis, which are snacks; "Bakery"
 * is the catalogue's name for breads.
 */
export const ADDED_DISH_INDEX = [
  { slug: "shabdeg", name: "Shabdeg", category: "Kashmiri Cuisine", foodType: "Non-veg", also: ["Shab deg", "Shab daig"] },
  {
    slug: "dagith-haakh",
    name: "Dagith Haakh",
    gloss: "Pounded collard greens",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Haak", "Dagith hak", "Collard greens"],
  },
  {
    slug: "tchok-wangan",
    name: "Tchok Wangan",
    gloss: "Sour aubergines",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Chok wangan", "Chok wangun", "Khatte baingan", "Brinjal"],
  },
  {
    slug: "bezze-wangan",
    name: "Bezze Wangan",
    gloss: "Roasted aubergine mash",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Baingan bharta", "Baingan ka bharta", "Brinjal"],
  },
  {
    slug: "teher",
    name: "Teher",
    gloss: "Turmeric rice with fried onions",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Téher", "Tehar", "Tehri", "Yellow rice"],
  },
  {
    slug: "nadru-kofta",
    name: "Nadru Kofta",
    kashmiriName: "Nadre Machh",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Nadre macch", "Nadru kofta handi", "Lotus stem kofta"],
  },
  {
    slug: "gaade-te-hoakh-syun",
    name: "Gaade te Hoakh Syun",
    gloss: "Fish with dried vegetables",
    category: "Kashmiri Cuisine",
    foodType: "Non-veg",
    also: ["Gaadé teh hoakh syun", "Hokh syun", "Gaad", "Kashmiri fish"],
  },
  {
    slug: "paneer-kaliya",
    name: "Paneer Kaliya",
    gloss: "Kashmiri Pandit style",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Paneer kalia", "Chaman kaliya", "Tchaman kaliya"],
  },
  {
    slug: "alle-korme",
    name: "Alle Korme",
    gloss: "Bottle gourd korma",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Allè kormè", "Alle korma", "Lauki ka korma", "Lauki korma"],
  },
  {
    slug: "tchok-mujje",
    name: "Tchok Mujje",
    gloss: "Sour radish",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Chok mujje", "Khatti mooli", "Radish curry"],
  },
  {
    slug: "tchaer-chetin",
    name: "Tchaer Chetin",
    gloss: "Raw apricot chutney",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Tchaèr chetin", "Tcaér chetin", "Apricot chutney"],
  },
  {
    slug: "garlic-scape-pickle",
    name: "Garlic Scape Pickle",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Garlic shoot pickle", "Garlic scapes", "Achaar"],
  },
  {
    slug: "demin",
    name: "Demin",
    gloss: "Fried tripe",
    category: "Kashmiri Cuisine",
    foodType: "Non-veg",
    also: ["Kashmiri fried tripe", "Tripe"],
  },
  {
    slug: "thoole-tchaman",
    name: "Thoole Tchaman",
    gloss: "Steamed eggs",
    category: "Kashmiri Cuisine",
    foodType: "Egg",
    also: ["Thoolé tchaman", "Thool chaman", "Kashmiri steamed eggs"],
  },
  {
    slug: "baegli",
    name: "Baegli",
    gloss: "Crispy fava beans",
    category: "Kashmiri Cuisine",
    foodType: "Veg",
    also: ["Baégli", "Fava beans", "Roasted fava beans"],
  },
  {
    slug: "handh-te-kokur",
    name: "Handh te Kokur",
    gloss: "Dandelion greens with chicken",
    category: "Kashmiri Cuisine",
    foodType: "Non-veg",
    also: ["Handh", "Dandelion greens", "Postpartum chicken"],
  },
  {
    slug: "kutta-hua-ghosht",
    name: "Kutta Hua Ghosht",
    gloss: "Shredded dry mutton",
    category: "Kashmiri Cuisine",
    foodType: "Non-veg",
    also: ["Kutta hua gosht", "Kuta hua gosht", "Shredded mutton"],
  },
  { slug: "chicken-kanti", name: "Chicken Kanti", category: "Street Food", foodType: "Non-veg", also: ["Kashmiri chicken kanti", "Kanthi", "Kaanthi"] },
  { slug: "mutton-kanti", name: "Mutton Kanti", category: "Street Food", foodType: "Non-veg", also: ["Mutton kanthi", "Kanthi", "Kaanthi"] },
  { slug: "kabab-kanti", name: "Kabab Kanti", category: "Street Food", foodType: "Non-veg", also: ["Kebab kanti", "Kebab kaanthi", "Kanthi"] },
  {
    slug: "tcher-tchot",
    name: "Tcher Tchot",
    gloss: "Rice-flour bread",
    category: "Bakery",
    foodType: "Veg",
    also: ["Kashmiri rice bread", "Rice bread", "Rice flour bread"],
  },
  {
    slug: "nishasta-halwa",
    name: "Nishasta Halwa",
    gloss: "Wheat starch halwa",
    category: "Desserts",
    foodType: "Veg",
    also: ["Nishasta", "Wheat starch halwa"],
  },
];

export const ADDED_DISH_SLUGS = ADDED_DISH_INDEX.map((entry) => entry.slug);

/** The index entry for a slug, or undefined. */
export const addedDishEntry = (slug) => (slug ? ADDED_DISH_INDEX.find((entry) => entry.slug === slug) : undefined);
