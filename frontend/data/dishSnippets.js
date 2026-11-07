/**
 * Hand-written meta descriptions for dish pages whose automatic one lost clicks.
 *
 * A dish page's description is normally the first 158 characters of its text, cut at a word, so
 * Google showed half a sentence ending in "…". In Search Console (3 months to 4 November 2026)
 * these pages were shown tens of thousands of times for "wazwan" and "kashmiri wazwan", mostly in
 * recipe carousels, and clicked by fewer than 1 in 200: rista 9 clicks from 7,733 impressions,
 * marchwangan korma 8 from 4,342, methi maaz 2 from 1,392, harissa 0 from 1,287, tabak maaz 4
 * from 1,127, kabargah 4 from 905; kulcha, the site's most-shown page, had a 72-character line.
 *
 * Each line says what the dish is, where it sits in the Wazwan and what the page offers, in the
 * page's own words — nothing a reader won't find on the page. Keep every line at or under 158
 * characters (lib/dishSnippets.test.js checks), and change it when the page's content changes.
 */
export const DISH_SNIPPETS = {
  rista:
    "Rista: mutton pounded by hand into smooth meatballs in a red gravy of Kashmiri chilli, fennel and saffron. Its place in the Wazwan, history and recipe.",
  "marchwangan-korma":
    "Marchwangan korma: mutton braised in a hot, dark-red gravy of Kashmiri red chillies, the last hot dish of the Wazwan. Its history, where to eat it, recipe.",
  "methi-maaz":
    "Methi maaz: tripe cooked with dried fenugreek leaves and spices, served early in the Wazwan with the tabak maaz. Its history, where to eat it and the recipe.",
  "tabak-maaz":
    "Tabak maaz: lamb ribs simmered in spiced milk, then fried in ghee until crisp. First on the trami at a Wazwan. Its history, where to eat it and the recipe.",
  kabargah:
    "Kabargah: mutton ribs simmered in milk with fennel and cardamom, then batter-fried in ghee. The Kashmiri Pandit name for tabak maaz: history and recipe.",
  "kashmiri-harissa":
    "Harissa: Srinagar's winter breakfast of mutton and rice cooked overnight to a smooth paste, sold mornings in the old city from late autumn to March.",
  "kashmiri-kulcha":
    "Kashmiri kulcha: a small, hard, crumbly biscuit topped with poppy seeds, baked by the kandur and dipped in noon chai. Sweet and savoury kinds, and the recipe.",
};
