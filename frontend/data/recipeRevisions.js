/**
 * Wazwan recipes rewritten to the method a waza uses.
 *
 * The source is Dr Rukhsaar Sayeed's Wazwan series (autumn 2026): short videos in which a waza cooks
 * the feast's dishes for her sister's wedding, each published with her written recipe (the YouTube
 * description and the Instagram caption carry the same text). Her channel describes her as the
 * runner-up of MasterChef India season 8 and a food technologist. Read on 19 November 2026; each
 * written recipe was checked against the video's narration.
 *
 * A revision keeps her ingredients, quantities and order of work and is written in our own words,
 * never hers. Whatever we changed, scaled or added is said in `source.note`, and nothing is added
 * that neither her recipe nor one of our cited stories supports. Times, servings and level stay as
 * the catalogue has them unless her recipe states them.
 *
 * lib/dishContent.js lays a revision over the stored recipe wherever a dish is shown (page, Recipe
 * markup, /recipes); the database record is untouched. Each dish page credits the source visibly
 * (components/dish/RecipeSource.js) and its Recipe markup names it as `isBasedOn`.
 * lib/recipeRevisions.test.js checks every entry.
 */

export const WAZA_SERIES = {
  author: "Dr Rukhsaar Sayeed",
  // As her YouTube channel describes her.
  about: "runner-up of MasterChef India season 8 and a food technologist, by her channel's own description",
  instagram: "https://www.instagram.com/masterchefrukhsaarsayeed/",
  instagramHandle: "@masterchefrukhsaarsayeed",
  youtube: "https://www.youtube.com/@RukhsaarSayeed",
  read: "2026-11-19",
};

// Said once, used by several recipes below.
const CHILLI_WATER = "chilli water: dried red chillies soaked, ground with a little water, thinned with more water and strained";

export const RECIPE_REVISIONS = {
  "rogan-josh": {
    revised: "2026-11-19",
    source: {
      title: "Waza Style Mutton Roganjosh",
      url: "https://www.youtube.com/watch?v=s5g8je17FEI",
      published: "2026-10-17",
      publishedLabel: "17 October 2026",
      credit:
        "This recipe follows the rogan josh a waza cooks in Dr Rukhsaar Sayeed's Wazwan series: her ingredients and order of work, in our own words.",
      note: "Her quantities are for 2 kg of mutton; ours are halved. The salt is from her narration, which adds it before serving; her written list leaves it out.",
      also: [{ label: "Her home-style rogan josh, which she says differs from the Wazwan's", url: "https://www.youtube.com/watch?v=Y_H25MDNO2M" }],
    },
    recipe: {
      intro:
        "Rogan josh as a waza cooks it for a wedding: the mutton is boiled, skimmed and washed first, then cooked down in its own stock with ghee, fried-shallot paste and chilli water until the gravy is thick and red. There is no tomato and no yogurt in it.",
      ingredients: [
        "1 kg mutton, cut into medium pieces",
        "Water, to boil the mutton",
        "About 1 litre of the stock from boiling the mutton",
        `120 ml (½ cup) ${CHILLI_WATER}`,
        "4 tbsp fried-shallot (praan) paste; fried onions, ground to a paste, if you have no shallots",
        "3–4 green cardamom pods",
        "2–3 cloves",
        "About 1 tbsp turmeric powder",
        "120 ml (½ cup) ghee",
        "Salt, to taste",
      ],
      instructions: [
        "Put the mutton in a large pot, cover it with water and bring it to the boil. Skim off all the scum as it rises.",
        "Strain the mutton and keep the stock. Wash the mutton well.",
        "Return the mutton to the pot with about 1 litre of the stock. Add the cardamom, cloves and turmeric and boil until the raw smell of the turmeric has gone.",
        "Add the shallot paste, the chilli water and the ghee, and bring back to the boil.",
        "Cover and cook until the mutton is completely tender and the stock has reduced to a thick gravy.",
        "Add salt before serving.",
      ],
      wazaTips: [
        "The mutton is boiled, skimmed and washed before anything else; the stock that is left is the cooking liquid.",
        "Chilli water and fried-shallot paste are the two things Dr Sayeed calls essential to Wazwan dishes. Make both before you start.",
        "Boil the turmeric in the stock until its raw smell has gone before the paste, chilli water and ghee go in.",
        "Salt goes in at the end.",
      ],
      commonMistakes: [
        "Adding tomatoes or a browned-onion base, which makes a different curry.",
        "Stopping before the stock has reduced to a thick gravy.",
      ],
      homeAdaptation:
        "If you have no shallots, fry onions, grind them and use that paste, as Dr Sayeed says in the video. Her separate home recipe pressure-cooks raw mutton with onions, garlic, oil and ground spices; she notes that it is not what a Wazwan serves, because a home kitchen has neither the high heat nor the mutton stock.",
    },
  },

  "tabak-maaz": {
    revised: "2026-11-19",
    source: {
      title: "Waza Style Tabakh Maaz",
      url: "https://www.youtube.com/watch?v=_E7zsxjzfcU",
      published: "2026-10-19",
      publishedLabel: "19 October 2026",
      credit:
        "This recipe follows the tabak maaz a waza cooks in Dr Rukhsaar Sayeed's Wazwan series: her ingredients, quantities and order of work, in our own words.",
      note: "The Waza family's published recipe, quoted in our story on tabak maaz, has the same two cookings and adds dry ginger and black cardamom to the second pot.",
    },
    recipe: {
      intro:
        "Tabak maaz as a waza cooks it: mutton ribs boiled and washed, simmered again in their own stock with cloves, garlic and turmeric until completely tender, then trimmed and fried in plenty of ghee until crisp. The wazas' pot holds water and stock, not milk; our story on the dish sets out who uses which.",
      ingredients: [
        "1 kg mutton ribs; ask the butcher to separate them",
        "Water, for the first boil",
        "The stock from the first boil",
        "4–5 cloves",
        "10–12 garlic cloves",
        "1 tbsp turmeric powder",
        "Salt, to taste",
        "Ghee, plenty, for frying",
      ],
      instructions: [
        "Put the ribs in a large pot of water and bring to the boil. Skim off the scum that rises.",
        "Keep boiling until the ribs are partly cooked. Lift them out and wash them well; keep the stock.",
        "Cut the ribs into manageable pieces and return them to the stock. Add the cloves and garlic, then the turmeric and salt.",
        "Simmer until the ribs have taken up the flavour of the stock and are completely tender.",
        "Take the ribs out and let them cool a little. Chop off the excess bone to leave neat pieces that keep their rib shape.",
        "Lay the ribs on a wide tawa or heavy frying pan, add plenty of ghee and fry, turning as needed, until golden-brown and crisp. Serve hot.",
      ],
      wazaTips: [
        "The ribs are cooked twice in liquid before they meet the ghee: a first boil in water, then a simmer in their own stock with cloves, garlic, turmeric and salt.",
        "Trim the excess bone after the second cooking, once the ribs have cooled a little.",
        "Use plenty of ghee, and fry until the ribs are crisp.",
      ],
      commonMistakes: [
        "Frying before the ribs are completely tender; the ghee only crisps them.",
        "Letting them wait after frying. They are served hot.",
      ],
      homeAdaptation: "A wide, heavy frying pan stands in for the waza's tawa. Fry the ribs in batches so that each piece sits flat in the ghee.",
    },
  },

  "marchwangan-korma": {
    revised: "2026-11-19",
    source: {
      title: "Wazwan Style Marchewangan Kormé",
      url: "https://www.youtube.com/watch?v=4n732w3Cslw",
      reel: "https://www.instagram.com/reel/Df4SmDiyVrb/",
      published: "2026-11-18",
      publishedLabel: "18 November 2026",
      credit:
        "This recipe follows the marchwangan korma a waza cooks in Dr Rukhsaar Sayeed's Wazwan series: her ingredients, quantities and order of work, in our own words.",
      note: "Her written method mentions a ginger-garlic paste and a garlic powder that are not in her ingredient list; we have followed the list. The fennel powder is in her list and not in her method; we add it with the other powders.",
      also: [{ label: "Her own home-style version, with smoked mustard oil, fried-shallot paste and dried mint", url: "https://www.youtube.com/watch?v=iGGxzIPH35c" }],
    },
    recipe: {
      intro:
        "Marchwangan korma as a waza cooks it: mutton boiled until tender, fried in mustard oil and ghee with garlic and whole spices, cooked down in its own stock with chilli water until the pot is nearly dry, and finished with a great deal of Kashmiri chilli powder. Kashmiri chilli is mild; the heat comes from how much of it goes in.",
      ingredients: [
        "1 kg mutton",
        "15–20 dried red chillies and water, for the chilli water",
        "2 tbsp garlic paste",
        "2–3 small pieces of cinnamon",
        "4–5 green cardamom pods",
        "5–6 cloves",
        "Salt, to taste",
        "120 ml (½ cup) mustard oil",
        "3 tbsp ghee",
        "The stock from boiling the mutton, as needed",
        "1½ tsp turmeric powder",
        "2 tbsp coriander powder",
        "1 tsp dry ginger powder",
        "1 tsp fennel powder",
        "3–4 tbsp Kashmiri red chilli powder, to taste",
      ],
      instructions: [
        "Make the chilli water: soak the dried chillies, grind them with a little water, stir in more water and strain.",
        "Wash the mutton and boil it until tender. Strain it and keep the stock.",
        "Heat the mustard oil and ghee in a wide pot. Add the cooked mutton, garlic paste, cinnamon, cardamom, cloves and salt, and fry well until the mutton is coated.",
        "Pour in the stock and the chilli water, then add the turmeric, coriander, dry ginger and fennel powders.",
        "Cook, frying as the liquid goes, until the stock has reduced completely and the spices have gone into the meat.",
        "Add the Kashmiri chilli powder and fry for a few minutes more, until the korma is deep red and the oil begins to separate.",
      ],
      wazaTips: [
        "The chilli goes in twice: as chilli water with the stock, and as chilli powder fried in at the end.",
        "Reduce the stock completely before the chilli powder goes in; the korma is fried at the end, not simmered.",
        "It is ready when it is deep red and the oil has begun to separate.",
      ],
      commonMistakes: [
        "Using a hot chilli powder in these quantities. The recipe is written for Kashmiri chilli, which is mild.",
        "Leaving stock in the pot. The korma is fried nearly dry before the chilli powder goes in.",
      ],
      homeAdaptation:
        "Adjust the chilli powder to the heat you want, as her recipe says. Dr Sayeed's own home versions differ from the waza's: one fries the mutton in smoked mustard oil and adds fried-shallot paste and dried mint.",
    },
  },

  "daniwal-korma": {
    revised: "2026-11-19",
    source: {
      title: "Wazwan Dhaniwal Kormaé",
      url: "https://www.youtube.com/watch?v=rU_cLzGjpFc",
      reel: "https://www.instagram.com/reel/DfEzF6mSVwx/",
      published: "2026-10-29",
      publishedLabel: "29 October 2026",
      credit:
        "This recipe follows the daniwal korma a waza cooks in Dr Rukhsaar Sayeed's Wazwan series: her ingredients, quantities and order of work, in our own words.",
      note: "Her recipe says to adjust the spices, ghee and stock to your taste and to the consistency you want.",
      also: [{ label: "Her earlier home-style daniwal korma", url: "https://www.youtube.com/watch?v=4pj9lB9AZfc" }],
    },
    recipe: {
      intro:
        "Daniwal korma as a waza cooks it: small pieces of mutton boiled and washed, fried in plenty of desi ghee with garlic and whole spices, cooked tender on their own stock, then joined by boiled curd, raw onion paste, turmeric and dry ginger. Saffron goes in near the end, and the fresh coriander that names the dish goes on just before serving.",
      ingredients: [
        "1 kg mutton, in small pieces",
        "The stock from boiling the mutton, as needed",
        "250 g curd (yogurt)",
        "2 tbsp garlic paste",
        "2 medium onions, ground raw to a paste",
        "150–200 g desi ghee",
        "1½ tsp turmeric powder",
        "1 tsp dry ginger powder (sonth)",
        "2 small pieces of cinnamon",
        "4–5 green cardamom pods",
        "3–4 cloves",
        "A generous pinch of saffron",
        "Salt, to taste",
        "Fresh coriander, chopped, to finish",
      ],
      instructions: [
        "Boil the mutton, strain it and wash it well. Keep the stock.",
        "Put the mutton in a large pot with the ghee, garlic paste, cinnamon, cardamom, cloves and salt. Set it on the heat and fry well.",
        "Add the stock a little at a time and keep cooking until the mutton is tender.",
        "In a separate pan, bring the curd to the boil.",
        "Add the boiled curd to the mutton with the onion paste, turmeric and dry ginger. Cook until the flavours have come together, the mutton is completely tender and the gravy has thickened.",
        "Add the saffron and cook a little longer.",
        "Scatter with fresh coriander before serving.",
      ],
      wazaTips: [
        "Add the stock a little at a time while the mutton fries in the ghee.",
        "The curd is boiled in its own pan before it joins the mutton.",
        "The onion paste goes in raw, with the turmeric and dry ginger.",
        "Saffron goes in near the end, and the coriander just before serving.",
      ],
      commonMistakes: [
        "Adding the curd unboiled.",
        "Adding red chilli; the waza's version has none.",
      ],
      homeAdaptation:
        "Dr Sayeed's earlier home version pressure-cooks the mutton with the whole spices and whisks the yogurt over a high flame, stirring all the time, until it boils; she suggests an egg or 2 tbsp of gram flour in the yogurt to stop it splitting.",
    },
  },

  "methi-maaz": {
    revised: "2026-11-19",
    source: {
      title: "Wazwan Series | Methi Maaz",
      url: "https://www.youtube.com/watch?v=HrGfuG00c8U",
      reel: "https://www.instagram.com/reel/De9EBP2yorC/",
      published: "2026-10-26",
      publishedLabel: "26 October 2026",
      credit:
        "This recipe follows the methi maaz a waza cooks in Dr Rukhsaar Sayeed's Wazwan series: her ingredients, quantities and order of work, in our own words.",
      note: "The dried fenugreek leaves are in her narration, added at the end, and missing from her written list, so we have no amount for them.",
    },
    recipe: {
      intro:
        "Methi maaz as a waza cooks it: the sheep's stomach, tripe and intestines, cleaned, boiled tender and chopped small, then simmered in mutton stock with ghee, chilli water, garlic and a few spices until the gravy is thick. Dried fenugreek leaves, the methi of the name, go in at the end.",
      ingredients: [
        "500 g sheep's stomach, tripe and intestines, thoroughly cleaned",
        "500 ml (2 cups) mutton stock",
        "3 tbsp ghee, plus a little to finish",
        "1 tsp dry ginger powder",
        "1 tbsp garlic paste",
        "½ tsp turmeric powder",
        `120 ml (½ cup) ${CHILLI_WATER}`,
        "1 small piece of cinnamon",
        "3–4 green cardamom pods",
        "Salt, to taste",
        "Dried fenugreek leaves (methi), to finish",
      ],
      instructions: [
        "Clean the stomach, tripe and intestines thoroughly, then boil them until tender.",
        "Drain and chop into small pieces.",
        "Heat the ghee in a pot and add the cinnamon, cardamom, dry ginger, garlic paste, turmeric and chilli water.",
        "Add the chopped offal and the stock.",
        "Simmer on a low heat until the flavours are absorbed and the gravy has thickened.",
        "Add the dried fenugreek leaves and finish with a little ghee.",
      ],
      wazaTips: [
        "Boil the offal until it is tender before chopping it, and chop it small.",
        "Cook it on a low heat until the gravy thickens.",
        "The dried fenugreek leaves go in last.",
      ],
      commonMistakes: [
        "Chopping the offal before it is tender.",
        "Rushing the simmer; the gravy should be thick.",
      ],
      homeAdaptation: "A butcher will usually clean the tripe and intestines for you; wash them again thoroughly before the first boil.",
    },
  },

  "aab-gosht": {
    revised: "2026-11-19",
    source: {
      title: "Mutton Aabgosh | Kashmiri Mutton-Milk Stew",
      url: "https://www.youtube.com/watch?v=MCb0gYfmLXA",
      reel: "https://www.instagram.com/reel/DfWzu03y1Um/",
      published: "2026-11-05",
      publishedLabel: "5 November 2026",
      credit:
        "This recipe follows the aab gosht a waza cooks in Dr Rukhsaar Sayeed's Wazwan series: her ingredients, quantities and order of work, in our own words.",
      note: "The waza in the video makes the milk from milk powder. Our story on aab gosht covers the older practice of reducing fresh milk.",
      also: [{ label: "Her earlier home-style aab gosht", url: "https://www.youtube.com/watch?v=F9lIVxJ9Y20" }],
    },
    recipe: {
      intro:
        "Aab gosht as a waza cooks it: mutton boiled and washed, cooked in its own stock with ghee, fried-shallot paste, fennel, cardamom and cloves until the stock has reduced, then simmered in milk until the gravy is thick and creamy. It has no chilli and no turmeric.",
      servings: "4–5",
      ingredients: [
        "750 g mutton",
        "750 ml to 1 litre of the stock from boiling the mutton",
        "5–6 green cardamom pods",
        "5–6 cloves",
        "1 tbsp fennel powder",
        "3 tbsp ghee",
        "½ cup fried shallots, ground to a paste",
        "Salt, to taste",
        "For the milk: 200 g full-fat milk powder whisked into 1.5 litres of water",
      ],
      instructions: [
        "Boil the mutton until it is partly cooked. Drain it, wash it well and keep the stock.",
        "Put the washed mutton in a heavy pot with the stock, cardamom, cloves, fennel powder, ghee and fried-shallot paste.",
        "Cook until the mutton is tender, the stock has reduced and the ghee has separated.",
        "Whisk the milk powder into the water until it is smooth, with no lumps.",
        "Add the milk to the mutton, season with salt and stir gently.",
        "Simmer on a low heat until the milk thickens to a creamy gravy.",
      ],
      wazaTips: [
        "Cook the mutton in its stock with the ghee and fried-shallot paste until the stock has reduced; only then add the milk.",
        "Whisk the milk powder into the water until there are no lumps.",
        "Keep the heat low once the milk is in.",
      ],
      commonMistakes: [
        "Adding the milk before the stock has reduced.",
        "Boiling hard once the milk is in; it is simmered on a low heat.",
      ],
      homeAdaptation:
        "Dr Sayeed's earlier home version pressure-cooks the mutton with whole spices, ginger-garlic paste and fennel, makes the milk from milk powder in the same way, and finishes with a little sugar and ghee.",
    },
  },

  // The catalogue's waza palak is a vegetarian spinach dish; the feast also has spinach with small
  // meatballs, which is what her video shows. The stored recipe stays; this adds the variation.
  "waza-palak": {
    revised: "2026-11-19",
    source: {
      title: "Wazwan Style Palak Risté",
      url: "https://www.youtube.com/watch?v=C4j0M17ztH0",
      reel: "https://www.instagram.com/reel/DfhHojESt6q/",
      published: "2026-11-09",
      publishedLabel: "9 November 2026",
      // Only the variation is hers, so the Recipe markup does not call the recipe based on it.
      scope: "variation",
      credit:
        "The palak riste method comes from Dr Rukhsaar Sayeed's Wazwan series, where a waza cooks it; it is told in our own words. The vegetarian recipe above it is our own and is not from her video.",
      note: "",
    },
    recipe: {
      variation: {
        title: "With meatballs: palak riste",
        paragraphs: [
          "The wazas also cook spinach with small meatballs, as palak riste. In Dr Rukhsaar Sayeed's Wazwan series a waza makes it like this.",
          "For the riste, 500 g of boneless mutton and about 150 g of mutton fat are pounded separately on stone until smooth, then pounded together, the fat at about 30 per cent, into a fine paste. Small balls of it are boiled gently in water with 3–4 green cardamom pods, a piece of cinnamon, 1 tsp garlic paste, 1 tsp dry ginger powder, ½ tsp turmeric and salt. Once they are cooked, 2 tbsp fried-shallot paste and ½ cup of chilli water go in and the pot simmers on a low heat.",
          "For the spinach, 500 g is blanched, strained, squeezed dry and roughly chopped, then fried with 1 tbsp garlic paste and salt in 2 tbsp oil. 2 tbsp desi ghee is added, then the riste with their gravy, and the two simmer together for a few minutes.",
        ],
      },
    },
  },
};

/** The revision for a dish, or undefined. */
export const recipeRevisionFor = (slug) => (slug ? RECIPE_REVISIONS[slug] : undefined);
