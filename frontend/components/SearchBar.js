"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ initialValue = "", target = "/dishes" }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);

  const onSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (value) {
      params.set("search", value);
    }
    router.push(`${target}?${params.toString()}`);
  };

  return (
    <form onSubmit={onSubmit} className="glass-panel flex flex-col gap-3 rounded-[30px] p-3 shadow-card sm:flex-row">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search dishes or restaurants"
        className="min-w-0 flex-1 rounded-[22px] border border-slate-200 bg-white px-5 py-4 text-slate-800 outline-none ring-0 transition focus:border-saffron"
      />
      <button
        type="submit"
        className="rounded-[22px] bg-saffron px-6 py-4 font-semibold text-white transition hover:bg-amber-600"
      >
        Explore
      </button>
    </form>
  );
}
