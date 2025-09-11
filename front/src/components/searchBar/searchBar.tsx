"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const categories = [
  { value: "", label: "Todas las categorías" },
  { value: "plomero", label: "Plomero" },
  { value: "electricista", label: "Electricista" },
  { value: "carpintero", label: "Carpintero" },
  // 👉 Podés traer esto de la DB en lugar de hardcodearlo
];

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("query", query.trim());
    if (category) params.set("category", category);

    router.push(`/professionals?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="flex items-center gap-2 w-full max-w-lg"
    >
      {/* Texto */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar profesional…"
        className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
      />

      {/* Categoría */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-full border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      >
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {/* Botón */}
      <button
        type="submit"
        className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
      >
        Buscar
      </button>
    </form>
  );
}
