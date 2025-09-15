import CategoriesList from "@/components/categories/categoriesTable";

export default function AdminCategoriesPage() {
  return (
    <main className="flex flex-col p-6 gap-4">
      <h1 className="text-2xl font-semibold">Categorías</h1>
      <p className="text-sm text-gray-500">Listado de categorías de la app </p>
      <CategoriesList />
    </main>
  );
}
