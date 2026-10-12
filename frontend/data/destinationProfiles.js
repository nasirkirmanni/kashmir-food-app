/**
 * Written content for destination pages whose catalogue record holds only the seed script's
 * placeholder text, which lib/destinationContent.js strips. Without it those pages had nothing but a
 * name and a season, so they were noindexed and left out of the sitemap.
 *
 * A profile only fills fields the record leaves empty: anything written in the database later takes
 * precedence. Every statement comes from the sources listed with it, checked on 12 October 2026.
 */

// When these profiles and their sources were last checked. Shown on the destination page.
export const DESTINATION_PROFILES_CHECKED = "12 October 2026";

const wikipedia = (title) => ({
  publisher: "Wikipedia",
  title,
  url: `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_")).replace(/%2C/g, ",")}`,
});

export const DESTINATION_PROFILES = {
  achabal: {
    description:
      "A town in Anantnag district known for its Mughal garden, laid out around a spring by the empress Nur Jahan.",
    fullDescription:
      "Achabal Gardens is a small Mughal garden at the south-eastern end of the Kashmir valley, about 8 km from Anantnag. Nur Jahan laid it out in the early 17th century; Shah Jahan's daughter Jahanara remodelled it between about 1634 and 1640, and after it decayed Gulab Singh rebuilt it on a smaller scale. It is now a public garden. Its main feature is a waterfall from the spring into a pool, and local tradition holds that the spring is the river Bringhi reappearing after it vanishes into a fissure upstream.",
    attractions: ["Achabal Gardens", "The Achabal spring and its waterfall"],
    sources: [wikipedia("Achabal Gardens"), wikipedia("Achabal")],
  },
  daksum: {
    description: "A scenic stop at about 2,438 m in Anantnag district, on the road over the Sinthan pass to Kishtwar.",
    fullDescription:
      "Daksum is in the Larnoo tehsil of Anantnag district, on the Anantnag–Sinthan–Kishtwar road (NH 244), about 42 km from Anantnag and 100 km from Srinagar, on the trekking route to Kishtwar. Kokernag's springs and botanical garden are on the way, and beyond Daksum the road climbs to Sinthan Top.",
    attractions: [],
    sources: [wikipedia("Daksum")],
  },
  kokernag: {
    description: "A town in the Breng valley of Anantnag district, known for its freshwater springs, botanical garden and trout farm.",
    fullDescription:
      "Kokernag lies at about 2,000 m, some 25 km from Anantnag on NH 244. Its springs gush from the foot of a wooded hill; Wikipedia describes them as the largest freshwater springs in Kashmir, and the Ain-i-Akbari praised their water. A trout farm set up in 1984 with European Economic Community support rears rainbow and brown trout. The poet Sheikh-ul-Alam called Kokernag \"a crown of gold\".",
    attractions: ["Kokernag springs", "Kokernag botanical garden", "Kokernag trout farm"],
    sources: [wikipedia("Kokernag")],
  },
  "pari-mahal": {
    description: "A seven-terraced Mughal garden on the Zabarwan range above Srinagar, looking out over Dal Lake and the city.",
    fullDescription:
      "Dara Shikoh, the eldest son of the emperor Shah Jahan, built it in the mid-1600s on the ruins of an old Buddhist monastery, and it served as a library and a place of learning, including astrology and astronomy. It is now owned by the Government of Jammu and Kashmir. Its terraces, arched doorways and water channels look out over Dal Lake.",
    attractions: [],
    sources: [wikipedia("Pari Mahal")],
  },
  "shalimar-bagh": {
    description: "A Mughal garden on the north-east shore of Dal Lake in Srinagar, built by the emperor Jahangir in 1619.",
    fullDescription:
      "Jahangir enlarged an older garden here into a royal garden in 1619, and in 1630 Zafar Khan, Shah Jahan's governor of Kashmir, extended it. It covers about 12.4 hectares on three terraces, with fountains, a long central water channel and chinar-lined walks; a canal about 1.6 km long once linked it to the open water of Dal Lake. Jahangir and Nur Jahan used it as their summer residence and court. It is now a public park.",
    attractions: ["Diwan-e-Aam, the public audience hall on the first terrace", "Nishat Bagh, a Mughal garden on the same shore"],
    sources: [wikipedia("Shalimar Bagh, Srinagar")],
  },
  "sinthan-top": {
    description: "A mountain pass at about 3,800 m (12,500 ft) on the road between Anantnag and Kishtwar, snow-covered for most of the year.",
    fullDescription:
      "The pass is on the Anantnag–Kokernag–Kishtwar stretch of NH 244, 48 km from Kokernag and 73 km from Anantnag, and most of the area lies on the Kishtwar side. It is the only road linking Warwan and Marwah with Kishtwar town. No one lives at the top: shepherds and people working in tourism stay overnight in tents, and the nearest hotels are at Kokernag and Daksum. From the spot called \"360 Degree View\" you can see parts of both the Kashmir and Jammu divisions.",
    attractions: ["The \"360 Degree View\" point"],
    sources: [wikipedia("Sinthan Top")],
  },
  verinag: {
    description:
      "A spring in Anantnag district, regarded as the source of the Jhelum, that the emperor Jahangir enclosed in an octagonal stone basin in 1620.",
    fullDescription:
      "The spring rises at the foot of a pine-covered hill about 26 km from Anantnag. Jahangir enclosed it in an octagonal stone tank with an arcade around it, dated 1620 by an inscription in its southern wall, and his son Shah Jahan later laid out a garden in front of it with cascades and channels. The spring and its Mughal arcade are protected by the Archaeological Survey of India as a monument of national importance. On the road from Jammu, Verinag is the first sight in the valley.",
    attractions: ["Verinag spring, its octagonal tank and arcade (1620)", "The Mughal garden laid out by Shah Jahan"],
    sources: [wikipedia("Verinag")],
  },
};
