import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Dish } from "../models/Dish.js";
import fs from "fs";
import path from "path";

dotenv.config();

function getProposedClassification(dish) {
  const name = dish.name;
  
  // Specific renames and classifications
  if (name === "Aab Gosh" || name === "Aab Gosht") {
    return { name: "Aab Gosht", categoryType: "wazwan", courseType: "signature" };
  }
  if (name === "Yakhin" || name === "Yakhni") {
    return { name: "Yakhni", categoryType: "wazwan", courseType: "signature" };
  }
  if (name === "Dum Aelve" || name === "Dum Oluv") {
    return { name: "Dum Oluv", categoryType: "wazwan", courseType: "vegetarian" };
  }
  if (name === "Waza Haak" || name === "Haakh") {
    return { name: "Haakh", categoryType: "wazwan", courseType: "vegetarian" };
  }
  if (name === "Seekh Kabab" || name === "Seekh Kebab") {
    return { name: "Seekh Kebab", categoryType: "wazwan", courseType: "foundation" };
  }
  
  // Kahwa and Noon Chai renames
  if (name === "Kahwa" || name === "Kahwa (Beverage)") {
    return { name: "Kahwa (Beverage)", categoryType: "beverage", courseType: undefined };
  }
  if (name === "Kashmiri Kahwa") {
    return { name: "Kashmiri Kahwa", categoryType: "beverage", courseType: undefined };
  }
  if (name === "Noon Chai" || name === "Noon Chai (Beverage)") {
    return { name: "Noon Chai (Beverage)", categoryType: "beverage", courseType: undefined };
  }
  if (name === "Ginger Noon Chai" || name === "Noon Chai (Home Style)") {
    return { name: "Noon Chai (Home Style)", categoryType: "kashmiri_cuisine", courseType: undefined };
  }

  // Breads / Bakery
  const bakeryNames = [
    "bakerkhani", "czochworu", "girda", "girda / tsot", "lavas", "kulcha", "roth", 
    "roth bread", "roath sweet", "sheermal", "ghihev bread", "masala tsot", 
    "keema tsot", "kashmiri naan"
  ];
  if (bakeryNames.includes(name.toLowerCase())) {
    return { name, categoryType: "bakery", courseType: undefined };
  }

  // Beverages
  const beverageNames = [
    "saffron kahwa", "cardamom kahwa", "babribyol", "zamut doodh"
  ];
  if (beverageNames.includes(name.toLowerCase())) {
    return { name, categoryType: "beverage", courseType: undefined };
  }

  // Authoritative Wazwan list (dishes that do not require renaming)
  const wazwanMap = {
    "methi maaz": "foundation",
    "tabak maaz": "foundation",
    "muji chetin": "foundation",
    "rista": "signature",
    "rogan josh": "signature",
    "daniwal korma": "signature",
    "marchwangan korma": "signature",
    "gushtaba": "signature",
    "nadru yakhni": "vegetarian"
  };

  const lowerName = name.toLowerCase();
  if (wazwanMap[lowerName]) {
    return { name, categoryType: "wazwan", courseType: wazwanMap[lowerName] };
  }

  // All other dishes go to kashmiri_cuisine
  return { name, categoryType: "kashmiri_cuisine", courseType: undefined };
}

async function run() {
  await connectDB();
  const dishes = await Dish.find().sort({ name: 1 });
  console.log(`Auditing ${dishes.length} dishes from database...`);

  const auditRows = [];
  const counts = {
    wazwan: 0,
    kashmiri_cuisine: 0,
    bakery: 0,
    beverage: 0
  };

  // Add the 2 proposed NEW dishes to wazwan count for validation
  counts.wazwan += 2;
  auditRows.push({
    originalName: "[NEW ITEM]",
    proposedName: "Rice",
    currentCategory: "N/A",
    proposedCategoryType: "wazwan",
    proposedCourseType: "foundation"
  });
  auditRows.push({
    originalName: "[NEW ITEM]",
    proposedName: "Aloo Bukhar Korma",
    currentCategory: "N/A",
    proposedCategoryType: "wazwan",
    proposedCourseType: "signature"
  });

  for (const dish of dishes) {
    const proposed = getProposedClassification(dish);
    counts[proposed.categoryType]++;
    
    auditRows.push({
      originalName: dish.name,
      proposedName: proposed.name,
      currentCategory: dish.category,
      proposedCategoryType: proposed.categoryType,
      proposedCourseType: proposed.courseType || "N/A"
    });
  }

  console.log("\n--- VALIDATION COUNTS ---");
  console.log(`wazwan: ${counts.wazwan}`);
  console.log(`kashmiri_cuisine: ${counts.kashmiri_cuisine}`);
  console.log(`bakery: ${counts.bakery}`);
  console.log(`beverage: ${counts.beverage}`);
  console.log(`total: ${dishes.length + 2}`);
  console.log("-------------------------\n");

  const validationPassed = counts.wazwan === 16;
  console.log(`Validation Passed (wazwan === 16): ${validationPassed ? "YES" : "NO"}`);

  // Generate markdown report content
  let mdContent = `# Classification Audit Report: Wazwan Data Restructuring

This report displays the current and proposed classifications for all ${dishes.length} dishes in the database.

## Validation Status
* **Wazwan Dishes Count**: **${counts.wazwan}** ${validationPassed ? "(PASS - Exactly 16)" : "(FAIL - Must be exactly 16)"}
* **Kashmiri Cuisine Count**: **${counts.kashmiri_cuisine}**
* **Kandur Bakery Count**: **${counts.bakery}**
* **Beverages Count**: **${counts.beverage}**
* **Total Dishes**: **${dishes.length + 2}**

---

## Detailed Classification Audit Table

| Dish Name (Original) | Proposed Name | Current Category | Proposed categoryType | Proposed courseType |
|---|---|---|---|---|
`;

  for (const row of auditRows) {
    mdContent += `| **${row.originalName}** | ${row.proposedName !== row.originalName ? `*${row.proposedName}*` : row.proposedName} | ${row.currentCategory} | \`${row.proposedCategoryType}\` | \`${row.proposedCourseType}\` |\n`;
  }

  const reportPath = "C:/Users/nasir/.gemini/antigravity-ide/brain/72c5356d-4e18-4f91-9013-25d86a3bafa3/classification_audit_report.md";
  fs.writeFileSync(reportPath, mdContent);
  console.log(`\nSuccessfully wrote classification audit report to: ${reportPath}`);

  process.exit(0);
}

run().catch(console.error);
