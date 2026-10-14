/**
 * Sourced notes shown on individual dish pages, under "About <dish>" on /dishes/<slug>.
 *
 * Some dishes used to have three or four pages each: the dish page, a /kashmiri-food-blogs
 * article, an older guide and a blog post, mostly unsourced and repeating one another. Those
 * pages now redirect to the dish page (seo-redirects.json), and what they had that sources
 * support is here instead. Every statement names its source, and every source is listed in
 * DISH_SOURCES with its URL; all were checked on 12 October 2026.
 *
 * The dish's history paragraph comes from the database. Where it was wrong it is corrected in
 * dishTextCorrections.json, and the sources it names are listed with the notes.
 *
 * Text is Markdown. Links to other pages on the site are site-relative. Spellings follow the
 * house style: trami, waza, vasta waza, praan, mawal, ratan jot, gushtaba, rista.
 */

// When these notes and their sources were last checked. Shown on the dish page.
export const DISH_NOTES_REVIEWED = "October 12, 2026";

export const DISH_SOURCES = {
  "wikipedia-rogan-josh": {
    publisher: "Wikipedia",
    title: "Rogan josh",
    url: "https://en.wikipedia.org/wiki/Rogan_josh",
  },
  "wikipedia-kashmiri-cuisine": {
    publisher: "Wikipedia",
    title: "Kashmiri cuisine",
    url: "https://en.wikipedia.org/wiki/Kashmiri_cuisine",
  },
  "wikipedia-wazwan": {
    publisher: "Wikipedia",
    title: "Wazwan",
    url: "https://en.wikipedia.org/wiki/Wazwan",
  },
  "wikipedia-list": {
    publisher: "Wikipedia",
    title: "List of Kashmiri dishes",
    url: "https://en.wikipedia.org/wiki/List_of_Kashmiri_dishes",
  },
  "wikipedia-tomato": {
    publisher: "Wikipedia",
    title: "Tomato",
    url: "https://en.wikipedia.org/wiki/Tomato",
  },
  "wikipedia-alkanet": {
    publisher: "Wikipedia",
    title: "Alkanna tinctoria",
    url: "https://en.wikipedia.org/wiki/Alkanna_tinctoria",
  },
  "wikipedia-kashmiri-chilli": {
    publisher: "Wikipedia",
    title: "Kashmiri red chilli",
    url: "https://en.wikipedia.org/wiki/Kashmiri_red_chilli",
  },
  jktdc: {
    publisher: "Jammu & Kashmir Tourism Development Corporation",
    title: "Cuisines of Kashmir",
    url: "https://www.jktdc.co.in/cuisines-of-kashmir.aspx",
  },
  sahapedia: {
    publisher: "Sahapedia",
    title: "Wazwan: A Culinary Legacy",
    author: "Raja Muzaffar Bhat",
    url: "https://www.sahapedia.org/wazwan-culinary-legacy",
  },
  "asia-media-centre": {
    publisher: "Asia Media Centre",
    title: "The intricacies of Kashmiri Wazwan",
    author: "Anusha Kulal",
    date: "29 May 2024",
    url: "https://www.asiamediacentre.org.nz/features/the-intricacies-of-kashmiri-wazwan",
  },
  "outlook-diplomacy": {
    publisher: "Outlook India",
    title: "Why Kashmir's Famed Wazwan Is Always On The Diplomacy Menu",
    author: "Naseer Ganai",
    date: "27 April 2022",
    url: "https://www.outlookindia.com/national/why-kashmir-s-famed-wazwan-is-always-on-the-diplomacy-menu-news-193258",
  },
  "outlook-pandit": {
    publisher: "Outlook India",
    title: "A Pandit Must Know His Meat",
    author: "Amit Bamzai",
    date: "29 May 2022",
    url: "https://www.outlookindia.com/national/a-pandit-must-know-his-meat-magazine-192403",
  },
  onmanorama: {
    publisher: "Onmanorama",
    title: "Wazwan: The royal meal of paradise",
    date: "10 November 2021",
    url: "https://www.onmanorama.com/food/features/2021/11/10/wazwan-royal-meal-of-kashmir-paradise.html",
  },
  reuters: {
    publisher: "Reuters, via Al Jazeera",
    title: "Photos: Kashmir's 600-year-old Wazwan wedding feast adapts to modern life",
    date: "30 September 2026",
    url: "https://www.aljazeera.com/gallery/2026/9/30/photos-kashmirs-600-year-old-wazwan-wedding-feast-adapts-to-modern-life",
  },
  "gulf-news": {
    publisher: "Gulf News",
    title: "Rogan Josh, Tabak Maaz, Rista, Goshtaba… royal Kashmiri wazwan, a feast for the senses",
    date: "20 January 2022",
    url: "https://gulfnews.com/food/rogan-josh-tabak-maaz-rista-goshtaba-royal-kashmiri-wazwan-a-feast-for-the-senses-1.1642605703710",
  },
  "deccan-chronicle": {
    publisher: "Deccan Chronicle",
    title: "Wazwan from the valley",
    author: "Namita Gupta",
    date: "2 June 2016",
    url: "https://www.deccanchronicle.com/lifestyle/food-and-recipes/020616/wazwan-from-the-valley.html",
  },
  "gi-1337": {
    publisher: "Intellectual Property India, Geographical Indications Registry",
    title: "Application 1337: Goshtaba (Meat Products) of Kashmir",
    url: "https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/1337",
  },
  "gi-1336": {
    publisher: "Intellectual Property India, Geographical Indications Registry",
    title: "Application 1336: Tabakmaaz (Meat Products) of Kashmir",
    url: "https://search.ipindia.gov.in/GIRPublicSearch/Application/Details/1336",
  },
  "wikipedia-tabak-maaz": {
    publisher: "Wikipedia",
    title: "Tabak maaz",
    url: "https://en.wikipedia.org/wiki/Tabak_maaz",
  },
  "wikipedia-yakhni": {
    publisher: "Wikipedia",
    title: "Yakhni",
    url: "https://en.wikipedia.org/wiki/Yahni",
  },
  "wikipedia-dum-aloo": {
    publisher: "Wikipedia",
    title: "Dum aloo",
    url: "https://en.wikipedia.org/wiki/Dum_aloo",
  },
  "scroll-tabakh-maaz": {
    publisher: "Scroll",
    title: "Tabakh Maaz (excerpted from the Roli Books cookbook Wazwaan: Traditional Kashmiri Cuisine)",
    date: "14 February 2020",
    url: "https://scroll.in/food/945552/tabakh-maaz",
  },
  "grierson-tabakh": {
    publisher: "G. A. Grierson, A Dictionary of the Kashmiri Language (Digital South Asia Library)",
    title: "tabakh, p. 962",
    url: "https://dsal.uchicago.edu/cgi-bin/app/grierson_query.py?qs=tabak&searchhws=yes",
  },
  "grierson-maz": {
    publisher: "G. A. Grierson, A Dictionary of the Kashmiri Language (Digital South Asia Library)",
    title: "māz, p. 615",
    url: "https://dsal.uchicago.edu/cgi-bin/app/grierson_query.py?qs=maz&searchhws=yes",
  },
  "kashmir-life": {
    publisher: "Kashmir Life",
    title: "Kashmir Wazwan",
    date: "21 January 2021",
    url: "https://kashmirlife.net/kashmir-wazwan-issue-42-vol-12-257951/",
  },
  "grierson-modur": {
    publisher: "G. A. Grierson, A Dictionary of the Kashmiri Language (Digital South Asia Library)",
    title: "mŏduru, p. 550",
    url: "https://dsal.uchicago.edu/cgi-bin/app/grierson_query.py?qs=modur&searchhws=yes",
  },
  "de-leij-164": {
    publisher: "De Leij: Culinary Art of Kashmir (ikashmir.net)",
    title: "Recipe no. 164, Modur Polav",
    url: "https://ikashmir.net/cookbook/recipes/164.html",
  },
  "wikipedia-pampore": {
    publisher: "Wikipedia",
    title: "Pampore",
    url: "https://en.wikipedia.org/wiki/Pampore",
  },
  "wikipedia-abgoosht": {
    publisher: "Wikipedia",
    title: "Abgoosht",
    url: "https://en.wikipedia.org/wiki/Abgoosht",
  },
  "grierson-red-pepper": {
    publisher: "G. A. Grierson, A Dictionary of the Kashmiri Language (Digital South Asia Library)",
    title: "marʦ, p. 594",
    url: "https://dsal.uchicago.edu/cgi-bin/app/grierson_query.py?qs=red%20pepper&searchhws=no",
  },
  "wikipedia-korma": {
    publisher: "Wikipedia",
    title: "Korma",
    url: "https://en.wikipedia.org/wiki/Korma",
  },
  "wikipedia-daniwal": {
    publisher: "Wikipedia",
    title: "Daniwal korme",
    url: "https://en.wikipedia.org/wiki/Daniwal_korme",
  },
};

const link = (id, label) => `[${label}](${DISH_SOURCES[id].url})`;

export const DISH_NOTES = {
  "rogan-josh": {
    sections: [
      {
        title: "Two versions",
        body: `Kashmiri Muslim and Kashmiri Pandit cooks both make rogan josh, in different ways (${link("jktdc", "JKTDC")}; ${link("wikipedia-rogan-josh", "Wikipedia")}).

- **Kashmiri Muslim, the Wazwan version.** The base is praan, a shallot grown in Kashmir, with garlic (${link("sahapedia", "Sahapedia")}). The red comes from Kashmiri chillies and mawal, dried cockscomb flowers boiled to make a red colouring (${link("wikipedia-kashmiri-cuisine", "Wikipedia")}; ${link("onmanorama", "Onmanorama")}). Azmat Ali Mir, who owns a Kashmiri restaurant in Bangalore, says mustard oil is preferred for home cooking but an authentic Wazwan can only be cooked in ghee (${link("asia-media-centre", "Asia Media Centre")}).
- **Kashmiri Pandit.** Traditionally made without onion, garlic or shallots (${link("jktdc", "JKTDC")}; ${link("wikipedia-kashmiri-cuisine", "Wikipedia")}); yogurt and asafoetida give the gravy its body (${link("wikipedia-rogan-josh", "Wikipedia")}). The red comes from Kashmiri chillies and ratan jot, the root of alkanet (${link("wikipedia-kashmiri-cuisine", "Wikipedia")}), which is fried in hot oil because its dye dissolves in oil but not in water (${link("wikipedia-alkanet", "Wikipedia")}). A Pandit writer describes a good rogan josh as cooked with little water and plenty of mustard oil (${link("outlook-pandit", "Outlook India")}). Many Pandit families now use onion and garlic in some dishes (${link("jktdc", "JKTDC")}).

The colourings aren't strictly divided between the two: Wikipedia's Wazwan article describes the red gravy of rista, a Wazwan dish, as coloured with alkanet (${link("wikipedia-wazwan", "Wikipedia")}). For the Pandit table more widely, see [Kashmiri Pandit food](/blog/kashmiri-pandit-food).`,
      },
      {
        title: "Why there's no tomato",
        body: `Rogan josh cooked in Kashmir has no tomato. Wikipedia calls tomato an incorrect substitute, used when mawal and ratan jot can't be found (${link("wikipedia-kashmiri-cuisine", "Wikipedia")}), and British Indian restaurants make the dish red with tomatoes and red peppers (${link("wikipedia-rogan-josh", "Wikipedia")}). Tomatoes only found their way into Indian curries after Europeans introduced them (${link("wikipedia-tomato", "Wikipedia")}).`,
      },
      {
        title: "How it's eaten",
        body: `With rice. In most Kashmiri cooking bread isn't part of the meal and is eaten with tea instead (${link("wikipedia-kashmiri-cuisine", "Wikipedia")}), although Outlook India notes that the mutton dishes of a Wazwan are served with rice or flat bread (${link("outlook-diplomacy", "Outlook India")}). The rice prized for Wazwan is mushk budji, a short-grain variety (${link("asia-media-centre", "Asia Media Centre")}) grown in the higher reaches of the valley, which received a GI tag in February 2022 (${link("wikipedia-kashmiri-cuisine", "Wikipedia")}).

At a Wazwan, rogan josh comes after the trami's first dishes, methi maaz and rista (${link("outlook-diplomacy", "Outlook India")}).`,
      },
      {
        title: "The cuts",
        body: `Sahapedia describes rogan josh made with pieces of about 70 to 80 g cut from the lower ribs, the lower back (*bukhtor*), the chest and the neck. They are simmered in a gravy of garlic, ginger, red chilli powder, clove, cardamom, cinnamon and praan paste, and served hot with rice (${link("sahapedia", "Sahapedia")}).`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: [
      "jktdc",
      "wikipedia-rogan-josh",
      "wikipedia-kashmiri-cuisine",
      "wikipedia-alkanet",
      "wikipedia-wazwan",
      "wikipedia-tomato",
      "sahapedia",
      "onmanorama",
      "asia-media-centre",
      "outlook-pandit",
      "outlook-diplomacy",
    ],
  },

  rista: {
    sections: [
      {
        title: "How it's made",
        body: `The meat is pounded straight after slaughter, before rigor mortis sets in, with a wooden mallet on a flat stone (${link("sahapedia", "Sahapedia")}; ${link("wikipedia-kashmiri-cuisine", "Wikipedia")}; ${link("reuters", "Reuters")}). Fresh sheep fat is worked in until the paste turns light pink, then black cardamom seeds and salt; Sahapedia lists nothing else (${link("sahapedia", "Sahapedia")}). The meat is folded as it is beaten, which works air in and keeps the balls light (${link("wikipedia-kashmiri-cuisine", "Wikipedia")}).

Sahapedia describes the balls being boiled in water until soft and expanded before they go into the gravy (${link("sahapedia", "Sahapedia")}). At weddings the meat is still pounded by hand (${link("reuters", "Reuters")}).`,
      },
      {
        title: "The gravy",
        body: `Its red comes from Kashmiri chillies, which give food a deep colour without much heat (${link("wikipedia-kashmiri-chilli", "Wikipedia")}), and from mawal, dried cockscomb flowers boiled into a red colouring (${link("wikipedia-kashmiri-cuisine", "Wikipedia")}; ${link("asia-media-centre", "Asia Media Centre")}). Wikipedia's Wazwan article says it is coloured with alkanet, ratan jot. The gravy is scented with saffron and fennel (${link("wikipedia-wazwan", "Wikipedia")}; ${link("asia-media-centre", "Asia Media Centre")}).`,
      },
      {
        title: "Rista and gushtaba",
        body: `Both are made from the same pounded mutton: gushtaba's balls are larger and rista's smaller (${link("sahapedia", "Sahapedia")}). Rista comes early, straight after the trami's first dishes (${link("outlook-diplomacy", "Outlook India")}; ${link("gulf-news", "Gulf News")}). Gushtaba, in a white yogurt gravy with mint, ends the main meal (${link("wikipedia-wazwan", "Wikipedia")}; ${link("asia-media-centre", "Asia Media Centre")}).

[Rista vs gushtaba](/kashmiri-food/wazwan/guide/rista-vs-gushtaba) compares the two side by side, and [gushtaba](/dishes/gushtaba) has its own page.`,
      },
    ],
    sources: [
      "wikipedia-wazwan",
      "wikipedia-kashmiri-cuisine",
      "wikipedia-list",
      "wikipedia-kashmiri-chilli",
      "sahapedia",
      "asia-media-centre",
      "reuters",
      "outlook-diplomacy",
      "gulf-news",
    ],
  },

  gushtaba: {
    sections: [
      {
        title: "The gravy",
        body: `Sahapedia describes gushtaba's yakhni as yogurt and mutton broth with shallots, ginger, garlic and spices such as cinnamon and cardamom, topped with cumin and dried mint (${link("sahapedia", "Sahapedia")}). Onmanorama names curd, cardamom, dry ginger and fennel (${link("onmanorama", "Onmanorama")}). Neither lists tomato or chilli, though Wikipedia's Wazwan article calls the gravy "spicy" (${link("wikipedia-wazwan", "Wikipedia")}).

The meatballs are boiled in water until soft and expanded, then cooked in the yakhni (${link("sahapedia", "Sahapedia")}).`,
      },
      {
        title: "Its place in the feast",
        body: `Gushtaba ends the main meal: "As a rule, the meal must end with gushtaba" (${link("asia-media-centre", "Asia Media Centre")}). Its arrival tells guests the savoury courses are over (${link("wikipedia-wazwan", "Wikipedia")}; ${link("reuters", "Reuters")}). Desserts follow (${link("wikipedia-wazwan", "Wikipedia")}), and kahwa closes the feast (${link("sahapedia", "Sahapedia")}). The sources we use record that it comes last, but not why.

Kashmiri hosts press food on their guests, and Onmanorama writes that Kashmiris consider it disrespectful to refuse a dish or an extra helping (${link("onmanorama", "Onmanorama")}). [How Wazwan is served](/kashmiri-food/wazwan/guide/how-wazwan-is-served) covers the order of the courses and the manners at the trami.`,
      },
      {
        title: "Gushtaba and rista",
        body: `Both are made from the same pounded mutton and fat: gushtaba's balls are larger, rista's smaller (${link("sahapedia", "Sahapedia")}), and rista's gravy is red where gushtaba's is white (${link("wikipedia-wazwan", "Wikipedia")}). [Rista vs gushtaba](/kashmiri-food/wazwan/guide/rista-vs-gushtaba) compares them side by side, and [rista](/dishes/rista) has its own page.`,
      },
    ],
    sources: [
      "sahapedia",
      "wikipedia-wazwan",
      "wikipedia-list",
      "deccan-chronicle",
      "reuters",
      "gi-1337",
      "asia-media-centre",
      "onmanorama",
    ],
  },

  "tabak-maaz": {
    sections: [
      {
        title: "How the wazas make it",
        body: `A waza family's published recipe boils the whole rack of ribs in water, skimming it until the water runs clear, then adds garlic and salt and boils it until the membrane between the ribs can be pierced with a thumb. Only then is the rack cut into eight rectangles, boiled again with turmeric, dry ginger, cloves, black cardamom and salt, and fried in pure ghee until reddish brown (${link("scroll-tabakh-maaz", "Scroll")}, from the Roli Books cookbook *Wazwaan*).

Sahapedia describes fatty ribs simmered in water with cardamom, cinnamon, ginger powder, garlic paste and cloves, then cut and fried in ghee until crisp and caramelised outside and succulent inside, a balance that earns a waza particular praise (${link("sahapedia", "Sahapedia")}).

Other accounts differ on the liquid. Wikipedia has the ribs simmered in milk (${link("wikipedia-tabak-maaz", "Wikipedia")}), and Onmanorama describes them cooked in ghee and then simmered in yogurt until dry (${link("onmanorama", "Onmanorama")}). Our recipe below uses milk. A Srinagar chef told Deccan Chronicle that tabak maaz is deep-fried in ghee and that the chest gives "the required softness and taste" (${link("deccan-chronicle", "Deccan Chronicle")}).`,
      },
      {
        title: "Tabak maaz and kabargah",
        body: `Kashmiri Pandits commonly call the dish kabargah (${link("wikipedia-list", "Wikipedia")}), and JKTDC lists kabargah among the delicacies of Kashmiri Pandit cooking (${link("jktdc", "JKTDC")}). Wikipedia treats the two names as one dish (${link("wikipedia-tabak-maaz", "Wikipedia")}), though its list of Kashmiri dishes notes a small difference in method: kabargah is simmered on a low heat for longer and then fried very quickly, while tabak maaz is boiled with salt and garlic and has a slightly elastic texture (${link("wikipedia-list", "Wikipedia")}). In Pandit homes that avoid onion and garlic (${link("jktdc", "JKTDC")}), the garlic is left out.

[Kabargah](/dishes/kabargah) has its own page, with a Pandit recipe.`,
      },
      {
        title: "The name",
        body: `In Kashmiri, *tabakh* is a large dish, plate or tray (${link("grierson-tabakh", "Grierson")}) and *māz* is meat (${link("grierson-maz", "Grierson")}). Kashmir Life, describing feasts in the 16th-century *Tuhfat-ul-Ahbab*, notes that food was served in a copper *tabak*, "maybe a forerunner of traem of today" (${link("kashmir-life", "Kashmir Life")}). How the dish came by its name isn't recorded.`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: [
      "wikipedia-tabak-maaz",
      "wikipedia-wazwan",
      "wikipedia-list",
      "sahapedia",
      "jktdc",
      "asia-media-centre",
      "outlook-diplomacy",
      "gulf-news",
      "scroll-tabakh-maaz",
      "onmanorama",
      "deccan-chronicle",
      "grierson-tabakh",
      "grierson-maz",
      "kashmir-life",
      "gi-1336",
    ],
  },

  kabargah: {
    sections: [
      {
        title: "Kabargah and tabak maaz",
        body: `Wikipedia treats kabargah and tabak maaz as one dish under two names (${link("wikipedia-tabak-maaz", "Wikipedia")}), and its list of Kashmiri dishes says Kashmiri Pandits commonly call it kabargah. The list notes a small difference in method: kabargah is simmered on a low heat for longer and then fried very quickly, while tabak maaz is boiled with salt and garlic and has a slightly elastic texture (${link("wikipedia-list", "Wikipedia")}). JKTDC lists kabargah among the delicacies of Kashmiri Pandit cooking (${link("jktdc", "JKTDC")}).

[Tabak maaz](/dishes/tabak-maaz) has the Wazwan version, with how the wazas make it, and [Kashmiri Pandit food](/blog/kashmiri-pandit-food) covers the Pandit table more widely.`,
      },
    ],
    sources: ["wikipedia-tabak-maaz", "wikipedia-list", "jktdc"],
  },

  yakhni: {
    sections: [
      {
        title: "What yakhni is",
        body: `In Kashmir, yakhni is a light, yogurt-based meat dish, usually mutton, flavoured with fennel, ginger and cardamom and eaten with rice (${link("wikipedia-yakhni", "Wikipedia")}). Wikipedia's list of Kashmiri dishes describes it as a mild mutton gravy without turmeric or chilli powder (${link("wikipedia-list", "Wikipedia")}), and Gulf News describes the Wazwan yakhni as mutton "stewed in curd and some delectable herbs", "sumptuous and thick" (${link("gulf-news", "Gulf News")}).

The two communities make it differently. Pandit cooks traditionally rely on asafoetida and curd rather than onion and garlic (${link("jktdc", "JKTDC")}), while the yakhni Sahapedia describes for gushtaba, a Wazwan dish, includes shallots, ginger and garlic paste (${link("sahapedia", "Sahapedia")}).`,
      },
      {
        title: "Its place in the feast",
        body: `At a Wazwan, yakhni comes late. Outlook India's account of the order runs from methi maaz, rista and rogan josh through daniwal korma, marchwangan korma and aab gosht to yakhni, "the finishing dish served in wazwan before gushtaba" (${link("outlook-diplomacy", "Outlook India")}). Gulf News also has it "towards the close" (${link("gulf-news", "Gulf News")}). [How Wazwan Is Served](/kashmiri-food/wazwan/guide/how-wazwan-is-served) covers the order of the courses.`,
      },
      {
        title: "Other yakhnis",
        body: `The same curd gravy goes into other dishes. Wikipedia's Wazwan article describes it as the gravy typically made for gushtaba, "although it is also part of other dishes" (${link("wikipedia-wazwan", "Wikipedia")}). Its list of Kashmiri dishes includes vegetable yakhnis of lotus stem (*nadir yakhean*), bottle gourd (*al yakhean*), mushrooms, bitter gourd and fried aubergine (${link("wikipedia-list", "Wikipedia")}). Sahapedia calls nadru, lotus stem, a staple of Kashmiri households and names nadru yakhni as a common way of cooking it (${link("sahapedia", "Sahapedia")}).`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: [
      "wikipedia-yakhni",
      "wikipedia-list",
      "wikipedia-wazwan",
      "kashmir-life",
      "gulf-news",
      "jktdc",
      "sahapedia",
      "outlook-diplomacy",
    ],
  },

  "dum-oluv": {
    sections: [
      {
        title: "The gravy",
        body: `The red comes from Kashmiri chilli, which colours food strongly but adds little heat (${link("wikipedia-kashmiri-chilli", "Wikipedia")}). Wikipedia's account of the Kashmiri dish makes the sauce with yogurt or khoya, often with cashew paste, and lists garlic among the spices (${link("wikipedia-dum-aloo", "Wikipedia")}); Pandit homes that avoid onion and garlic (${link("jktdc", "JKTDC")}) leave them out, and our recipe below uses asafoetida. Other versions, such as the Banarasi dum aloo, are made with tomatoes and onions (${link("wikipedia-dum-aloo", "Wikipedia")}).`,
      },
      {
        title: "The pricking",
        body: `The potatoes are pierced all over so the gravy soaks into them and they turn spongy. Wikipedia's list of Kashmiri dishes calls this "the most skilful part" and has it done after frying (${link("wikipedia-list", "Wikipedia")}). Our recipe pricks them before frying, which also stops them bursting in the hot oil.`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: [
      "wikipedia-dum-aloo",
      "wikipedia-list",
      "wikipedia-wazwan",
      "wikipedia-kashmiri-chilli",
      "jktdc",
      "asia-media-centre",
    ],
  },

  "kashmiri-pulao": {
    sections: [
      {
        title: "What goes in",
        body: `The colour and scent come from saffron. Kashmir's saffron is grown mainly around Pampore, which produces about 90% of India's crop (${link("wikipedia-pampore", "Wikipedia")}).

A published Kashmiri recipe for modur polav adds almonds, raisins, dried dates, dried coconut and melon seeds, with black and green cardamom, peppercorns, cinnamon, cassia leaves, cloves and fresh ginger, and finishes the rice with sugar candy and kewra. It allows a yellow food colour in place of saffron, and uses three parts sugar to two of rice (${link("de-leij-164", "De Leij: Culinary Art of Kashmir")}). Our recipe below follows its method with much less sugar.`,
      },
      {
        title: "Who makes it",
        body: `Modur pulav is cooked for special occasions in both Kashmiri Pandit and Kashmiri Muslim homes; our guide to [Kashmiri sweets and desserts](/blog/kashmiri-sweets-desserts) gives the sources. Kashmir's everyday rice, the base of most meals and of the Wazwan trami, is plain.`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: ["grierson-modur", "de-leij-164", "wikipedia-pampore", "wikipedia-wazwan", "onmanorama", "kashmir-life"],
  },

  "aab-gosht": {
    sections: [
      {
        title: "How it's made",
        body: `Sahapedia describes meat from the lamb's tail, shoulder or shank, boiled until tender, then cooked with shallot, garlic paste, ginger powder, fennel powder, cloves, green and black cardamom, cinnamon and salt, with full-cream dry milk added to the stock and ghee to finish (${link("sahapedia", "Sahapedia")}). Others use sheep ribs and flavour the milk with green cardamom and saffron (${link("outlook-diplomacy", "Outlook India")}; ${link("onmanorama", "Onmanorama")}), and Wikipedia's list of Kashmiri dishes describes ten litres of cow's milk reduced to one (${link("wikipedia-list", "Wikipedia")}). None of these accounts adds chilli, tomato or turmeric.`,
      },
      {
        title: "Its place in the feast",
        body: `Aab gosht comes late in a Wazwan. In Outlook India's account of the order it follows marchwangan korma and comes before yakhni and gushtaba (${link("outlook-diplomacy", "Outlook India")}); in Asia Media Centre's it follows rista, rogan josh and daniphol (${link("asia-media-centre", "Asia Media Centre")}). It is served on the trami with rice (${link("sahapedia", "Sahapedia")}).`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: ["wikipedia-list", "wikipedia-wazwan", "wikipedia-abgoosht", "sahapedia", "outlook-diplomacy", "onmanorama", "asia-media-centre"],
  },

  "marchwangan-korma": {
    sections: [
      {
        title: "The name",
        body: `In Kashmiri, *marʦ* is a red chilli, and Grierson's dictionary lists under it *-wã̄gan-āra*, "a chain or string of red chillis, dried and kept for winter use" (${link("grierson-red-pepper", "Grierson")}). *Korma*, from *qormā*, means braising: meat or vegetables braised with yogurt, water or stock (${link("wikipedia-korma", "Wikipedia")}). Lamb and chicken kormas are common in the Wazwan (${link("wikipedia-korma", "Wikipedia")}).`,
      },
      {
        title: "How hot it is",
        body: `Kashmiri chilli itself is mild, rated at 1,000–2,000 Scoville heat units and valued for the deep red colour it gives food (${link("wikipedia-kashmiri-chilli", "Wikipedia")}). Marchwangan korma uses a great deal of it and is described as hot (${link("wikipedia-list", "Wikipedia")}; ${link("outlook-diplomacy", "Outlook India")}). How hot depends on the kitchen: India's Consumer Education and Research Centre put two branded "Kashmiri chilli" powders at 48,000 and 60,000 SHU (${link("wikipedia-kashmiri-chilli", "Wikipedia")}). If you're sensitive to heat, ask before you order. [Is Kashmiri food spicy?](/blog/is-kashmiri-food-spicy) covers the rest of the menu.`,
      },
      {
        title: "Its place in the feast",
        body: `In Outlook India's account of the Wazwan's order, marchwangan korma follows rista, rogan josh and daniwal korma, and comes before aab gosht, yakhni and gushtaba. The mutton dishes are eaten with rice or flat bread (${link("outlook-diplomacy", "Outlook India")}).`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: ["wikipedia-list", "outlook-diplomacy", "wikipedia-wazwan", "grierson-red-pepper", "wikipedia-korma", "wikipedia-kashmiri-chilli"],
  },

  "daniwal-korma": {
    sections: [
      {
        title: "How it tastes and looks",
        body: `The sources agree on a yogurt gravy with plenty of fresh coriander (${link("wikipedia-daniwal", "Wikipedia")}; ${link("outlook-diplomacy", "Outlook India")}). None of them mentions chilli, and none describes the colour. Wikipedia's Wazwan article describes lamb roasted with yogurt, spices and onion purée, topped with coriander leaves (${link("wikipedia-wazwan", "Wikipedia")}).

Our recipe below keeps the gravy pale, adds the coriander twice, once to cook into the gravy and once fresh at the end, and uses black pepper for warmth; turmeric is optional.`,
      },
    ],
    // The corrected history paragraph cites these too.
    sources: ["wikipedia-daniwal", "outlook-diplomacy", "wikipedia-wazwan", "wikipedia-list"],
  },
};

/** The notes for a dish page, with its sources resolved, or null when the dish has none. */
export function dishNotesFor(slug) {
  const notes = DISH_NOTES[slug];
  if (!notes) return null;
  return {
    reviewed: DISH_NOTES_REVIEWED,
    sections: notes.sections,
    sources: notes.sources.map((id) => ({ id, ...DISH_SOURCES[id] })),
  };
}
