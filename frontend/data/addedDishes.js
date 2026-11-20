/**
 * Dish pages written from Dr Rukhsaar Sayeed's recipes for dishes the database has no record of
 * (the owner's chosen reference, with her agreement as the owner reports it). Who each dish is —
 * its name, category and spellings — is in data/addedDishIndex.js; this file holds the page.
 *
 * Every page is taken from the written recipe under one of her videos (the YouTube description and
 * the Instagram caption carry the same text), read on 19 November 2026, and from nothing else:
 * - what the dish is, and anything said about its place in Kashmiri life, is what she says, and the
 *   page says it is her account;
 * - the ingredients, quantities and order of work are hers, in our own words, never hers;
 * - where her method leaves out an ingredient that is on her list, or names one that is not,
 *   `source.note` says what we did;
 * - sponsors, brands and health claims in her captions are left out;
 * - no cooking time, difficulty, price or rating is given, because she gives none. A serving
 *   count appears only where she states one.
 *
 * None of these dishes has a photograph yet, so their pages carry no Recipe markup
 * (components/JsonLd.js). When a dish gets a database record, delete it here and in the index.
 *
 * lib/addedDishes.js builds the record each page is rendered from; lib/addedDishes.test.js checks
 * every entry.
 */

/** The date these pages were written (UTC), shown to search engines as published and last changed. */
export const ADDED_ON = "2026-11-19";

const video = (id, title, published, publishedLabel) => ({
  title,
  url: `https://www.youtube.com/watch?v=${id}`,
  published,
  publishedLabel,
});

const TIPS = "Dr Sayeed's tips";

export const ADDED_DISH_PAGES = {
  shabdeg: {
    seoTitle: "Shabdeg: A One-Hour Recipe With Chicken",
    description:
      "Shabdeg is a Kashmiri winter dish that usually cooks overnight. Dr Rukhsaar Sayeed's home version, with country chicken and pumpkin, is made in about an hour.",
    summary:
      "Shabdeg is a traditional Kashmiri winter dish that usually cooks slowly overnight. This is the home version Dr Rukhsaar Sayeed cooked at her MasterChef audition: country chicken and fried pumpkin with dried plums, made in a pressure cooker in the one hour she was given.",
    source: {
      ...video("kT6SAmxE4ok", "Lost Kashmiri Dish- Shabdeg", "2025-12-04", "4 December 2025"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's home version of shabdeg: her ingredients, quantities and order of work, in our own words.",
      note: "Her video was made with a cookware brand, which we have left out. Her method does not say when the ginger-garlic paste, coriander powder and black pepper on her list go in; we have added the paste after the onions and the two powders with the other ground spices.",
    },
    recipe: {
      intro:
        "Dr Sayeed calls this the modern, fast version of shabdeg. The chicken is cooked under pressure with fried-onion paste and Kashmiri spices, and the fried pumpkin and dried plums go in for the last few minutes. She says any chicken can be used in place of country chicken.",
      servings: "3–4",
      ingredients: [
        "700–800 g country chicken, or any chicken",
        "3 tbsp oil",
        "1 tsp cumin seeds",
        "1 bay leaf, 3–4 cloves, 3 green cardamom pods, 1 black cardamom pod and a small stick of cinnamon",
        "2 medium onions, sliced",
        "Salt, to taste",
        "1½ tbsp ginger-garlic paste",
        "½ tsp turmeric",
        "2 tbsp Kashmiri red chilli powder",
        "1 tbsp coriander powder",
        "1 tbsp fennel powder",
        "½ tsp dry ginger powder",
        "1 tsp garam masala",
        "½ tsp black pepper",
        "½–1 tsp ver masala (Kashmiri masala paste), optional",
        "3 tbsp fried-onion paste",
        "1 cup fried pumpkin cubes",
        "10–12 dried plums (aloo bukhara)",
        "1–1½ cups water",
      ],
      instructions: [
        "Heat the oil in a pressure cooker. Add the cumin seeds and whole spices and let them give up their aroma.",
        "Add the sliced onions and salt and fry until golden brown. Stir in the ginger-garlic paste.",
        "Add the turmeric, chilli powder, coriander powder, fennel powder, dry ginger powder, garam masala and black pepper. Cook for 30–40 seconds.",
        "Add the chicken and fry until it changes colour and is coated in the spices.",
        "Stir in the ver masala, if you are using it, and the fried-onion paste.",
        "Pour in the water, close the lid and cook under pressure until the chicken is about four-fifths done: roughly 10–15 minutes, depending on the chicken.",
        "Add the fried pumpkin and the dried plums. Cover and simmer on a low heat for 5–7 minutes, then serve.",
      ],
      tipsTitle: TIPS,
      wazaTips: [
        "The ver masala is optional, but she says it does a great deal for the aroma.",
        "How long the chicken needs under pressure depends on the bird.",
      ],
    },
  },

  "dagith-haakh": {
    seoTitle: "Dagith Haakh: Kashmiri Pounded Greens Recipe",
    description:
      "Dagith haakh is Kashmiri pounded collard greens: boiled, squeezed and pounded, then cooked in mustard oil with garlic, green chillies and fried onion.",
    summary:
      "Dagith haakh is pounded haakh, Kashmiri collard greens. The leaves are boiled, squeezed dry and pounded to a coarse mash, then cooked in mustard oil with a paste of garlic and green chillies, a few ground spices and fried onion. Dr Rukhsaar Sayeed calls it a traditional Kashmiri comfort food, best eaten with steamed rice.",
    source: {
      ...video("Hea87BtellU", "Dagith Haakh", "2025-08-20", "20 August 2025"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for dagith haakh: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. She says mustard greens or spinach can be used in place of haakh.",
      ingredients: [
        "500 g fresh haakh (collard greens), or mustard greens or spinach",
        "¼ tsp baking soda",
        "Water, for boiling",
        "4–5 green chillies, or to taste",
        "6–7 cloves garlic",
        "3–4 tbsp mustard oil",
        "1 large onion, thinly sliced",
        "1 tsp cumin seeds",
        "2 dried red chillies",
        "1 tsp coriander powder",
        "½ tsp cumin powder",
        "1 tsp fennel powder",
        "½ tsp dry ginger powder",
        "Salt, to taste",
      ],
      instructions: [
        "Wash the greens well and tear them roughly. Add them to boiling water with the baking soda and cook until tender.",
        "Drain the greens, squeeze out the water and pound them to a coarse mash.",
        "Crush the green chillies and garlic to a coarse paste in a mortar.",
        "Heat the mustard oil and fry the sliced onion until golden brown. Lift it out and keep it aside.",
        "In the same oil, add the cumin seeds and dried red chillies, then the garlic and chilli paste, and fry for 1–2 minutes.",
        "Stir in the pounded greens, the salt and the coriander, cumin, fennel and ginger powders. Cook for a few minutes.",
        "Add a little water and the fried onion and cook until the oil separates. Serve hot with steamed rice.",
      ],
    },
  },

  "tchok-wangan": {
    seoTitle: "Tchok Wangan: Kashmiri Sour Aubergine Recipe",
    description:
      "Tchok wangan is Kashmiri sour aubergine: fried in mustard oil, then simmered in a hot, tangy gravy soured with lemon, tamarind or raw grape juice.",
    summary:
      "Tchok wangan, khatte baingan in Hindi, is aubergine fried in mustard oil and simmered in a sour, chilli-red gravy. Dr Rukhsaar Sayeed describes it as a classic summer dish that Kashmiri households make at least once a week.",
    source: {
      ...video("fBGrdphE_G4", "Kashmiri Khatte Baingan | Tchok Wangan", "2026-06-17", "17 June 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for tchok wangan: her ingredients, quantities and order of work, in our own words.",
      note: "Her July 2025 video gives the same recipe and asks for small aubergines. Her method does not say when the green chillies go in; we have added them with the fried aubergines.",
      also: [{ label: "Her July 2025 video of the same recipe", url: "https://www.youtube.com/watch?v=Zq9jMUF60LY" }],
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe. The sourness can come from lemon juice, tamarind pulp, vinegar or the juice of raw grapes, and she says to adjust every spice to your own taste.",
      ingredients: [
        "6–8 small aubergines (brinjal), slit into quarters",
        "4–5 tbsp mustard oil",
        "1 tbsp cumin seeds",
        "2 tbsp Kashmiri red chilli powder",
        "½ tsp turmeric",
        "½ tbsp fennel powder",
        "½ tsp dry ginger powder",
        "1 tbsp coriander powder",
        "2–3 cloves",
        "About 1 cup water",
        "6–7 green chillies",
        "1½–2 tbsp lemon juice, tamarind pulp, vinegar or raw grape juice, to taste",
        "¼ tsp garam masala",
        "Salt, to taste",
      ],
      instructions: [
        "Heat the mustard oil until it smokes, lower the flame and fry the aubergines until golden and soft. Lift them out.",
        "In another pan, heat 1–2 tbsp of the same oil. Add the cumin seeds and let them splutter.",
        "Lower the flame, add the red chilli powder and fry it for a few seconds, then pour in the water. Add the rest of the ground spices and the cloves.",
        "Add the fried aubergines and the green chillies. Cover and simmer on a low heat for 5–6 minutes, until the aubergines have taken up the gravy.",
        "Stir in the lemon juice, or whichever souring you are using, and the garam masala. Cook for 2–3 minutes.",
        "Let it rest for a while before serving.",
      ],
      tipsTitle: TIPS,
      wazaTips: ["It tastes even better the next day, she says.", "Adjust the amount of each spice to your own taste."],
      variations: [
        {
          title: "Her earlier version, with onion, garlic and sour grape juice",
          source: video("Fh6nHzswT1U", "Kashmiri Khatte Baingan / Tchok Wangan / Brinjal Recipe", "2024-08-18", "18 August 2024"),
          paragraphs: [
            "Dr Sayeed's first video of the dish is a different recipe. ½ kg of long Chinese aubergines are each cut into 4 long pieces, washed, drained and salted, then fried golden brown in 2 cups of refined or mustard oil in a deep pan and lifted out.",
            "2 cups of sliced onions are cooked in the same pan on a medium flame. A handful of garlic, 4–5 green chillies, 2 tsp red chilli powder, 1 tsp ginger powder, 1 tbsp cumin seeds, 3 tsp fennel powder, salt and some water go in and cook until the spices are done.",
            "The gravy is brought to the boil and the fried aubergines are boiled in it for 5 minutes. 1 cup of sour grape juice (or tamarind pulp, lemon or vinegar) is added, and it boils for 2 minutes more, or until the oil separates.",
          ],
        },
      ],
    },
  },

  "bezze-wangan": {
    seoTitle: "Bezze Wangan: Kashmiri Baingan Bharta Recipe",
    description:
      "Bezze wangan is Kashmiri-style baingan bharta: aubergines roasted over coals, mashed, and cooked in mustard oil with pounded garlic, chillies and coriander.",
    summary:
      "Bezze wangan is the Kashmiri way with baingan ka bharta. Aubergines are charred over live coals or a gas flame, peeled and mashed, then cooked in mustard oil with fried onion and a freshly pounded paste of garlic, green chillies and coriander. Dr Rukhsaar Sayeed gives it as her mother-in-law's recipe.",
    source: {
      ...video("CDxFoVNdi0w", "Bezze Wangan / Kashmiri Style Baingan Barta", "2025-07-30", "30 July 2025"),
      credit:
        "This recipe follows the recipe for bezze wangan that Dr Rukhsaar Sayeed gives as her mother-in-law's: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe. The two things she holds to are roasting the aubergines over coals where you can, and pounding the paste fresh in a mortar.",
      ingredients: [
        "2 large aubergines (brinjal)",
        "1 bowl cold water, for peeling",
        "6–7 cloves garlic",
        "2 green chillies, or to taste",
        "1 small bunch fresh coriander",
        "3 tbsp mustard oil, or any cooking oil",
        "1 large onion, finely sliced",
        "½ tsp cumin seeds",
        "½ tsp coriander powder",
        "¼ tsp dry ginger powder",
        "Salt, to taste",
      ],
      instructions: [
        "Roast the aubergines over live coals, or on a gas flame, turning them until the skin is charred and the flesh soft.",
        "Drop them into the cold water, peel off the burnt skin and mash the flesh with a fork.",
        "Pound the garlic, green chillies and coriander leaves coarsely in a mortar.",
        "Heat the mustard oil in a kadhai and fry the onion until golden brown. Add the cumin seeds, coriander powder, dry ginger powder and salt.",
        "Mix in the mashed aubergine and the pounded paste. Cook on a medium heat, stirring now and then, until the oil separates.",
        "Serve hot with Kashmiri roti, paratha or plain rice.",
      ],
      tipsTitle: TIPS,
      wazaTips: ["She prefers live coals to a gas flame for roasting.", "It tastes even better the next day, she says."],
    },
  },

  teher: {
    seoTitle: "Teher: Kashmiri Turmeric Rice Recipe",
    description:
      "Teher is Kashmiri turmeric rice dressed with mustard oil, cumin and fried onions, cooked and shared out on happy occasions. Dr Rukhsaar Sayeed's recipe.",
    summary:
      "Teher is rice boiled with turmeric, finished on dum, and dressed with hot mustard oil, cumin and crisp fried onions. Dr Rukhsaar Sayeed describes it as a ritual as much as a dish, cooked and given out in Kashmiri households after a happy dream, at the birth of a child, at a wedding or to mark an auspicious moment, and shared as tabarruk.",
    source: {
      ...video("J_wJQapqqgY", "Kashmiri Téher", "2026-01-05", "5 January 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for teher: her ingredients, quantities and order of work, in our own words.",
      note: "Her ingredient list says rice; her method names basmati.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe. She says teher is traditionally served plain, is often eaten by hand, and needs nothing alongside it.",
      ingredients: [
        "2 cups rice (her method uses basmati)",
        "Water, for boiling",
        "½ tsp turmeric powder",
        "Salt, to taste",
        "3–4 tbsp mustard oil",
        "2 medium onions, thinly sliced",
        "1½ tsp cumin seeds",
      ],
      instructions: [
        "Wash the rice and soak it for 20–30 minutes.",
        "Bring plenty of water to the boil in a large pot with the turmeric and salt. Add the rice and cook until it is 70–75 per cent done, with a bite still in the grain.",
        "Drain the rice completely and return it to the pot. Cover tightly and leave on a very low heat (dum) for 8–10 minutes, until it is cooked through and fluffy.",
        "Heat the mustard oil in a pan until it smokes, then lower the heat. Fry the sliced onions until deep golden and crisp.",
        "Spread the rice on a large plate. Sprinkle it with a little more salt and the cumin, pour the oil over it and top with the fried onions.",
        "Mix gently just before serving, so that every grain is coated.",
      ],
    },
  },

  "nadru-kofta": {
    seoTitle: "Nadru Kofta (Nadre Machh): Kashmiri Recipe",
    description:
      "Nadru kofta, or nadre machh, is grated lotus stem bound with gram flour, fried in mustard oil and simmered in a spiced yogurt gravy. A Kashmiri recipe.",
    summary:
      "Nadru kofta, also called nadre machh, is koftas of grated lotus stem bound with gram flour and spices, fried in mustard oil and then simmered in a tangy yogurt gravy. Dr Rukhsaar Sayeed serves it with steamed rice or plain roti.",
    source: {
      ...video("gXtt-8OMj7E", "Nadru Kofta Handi | Nadre Machh", "2024-12-07", "7 December 2024"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for nadru kofta: her ingredients, quantities and order of work, in our own words.",
      note: "Her method names ginger powder for the koftas where her list has ajwain, chilli powder, coriander powder and cumin seeds; we have followed the list. It does not say when the garam masala and dried fenugreek leaves go in; we have added them at the end.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe for soft koftas in a hot, tangy gravy. The koftas are fried first and finish cooking in the yogurt.",
      ingredients: [
        "For the koftas: 2 cups lotus stem (nadru), grated or finely minced",
        "3–4 tbsp gram flour (besan), or more",
        "2 green chillies, finely chopped",
        "½ tsp ajwain (carom seeds)",
        "1½ tbsp red chilli powder",
        "1 tbsp coriander powder",
        "1 tsp cumin seeds",
        "1 tsp fennel powder",
        "Salt, to taste",
        "Mustard oil, for frying",
        "For the gravy: 1 cup yogurt, whisked",
        "½ tsp turmeric powder",
        "1 tsp red chilli powder, or to taste",
        "1 tsp fennel powder",
        "½ tsp dry ginger powder",
        "½ tsp cumin seeds",
        "2 tbsp mustard oil",
        "2–3 cloves, 2–3 green cardamom pods and 1 bay leaf",
        "A pinch of asafoetida",
        "1½ cups water",
        "Salt, to taste",
        "1 tsp garam masala",
        "2 tbsp dried fenugreek leaves (kasuri methi)",
      ],
      instructions: [
        "Wash and peel the lotus stem. Grate or mince it finely and squeeze out the water.",
        "Mix it with the gram flour, green chillies, the kofta spices and salt until it comes together like a dough. Shape it into small oval koftas.",
        "Heat mustard oil in a deep pan until it smokes, then lower the heat. Fry the koftas until golden brown and lift them out.",
        "Whisk the yogurt with the turmeric, chilli powder, fennel powder, dry ginger powder and cumin seeds.",
        "For the gravy, heat the 2 tbsp of mustard oil until it smokes and lower the heat. Add the cloves, cardamom, bay leaf and asafoetida and fry for a few seconds.",
        "Pour in the yogurt mixture slowly, stirring all the time so that it does not curdle. Add the water and salt and simmer for 5–7 minutes.",
        "Slide in the koftas and cook on a low heat for 5–7 minutes, so that they take up the gravy. Add the garam masala and dried fenugreek leaves, turn off the heat and let it rest for a few minutes before serving.",
      ],
      tipsTitle: TIPS,
      wazaTips: [
        "Squeeze the water out of the grated lotus stem before mixing; she says more gram flour can be added.",
        "Add the yogurt slowly and keep stirring, so that it does not curdle.",
      ],
    },
  },

  "gaade-te-hoakh-syun": {
    seoTitle: "Gaade te Hoakh Syun: Kashmiri Fish Recipe",
    description:
      "Gaade te hoakh syun is Kashmiri fish with dried vegetables: fried fish layered over lotus stem with sun-dried tomatoes and aubergines, simmered until thick.",
    summary:
      "Gaade te hoakh syun is fish with dried vegetables. Pieces of fish are fried crisp in mustard oil, layered over fried lotus stem with soaked sun-dried tomatoes and aubergines and a tomato purée, and simmered with whole and ground spices until the gravy is absorbed. Dr Rukhsaar Sayeed serves the fish and the dried vegetables in two separate dishes.",
    source: {
      ...video("nYOVWR7D7CE", "Kashmiri Fish with Dried Vegetables | Gaadé teh Hoakh Syun", "2024-09-29", "29 September 2024"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for gaade te hoakh syun: her ingredients, quantities and order of work, in our own words.",
      note: "She measures the spices in spoons without saying which spoon, and calls the amounts a guide; we have kept her wording.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe, for 1 kg of fish. She gives the spice quantities as a reference and says to use them to your own taste.",
      ingredients: [
        "1 kg fish, cleaned and cut into small pieces",
        "1 tsp turmeric powder and 1 spoon salt, to marinate the fish",
        "50 g sun-dried tomatoes",
        "50 g sun-dried aubergines (brinjal)",
        "250 g lotus stem (nadru)",
        "4–5 tomatoes, puréed",
        "Mustard oil, for frying, and 1 cup of the same oil for the pot",
        "2–3 spoons salt",
        "5 spoons red chilli powder",
        "2 spoons turmeric powder",
        "2 spoons coriander powder",
        "1 tbsp cumin seeds",
        "2 black cardamom pods, 3 green cardamom pods, 1 small stick of cinnamon and 3 cloves",
        "2 spoons ginger-garlic paste",
        "2 spoons ver masala, optional",
        "Water",
      ],
      instructions: [
        "Pat the fish dry and rub it with the 1 tsp turmeric and 1 spoon of salt. Leave it for 1–2 hours.",
        "Soak the dried tomatoes and dried aubergines in warm water for 10–15 minutes.",
        "Heat mustard oil until it smokes and fry the fish until golden brown and crisp.",
        "Clean the lotus stem, cut it into small pieces and shallow-fry it until it turns light brown.",
        "In a large pot, lay the lotus stem at the bottom, then the fish, with the soaked dried vegetables and the tomato purée.",
        "Pour in water until the fish is half covered. Add the salt, ground spices, cumin, whole spices, ginger-garlic paste, the ver masala if you are using it, and 1 cup of the mustard oil the fish was fried in.",
        "Mix the spices in, cover and simmer until the gravy is absorbed and thick.",
        "Let it rest until it has cooled, then serve the fish and the dried vegetables in two separate dishes.",
      ],
    },
  },

  "paneer-kaliya": {
    seoTitle: "Paneer Kaliya: Kashmiri Pandit Recipe",
    description:
      "Paneer kaliya is a Kashmiri Pandit dish: paneer soaked in turmeric water, fried in mustard oil and simmered in a milk gravy with fennel and dry ginger.",
    summary:
      "Paneer kaliya is fried paneer in a mild milk gravy, spiced with fennel, dry ginger and turmeric. Dr Rukhsaar Sayeed calls it a household favourite and a dish that represents Kashmiri Pandit cooking. Her recipe has no onion, garlic or chilli in it.",
    tradition: "Kashmiri Pandit",
    source: {
      ...video("NWsj37JEPGA", "Kashmiri Pandith Style Paneer Kaliya", "2024-10-08", "8 October 2024"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for paneer kaliya: her ingredients, quantities and order of work, in our own words.",
      note: "Her written steps put the turmeric soak before the frying, and we have kept that order. Her method names fennel powder where her list has cumin powder, and does not say when the salt goes in; we have followed the list and salted the gravy.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe. The paneer is soaked in boiling turmeric water, and that water then goes into the gravy with the milk. She serves it with steamed rice or Kashmiri naan.",
      ingredients: [
        "250 g paneer, cubed",
        "2 cups water",
        "1 tsp turmeric powder, for the soaking water and the gravy",
        "2 tbsp mustard oil",
        "1 tsp fennel seeds",
        "2–3 green cardamom pods",
        "1 stick cinnamon",
        "2–3 cloves",
        "1 tsp dry ginger powder",
        "1 tsp cumin powder",
        "1 cup milk",
        "½ cup cream, optional",
        "Salt, to taste",
        "2 tbsp dried fenugreek leaves (kasuri methi)",
        "½ tsp garam masala",
        "Fresh coriander, to garnish (optional)",
      ],
      instructions: [
        "Bring the 2 cups of water to the boil with turmeric. Add the paneer cubes and let them soak for 10 minutes. Keep the water.",
        "Heat the mustard oil in a pan until it just begins to smoke. Fry the paneer cubes until golden and set them aside.",
        "In the same pan, fry the fennel seeds, cardamom, cinnamon and cloves for 1–2 minutes, until fragrant.",
        "Lower the heat and add turmeric, the dry ginger powder and the cumin powder, stirring quickly so that they do not burn. Pour in the turmeric water, the milk and the cream, and add salt.",
        "Add the fried paneer and simmer on a low heat for 10–12 minutes, so that it takes up the gravy. Add the dried fenugreek leaves.",
        "Sprinkle the garam masala over, stir once more and garnish with fresh coriander if you like.",
      ],
    },
  },

  "alle-korme": {
    seoTitle: "Alle Korme: Bottle Gourd Korma Recipe",
    description:
      "Alle korme is a mild bottle gourd korma: lauki softened in ghee, then cooked with a paste of fried onions and cashews, milk and cream. Serves 3–4.",
    summary:
      "Alle korme, lauki ka korma, is bottle gourd cooked slowly in ghee with a paste of fried onions and cashews, milk and a little cream. Dr Rukhsaar Sayeed calls it a mild, aromatic korma for summer that wins over people who do not care for lauki.",
    source: {
      ...video("5QMg1NRTqR0", "Allè Kormè | Lauki ka Korma", "2026-04-20", "20 April 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for alle korme: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe. The gourd is cooked in ghee until it is soft and its moisture has gone before the spices, the paste and the milk go in.",
      servings: "3–4",
      ingredients: [
        "500 g bottle gourd (lauki), peeled and cut into thin slices or strips",
        "2 tbsp ghee",
        "1 tsp salt, or to taste",
        "½ tsp turmeric powder",
        "1 tsp fennel powder",
        "½ tsp dry ginger powder",
        "1 tsp cumin powder",
        "1 tbsp coriander powder",
        "½ cup fried onions",
        "12–15 cashews",
        "1 cup milk",
        "3 tbsp fresh cream",
        "2 tbsp chopped fresh coriander",
      ],
      instructions: [
        "Heat the ghee in a pan. Add the sliced gourd and the salt and cook on a medium heat until it is soft and its moisture has dried off.",
        "Add the ground spices and mix well.",
        "Grind the fried onions and cashews to a smooth paste and add it to the pan.",
        "Pour in the milk and a little of the cream, stir and cover. Cook on a low heat until it comes together into a rich gravy.",
        "Finish with the rest of the cream, if you like, and the chopped coriander.",
      ],
    },
  },

  "tchok-mujje": {
    seoTitle: "Tchok Mujje: Kashmiri Sour Radish Recipe",
    description:
      "Tchok mujje is Kashmiri sour radish: slices of radish fried in mustard oil, then simmered with tamarind and spices until soft. Dr Rukhsaar Sayeed's recipe.",
    summary:
      "Tchok mujje, khatti mooli, is a sour radish curry: sliced radish fried golden in mustard oil and simmered in tamarind water with fennel, dry ginger and red chilli. Dr Rukhsaar Sayeed describes it as a traditional Kashmiri dish, the one to try after khatte baingan (tchok wangan), and one of the underrated Kashmiri recipes.",
    source: {
      ...video("ctw5HoyO4Ow", "Tchok Mujje | Kashmiri Khatti Mooli", "2026-04-09", "9 April 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for tchok mujje: her ingredients, quantities and order of work, in our own words.",
      note: "She gives no quantity for the whole spices or the tamarind.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. She serves it hot with rice or roti.",
      ingredients: [
        "2–3 medium radishes (mooli), peeled and sliced",
        "2–3 tbsp mustard oil",
        "1 tsp cumin seeds",
        "Whole spices, such as cloves, cinnamon and cardamom",
        "1 tsp fennel powder",
        "1 tsp dry ginger powder",
        "1 tbsp red chilli powder",
        "½ tsp turmeric powder",
        "1 tbsp coriander powder",
        "Tamarind, soaked in warm water, for its pulp",
        "Water, as needed",
        "Salt, to taste",
        "2–3 green chillies",
      ],
      instructions: [
        "Soak the tamarind in warm water and press out the pulp.",
        "Heat the mustard oil and fry the sliced radish until golden brown. Lift it out.",
        "Pour off the extra oil, leaving 1–2 tbsp in the pan. Add the cumin seeds and whole spices.",
        "Turn off the flame and add all the ground spices.",
        "Turn the flame back on and add water, the tamarind pulp and salt. Mix well.",
        "Add the fried radish and the green chillies and bring to the boil.",
        "Cover and cook until the radish is soft and the oil begins to separate.",
      ],
      tipsTitle: TIPS,
      wazaTips: ["Add the ground spices with the flame off: she says it keeps them from burning."],
    },
  },

  "tchaer-chetin": {
    seoTitle: "Tchaer Chetin: Raw Apricot Chutney Recipe",
    description:
      "Tchaer chetin is a Kashmiri chutney of raw apricots pounded with soaked dried red chillies and salt: sour, hot and coarse. Three ingredients.",
    summary:
      "Tchaer chetin is a chutney of three things: sour raw apricots, dried red chillies soaked until soft, and salt, ground together into a thick, coarse paste. Dr Rukhsaar Sayeed describes it as a bold, rustic Kashmiri chutney, sharp and hot.",
    source: {
      ...video("fD5Olo2pEb0", "Raw Apricot Chutney / Tchaèr Chetin", "2026-04-23", "23 April 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for tchaer chetin: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. The chillies are ground first, and the apricots are crushed into them only briefly.",
      ingredients: ["1 cup raw apricots, washed, stoned and sliced", "4–6 dried red chillies", "Salt, to taste", "A few drops of water, only if needed"],
      instructions: [
        "Soak the dried red chillies in warm water for 15–20 minutes, until soft.",
        "Grind them with salt to a coarse paste.",
        "Add the sliced apricots and crush again, until the chutney is slightly chunky.",
        "Add a few drops of water only if it needs them.",
      ],
      tipsTitle: TIPS,
      wazaTips: ["Keep it thick and coarse rather than smooth."],
    },
  },

  "garlic-scape-pickle": {
    seoTitle: "Kashmiri Garlic Scape Pickle Recipe",
    description:
      "A Kashmiri pickle of garlic scapes: the shoots are dried for a day or two, mixed with chilli, cumin, pickling spices and oil, and left for about two weeks.",
    summary:
      "This is a pickle of garlic scapes, the shoots of the garlic plant, mixed with salt, red chilli, cumin, a pickling masala and oil and left in a warm place for about two weeks. Dr Rukhsaar Sayeed calls it a Kashmiri favourite and her mother's recipe, and says she likes it best in summer.",
    source: {
      ...video("rJVzggiqevs", "Kashmiri Garlic Shoot Pickle", "2026-05-19", "19 May 2026"),
      credit:
        "This recipe follows the garlic scape pickle that Dr Rukhsaar Sayeed gives as her mother's: her ingredients, quantities and order of work, in our own words.",
      also: [{ label: "Her May 2025 video of the same pickle", url: "https://www.youtube.com/watch?v=kH5ByMIyNDQ" }],
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe, for 1 kg of scapes. She eats the pickle with rice or roti.",
      ingredients: [
        "1 kg garlic scapes",
        "1 cup salt",
        "1½ cups red chilli powder",
        "½ cup cumin (zeera)",
        "For the achaar masala: 4 tbsp coriander seeds",
        "3 tbsp mustard seeds",
        "1 tbsp ajwain (carom seeds)",
        "3 cups oil",
      ],
      instructions: [
        "Pick mature garlic scapes, wash them and leave them to dry for 1–2 days.",
        "Add the salt, spices and oil to the scapes and mix very well.",
        "Pack the pickle into an airtight container and close the lid tightly. Keep it in a warm place.",
        "It takes about two weeks to be ready.",
      ],
      tipsTitle: TIPS,
      wazaTips: ["How much of each spice to use is a matter of taste, she says."],
    },
  },

  demin: {
    seoTitle: "Demin: Kashmiri Fried Tripe Recipe",
    description:
      "Demin is Kashmiri fried tripe: sheep tripe cleaned, pressure-cooked with whole spices, fried in mustard oil and simmered in a light onion masala.",
    summary:
      "Demin is sheep tripe, cooked until tender, fried in mustard oil and simmered in a light onion masala made with its own stock. Dr Rukhsaar Sayeed calls it a hearty, traditional Kashmiri comfort dish in which the tripe stays the centre of the plate.",
    source: {
      ...video("bbC9SK_IeEo", "Kashmiri Fried Tripe / Demin", "2026-05-30", "30 May 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for demin: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe, for 1 kg of tripe. It is cleaned and boiled twice before it is fried, and she says her quantities are a guide to adjust to taste.",
      ingredients: [
        "1 kg sheep tripe, cleaned",
        "1 tsp turmeric, for the first boil",
        "2 bay leaves, 1 black cardamom pod, 3 green cardamom pods, a 1-inch stick of cinnamon and 4 cloves",
        "4–5 cups water, for pressure-cooking",
        "4 tbsp mustard oil",
        "2 medium onions, thinly sliced",
        "1 tbsp ginger-garlic paste",
        "1 tsp red chilli powder",
        "½ tsp turmeric powder",
        "1 tsp coriander powder",
        "1 tsp salt, or to taste",
        "1 tbsp dried fenugreek leaves (kasuri methi)",
        "1 tbsp ghee",
      ],
      instructions: [
        "Soak the tripe in hot water for 5–6 minutes. Pull off the outer layer and wash the tripe thoroughly.",
        "Boil it in water with the 1 tsp of turmeric for 5–10 minutes. Throw the water away and rinse the tripe again.",
        "Pressure-cook the tripe with the whole spices and the 4–5 cups of water until tender. Keep the stock.",
        "Cut the tripe into bite-sized pieces. Heat the mustard oil, fry the pieces until lightly golden and lift them out.",
        "In the same pan, fry the sliced onions until lightly golden. Add the ginger-garlic paste and cook for 1 minute.",
        "Add the chilli powder, turmeric, coriander powder and salt with a splash of the stock, and cook the masala well.",
        "Return the tripe to the pan with the dried fenugreek leaves and enough stock to make a light gravy. Cover and simmer for 10–15 minutes.",
        "Finish with the ghee and serve hot.",
      ],
      tipsTitle: TIPS,
      wazaTips: [
        "Take the outer membrane off completely, for the best texture.",
        "The first boil with turmeric helps with any strong smell.",
        "Cook the tripe until it is tender but not falling apart.",
        "Frying the cooked tripe before it simmers adds flavour and improves the texture.",
        "Always keep the cooking stock: it gives the dish its body.",
      ],
    },
  },

  "thoole-tchaman": {
    seoTitle: "Thoole Tchaman: Kashmiri Steamed Eggs Recipe",
    description:
      "Thoole tchaman is a Kashmiri dish of steamed eggs: beaten with milk, turmeric and crushed spring onion greens, set like paneer and cut into cubes.",
    summary:
      "Thoole tchaman looks like paneer but is made of eggs: beaten with milk, turmeric and hand-crushed spring onion greens, steamed until set, cooled and cut into soft, spongy cubes. Dr Rukhsaar Sayeed says the name roughly means \"paneer made from eggs\", and that the recipe is her grandmother's.",
    source: {
      ...video("tOH73rmxzx0", "Thoolé Tchaman | Kashmiri Steamed Eggs", "2026-04-28", "28 April 2026"),
      credit:
        "This recipe follows the recipe for thoole tchaman that Dr Rukhsaar Sayeed gives as her grandmother's: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe. She says her mother made it whenever the house had plenty of fresh desi eggs, and that the crushed greens of spring onion (puch gande) or shallot (puch praan) are what lift its flavour and texture.",
      ingredients: ["5 eggs", "½ cup milk", "Salt, to taste", "¼ tsp turmeric powder", "2 tbsp spring onion greens or shallot greens, crushed by hand"],
      instructions: [
        "Put the eggs, milk, salt and turmeric in a bowl and add the crushed greens.",
        "Whisk or blend until smooth and well combined.",
        "Pour the mixture into a greased mould or container.",
        "Steam for about 15 minutes, or until set.",
        "Let it cool completely, then cut it into cubes.",
        "Use the cubes in curries, stir-fries or salads.",
      ],
    },
  },

  baegli: {
    seoTitle: "Baegli: Kashmiri Crispy Fava Beans Recipe",
    description:
      "Baegli are fava beans. In Dr Rukhsaar Sayeed's recipe they are blanched, skinned, split and roasted or fried until crisp, then tossed with salt and spices.",
    summary:
      "Baegli is Dr Rukhsaar Sayeed's name for fava beans. In her recipe the fresh beans are blanched, slipped out of their skins, split and roasted in the oven until crisp and golden, then tossed with a seasoning of your choice while still warm. She also gives a deep-fried version.",
    source: {
      ...video("O6MupFRJ_kw", "Crispy Fava Beans / Kashmiri Baégli", "2026-06-10", "10 June 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for crispy baegli: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe, for 2 cups of shelled beans. The seasoning is left open: she lists six to choose from.",
      ingredients: [
        "2 cups fresh fava beans (baegli), shelled",
        "1 tbsp oil",
        "Salt, to taste",
        "To season, any of: garlic powder, Kashmiri red chilli powder, cumin powder, black pepper, dried mint powder, chaat masala",
      ],
      instructions: [
        "Blanch the shelled beans in boiling water for 2–3 minutes.",
        "Move them to cold water and slip off the outer skins.",
        "Pat them dry and split each bean in half.",
        "Toss with the oil and salt and spread on a baking tray in a single layer.",
        "Roast at 180°C for 20–30 minutes, stirring every 8–10 minutes, until crisp and golden.",
        "Toss with the seasoning while still warm. Leave them for 5–10 minutes: they turn crunchier as they cool.",
      ],
      tipsTitle: TIPS,
      wazaTips: ["The drier the beans, the crisper they come out.", "Splitting the beans helps them crisp faster.", "Do not crowd the tray."],
      variations: [
        {
          title: "Deep-fried instead of roasted",
          paragraphs: [
            "The same video gives a fried version. The beans are blanched, skinned and dried thoroughly, as above, and split in half.",
            "They are fried in medium-hot oil until golden and crisp, drained well and seasoned at once, while hot. She warns against very high heat, which burns the outside before the inside has crisped.",
          ],
        },
      ],
    },
  },

  "handh-te-kokur": {
    seoTitle: "Handh te Kokur: Dandelion Greens and Chicken",
    description:
      "Handh te kokur is a Kashmiri dish of dandelion greens and chicken, traditionally cooked for mothers after childbirth. Dr Rukhsaar Sayeed's recipe.",
    summary:
      "Handh te kokur is dandelion greens cooked with chicken and its stock, a little fat and a few warming spices into an earthy broth. Dr Rukhsaar Sayeed describes it as a Kashmiri dish traditionally prepared for a mother's recovery after childbirth, and one traditionally cooked in copper pots at a slow simmer.",
    source: {
      ...video("sPn-FjGxkZA", "Kashmiri Postpartum Handh te Kokur", "2026-05-21", "21 May 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for handh te kokur: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro:
        "This is Dr Rukhsaar Sayeed's recipe. The greens are blanched and squeezed several times to take out their bitterness, then pounded, not blended.",
      ingredients: [
        "2 bunches dandelion greens (handh)",
        "500 g chicken on the bone, and its stock",
        "5–6 cloves garlic, minced",
        "Salt, to taste",
        "Water, as needed",
        "1–2 tbsp rendered mutton fat or ghee",
        "1 small onion, finely sliced",
        "1 small cardamom pod",
        "A small piece of cinnamon",
        "1 tsp fennel powder",
        "½ tsp black pepper",
        "A pinch of dry ginger powder",
      ],
      instructions: [
        "Wash the dandelion greens thoroughly.",
        "Blanch them in boiling water, strain and squeeze out the water. Fresh greens usually need this about three times; dried greens are more bitter and may need four or more.",
        "Pound the greens rather than blending them, for the coarse traditional texture.",
        "Cook the chicken slowly with garlic, salt and water to make a stock.",
        "Soften the onion and minced garlic gently in the mutton fat or ghee.",
        "Add the whole spices, the ground spices, the chicken with its stock and the pounded greens. Simmer gently until it comes together as a broth.",
      ],
      tipsTitle: TIPS,
      wazaTips: [
        "How many times the greens are boiled depends on how bitter they are.",
        "She says it is traditionally cooked in copper, at a slow simmer.",
      ],
    },
  },

  "kutta-hua-ghosht": {
    seoTitle: "Kutta Hua Ghosht: Kashmiri Shredded Mutton",
    description:
      "Kutta hua ghosht is Kashmiri-style dry mutton, pressure-cooked with onions, garlic, chillies and achari masala, then pounded until stringy.",
    summary:
      "Kutta hua ghosht is dry, shredded mutton: boneless meat cooked in mustard oil with onions, garlic, dried red chillies and achari masala until the water has gone, then lightly pounded so that the fibres come apart, and finished with fried onions, fresh mint and lemon. Dr Rukhsaar Sayeed calls it Kashmiri-style, bold and fiery.",
    source: {
      ...video("4iyfBVrELCE", "Kutta Hua Ghosht", "2025-12-31", "31 December 2025"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for kutta hua ghosht: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. She serves it hot with rice and extra lemon.",
      ingredients: [
        "600–700 g boneless mutton",
        "4 tbsp mustard oil",
        "2 medium onions, sliced",
        "12–15 cloves garlic (about 3 tbsp chopped)",
        "6–8 dried red chillies",
        "2–3 green chillies",
        "1 tsp cumin seeds",
        "About 1½ tsp salt, or to taste",
        "1 tbsp red chilli powder",
        "1 tbsp coriander powder",
        "1 tsp cumin powder",
        "½ tsp garam masala",
        "1½ tbsp achari masala",
        "1–1½ cups water, enough to cook the mutton",
        "½ cup fried shallots or onions",
        "½ cup chopped fresh mint, loosely packed",
        "2 tbsp lemon juice",
      ],
      instructions: [
        "Heat the mustard oil until it smokes.",
        "Add the mutton, onions, garlic, dried red chillies, green chillies, salt, cumin and ground spices.",
        "Add the achari masala, pour in the water and pressure-cook until the mutton is tender.",
        "Open the cooker and cook on until the water has dried off completely.",
        "Pound the mutton lightly, so that the fibres separate.",
        "Add the fried onions, mint and lemon juice and fry for a minute or two.",
      ],
    },
  },

  "chicken-kanti": {
    seoTitle: "Chicken Kanti Recipe: A Kashmiri Snack",
    description:
      "Chicken kanti is a Kashmiri snack of crisp fried chicken tossed on a high flame with marinated onions and tomatoes. A recipe with no MSG or food colour.",
    summary:
      "Chicken kanti is a Kashmiri snack: cubes of boneless chicken, marinated and fried crisp in mustard oil, then tossed on a high flame with onions and tomatoes that have sat in vinegar and spices. Dr Rukhsaar Sayeed says it is eaten at home and in restaurants alike; her version uses no MSG and no food colour.",
    source: {
      ...video("KdDw2SWEObY", "Kashmiri Chicken Kanti", "2025-02-11", "11 February 2025"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for chicken kanti: her ingredients, quantities and order of work, in our own words.",
      also: [{ label: "Her November 2025 video of the same recipe", url: "https://www.youtube.com/watch?v=SFZwo5vXlK0" }],
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. The chicken and the vegetables are marinated separately, and she serves the kanti hot with naan or paratha.",
      ingredients: [
        "For the chicken: 500 g boneless chicken, cut into cubes",
        "1 tbsp vinegar",
        "2 tbsp yogurt",
        "1 tsp ginger-garlic paste",
        "2 tbsp red chilli powder, or to taste",
        "½ tsp black pepper powder",
        "1 tsp cumin powder",
        "1 tbsp coriander powder",
        "1 tsp fennel powder",
        "½ tsp turmeric powder",
        "2 tsp dried fenugreek leaves (kasuri methi)",
        "½ cup cornflour, enough to coat",
        "Salt, to taste",
        "For the onions and tomatoes: 2 medium onions, thinly sliced",
        "2 medium tomatoes, thinly sliced",
        "2–3 green chillies, slit",
        "4–5 cloves garlic, thinly sliced",
        "½ tsp cumin seeds",
        "½ tsp dried fenugreek leaves",
        "1 tbsp vinegar",
        "1–2 tbsp red chilli powder",
        "½ tsp turmeric powder",
        "1 tsp fennel powder",
        "1 tbsp coriander powder",
        "Salt, to taste",
        "To cook: ½ cup mustard oil",
        "Fresh coriander, to garnish",
      ],
      instructions: [
        "Mix the chicken with the vinegar, yogurt, ginger-garlic paste, ground spices, dried fenugreek leaves, cornflour and salt. Leave it for 30 minutes.",
        "In another bowl, mix the onions, tomatoes, green chillies and garlic with their spices, the cumin seeds, dried fenugreek leaves, vinegar and salt. Work it together with your hands and leave it for at least 1 hour.",
        "Heat the mustard oil in a kadhai until it starts to smoke, then lower the flame to medium. Fry the chicken until crisp and golden brown and lift it out.",
        "Pour off about four-fifths of the oil, keeping just enough to stir-fry. Add the onion and tomato mixture and cook on a high flame, stirring all the time, until the oil separates but the onions still have some crunch.",
        "Add the fried chicken and toss everything together on a high flame.",
        "Garnish with fresh coriander.",
      ],
    },
  },

  "mutton-kanti": {
    seoTitle: "Mutton Kanti Recipe: A Kashmiri Eid Snack",
    description:
      "Mutton kanti is a Kashmiri snack of marinated boneless mutton, pressure-cooked and dried off, then tossed with onions, tomato and capsicum.",
    summary:
      "Mutton kanti is small cubes of boneless mutton, marinated in yogurt, vinegar and spices, cooked until tender and dry, and tossed with barely cooked onions, tomato and capsicum. Dr Rukhsaar Sayeed describes it as a much-loved snack in Kashmiri households, above all at Bakra Eid.",
    source: {
      ...video("sjnoAFLns_E", "Eid Special | Mutton Kanti", "2025-06-02", "2 June 2025"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for mutton kanti: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. The mutton needs at least 2 hours in its marinade, and she says to adjust all the spices to your own taste.",
      ingredients: [
        "For the mutton: 500 g boneless mutton, cut into small cubes",
        "5 tbsp yogurt",
        "1 tbsp ginger-garlic paste",
        "1 tsp red chilli powder",
        "½ tsp turmeric powder",
        "1 tsp coriander powder",
        "1 tsp garam masala",
        "1 tsp salt, or to taste",
        "1 tbsp vinegar",
        "For the vegetables: 2 medium onions, sliced",
        "1 large tomato, diced",
        "1 medium capsicum, diced",
        "2 green chillies, slit",
        "½ tsp cumin seeds",
        "½ tsp dried fenugreek leaves (kasuri methi)",
        "1 tbsp vinegar",
        "Salt, to taste",
        "To cook: 2 tbsp mustard oil, or vegetable oil",
        "About ¼ cup water",
        "Fresh coriander, to garnish",
      ],
      instructions: [
        "Mix the mutton with the yogurt, ginger-garlic paste, chilli powder, turmeric, coriander powder, garam masala, salt and vinegar until it is evenly coated. Cover and refrigerate for at least 2 hours, and overnight if you can.",
        "Mix the onions, tomato, capsicum and green chillies with the cumin seeds, dried fenugreek leaves, vinegar and salt. Leave for about 30 minutes.",
        "Heat mustard oil in a pressure cooker over a medium heat until it smokes. Add the mutton and fry until it has changed colour and browned on all sides.",
        "Add about ¼ cup of water, close the lid and pressure-cook for 3–4 whistles, or until the mutton is tender.",
        "Release the pressure, open the cooker and cook uncovered on a medium heat until the moisture has gone and the masala coats the meat.",
        "In another pan or wok, heat a tablespoon of mustard oil on a high heat. Add the vegetables and fry for 2–3 minutes, so that they are just cooked and still crunchy.",
        "Add the mutton, mix well and cook for 2 minutes more. Garnish with fresh coriander.",
      ],
    },
  },

  "kabab-kanti": {
    seoTitle: "Kabab Kanti Recipe: A Kashmiri Kebab Snack",
    description:
      "Kabab kanti is a Kashmiri snack: ready-made mutton kebabs cut up and fried crisp, then tossed on a high flame with spiced onion, tomato and capsicum.",
    summary:
      "Kabab kanti is kanti made with kebabs. Mutton kebabs are cut into bite-sized pieces and fried crisp, then tossed in a very hot pan with garlic and with onion, tomato and capsicum that have sat in vinegar and spices. Dr Rukhsaar Sayeed calls it a little Kashmiri snack with a lot of flavour, and serves it with naan and chutney.",
    source: {
      ...video("AIr7IItHEqg", "Kabab Kanti", "2026-10-05", "5 October 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for kabab kanti: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. It starts from four mutton kebabs that are already made.",
      ingredients: [
        "4 ready-made mutton kebabs",
        "Oil, for frying",
        "1 large onion, thinly sliced",
        "1 large tomato, deseeded and thinly sliced",
        "1 small capsicum, thinly sliced",
        "1 tsp Kashmiri chilli powder",
        "½ tsp turmeric",
        "½ tsp cumin powder",
        "½ tsp coriander powder",
        "½ tsp dried fenugreek leaves (kasuri methi)",
        "1–2 tbsp vinegar",
        "Salt, to taste",
        "2 tbsp oil, for tossing",
        "1 tbsp garlic, finely chopped or sliced",
        "Fresh coriander, chopped",
        "Naan and chutney, to serve",
      ],
      instructions: [
        "Cut the kebabs into bite-sized pieces and fry them until crisp and golden. Lift them out.",
        "Mix the onion, tomato and capsicum with the chilli powder, turmeric, cumin, coriander powder, dried fenugreek leaves, vinegar and salt. Let them sit for a few minutes.",
        "Heat the 2 tbsp of oil in a pan until properly hot. Add the garlic and fry it briefly.",
        "Add the vegetables and toss on a high flame, so that they cook quickly and keep their crunch.",
        "Add the fried kebab pieces and toss until everything is combined.",
        "Finish with fresh coriander and serve hot with naan and chutney.",
      ],
      tipsTitle: TIPS,
      wazaTips: ["Keep the pan really hot and do not overcook the vegetables: she says the slight crunch is what makes it."],
    },
  },

  "tcher-tchot": {
    seoTitle: "Tcher Tchot: Kashmiri Rice Bread Recipe",
    description:
      "Tcher tchot is a thin Kashmiri bread of rice-flour batter with ghee and cumin, cooked on a hot tawa like a dosa and eaten hot with noon chai.",
    summary:
      "Tcher tchot is Kashmiri rice bread: a thin, crêpe-like round made from a pourable batter of rice flour, ghee and cumin seeds, spread on a hot tawa and cooked until soft with lightly crisp edges. Dr Rukhsaar Sayeed calls it Kashmir's answer to the dosa and serves it hot with noon chai.",
    source: {
      ...video("TXb2Xp_lqWk", "Tcher Tchot (Kashmiri Rice Bread)", "2025-08-18", "18 August 2025"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for tcher tchot: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe, for 1 cup of rice flour. The batter is thin enough to pour, and each bread is steamed under a lid before it is crisped.",
      ingredients: [
        "1 cup short-grain rice flour",
        "1 tsp salt, or to taste",
        "1 tsp cumin seeds",
        "1 tbsp ghee or oil for the batter, and more for the tawa",
        "Water, as needed",
      ],
      instructions: [
        "Whisk the rice flour, salt, cumin and melted ghee together in a bowl.",
        "Add water a little at a time until you have a thin batter that pours, like a dosa batter.",
        "Heat a tawa and grease it lightly.",
        "Pour on a ladleful of batter and spread it thin at once, in circles, as for a dosa.",
        "Cover with a lid and let it steam for 30–40 seconds.",
        "Drizzle a little ghee round the edges and cook until lightly crisp but still soft. Serve hot with noon chai.",
      ],
    },
  },

  "nishasta-halwa": {
    seoTitle: "Nishasta Halwa: Kashmiri Wheat Starch Halwa",
    description:
      "Nishasta halwa is a Kashmiri-style halwa of wheat starch cooked in ghee with saffron, sugar and nuts until thick and glossy. Makes 2–3 servings.",
    summary:
      "Nishasta halwa is made from nishasta, wheat starch, soaked to a slurry and cooked slowly in ghee with saffron and sugar until it thickens and turns glossy, then finished with chopped nuts. Dr Rukhsaar Sayeed says it is traditionally given in Kashmir in winter.",
    source: {
      ...video("K41eDlA0It0", "Halwa for Your Bones!", "2026-07-13", "13 July 2026"),
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's Kashmiri-style recipe for nishasta halwa: her ingredients, quantities and order of work, in our own words.",
    },
    recipe: {
      intro: "This is Dr Rukhsaar Sayeed's recipe. The starch has to soak for 2–3 hours before it is cooked.",
      servings: "2–3",
      ingredients: [
        "4 tbsp nishasta (wheat starch)",
        "1 cup water for soaking, and 1 cup for cooking",
        "2–3 tbsp ghee",
        "6–8 saffron strands, soaked in 1 tbsp warm water or milk",
        "4–5 tbsp sugar, or to taste",
        "¼ tsp cardamom powder, optional",
        "2–3 tbsp chopped almonds, walnuts and cashews",
        "Poppy seeds, to garnish",
      ],
      instructions: [
        "Mix the nishasta with 1 cup of water and leave it to soak for 2–3 hours. Stir it well into a smooth slurry with no lumps.",
        "Melt the ghee in a heavy pan on a low flame and add the saffron with its soaking liquid.",
        "Pour the slurry slowly into the ghee, stirring all the time. Add the second cup of water.",
        "Add the sugar and stir until it dissolves, then the cardamom if you are using it.",
        "Keep cooking on a low flame, stirring regularly, until the halwa thickens and turns glossy and the ghee begins to separate at the sides.",
        "Stir in the chopped nuts and serve hot, sprinkled with poppy seeds.",
      ],
    },
  },
};
