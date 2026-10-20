/**
 * The script of the desktop homepage's documentary: five acts that follow one Wazwan from the
 * evening the cooks arrive to the last course, then roll the credits. Kept apart from the
 * components so it can be checked. Every line follows the site's own articles, which carry the
 * sources:
 *   - the cooks, the vur and the night: /kashmiri-food/wazwan/guide/waza-meaning and
 *     /kashmiri-food/wazwan/guide/restaurant-vs-wedding-vs-home
 *   - the pounding, rista and gushtaba: /kashmiri-food/wazwan/guide/rista-vs-gushtaba and the dish
 *     notes in data/dishNotes.js
 *   - red and white: /kashmiri-food/wazwan/guide/history-of-wazwan (chilli and mawal, no tomato),
 *     the rogan josh note in data/dishNotes.js (chilli for colour more than heat, mawal as dried
 *     cockscomb) and the yakhni and gushtaba notes
 *   - the trami, its manners and the order of the courses:
 *     /kashmiri-food/wazwan/guide/how-wazwan-is-served
 * Photos are captioned with what they show, never with more than that.
 *
 * The narration comes in beats. Each has a lead, set large in the dark side of the frame, with
 * the Kashmiri word or key phrase marked in *asterisks* (set in gold italic), and usually a
 * smaller line beneath it. Leads stay short enough to sit in half the frame (the test checks).
 */

/* The desktop homepage's chapters, in order, as the chapter rail lists them. Keep in step with the
   data-ww-chapter blocks in components/HomePageClient.js (lib/homeChapters.test.js checks). */
export const HOME_CHAPTERS = [
  { n: "I", label: "The Evening Before" },
  { n: "II", label: "The Pounding" },
  { n: "III", label: "Red and White" },
  { n: "IV", label: "The Trami" },
  { n: "V", label: "The Credits" },
  { n: "VI", label: "Four Doors" },
  { n: "VII", label: "The Seasons" },
  { n: "VIII", label: "Meet Waza" },
];

/* ─── Act I — The evening before ─── */

export const ACT_EVENING = {
  title: "The evening before",
  photo: {
    src: "/images/kashmiri-food/wazwan.webp",
    alt: "Cooks tending a row of large pots over a wood fire, one ladling liquid into a pot",
    caption: "Pots over a wood fire.",
    position: "58% 50%",
  },
  beats: [
    {
      lead: "A family hires a *vasta waza* and his team.",
      text: "He is the head cook: he leads the team and watches over the pots.",
    },
    {
      lead: "The evening before the feast, they build the *vur*.",
      text: "It is a kitchen in the open, at the host's home.",
    },
    {
      lead: "The *degs* go over the fire.",
      text: "They are large copper pots, set over fires of fruit-tree wood: apple, walnut or plum.",
    },
  ],
};

/* ─── Act II — The pounding ─── */

export const ACT_POUNDING = {
  title: "The pounding",
  wide: {
    src: "/images/kashmiri-food/hero.webp",
    alt: "A row of cooks in white sitting on the ground, pounding meat on flat stones with wooden mallets",
    caption: "Wazas pounding meat on flat stones.",
    position: "12% 50%",
  },
  close: {
    src: "/redesign/img/door-feast.webp",
    alt: "A cook seated cross-legged raises a wooden mallet over a flat stone of pounded meat",
    caption: "A wooden mallet on a flat stone.",
    position: "50% 50%",
  },
  // One beat per shot: the wide shot, then the close-up.
  beats: [
    {
      lead: "The mutton is pounded *by hand*.",
      text: "It is the meat for rista and gushtaba, pounded straight after slaughter.",
    },
    {
      lead: "A wooden *mallet* and a flat *stone*.",
      text: "The meat is folded as it is beaten, to keep the balls light.",
    },
  ],
  split: {
    lead: "The same pounded meat becomes two dishes.",
    rista: {
      name: "Rista",
      text: "Small, one for each of the four, in a red gravy, early in the meal.",
      href: "/dishes/rista",
    },
    gushtaba: {
      name: "Gushtaba",
      text: "Large, one shared by the four and divided by the eldest, in a white yogurt gravy, at the end.",
      href: "/dishes/gushtaba",
    },
    guide: { href: "/kashmiri-food/wazwan/guide/rista-vs-gushtaba", label: "Rista or gushtaba?" },
  },
};

/* ─── Act III — Red and white ─── */

export const ACT_DEGS = {
  title: "Red and white",
  night: { lead: "The cooking often runs through the *night*.", text: "Or it starts before dawn." },
  watch: {
    figure: "15–20",
    line: "One vasta waza may watch over fifteen to twenty pots at once.",
  },
  degs: [
    {
      slug: "rogan-josh",
      name: "Rogan josh",
      family: "red",
      src: "/images/scroll/ROGAN.png",
      position: "50% 37%",
      alt: "Rogan josh in a deep red gravy, seen from above inside a tinned pot",
      lead: "The red comes from *chilli* and *mawal*, not tomato.",
      text: "Kashmiri chilli gives a deep colour without much heat. Mawal is dried cockscomb flower.",
    },
    {
      slug: "rista",
      name: "Rista",
      family: "red",
      src: "/images/scroll/RISTA.png",
      position: "50% 64%",
      alt: "Rista, balls of pounded meat in a red gravy, seen from above inside a tinned pot",
      lead: "Pounded mutton, in a *red* gravy.",
      text: "Small, one for each guest, early in the meal.",
    },
    {
      slug: "gushtaba",
      name: "Gushtaba",
      family: "white",
      src: "/images/scroll/GUSHTABA.png",
      position: "50% 50%",
      alt: "Pale balls of pounded meat in a golden broth, seen from above inside a tinned pot",
      lead: "The white dishes are cooked in *yogurt*.",
      text: "It is one of them, and it ends the meal.",
    },
  ],
};

/* ─── Act IV — The trami ─── */

export const ACT_TRAMI = {
  title: "The trami",
  shots: [
    {
      src: "/redesign/img/ritual-tashnaer.webp",
      alt: "Water poured from an engraved copper ewer over a guest's cupped hands, into a copper basin",
      caption: "The tash-t-naer.",
      position: "85% 50%",
      beats: [
        {
          lead: "Guests sit four to a *trami*.",
          text: "They sit cross-legged on the dastarkhwan, the cloth spread over the carpets.",
        },
        {
          lead: "First the *tash-t-naer* comes round.",
          text: "Water is poured from the ewer over each guest's hands, into the basin.",
        },
      ],
    },
    {
      src: "/redesign/img/ritual-elder.webp",
      alt: "Hands reaching in from every side of a copper trami of rice, kebabs and rista",
      caption: "Hands from every side of one trami.",
      position: "37% 55%",
      beats: [
        { lead: "The trami arrives under the *sarposh*.", text: "It is the trami's copper cover." },
        { lead: "When all four are seated, the *eldest* begins.", text: "First, the eldest says the prayer." },
      ],
    },
    {
      src: "/images/kashmiri-food/trami-wheel.webp",
      alt: "Guests seated cross-legged on a carpet, eating with their hands from a shared trami",
      caption: "Guests seated around a shared trami.",
      position: "44% 60%",
      beats: [
        {
          lead: "Two *seekh kebabs* divide the rice into quarters.",
          text: "They are laid across it: one quarter for each guest.",
        },
      ],
    },
  ],
  service: "Then the wazas bring the courses, serving each onto the rice, usually four pieces at a time.",
  courses: [
    { slug: "seekh-kebab", name: "Seekh kebab", when: "On the trami" },
    { slug: "tabak-maaz", name: "Tabak maaz", when: "On the trami" },
    { slug: "rista", name: "Rista", when: "Served in turn" },
    { slug: "rogan-josh", name: "Rogan josh", when: "Served in turn" },
    { name: "The other meat dishes", when: "Served in turn", href: "/dishes" },
    { slug: "yakhni", name: "Yakhni", when: "Near the end" },
    { slug: "gushtaba", name: "Gushtaba", when: "The last course" },
  ],
  closing: "Gushtaba closes the meal, and the eldest shares it out. Then the tash-t-naer comes round again.",
  links: [
    { href: "/kashmiri-food/wazwan/guide/how-wazwan-is-served", label: "How a Wazwan is served" },
    { href: "/dishes", label: "Every dish, in serving order" },
  ],
};

/* ─── Act V — The credits ─── */

export const ACT_CREDITS = {
  cast: [
    { role: "The head cook", name: "Vasta waza", note: "Leads the team and watches over the pots", href: "/kashmiri-food/wazwan/guide/waza-meaning" },
    { role: "The cooks", name: "Wazas", note: "Professional Wazwan cooks; the word means cook", href: "/kashmiri-food/wazwan/guide/waza-meaning" },
    { role: "The kitchen", name: "Vur", note: "Built in the open, at the host's home" },
    { role: "The pots", name: "Degs", note: "Large copper pots, over fires of fruit-tree wood" },
    { role: "The platter", name: "Trami", note: "Engraved copper, shared by four", href: "/kashmiri-food/wazwan/guide/how-wazwan-is-served" },
    { role: "Its cover", name: "Sarposh", note: "The copper lid the trami arrives under" },
    { role: "The basin and ewer", name: "Tash-t-naer", note: "Brought round before the meal, and after it" },
    { role: "The cloth", name: "Dastarkhwan", note: "Spread over the carpets, where the guests sit" },
    { role: "Early in the meal", name: "Rista", note: "Pounded mutton, in a red gravy", href: "/dishes/rista" },
    { role: "The last course", name: "Gushtaba", note: "Pounded mutton, in a white yogurt gravy", href: "/dishes/gushtaba" },
    { role: "The name", name: "Wazwan", note: "Waz, cook, and wan, usually given as shop", href: "/kashmiri-food/wazwan/guide/history-of-wazwan" },
  ],
  sourcesNote: "Every line in this film follows the site's guides, which cite their sources:",
  sources: [
    "J&K Tourism",
    "JK Arts Foundation",
    "Sahapedia",
    "Asia Media Centre",
    "Gulf News",
    "Outlook India",
    "Onmanorama",
    "Reuters",
    "Wikipedia",
    "District Budgam",
  ],
  // The rest of the Kashmiri table, from the site's own posts on each.
  beyond: [
    { name: "Saffron", note: "Picked by hand before sunrise, in late autumn, at Pampore", href: "/blog/pampore-kashmiri-saffron" },
    { name: "Ver", note: "The spice cake, sun-dried to last the winter", href: "/blog/what-is-ver-masala" },
    { name: "Nadru", note: "Lotus stem from the Dal, Anchar and Manasbal lakes", href: "/blog/nadru-lotus-stem-kashmir" },
    { name: "Girda", note: "The kandur's bread, out of the tandoor at dawn", href: "/blog/kandur-wan-breads" },
    { name: "Noon chai", note: "The pink, salted morning tea", href: "/blog/noon-chai-pink-tea-kashmir" },
    { name: "Kahwa", note: "Green tea turned gold by saffron, the wedding cup", href: "/blog/kahwa-vs-noon-chai" },
  ],
  next: [
    { href: "/kashmiri-food/wazwan/guide/how-wazwan-is-served", label: "How a Wazwan is served" },
    { href: "/how-to-experience", label: "A first-timer's guide to the feast" },
    { href: "/kashmiri-food/wazwan/guide/waza-meaning", label: "Who the wazas are" },
    { href: "/kashmiri-food/wazwan/guide/history-of-wazwan", label: "Where Wazwan comes from" },
    { href: "/dishes", label: "Every dish, in serving order" },
    { href: "/blog/core-seven", label: "Seven dishes, seven stories" },
    { href: "/restaurants/best-wazwan-srinagar", label: "Where to eat it in Srinagar" },
    { href: "/kashmiri-food", label: "All of Kashmiri food" },
  ],
};
