import DishDetailClient from "@/components/DishDetailClient";
import fs from "fs";
import path from "path";

export async function generateStaticParams() {
  try {
    const jsonPath = path.join(process.cwd(), "dishes-static-ids.json");
    if (fs.existsSync(jsonPath)) {
      const content = fs.readFileSync(jsonPath, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read static IDs in generateStaticParams:", err);
  }
  return [];
}

export default function DishDetailPage() {
  return <DishDetailClient />;
}
