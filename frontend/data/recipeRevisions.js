/**
 * Recipes that follow Dr Rukhsaar Sayeed's published recipes (the owner's chosen reference, with
 * her agreement as the owner reports it).
 *
 * Two kinds of source, and each entry says which:
 * - her Wazwan series (autumn 2026): short videos in which a waza cooks the feast's dishes for her
 *   sister's wedding. Each written recipe was checked against the video's narration.
 * - her own home recipes (2024 to 2026), which she presents as home versions. These were taken from
 *   her written recipes.
 * The YouTube description and the Instagram caption of a video carry the same text. Read on
 * 19 November 2026.
 *
 * A revision keeps her ingredients, quantities and order of work and is written in our own words,
 * never hers. Whatever we changed, scaled or added is said in `source.note`. Where her recipe is a
 * different take on a dish (chicken for mutton, a pressure cooker for an oven) or belongs with a
 * dish we have, it is added to the closest page as a `variations` entry and the stored recipe stays.
 * Her recipes for dishes we had no page for have pages of their own (data/addedDishes.js).
 * Times are our estimates from the durations she gives; a serving count is shown only where the
 * stored one still fits her quantities or she states one.
 *
 * lib/recipeRevisions.js lays a revision over the stored recipe on the server (dish page, Recipe
 * markup, /recipes, sitemap); the database record is untouched. The dish page credits the source
 * under the recipe (components/dish/RecipeSource.js), and the Recipe markup names the video as
 * `isBasedOn` only where the recipe itself, not just a variation, is hers.
 * lib/recipeRevisions.test.js checks every entry.
 */

import { WAZA_SERIES } from "./rukhsaarSayeed";

export { WAZA_SERIES };

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
      variations: [
        {
          title: "Hindi rogan josh, with yogurt and tamarind",
          source: { title: "Hindi Roganjosh", url: "https://www.youtube.com/watch?v=sIZcQLAYVCQ", published: "2026-11-16", publishedLabel: "16 November 2026" },
          paragraphs: [
            "The Wazwan has a second rogan josh, which Dr Sayeed calls Hindi rogan josh and describes as a lesser-known dish made for the groom and his party. It is tangy, from yogurt and tamarind. In her Wazwan series a waza makes it like this, for four or five.",
            "750 g cooked mutton goes into a heavy pan with 2 tbsp garlic paste, 2 black and 4 green cardamom pods, 2 small pieces of cinnamon, 5–6 cloves, salt, ½ cup mustard oil and 2 tbsp desi ghee. On the heat, 1½ cups mutton stock, ½ tsp turmeric, ½ cup fried shallots and 1½ cups whisked yogurt are added and cooked until the yogurt is worked in.",
            "Then 2 tbsp Kashmiri red chilli powder, ¼ cup tamarind water and ½ cup onion paste go in. The pan is covered and simmered until the gravy thickens and the mutton is tender. She advises adding the tamarind a little at a time.",
          ],
        },
      ],
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
      scope: "variation",
      credit:
        "The palak riste method comes from Dr Rukhsaar Sayeed's Wazwan series, where a waza cooks it; it is told in our own words. The vegetarian recipe above it is our own and is not from her video.",
    },
    recipe: {
      variations: [
        {
          title: "With meatballs: palak riste",
          source: {
            title: "Wazwan Style Palak Risté",
            url: "https://www.youtube.com/watch?v=C4j0M17ztH0",
            reel: "https://www.instagram.com/reel/DfhHojESt6q/",
            published: "2026-11-09",
            publishedLabel: "9 November 2026",
          },
          paragraphs: [
            "The wazas also cook spinach with small meatballs, as palak riste. In Dr Rukhsaar Sayeed's Wazwan series a waza makes it like this.",
            "For the riste, 500 g of boneless mutton and about 150 g of mutton fat are pounded separately on stone until smooth, then pounded together, the fat at about 30 per cent, into a fine paste. Small balls of it are boiled gently in water with 3–4 green cardamom pods, a piece of cinnamon, 1 tsp garlic paste, 1 tsp dry ginger powder, ½ tsp turmeric and salt. Once they are cooked, 2 tbsp fried-shallot paste and ½ cup of chilli water go in and the pot simmers on a low heat.",
            "For the spinach, 500 g is blanched, strained, squeezed dry and roughly chopped, then fried with 1 tbsp garlic paste and salt in 2 tbsp oil. 2 tbsp desi ghee is added, then the riste with their gravy, and the two simmer together for a few minutes.",
          ],
        },
      ],
    },
  },

  // ---------------------------------------------------------------------------------------------
  // Her own home recipes, used as the recipe. She presents each as a home version, and so do we.
  // ---------------------------------------------------------------------------------------------

  rista: {
    revised: "2026-11-19",
    source: {
      title: "Homemade Wazwan Style Rista in a Grinder",
      url: "https://www.youtube.com/watch?v=KVVI0NTmSho",
      published: "2024-07-23",
      publishedLabel: "23 July 2024",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's home recipe for rista: her ingredients, quantities and order of work, in our own words.",
      note: "It is her home version, made in a grinder for cooks without the stone and mallet. At a Wazwan the meat and fat are pounded by hand, as our story on rista describes and as a waza does in her palak riste video.",
      also: [{ label: "A waza pounding and shaping rista, in her palak riste video", url: "https://www.youtube.com/watch?v=C4j0M17ztH0" }],
    },
    recipe: {
      intro:
        "Rista at home, as Dr Rukhsaar Sayeed makes it: chilled mutton mince and fat worked to a smooth paste in a grinder, rolled into balls and boiled in spiced mutton stock with fried-onion paste and ghee. At a Wazwan the meat is pounded by hand on stone; our story on rista describes that.",
      prepTimeMinutes: 90,
      cookTimeMinutes: 30,
      servings: "",
      difficulty: "Moderate",
      ingredients: [
        "For the meatballs: 500 g mutton mince (keema)",
        "150 g mutton fat, rendered and cooled until semi-solid",
        "1 tsp salt",
        "1 egg",
        "¼ tsp green cardamom seeds",
        "¼ tsp black cardamom seeds",
        "1 litre mutton stock",
        "For the gravy: 3–4 green cardamom pods, 2 black cardamom pods, 2–3 cloves, 2–3 black peppercorns, 1 bay leaf and 1–2 sticks of cinnamon",
        "1–2 tbsp chilli powder",
        "½ tsp turmeric",
        "½ tsp dry ginger powder",
        "1 tbsp coriander powder",
        "½ tbsp fennel powder",
        "1 tbsp ginger-garlic paste",
        "½ cup fried-onion paste",
        "2 tbsp ghee",
        "Mawal (cockscomb flower) extract for colour, optional",
      ],
      instructions: [
        "Chill the mince in the freezer for 1–2 hours, until half frozen. Grind it for 1–2 minutes in short pulses, so that it does not warm up.",
        "Add the cooled fat, the salt and the cardamom seeds and grind to a smooth paste. Add the egg and mix well.",
        "With wet hands, roll the paste into medium balls with no cracks.",
        "Warm the stock, put the balls in and bring it to the boil once, so that they hold their shape.",
        "Add the whole spices, the powdered spices, the ginger-garlic paste, the fried-onion paste, the ghee and the colour to the stock.",
        "Boil for 20–25 minutes, until the ristas have swollen and the gravy is thick and glossy. Serve hot.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: [
        "Keep the meat cold: a grinder heats it, and warm meat spoils the texture.",
        "The fat must be completely cool before it goes in.",
        "Leave no cracks in the balls, and set them in warm stock before the gravy is built.",
      ],
      commonMistakes: [],
      homeAdaptation: "",
    },
  },

  yakhni: {
    revised: "2026-11-19",
    source: {
      title: "Kashmiri Mutton Yakhni",
      url: "https://www.youtube.com/watch?v=EEF468g3bg4",
      published: "2025-03-26",
      publishedLabel: "26 March 2025",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's home recipe for mutton yakhni: her ingredients, quantities and order of work, in our own words.",
      note: "It is her home version, with a pressure cooker and an egg in the yogurt. Her Wazwan series has no yakhni yet.",
    },
    recipe: {
      intro:
        "Yakhni is mutton in a yogurt gravy with fennel, dry ginger and dried mint. This is Dr Rukhsaar Sayeed's home version: the mutton is pressure-cooked, and an egg whisked into the yogurt keeps it from curdling.",
      cookTimeMinutes: 50,
      servings: "",
      ingredients: [
        "500 g mutton, preferably fatty",
        "2–3 green cardamom pods, 1 black cardamom pod, 1 stick of cinnamon and 4–5 cloves",
        "Salt, to taste",
        "1 tbsp ginger-garlic paste",
        "2–3 cups water, for cooking the mutton",
        "1 cup yogurt",
        "1 egg",
        "3 tbsp mustard oil",
        "2 shallots or onions, thinly sliced",
        "1 tsp fennel powder",
        "1 tsp dry ginger powder",
        "½ tsp garam masala",
        "1 tbsp ghee",
        "1 tbsp dried mint powder",
      ],
      instructions: [
        "Pressure-cook the mutton with the whole spices, salt, ginger-garlic paste and water until tender, 3–4 whistles. Keep the stock.",
        "Whisk the yogurt with the egg until smooth. Cook it over a high flame, stirring all the time, until it boils.",
        "Heat the mustard oil and fry the sliced shallots until golden brown. Blend them to a smooth paste.",
        "To the boiled yogurt add the fennel, dry ginger and garam masala, then the cooked mutton, its stock, the ghee and the shallot paste.",
        "Sprinkle in the dried mint and simmer for 10–15 minutes.",
        "Serve hot with steamed rice.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: [
        "The egg is there to stop the yogurt curdling; keep stirring until it boils.",
        "Fry the shallots to a golden brown before blending them.",
        "Be generous with the dried mint.",
      ],
      commonMistakes: [],
      homeAdaptation: "",
    },
  },

  "dum-oluv": {
    revised: "2026-11-19",
    source: {
      title: "Silkiest Kashmiri Dum Aloo",
      url: "https://www.youtube.com/watch?v=rutffC8ovFE",
      published: "2026-07-02",
      publishedLabel: "2 July 2026",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's home recipe for dum aloo: her ingredients, quantities and order of work, in our own words.",
      note: "The potato paste in the gravy is her own touch. The garam masala at the end is in her written recipe and not in her video, as she notes.",
    },
    recipe: {
      intro:
        "Kashmiri dum aloo: baby potatoes pricked and fried golden, then simmered in a spiced yogurt gravy until the oil separates. This is Dr Rukhsaar Sayeed's home recipe, and her own touch is to thicken the gravy with a paste of a few of the boiled potatoes.",
      ingredients: [
        "500 g baby potatoes",
        "Oil, for deep-frying",
        "2 bay leaves",
        "1 tsp cumin seeds",
        "2 black cardamom pods",
        "4 green cardamom pods",
        "4 cloves",
        "1-inch piece of cinnamon",
        "1 tsp Kashmiri red chilli powder",
        "½ tsp turmeric",
        "1 tsp fennel powder",
        "1 tsp dry ginger powder",
        "1 tsp coriander powder",
        "1 cup yogurt, whisked",
        "Salt, to taste",
        "Water, as needed",
        "½ tsp garam masala, to finish",
      ],
      instructions: [
        "Pressure-cook the potatoes, peel them and prick them all over.",
        "Blend 4–5 of the potatoes to a smooth paste. Deep-fry the rest until golden.",
        "Heat a little of the frying oil in a pot and sauté the bay leaves, cumin, cardamoms, cloves and cinnamon.",
        "Add the chilli, turmeric, fennel, dry ginger and coriander powders and cook on a low heat.",
        "Stir in the whisked yogurt and cook until smooth.",
        "Add the potato paste, the fried potatoes, salt and a little water. Cover and simmer until the gravy is thick and the oil separates.",
        "Finish with the garam masala and serve hot.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: [
        "Prick the potatoes after peeling, so the gravy gets in.",
        "The paste of boiled potato is what makes the gravy silky.",
        "Cook the powdered spices on a low heat before the yogurt goes in.",
      ],
      commonMistakes: [],
      homeAdaptation: "",
    },
  },

  "kashmiri-harissa": {
    revised: "2026-11-19",
    source: {
      title: "Mutton Harissa",
      url: "https://www.youtube.com/watch?v=4sw-WeeRpDk",
      published: "2025-10-30",
      publishedLabel: "30 October 2025",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's home recipe for harissa: her ingredients, quantities and order of work, in our own words.",
      note: "It is a home version, thickened with rice flour and started in a pressure cooker; the harissa shops of Srinagar cook theirs overnight. Her method puts garlic paste and green cardamom in the stock, though her ingredient list has no garlic and keeps the cardamom for the spice bundle; and her list has a sliced onion that her method does not mention, which we have put with the fried-onion garnish.",
      also: [{ label: "Her longer harissa video, with the same recipe", url: "https://www.youtube.com/watch?v=p4-hc9zlxZ0" }],
    },
    recipe: {
      intro:
        "Harissa at home, as Dr Rukhsaar Sayeed makes it: a stock from the mutton bones, the meat pressure-cooked with fennel and whole spices, cooked down for hours and thickened with rice flour until it mashes smooth.",
      cookTimeMinutes: 240,
      ingredients: [
        "1.5 kg mutton on the bone",
        "2–2.5 cups rice flour",
        "½ cup fennel seeds",
        "Garlic paste, for the stock",
        "Salt, to taste",
        "½ cup mustard oil, plus more to serve",
        "2 tbsp fried shallot or onion paste",
        "For the spice bundle: 8–9 green cardamom pods, 3–4 black cardamom pods, 5–6 cloves and ½ tsp black peppercorns",
        "1 large onion, finely sliced and fried, or fried shallots, to garnish",
        "Water, as needed",
      ],
      instructions: [
        "Take the meat off the bones. Boil the bones in a large pot of water with green cardamom and the garlic paste, then lower the heat and cook until you have a rich stock. Strain it, add any meat left on the bones to the rest, and discard the bones.",
        "Pressure-cook the boneless mutton with the spice bundle, the fennel seeds, salt and water until it is falling apart. Take out the bundle and any membranes.",
        "Pour the stock over the meat. Cover and cook on a low flame for 1–2 hours.",
        "Mix the rice flour with water to a smooth slurry. Add it to the pot a little at a time, stirring continuously so that no lumps form.",
        "Cook for 30–40 minutes more, stirring now and then, until the harissa is thick and velvety. Add the ½ cup of oil and the fried-onion paste.",
        "Mash the meat into the gravy with a wooden spoon or a masher until smooth. Adjust the salt.",
        "Serve hot, topped with mustard oil and fried onions.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: [
        "Stir all the time while the rice-flour slurry goes in.",
        "The stock from the bones is what gives the harissa its depth, she says.",
        "Mash until the meat disappears into the gravy.",
      ],
      commonMistakes: [],
      homeAdaptation: "",
    },
  },

  "noon-chai": {
    revised: "2026-11-19",
    source: {
      title: "2-Ways Kashmiri Noon-Chai",
      url: "https://www.youtube.com/watch?v=ZBnSG6SUy_Y",
      published: "2025-11-17",
      publishedLabel: "17 November 2025",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's traditional method for noon chai: her ingredients, quantities and order of work, in our own words.",
      note: "Her recipe says to boil the tea down and repeat it twice; we have written it as she does.",
      also: [{ label: "Her earlier video on noon chai in a pressure cooker", url: "https://www.youtube.com/watch?v=xOmq72D16gQ" }],
    },
    recipe: {
      intro:
        "Noon chai is Kashmir's salted pink tea: tea leaves boiled down with a pinch of baking soda, shocked with cold water, then simmered with milk and salt. This is the traditional method as Dr Rukhsaar Sayeed makes it; her quicker pressure-cooker method is below.",
      servings: "",
      ingredients: [
        "1 heaped tsp Kashmiri tea leaves",
        "¼ tsp baking soda",
        "2 cups water",
        "1 cup cold water",
        "2 cups full-fat milk",
        "½ tsp salt, or to taste",
        "1 tbsp malai (cream), optional",
      ],
      instructions: [
        "Roast the tea leaves in a heavy pan on a low flame for 10–20 seconds.",
        "Add the baking soda and the 2 cups of water. Boil on a medium heat for 10–15 minutes, until it has reduced by half and turned a deep reddish brown. Repeat this twice, as she does.",
        "Add the cup of cold water and whisk hard for 2–3 minutes.",
        "Simmer for another 10 minutes; the tea turns a dark ruby pink.",
        "Add the milk, stirring gently, and simmer slowly for 10 minutes, until it is a creamy rose pink.",
        "Add the salt and, if you like, the malai. Serve hot with lavasa, girda or bakerkhani.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: [
        "Long brewing is the key: reducing the tea is what develops the colour.",
        "Air matters: whisk the tea, or pour it, to bring out the pink.",
        "The cold water deepens the colour.",
        "Simmer slowly once the milk is in.",
      ],
      commonMistakes: [],
      homeAdaptation: "",
      variations: [
        {
          title: "In a pressure cooker",
          paragraphs: [
            "The same video gives a quicker way. Put 2 cups of water, 1 heaped tsp of tea leaves and ¼ tsp of baking soda in a pressure cooker and stir. Cook on a high flame to the first whistle, then on a low flame for 5 minutes, and let the pressure fall by itself.",
            "Open the cooker, add 1 cup of cold water and stir hard. Add 1 cup of milk, or more, bring to a gentle boil and simmer for 5–7 minutes, until the tea is a rich pink. Add ½ tsp of salt and a spoonful of malai if you like, and strain into cups.",
          ],
        },
        {
          title: "With tomle sott, roasted rice flour",
          source: { title: "Tomlé Sott- Kashmiri Superfood", url: "https://www.youtube.com/watch?v=ryKfdNcupy0", published: "2025-07-23", publishedLabel: "23 July 2025" },
          paragraphs: [
            "Tomle sott is rice that has been slowly roasted and stone-ground to a fine powder. Dr Sayeed describes it as what Kashmir turned to for energy long before breakfast cereals, traditionally mixed into hot salted noon chai at breakfast or with the evening tea.",
            "A spoonful goes into the cup, she says, and makes the tea filling. Her written note gives no quantities for making the sott itself.",
          ],
        },
      ],
    },
  },

  phirni: {
    revised: "2026-11-19",
    source: {
      title: "Kashmiri Phirni | Ramadan Special",
      url: "https://www.youtube.com/watch?v=pWLuU1Hb9U0",
      published: "2026-02-21",
      publishedLabel: "21 February 2026",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for Kashmiri phirni: her ingredients, quantities and order of work, in our own words.",
      note: "Hers is made with semolina, where our earlier recipe used ground rice.",
    },
    recipe: {
      intro:
        "Kashmiri phirni: semolina cooked slowly in full-fat milk with sugar, coconut, almonds and raisins, set in earthen bowls under roasted poppy seeds. This is Dr Rukhsaar Sayeed's recipe, the one she makes for Ramadan.",
      servings: "",
      ingredients: [
        "1.5 litres full-fat milk",
        "½ cup semolina (suji)",
        "½ cup sugar, or to taste",
        "2–3 tbsp dried coconut, thinly sliced",
        "2 tbsp almonds, chopped",
        "1 tbsp raisins",
        "1 tbsp melon seeds",
        "2 tbsp poppy seeds",
        "Earthen bowls, for setting",
      ],
      instructions: [
        "Soak the semolina in a little of the milk for 10–15 minutes.",
        "Boil the rest of the milk and let it reduce a little, about 10 minutes.",
        "Add the coconut, almonds, raisins and melon seeds, the sugar and the soaked semolina.",
        "Cook on a low heat, stirring continuously, until slightly thick but still pourable.",
        "Dry-roast the poppy seeds in a separate pan.",
        "Pour the phirni into the earthen bowls and top with the poppy seeds.",
        "Leave it to cool completely; it thickens and turns creamy as it cools.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: [
        "Soak the semolina first: it prevents lumps.",
        "Cook it low and slow, and stop while it is still pourable. It thickens as it cools.",
        "She counts the earthen bowls and the poppy seeds as part of the dish.",
      ],
      commonMistakes: [],
      homeAdaptation: "",
    },
  },

  "masala-tsot": {
    revised: "2026-11-19",
    source: {
      title: "Masaal Tchot | Iconic Kashmiri Street Food",
      url: "https://www.youtube.com/watch?v=pfhnrhjDywQ",
      published: "2025-04-16",
      publishedLabel: "16 April 2025",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for masala tsot: her ingredients, quantities and order of work, in our own words.",
      note: "Her method names cumin and coriander powders where her ingredient list has cumin seeds and fresh coriander; we have followed the list.",
    },
    recipe: {
      intro:
        "Masala tsot is a Kashmiri street wrap: a soft lavasa spread with radish-and-onion chutney and a thick paste of boiled white peas, then rolled. This is Dr Rukhsaar Sayeed's recipe; she notes that it uses no oil.",
      ingredients: [
        "For the pea paste: 1 cup dried white peas (safed matar)",
        "Salt, to taste",
        "Water, for boiling",
        "For the chutney: 1 cup grated radish (mooli)",
        "½ cup finely chopped onion",
        "1–2 green chillies, finely chopped",
        "1 tsp cumin seeds",
        "½ tsp red chilli powder",
        "A handful of fresh coriander",
        "2–3 tbsp yogurt",
        "Salt, to taste",
        "To assemble: Kashmiri lavasa or any soft roti",
      ],
      instructions: [
        "Rinse the peas and soak them overnight.",
        "Drain them and pressure-cook with a pinch of salt and enough water until soft. Dry off any water that is left and mash the peas to a smooth, thick paste.",
        "For the chutney, mix the grated radish, onion and green chillies with the salt, cumin, chilli powder, coriander and yogurt.",
        "Lay a lavasa flat and spread it generously with chutney, then with a layer of the pea paste. Add another spoonful of chutney on top if you like it hot.",
        "Roll it up tightly and serve at once.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: ["Dry the cooked peas well before mashing, so the paste is thick.", "Serve as soon as it is rolled."],
      commonMistakes: [],
      homeAdaptation: "",
    },
  },

  basrakh: {
    revised: "2026-11-19",
    source: {
      title: "Basrakh",
      url: "https://www.youtube.com/watch?v=WBKtEpGKJMY",
      published: "2024-11-08",
      publishedLabel: "8 November 2024",
      credit:
        "This recipe follows Dr Rukhsaar Sayeed's recipe for basrakh: her ingredients, quantities and order of work, in our own words.",
      note: "Her video was made with an oil brand, which we have left out. The powdered sugar and the salt are in her ingredient list and not in her method; we add them with the flour.",
    },
    recipe: {
      intro:
        "Basrakh is a Kashmiri festive sweet: a stiff ghee dough shaped into small bowls, fried slowly until crisp and dipped in cardamom sugar syrup. This is Dr Rukhsaar Sayeed's recipe.",
      servings: "",
      ingredients: [
        "For the dough: 2 cups all-purpose flour (maida)",
        "½ cup ghee",
        "1 tsp cardamom powder",
        "2 tbsp powdered sugar",
        "A pinch of salt",
        "¼ cup water, or as needed",
        "Oil, for deep-frying",
        "For the syrup: 1 cup sugar",
        "1 cup water",
        "½ tsp cardamom powder",
        "A few saffron strands, optional",
        "Dry fruits of your choice, to finish",
      ],
      instructions: [
        "Mix the flour, powdered sugar, salt and cardamom, and rub in the ghee until the mixture looks like breadcrumbs.",
        "Add the water a little at a time and knead to a stiff dough. Rest it for at least 30 minutes.",
        "Divide the dough into small balls, or roll it out about ¼ inch thick, and shape the pieces into small bowls.",
        "Fry on a low to medium heat until golden brown and crisp. Drain and leave to cool completely.",
        "Boil the sugar, water, saffron and cardamom and simmer to a one-string syrup.",
        "Dip the fried basrakh in the warm syrup to coat them, leave them in it for a minute, then set them on a plate and top with dry fruits.",
        "Let them cool completely: the syrup hardens to a crunchy coating. They keep in an airtight container for up to a week.",
      ],
      tipsTitle: "Dr Sayeed's tips",
      wazaTips: [
        "Rub the ghee in until the flour looks like breadcrumbs before any water goes in.",
        "Fry slowly, and cool the basrakh completely before the syrup.",
        "The syrup is ready at one-string consistency.",
      ],
      commonMistakes: [],
      homeAdaptation: "",
    },
  },

  // ---------------------------------------------------------------------------------------------
  // Her recipes added as variations: a different take on the dish, or a dish we have no page for.
  // The stored recipe stays, and the credit says so.
  // ---------------------------------------------------------------------------------------------

  gushtaba: {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The chicken version comes from Dr Rukhsaar Sayeed's home recipe and is told in our own words. The mutton recipe above it is our own and is not from her video.",
    },
    recipe: {
      variations: [
        {
          title: "With chicken: Dr Sayeed's home-style gushtaba",
          source: { title: "Home Style Kashmiri Goshtabé", url: "https://www.youtube.com/watch?v=ToS3WQsY0Ew", published: "2026-08-03", publishedLabel: "3 August 2026" },
          paragraphs: [
            "Dr Rukhsaar Sayeed makes a lighter gushtaba at home with chicken, which she presents as her own take on the dish.",
            "For the meatballs she blends 500 g boneless chicken with 70 g rendered and cooled mutton fat (or ghee), 1 tsp salt, the seeds of 1 black cardamom pod, 1 tsp cumin seeds and 8–10 ice cubes to a smooth, sticky paste, shapes it into balls and cooks them in boiling water, keeping 2 cups of the stock.",
            "For the gravy, 500 g yogurt is whisked with 1 egg or 2 tbsp gram flour and cooked, whisking all the time, until it boils. In go 1 black and 2 green cardamom pods, a small stick of cinnamon, 2 cloves, 1 tsp cumin seeds, ½ tsp each of fennel and dry ginger powder, 1 tbsp ginger-garlic paste, 1 tbsp oil and salt. When it has thickened a little she adds the meatballs, the stock, 2 tbsp fried-shallot paste, ½ tsp mint powder and 1 tbsp ghee, covers the pot and simmers it for a few minutes. Her advice is to keep the chicken, fat and grinder cold, and to use mutton fat for the Wazwan flavour.",
          ],
        },
      ],
    },
  },

  "wazwan-mushroom-guchhi-yakhni": {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The quick mushroom curry comes from Dr Rukhsaar Sayeed's home recipe and is told in our own words. The morel recipe above it is our own and is not from her video.",
    },
    recipe: {
      variations: [
        {
          title: "With ordinary mushrooms: Dr Sayeed's quick curry",
          source: { title: "Kashmiri Wazwan Mushroom Curry", url: "https://www.youtube.com/watch?v=HvNDwOuymvY", published: "2026-01-31", publishedLabel: "31 January 2026" },
          paragraphs: [
            "Dr Rukhsaar Sayeed's Wazwan-style mushroom curry uses canned or fresh button mushrooms and takes about 15 minutes.",
            "She whisks 1 cup of yogurt with 2–3 green cardamom pods, a small stick of cinnamon, 3–4 cloves and 1 tbsp gram flour over a high flame until it boils and thickens a little, and sets it aside.",
            "In another pan 2 medium onions, thinly sliced, are fried golden in 2–3 tbsp oil. In goes 1 cup of mushrooms (halved, if fresh), then salt, a pinch of turmeric and red chilli, coriander, cumin, fennel and dry ginger powders to taste. The yogurt is poured in and cooked until the oil starts to separate, and the curry is finished with 1 tsp dried mint and fresh coriander.",
          ],
        },
      ],
    },
  },

  "waza-kokur": {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The pot-roasted chicken and the dum kokur come from Dr Rukhsaar Sayeed's home recipes and are told in our own words. The recipe above them is our own and is not from her videos.",
      note: "Her video was made with a spice brand, which we have left out.",
    },
    recipe: {
      variations: [
        {
          title: "Dr Sayeed's Wazwan-style pot-roasted chicken",
          source: { title: "Wazwan Pot-Roasted Chicken", url: "https://www.youtube.com/watch?v=yBZlyvULnbI", published: "2024-10-31", publishedLabel: "31 October 2024" },
          paragraphs: [
            "Dr Rukhsaar Sayeed's home version of the feast's chicken is boiled in its marinade, then battered and fried until crisp.",
            "500 g of chicken pieces, cut deeply, are marinated for at least 2 hours, or overnight, in ½ cup white vinegar with 2 tbsp ginger-garlic paste, 2 tbsp red chilli powder, ½ tsp turmeric, 1 tbsp fennel powder, 1 tsp cumin powder, 1 tbsp coriander powder, 1 tbsp meat masala, ½ tsp dry ginger powder and salt.",
            "The chicken is boiled in the marinade for about 15 minutes, until four-fifths cooked, then coated in a thick batter of the same spice mixture with ½–1 cup of cornflour and deep-fried in batches until golden and crisp, 5–7 minutes a piece.",
          ],
        },
        {
          title: "Dum kokur, the home dish she calls a lost recipe",
          source: { title: "Lost Kashmiri Recipe - Dum Kokur", url: "https://www.youtube.com/watch?v=lbFfR1230uU", published: "2026-08-20", publishedLabel: "20 August 2026" },
          paragraphs: [
            "Dr Rukhsaar Sayeed gives the name dum kokur to a home dish she calls a lost Kashmiri recipe: once made in Kashmiri homes, she says, and now almost forgotten. The chicken is cooked on dum with yogurt, saffron and mint and finished with a little honey.",
            "750 g of chicken is marinated for at least 2 hours, and preferably overnight, in 2 cups of thick whisked yogurt and ¼ cup of saffron milk with 1 tbsp ginger-garlic paste, 2 handfuls of chopped fresh mint, 4–5 chopped green chillies, 2 tbsp Kashmiri chilli powder, ½ tsp turmeric, ½ tsp fennel powder, 1 tbsp coriander powder, salt and 2 tbsp mustard or cooking oil.",
            "In a deep, heavy pan, 1 tsp cumin seeds, 3–4 green cardamom pods, 1 black cardamom pod, 3–4 cloves and a small stick of cinnamon go into hot oil, then 2 thinly sliced onions, fried golden brown, and 1 tbsp ginger-garlic paste. The marinated chicken is added and brought to the boil, with 1 tsp dried fenugreek leaves and ½–1 tsp chilli flakes. It is covered and cooked on a low heat until the chicken is done, the gravy thick and the oil separating, and 1–2 tsp of honey is stirred in at the end.",
          ],
        },
      ],
    },
  },

  "seekh-kebab": {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The two kebab variations on this page come from Dr Rukhsaar Sayeed's videos and are told in our own words: her home method without a grill, and the lahabi kabab a waza makes in her Wazwan series. The main recipe is our own and is not from her videos.",
    },
    recipe: {
      variations: [
        {
          title: "Without a grill or skewers: Dr Sayeed's home method",
          source: { title: "Kashmiri Seekh Kababs | No-Oven | No-Seekh", url: "https://www.youtube.com/watch?v=AEIPLYnZv-g", published: "2025-01-16", publishedLabel: "16 January 2025" },
          paragraphs: [
            "Kashmiri kababs need coals, a grill and skewers, Dr Rukhsaar Sayeed says, and this is her way of making them in a kitchen that has none of the three.",
            "250 g boneless mutton, with 25–30 per cent fat, is chopped fine on a board with 1½ tbsp chilli powder, 2 tsp fennel, 1 tsp dry ginger powder, 1 tsp black cardamom powder, ½ tsp black pepper and salt. 1 tbsp cumin seeds, a handful of chopped coriander and 1 egg are mixed in, and the mince rests in the freezer for at least 30 minutes.",
            "She folds skewers out of thick aluminium foil, as the video shows, shapes the mince on to them with wet hands, and lays them across a smoking-hot pan so that the meat does not touch it. They cook on a high flame for 10–15 minutes, turned all the time. If there is no fat, she says, add ghee and never oil.",
          ],
        },
        {
          title: "Lahabi kabab, the boat-shaped kebab of the feast",
          source: { title: "Wazwan Special Lahbi Kabab", url: "https://www.youtube.com/watch?v=bSeT6k2brWs", published: "2026-10-22", publishedLabel: "22 October 2026" },
          paragraphs: [
            "Lahabi, or lahabdar, kabab is a Wazwan kebab shaped like a boat and cooked in gravy. Dr Sayeed learnt it from the waza at her sister's wedding.",
            "500 g boneless mutton is chopped fine with salt and 1 tbsp red chilli powder and passed through a mincer once or twice. 1 egg, ½ tbsp dried mint, ½ tbsp turmeric and ½ tbsp cumin seeds are added, and it is minced again until smooth, then shaped by hand into boats.",
            "1 litre of mutton stock is boiled with ½ tbsp turmeric and 1 tbsp red chilli powder. The kebabs go in, followed by 2–3 cloves, 1 tbsp garlic paste, 3–4 green cardamom pods, ¼ tbsp dry ginger powder, 1–2 tbsp ghee, ½ cup whisked curd and a little onion or shallot paste to thicken. They simmer until the gravy is thick and the ghee separates.",
          ],
        },
      ],
    },
  },

  czochworu: {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The pressure-cooker method comes from Dr Rukhsaar Sayeed's home recipe and is told in our own words. The oven recipe above it is our own and is not from her video.",
    },
    recipe: {
      variations: [
        {
          title: "Without an oven: in a pressure cooker",
          source: { title: "Chochwur in a Cooker | Kashmiri Styled Bagels", url: "https://www.youtube.com/watch?v=vsk26vK1VY0", published: "2025-01-09", publishedLabel: "9 January 2025" },
          paragraphs: [
            "Czochworu is baked by the kandur in a tandoor. Dr Rukhsaar Sayeed bakes it at home on the hot wall of a pressure cooker.",
            "Her dough is 1½ cups flour, 1 tsp instant yeast and 1 tsp sugar frothed in ½ cup warm water, ½ tsp salt and 1 tbsp oil or melted butter, left to double for 1–1½ hours. Without knocking it back she shapes it into rings, boils each for 30–60 seconds a side in water with sugar and baking soda, brushes them with milk and scatters sesame or poppy seeds over.",
            "For the baking she takes the gasket and the whistle off the cooker's lid, heats the empty cooker for 10 minutes and sprinkles salt water inside. Each ring is wetted underneath and stuck to the inside of the cooker, covered with the lid and cooked for 2–3 minutes; then the cooker is turned over the flame for 5–7 minutes, until the bread has golden spots on both sides.",
          ],
        },
      ],
    },
  },

  girda: {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The pressure-cooker method comes from Dr Rukhsaar Sayeed's home recipe and is told in our own words. The recipe above it is our own and is not from her video.",
    },
    recipe: {
      variations: [
        {
          title: "Without an oven: girda in a pressure cooker",
          source: { title: "Kashmiri Roti Without Oven", url: "https://www.youtube.com/watch?v=bd83bh3f9Tg", published: "2024-11-26", publishedLabel: "26 November 2024" },
          paragraphs: [
            "Dr Rukhsaar Sayeed makes girda at home without yeast or an oven, on the hot wall of a pressure cooker.",
            "1 cup flour is mixed with ¼ tsp baking soda, ½ tsp sugar and ½ tsp salt, then kneaded with 3 tbsp curd and warm water to a soft dough; 1 tbsp oil is worked in for 5–7 minutes and the dough rests for an hour under a damp cloth. It makes 4–5 thick discs, pressed in the middle with the fingertips to give the bread its dimples.",
            "The cooker is used as for her czochworu: gasket and whistle off, heated empty for 10 minutes, salt water sprinkled inside. Each girda is wetted underneath and stuck to the inside, covered and cooked for 2–3 minutes, then the cooker is turned over the flame for 5–7 minutes until the bread has golden spots. She brushes them with butter or ghee.",
          ],
        },
      ],
    },
  },

  "kashmiri-kahwa": {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The four kehwas and the winter premix that end the recipe come from Dr Rukhsaar Sayeed's videos and are told in our own words. The main recipe is our own and is not from her videos.",
    },
    recipe: {
      variations: [
        {
          title: "Four kehwas, as Dr Sayeed makes them",
          source: { title: "4 Authentic Kashmiri Kehwas", url: "https://www.youtube.com/watch?v=6Uyso2tSCrw", published: "2025-01-13", publishedLabel: "13 January 2025" },
          paragraphs: [
            "Dr Rukhsaar Sayeed says recipes online muddle the kehwas together, and she keeps four apart. Each of hers makes two cups.",
            "Kong kehwa, the saffron one, has no tea in it: 6–8 saffron strands are soaked in 2 tbsp hot water for 5 minutes; 2 cups of water are boiled with 2 pounded cardamom pods; the saffron and sugar or honey go in, and it simmers for 2–3 minutes and is served with almond slivers. Dodh kehwa is the same made with milk: 2 cups boiled with the saffron and cardamom, sweetened and simmered for 5 minutes.",
            "Mulethi, or shangri, kehwa is 1 tsp liquorice root, 1 tsp sepistan and a small piece of cinnamon, lightly pounded, boiled in 2 cups of water with sugar for 8–10 minutes and strained. The green tea kehwa, dum tyoth, is 2 cups of water boiled with a small stick of cinnamon and sugar, then simmered for 3–4 minutes with 1 tsp green tea or noon chai leaves and strained.",
          ],
        },
        {
          title: "A winter kehwa premix",
          source: { title: "Winter Kehwa Premix", url: "https://www.youtube.com/watch?v=um4m_kZvM-s", published: "2025-12-06", publishedLabel: "6 December 2025" },
          paragraphs: [
            "Dr Sayeed also keeps a ground mix for winter, which she describes as a traditional blend in the Ayurvedic and Unani manner, made from whole spices and herbs.",
            "It is equal weights, 50 g each, of eight things, in her names for them: shanger, sonth (dried ginger), Bombay chai mix (a green tea), sapistaan (lisoda), black pepper, cinnamon, green cardamom and dried rose petals. They are cleaned and dried if they need it, ground coarse or fine, mixed and stored in an airtight jar.",
            "To use it, ½ tsp of the mix is boiled in 1 cup of water for 5–7 minutes, strained, sweetened with honey and drunk warm.",
          ],
        },
      ],
    },
  },

  "muji-chetin": {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "The walnut and onion chutneys on this page come from Dr Rukhsaar Sayeed's Wazwan series and are told in our own words. The radish chutney is our own and is not from her videos.",
    },
    recipe: {
      variations: [
        {
          title: "Doon chetin, the walnut chutney",
          source: { title: "Wazwan Doon Chetin | Walnut Chutney", url: "https://www.youtube.com/watch?v=drbWTbMebBU", published: "2026-10-24", publishedLabel: "24 October 2026" },
          paragraphs: [
            "The walnut chutney served at Kashmiri weddings has radish in it too, as Dr Sayeed shows in her Wazwan series.",
            "1 cup of soaked walnuts is chopped fine. Half a radish, half an onion and 3–4 green chillies are ground to a fine paste. ½ cup of thick curd is whisked with a little water until smooth, and the walnuts, the paste, salt and ½ tbsp cumin seeds are stirred in.",
          ],
        },
        {
          title: "Gande chetin, the onion chutney",
          source: { title: "Wazwan Onion Chutney", url: "https://www.youtube.com/watch?v=OFubII7Jmt4", published: "2026-11-02", publishedLabel: "2 November 2026" },
          paragraphs: [
            "The onion chutney of the feast is sharp, hot and sour, and by her account helps a heavy meal go down. This quantity serves six to eight.",
            "4 large onions are sliced thin and 8–10 green chillies chopped fine. Both are washed well in a large bowl, strained and squeezed dry. ¼ cup vinegar, 1 tsp cumin seeds, 2 tbsp red chilli powder and 1–1½ tsp salt are massaged in by hand, and the chutney rests for 15–20 minutes before it is served. An earlier home version of hers adds fresh coriander and mint.",
          ],
        },
      ],
    },
  },

  "nadur-monji": {
    revised: "2026-11-19",
    source: {
      scope: "variation",
      credit:
        "Nadre churme, which she calls her own version, and the nadru chaat, which is her own idea, come from Dr Rukhsaar Sayeed's recipes and are told in our own words. The recipe above them is our own and is not from her videos.",
    },
    recipe: {
      variations: [
        {
          title: "Another lotus-stem snack: nadre churme",
          source: { title: "Nadre Churme | Kashmiri Fries with Nadru", url: "https://www.youtube.com/watch?v=YebB_FKHwkk", published: "2025-08-02", publishedLabel: "2 August 2025" },
          paragraphs: [
            "Nadre churme are crushed, fried pieces of lotus stem tossed in a sour, hot spice mix. This is Dr Rukhsaar Sayeed's version.",
            "2–3 cleaned lotus stems are cut into large pieces and crushed gently, without mashing them. They can be tossed with 1–2 tbsp rice flour or cornflour and salt for extra crispness, or fried as they are, and are deep-fried until golden and crisp.",
            "The spice mix is ½ tsp salt, 1 tsp chaat masala and ½ tsp each of red chilli powder, coriander powder, roasted cumin powder and dried mint. It is sprinkled over the hot churme with a squeeze of lemon, and they are served at once.",
          ],
        },
        {
          title: "Dr Sayeed's nadru chaat",
          source: { title: "Kashmiri Style Chaat", url: "https://www.youtube.com/watch?v=6pD94tdZ7Zw", published: "2025-11-01", publishedLabel: "1 November 2025" },
          paragraphs: [
            "This chaat is Dr Sayeed's own, one she says you will not have seen before: crisp slices of lotus stem take the place of papdi, over yogurt with saffron and caramelised onion, a pomegranate chutney and a walnut and mint chutney.",
            "For the yogurt, a medium onion, thinly sliced, is caramelised until golden with a pinch of salt in 1 tsp ghee or oil and folded into 1 cup of thick whisked yogurt with 2 pinches of saffron; her list allows ½ tsp salt in all, and ½ tsp sugar if liked. For the pomegranate chutney, ½ cup of juice is simmered until slightly thick, then 1 tbsp jaggery or sugar, ½ tsp each of Kashmiri chilli powder, roasted cumin powder and fennel powder, and salt go in; it is cooked to a syrup and cooled. The walnut chutney is ¼ cup walnuts, ½ cup coriander leaves, ¼ cup mint leaves, 1–2 green chillies, 1 tbsp lemon juice, 2 tbsp yogurt, salt and 2–3 tbsp water, blended smooth.",
            "One medium lotus stem is sliced paper-thin and coated with 2 tbsp cornflour, ½ tsp Kashmiri chilli powder, ½ tsp dried mint powder, salt and 1–2 tbsp of water, then fried until crisp and golden. To serve, the saffron yogurt is spread on a plate, both chutneys go over it, then the crisp nadru, and it is finished with pomegranate seeds, thin slices of apple or pear and mint leaves, and eaten at once.",
          ],
        },
      ],
    },
  },
};

/** The revision for a dish, or undefined. */
export const recipeRevisionFor = (slug) => (slug ? RECIPE_REVISIONS[slug] : undefined);
