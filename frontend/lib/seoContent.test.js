import { describe, expect, it } from "vitest";
import { dishCategoryLabel, isGeneratedDishText, sanitizeDish } from "./dishContent";
import {
  hasWrittenDestinationContent,
  isGeneratedAttraction,
  isGeneratedDestinationText,
  sanitizeDestination,
} from "./destinationContent";
import {
  DESTINATION_PLACEHOLDER,
  DISH_PLACEHOLDER,
  isPlaceholderImage,
  resolveContentImage,
  resolveContentPhoto,
} from "./contentImages";
import { markdownSummary, toMetaDescription } from "./metaText";
import DISH_TEXT_CORRECTIONS from "../data/dishTextCorrections.json";

describe("dishContent", () => {
  const templated = {
    name: "Cardamom Kahwa",
    category: "Beverages",
    description: "A traditional Kashmiri veg dish prepared in the authentic Cafes style.",
    fullDescription:
      "Cardamom Kahwa is a renowned culinary offering from Kashmir. Made with traditional spices and cooking methods, this veg item delivers the deep flavor profile typical of Cafes cuisine.",
    history:
      "The history of Cardamom Kahwa stretches back generations, drawing deep influences from local traditions and Central Asian culinary pathways.",
    touristTip:
      "When ordering Cardamom Kahwa, pair it with warm steamed rice or traditional local bread like Lavas. Ask your hosts about the specific spices used to enhance the flavor.",
    recipe: { intro: "Kashmiri green tea brewed light and gold with crushed green cardamom." },
  };

  it("detects each seed-script template", () => {
    expect(isGeneratedDishText(templated.description)).toBe(true);
    expect(isGeneratedDishText(templated.fullDescription)).toBe(true);
    expect(isGeneratedDishText(templated.history)).toBe(true);
    expect(isGeneratedDishText(templated.touristTip)).toBe(true);
    expect(isGeneratedDishText("Slow-cooked lamb in a Kashmiri chilli gravy.")).toBe(false);
  });

  it("replaces boilerplate with the hand-written recipe intro and drops the rest", () => {
    const dish = sanitizeDish(templated);
    expect(dish.description).toBe(templated.recipe.intro);
    expect(dish.fullDescription).toBe(templated.recipe.intro);
    expect(dish.history).toBe("");
    expect(dish.touristTip).toBe("");
  });

  it("keeps real copy untouched", () => {
    const real = { name: "Rogan Josh", description: "Lamb braised in Kashmiri chilli.", history: "A Persian-rooted dish." };
    expect(sanitizeDish(real)).toMatchObject(real);
  });

  it("corrects known-wrong stored text until the record itself is fixed", () => {
    const fix = (field) => DISH_TEXT_CORRECTIONS["kashmiri-harissa"].find((c) => c.field === field);
    const stored = {
      slug: "kashmiri-harissa",
      history: fix("history").from,
      touristTip: fix("touristTip").from,
      recipe: {
        intro: "Srinagar's winter breakfast.",
        significance: `Sold ${fix("recipe.significance").from}.`,
        servingSuggestions: `It is ${fix("recipe.servingSuggestions").from}.`,
      },
    };
    const dish = sanitizeDish(stored);
    expect(dish.history).toBe(fix("history").to);
    expect(dish.touristTip).toBe(fix("touristTip").to);
    expect(dish.recipe.significance).toBe(`Sold ${fix("recipe.significance").to}.`);
    expect(dish.recipe.servingSuggestions).toBe(`It is ${fix("recipe.servingSuggestions").to}.`);
    expect(stored.recipe.significance).toBe(`Sold ${fix("recipe.significance").from}.`);

    const editedByHand = { ...stored, history: "Rewritten by an editor." };
    expect(sanitizeDish(editedByHand).history).toBe("Rewritten by an editor.");
    expect(sanitizeDish({ ...stored, slug: "rogan-josh" }).history).toBe(fix("history").from);
  });

  it("labels categories without repeating 'Kashmiri'", () => {
    expect(dishCategoryLabel("Kashmiri Cuisine")).toBe("Kashmiri Dish");
    expect(dishCategoryLabel("Beverages")).toBe("Kashmiri Drink");
    expect(dishCategoryLabel(undefined)).toBe("Kashmiri Dish");
  });
});

describe("destinationContent", () => {
  const templated = {
    name: "Achabal",
    location: "South Kashmir, Anantnag",
    description: "A breathtaking destination in South Kashmir, Anantnag famous for its natural landscapes and local hospitality.",
    fullDescription:
      "Achabal stands as a premier tourist attraction in the Kashmir valley. Located in South Kashmir, Anantnag, it offers visitors spectacular panoramic views, rich cultural landmarks, and a serene getaway.",
    attractions: ["Achabal Scenic Point", "Historic Local Market in Achabal", "Traditional Food Street of Achabal"],
  };

  it("removes generated descriptions and invented attractions", () => {
    const d = sanitizeDestination(templated);
    expect(d.description).toBe("");
    expect(d.fullDescription).toBe("");
    expect(d.attractions).toEqual([]);
    expect(hasWrittenDestinationContent(d)).toBe(false);
    expect(isGeneratedDestinationText(templated.description)).toBe(true);
    expect(isGeneratedAttraction("Historic Local Market in Gulmarg")).toBe(true);
  });

  it("keeps real attractions and treats real planning fields as written content", () => {
    const real = sanitizeDestination({
      name: "Aharbal Waterfall",
      description: "Known as the Niagara Falls of Kashmir.",
      attractions: ["Aharbal Waterfall", "Veshu River"],
    });
    expect(real.attractions).toEqual(["Aharbal Waterfall", "Veshu River"]);
    expect(hasWrittenDestinationContent(real)).toBe(true);
    const planning = sanitizeDestination({ ...templated, travelAdvisory: "Gondola closes in high wind." });
    expect(hasWrittenDestinationContent(planning)).toBe(true);
  });
});

describe("contentImages", () => {
  it("maps missing files to a verified photo of the same subject", () => {
    expect(resolveContentImage("/images/dishes/gushtaba.jpg")).toBe("/images/scroll/GUSHTABA.png");
  });

  it("falls back to the folder placeholder for other missing files", () => {
    expect(resolveContentImage("/images/dishes/not-a-real-file.jpg")).toBe(DISH_PLACEHOLDER);
    expect(resolveContentImage("/images/destinations/Sinthan_Top.jpg")).toBe(DESTINATION_PLACEHOLDER);
    expect(isPlaceholderImage(DISH_PLACEHOLDER)).toBe(true);
    expect(resolveContentPhoto("/images/dishes/not-a-real-file.jpg")).toBeNull();
  });

  it("is case-sensitive and leaves existing and external images alone", () => {
    expect(resolveContentImage("/images/destinations/gulmarg.png")).toBe("/images/destinations/gulmarg.png");
    expect(resolveContentImage("/images/Destinations/gulmarg.png")).toBe("/images/Destinations/gulmarg.png");
    expect(resolveContentImage("https://example.com/x.jpg")).toBe("https://example.com/x.jpg");
    expect(resolveContentImage(undefined)).toBeUndefined();
  });
});

describe("toMetaDescription", () => {
  it("keeps short text and trims long text at a sentence or word boundary", () => {
    expect(toMetaDescription("Short text.")).toBe("Short text.");
    const long = `${"Kashmiri green tea brewed light and gold with crushed green cardamom and cinnamon. ".repeat(3)}`;
    const out = toMetaDescription(long);
    expect(out.length).toBeLessThanOrEqual(158);
    expect(out.endsWith(".") || out.endsWith("…")).toBe(true);
  });
});

describe("markdownSummary", () => {
  it("uses the first real paragraph and strips markdown formatting", () => {
    const md = "# Title\n\n- a list item\n\nGushtaba is the **velvety** finale of the [Wazwan](/kashmiri-food), pounded by hand for hours and simmered in yogurt.\n\nMore text.";
    expect(markdownSummary(md)).toBe(
      "Gushtaba is the velvety finale of the Wazwan, pounded by hand for hours and simmered in yogurt."
    );
    expect(markdownSummary("")).toBe("");
  });
});
