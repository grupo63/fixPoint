"use client";
import * as React from "react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar…",
  className = "",
}: SearchBarProps) {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className={`w-full max-w-xl flex items-center gap-2 ${className}`}
      role="search"
      aria-label="Buscador"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-label="Ingresá tu búsqueda"
      />
      <button
        type="submit"
        className="rounded-xl border px-4 py-2 hover:bg-gray-50"
        aria-label="Buscar"
        title="Buscar"
      >
        Buscar
      </button>
    </form>
  );
}