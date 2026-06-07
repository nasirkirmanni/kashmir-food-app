import Link from "next/link";

const categories = [
  "Wazwan",
  "Street Food",
  "Cafes",
  "Budget Eats",
  "Luxury Dining"
];

export default function CategoryPills() {
  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <Link
          key={category}
          href={`/dishes?category=${encodeURIComponent(category)}`}
          className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-walnut transition hover:border-saffron hover:bg-white"
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
