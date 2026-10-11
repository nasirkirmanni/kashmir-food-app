/**
 * The explanatory sections of the Traditional Wazwan page (/dishes), which is the site's main
 * page for Wazwan. Every factual statement names its source, and every source is listed in
 * WAZWAN_SOURCES with its URL; all were checked on 11 October 2026. Spellings follow one house
 * style: Wazwan, waza, vasta waza, trami, tash-t-naer, gushtaba, rista.
 *
 * Text is Markdown. Links to other pages on the site are site-relative.
 */

// When this page's text and sources were last checked. Shown on the page and used as the
// structured data's dateModified.
export const PILLAR_REVIEWED = "2026-10-11";

export const WAZWAN_IN_BRIEF = {
  definition:
    "**Wazwan** is the formal multi-course feast of Kashmir. Its dishes, mostly mutton, are cooked by professional cooks called wazas under a head cook, the vasta waza, and served on a copper trami that four guests share. It is best known from Kashmiri Muslim weddings, and it is a different thing from everyday Kashmiri home cooking.",
  facts: [
    { term: "Dishes", value: "7 to 36, depending on the occasion", source: "rather-2016" },
    { term: "Cooked by", value: "Wazas, led by a vasta waza", source: "jktdc" },
    { term: "Served", value: "Four diners to one copper trami", source: "wikipedia-wazwan" },
    { term: "Ends with", value: "Gushtaba", source: "wikipedia-wazwan" },
    { term: "Best known at", value: "Weddings", source: "sahapedia" },
    { term: "Origin", value: "Undocumented; the wazas’ own account points to Central Asia", source: "jk-arts" },
  ],
};

export const BEHIND_THE_FEAST = [
  {
    id: "the-wazas",
    kicker: "Who cooks it",
    title: "The wazas",
    body: `A Wazwan is cooked by wazas, professional cooks whom a family books for the occasion. The head cook, the **vasta waza**, supervises while his team does the heavy work ([JK Arts Foundation](https://www.jkartsfoundation.in/post/kashmiri-wazwan-celebration-of-food-culture-and-people)).

How big the team is depends on the order. In 2015 *The Tribune* reported that a wedding Wazwan takes at least six to eight wazas, and one waza said his bookings had started six months ahead ([The Tribune](https://www.tribuneindia.com/news/archive/community/wazas-get-going-as-marriage-season-arrives-in-valley-71343)). Sahapedia describes three or four wazas with assistants for 200 to 300 kg of meat ([Sahapedia](https://www.sahapedia.org/wazwan-culinary-legacy)).

The craft runs in families. Ghulam Nabi Baba, a 74-year-old waza, told Reuters in 2026 that his forefathers settled in Srinagar's old city as part of the community of cooks known as Wazpora, and that he joined his father at 15; his own son opened a restaurant instead ([Reuters via Al Jazeera](https://www.aljazeera.com/gallery/2026/9/30/photos-kashmirs-600-year-old-wazwan-wedding-feast-adapts-to-modern-life)). Recipes pass mostly by apprenticeship, though one waza family has published its recipes as a cookbook ([Roli Books](https://rolibooks.com/product/wazwaan-traditional-kashmiri-cuisine/)).`,
    more: { href: "/kashmiri-food/wazwan/guide/waza-meaning", label: "More on the wazas" },
  },
  {
    id: "origins",
    kicker: "Where it comes from",
    title: "What’s documented, and what’s told",
    body: `No document records when or how Wazwan began; the accounts that circulate rest largely on word of mouth ([JK Arts Foundation](https://www.jkartsfoundation.in/post/kashmiri-wazwan-celebration-of-food-culture-and-people)). Kashmir Life, working from medieval Persian sources, argues that it has no single starting point and took roughly its present form by the late Afghan period ([Kashmir Life](https://kashmirlife.net/kashmir-wazwan-issue-42-vol-12-257951/)).`,
    documented: [
      "Timur never entered Kashmir. In 1398 he demanded tribute from Sultan Sikandar from his camp on the Indus, and the two never met ([Wikipedia](https://en.wikipedia.org/wiki/Sikandar_Shah_Miri)).",
      "Scholars and Sufis from Isfahan, Bukhara and Balkh came to Sikandar’s court ([Wikipedia](https://en.wikipedia.org/wiki/Sikandar_Shah_Miri)).",
      "Sultan Zain-ul-Abidin spent years at Timur’s court in Samarkand. The craftsmen later accounts say he brought back were paper-makers, bookbinders, carpet weavers and saddle makers; cooks aren’t named ([Wikipedia](https://en.wikipedia.org/wiki/Zayn_al-Abidin_the_Great)).",
      "A Persian work completed in the early 17th century, the *Tuhfat-ul-Ahbab*, describes 16th-century feasts with kabab, pulao and yakhni, and cooks hired for weddings ([Kashmir Life](https://kashmirlife.net/kashmir-wazwan-issue-42-vol-12-257951/)).",
      "Governments have tried to limit the feast: in the 1960s ([Outlook India](https://www.outlookindia.com/national/why-kashmir-s-famed-wazwan-is-always-on-the-diplomacy-menu-news-193258)), and in February 2017, when an order capped weddings at seven non-vegetarian and seven vegetarian dishes plus two sweets ([Gulf News/IANS](https://gulfnews.com/world/asia/india/curbs-on-guests-dishes-at-kashmir-weddings-1.1982267)).",
    ],
    told: [
      "That cooks from Samarkand came to Kashmir in Timur’s time. J&K Tourism presents this as the wazas’ own account ([JKTDC](https://www.jktdc.co.in/cuisines-of-kashmir.aspx)).",
      "That the feast is about 600 years old ([Sahapedia](https://www.sahapedia.org/wazwan-culinary-legacy); [Reuters](https://www.aljazeera.com/gallery/2026/9/30/photos-kashmirs-600-year-old-wazwan-wedding-feast-adapts-to-modern-life)).",
    ],
    more: { href: "/kashmiri-food/wazwan/guide/history-of-wazwan", label: "The full history" },
  },
  {
    id: "how-many-dishes",
    kicker: "The size of the feast",
    title: "How many dishes",
    body: `There is no fixed number. A 2016 review in the *Journal of Ethnic Foods* puts a Wazwan at seven to 36 dishes ([Rather, Masoodi and Akhter](https://doi.org/10.1016/j.jef.2016.12.002)). Thirty-six is the traditional figure for the grandest feasts ([JKTDC](https://www.jktdc.co.in/cuisines-of-kashmir.aspx)), but most menus are smaller.

Sahapedia describes the feast growing from a seven-dish meal to 12 to 24 dishes ([Sahapedia](https://www.sahapedia.org/wazwan-culinary-legacy)), and Ghulam Nabi Baba told Reuters there were seven mutton dishes in his forefathers' time and about 20 now ([Reuters](https://www.aljazeera.com/gallery/2026/9/30/photos-kashmirs-600-year-old-wazwan-wedding-feast-adapts-to-modern-life)). A funeral Wazwan usually has at least seven dishes, a Kashmiri restaurateur told Asia Media Centre ([Asia Media Centre](https://www.asiamediacentre.org.nz/features/the-intricacies-of-kashmiri-wazwan)). Restaurants serve smaller set menus or single dishes.

The dishes on this page are the Wazwan dishes in our catalogue, in the order they're served. Seven of them are commonly listed as essential, and they're marked.`,
  },
  {
    id: "in-kashmiri-life",
    kicker: "Weddings and gatherings",
    title: "Wazwan in Kashmiri life",
    body: `Weddings are where the biggest menus are cooked. Ghulam Nabi Baba told Reuters an average wedding takes about 200 kg, and the largest he ever cooked took 4,500 kg ([Reuters](https://www.aljazeera.com/gallery/2026/9/30/photos-kashmirs-600-year-old-wazwan-wedding-feast-adapts-to-modern-life)). The cooking happens in a temporary kitchen set up at the host's home, over fires of fruit-tree wood such as apple, walnut or plum ([Sahapedia](https://www.sahapedia.org/wazwan-culinary-legacy)), and the meat is still pounded by hand ([Reuters](https://www.aljazeera.com/gallery/2026/9/30/photos-kashmirs-600-year-old-wazwan-wedding-feast-adapts-to-modern-life)).

Wazwan is cooked for other gatherings too, including funerals ([Asia Media Centre](https://www.asiamediacentre.org.nz/features/the-intricacies-of-kashmiri-wazwan)). Guests are usually given bags to take leftovers home; one restaurateur says the custom became accepted only in recent decades and was once thought shameful ([Asia Media Centre](https://www.asiamediacentre.org.nz/features/the-intricacies-of-kashmiri-wazwan)). Many people describe the shared trami as setting aside differences of status among the four who eat from it ([JK Arts Foundation](https://www.jkartsfoundation.in/post/kashmiri-wazwan-celebration-of-food-culture-and-people)).`,
  },
  {
    id: "communities",
    kicker: "Who eats it, and how it varies",
    title: "Communities and variations",
    body: `Wazwan as most people know it is a Kashmiri Muslim banquet ([JKTDC](https://www.jktdc.co.in/cuisines-of-kashmir.aspx)). Kashmiri Pandits have their own festive cooking: they eat mutton and fish but not beef ([Wikipedia](https://en.wikipedia.org/wiki/Kashmiri_Pandits)), and traditional Pandit kitchens use asafoetida rather than onion and garlic ([JKTDC](https://www.jktdc.co.in/cuisines-of-kashmir.aspx)). Our guide to [Kashmiri Pandit food](/blog/kashmiri-pandit-food) covers how it differs.

The menu also changes over time. Chicken and vegetarian dishes, mushrooms among them, have been added in recent years ([Asia Media Centre](https://www.asiamediacentre.org.nz/features/the-intricacies-of-kashmiri-wazwan)); see [vegetarian Wazwan](/kashmiri-food/wazwan/guide/vegetarian-wazwan). And Wazwan isn't the same as the everyday food of Kashmiri homes, which [Kashmiri cuisine explained](/blog/kashmiri-cuisine-explained) covers, or as Mughlai cooking ([Wazwan vs Mughlai](/kashmiri-food/wazwan/guide/wazwan-vs-mughlai)).`,
  },
  {
    id: "experience",
    kicker: "If you’re visiting",
    title: "How to experience it",
    body: `Weddings are private, so most visitors eat Wazwan in a restaurant, as a set menu or dish by dish. Our [guide to eating in Srinagar](/restaurants/best-wazwan-srinagar) lists places that serve it, the [cost guide](/kashmiri-food/wazwan/guide/cost-guide) covers prices, and [restaurant vs wedding vs home](/kashmiri-food/wazwan/guide/restaurant-vs-wedding-vs-home) explains what changes between them.

Weddings cluster in the warmer months. In 2015 *The Tribune* reported a season from mid-April to the end of October, with a break during Ramadan and generally no weddings in winter ([The Tribune](https://www.tribuneindia.com/news/archive/community/wazas-get-going-as-marriage-season-arrives-in-valley-71343)).

At the trami, wash your hands when the tash-t-naer comes round, eat from your own quarter, and expect gushtaba to close the meal; [how Wazwan is served](/kashmiri-food/wazwan/guide/how-wazwan-is-served) explains the order and the etiquette. Planning a trip around it? See the [Wazwan food trail itinerary](/itineraries/kashmir-food-trail-wazwan-itinerary).`,
  },
];

// Shown on the page as written and used for the FAQPage structured data (with links reduced to text).
export const WAZWAN_FAQ = [
  {
    question: "What does “Wazwan” mean?",
    answer:
      "*Waz* means cook, and *wan* is usually given as shop ([Budgam district administration](https://budgam.nic.in/culinary-delight/wazwan/); [Sahapedia](https://www.sahapedia.org/wazwan-culinary-legacy)), so the name points to the cooks rather than to a menu. *Outlook India* renders *wan* as “to spread”.",
  },
  {
    question: "How many dishes are in a Wazwan?",
    answer:
      "Seven to 36, according to a 2016 review in the *Journal of Ethnic Foods*. Thirty-six is the traditional figure for the grandest feasts; wedding menus today usually run to about 12 to 24 dishes (Sahapedia), and restaurants serve smaller sets.",
  },
  {
    question: "Who cooks Wazwan?",
    answer:
      "Professional cooks called wazas, led by a head cook, the vasta waza, who supervises the team. Most are based in Srinagar's old city, and the craft often passes from father to son.",
  },
  {
    question: "Which dish comes last?",
    answer:
      "Gushtaba, large balls of pounded mutton in a yogurt gravy, ends the main meal. A dessert such as phirni and a cup of kahwa usually follow.",
  },
  {
    question: "Is Wazwan always meat?",
    answer:
      "It is built mostly on mutton, with chicken, but vegetarian dishes such as dum aloo and mushrooms are served alongside, and more have been added in recent years. See [vegetarian Wazwan](/kashmiri-food/wazwan/guide/vegetarian-wazwan).",
  },
  {
    question: "Did Timur bring Wazwan to Kashmir?",
    answer:
      "That is the wazas' traditional account, but Timur never entered Kashmir: in 1398 he demanded tribute from Sultan Sikandar from a camp on the Indus. No document records how the feast began. See the [history of Wazwan](/kashmiri-food/wazwan/guide/history-of-wazwan).",
  },
  {
    question: "Does Wazwan have a GI tag?",
    answer:
      "Not as a whole. In August 2024 The Kashmir Wazwan Cooperative Limited applied for geographical indications for two dishes, Goshtaba ([application 1337](https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/1337)) and Tabakmaaz ([application 1336](https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/1336)). Both were still at pre-examination on the registry when we checked in October 2026.",
  },
  {
    question: "Can visitors eat Wazwan?",
    answer:
      "Yes. Weddings are private, but restaurants in Srinagar serve Wazwan dishes and set menus; see our [guide to eating in Srinagar](/restaurants/best-wazwan-srinagar).",
  },
];

export const WAZWAN_SOURCES = [
  {
    id: "rather-2016",
    text: "Rather, S. A., Masoodi, F. A. and Akhter, R. “Ethnic meat products of Kashmiri wazwan: a review.” *Journal of Ethnic Foods*, 2016.",
    url: "https://doi.org/10.1016/j.jef.2016.12.002",
  },
  {
    id: "jktdc",
    text: "Jammu & Kashmir Tourism Development Corporation. “Cuisines of Kashmir.”",
    url: "https://www.jktdc.co.in/cuisines-of-kashmir.aspx",
  },
  {
    id: "sahapedia",
    text: "Raja Muzaffar Bhat. “Wazwan: A Culinary Legacy.” Sahapedia.",
    url: "https://www.sahapedia.org/wazwan-culinary-legacy",
  },
  {
    id: "reuters-2026",
    text: "Reuters. “Photos: Kashmir’s 600-year-old Wazwan wedding feast adapts to modern life.” Al Jazeera, 30 September 2026.",
    url: "https://www.aljazeera.com/gallery/2026/9/30/photos-kashmirs-600-year-old-wazwan-wedding-feast-adapts-to-modern-life",
  },
  {
    id: "tribune-2015",
    text: "M Aamir Khan. “Wazas get going as marriage season arrives in Valley.” The Tribune, 24 April 2015.",
    url: "https://www.tribuneindia.com/news/archive/community/wazas-get-going-as-marriage-season-arrives-in-valley-71343",
  },
  {
    id: "jk-arts",
    text: "Arka Chakraborty. “Kashmiri Wazwan: Celebration of Food, Culture and People.” JK Arts Foundation, 13 August 2024.",
    url: "https://www.jkartsfoundation.in/post/kashmiri-wazwan-celebration-of-food-culture-and-people",
  },
  {
    id: "asia-media-centre",
    text: "Anusha Kulal. “The intricacies of Kashmiri Wazwan.” Asia Media Centre, 29 May 2024.",
    url: "https://www.asiamediacentre.org.nz/features/the-intricacies-of-kashmiri-wazwan",
  },
  {
    id: "kashmir-life",
    text: "“Kashmir Wazwan.” Kashmir Life, 21 January 2021.",
    url: "https://kashmirlife.net/kashmir-wazwan-issue-42-vol-12-257951/",
  },
  {
    id: "outlook",
    text: "Naseer Ganai. “Why Kashmir’s Famed Wazwan Is Always On The Diplomacy Menu.” Outlook India, 2022.",
    url: "https://www.outlookindia.com/national/why-kashmir-s-famed-wazwan-is-always-on-the-diplomacy-menu-news-193258",
  },
  {
    id: "gulf-news-2017",
    text: "IANS. “Curbs on guests, dishes at Kashmir weddings.” Gulf News, 21 February 2017.",
    url: "https://gulfnews.com/world/asia/india/curbs-on-guests-dishes-at-kashmir-weddings-1.1982267",
  },
  {
    id: "budgam",
    text: "District Budgam, Government of Jammu & Kashmir. “Wazwan.”",
    url: "https://budgam.nic.in/culinary-delight/wazwan/",
  },
  {
    id: "wikipedia-wazwan",
    text: "Wikipedia. “Wazwan”; “Sikandar Shah Miri”; “Zayn al-Abidin the Great”; “Kashmiri Pandits.”",
    url: "https://en.wikipedia.org/wiki/Wazwan",
  },
  {
    id: "gi-registry",
    text: "Intellectual Property India, Geographical Indications Registry. Applications 1336 (Tabakmaaz) and 1337 (Goshtaba) of Kashmir.",
    url: "https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/1337",
  },
  {
    id: "roli",
    text: "Sharief Waza, Waza Shafi and Rocky Mohan. *Wazwaan: Traditional Kashmiri Cuisine*. Roli Books, 2019.",
    url: "https://rolibooks.com/product/wazwaan-traditional-kashmiri-cuisine/",
  },
];
