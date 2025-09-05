// app/(views)/(protected)/admin/categories/page.tsx
export default function AdminCategoriesPage() {
  const categories = [
    { id: "c1", name: "Plomería" },
    { id: "c2", name: "Electricidad" },
    { id: "c3", name: "Carpintería" },
  ];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Categorías</h1>

      <ul className="divide-y rounded-2xl border">
        {categories.map((c) => (
          <li key={c.id} className="p-4 flex items-center justify-between">
            <span>{c.name}</span>
            <button className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">
              Editar
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
