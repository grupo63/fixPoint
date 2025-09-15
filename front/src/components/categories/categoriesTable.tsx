// src/components/categories/CategoriesList.tsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import {
  createCategory,
  deactivateCategory,
  default as fetchCategories,
} from "@/services/categorieServices";
import { Category } from "@/types/types";
import CreateCategoryModal from "./createCategoryModal";

export default function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar categorías");
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleDeactivate = async (id: string, status: boolean) => {
    try {
      const newStatus = status == false ? "alta" : "baja";
      setLoading(true);
      await deactivateCategory(id, status);
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: !status } : c))
      );
      toast.success(`Categoría dada de ${newStatus}`);
    } catch (err: any) {
      setError(err.message || "Error al desactivar categoría");
    } finally {
      setLoading(false);
      setOpenMenu(null);
    }
  };

  const handleCreateCategory = async (newCategory: {
    name: string;
    description: string;
  }) => {
    try {
      setLoading(true);
      const created = await createCategory(newCategory);
      setCategories((prev) => [...prev, created]);
      toast.success("Categoría creada con éxito");
      setShowModal(false);
    } catch (err: any) {
      toast.error("Error al crear categoría");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Categorías</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#ed7d31] text-white px-3 py-1.5 rounded-md text-sm hover:bg-[#b45d27]"
        >
          + Crear categoría
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left mb-10">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Categoría</th>
              <th className="px-6 py-3">Descripción</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 relative">
                <td className="px-6 py-4 text-gray-700">{category.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {category.name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {category.description}
                </td>
                <td className="px-6 py-4">
                  {category.isActive ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Activo
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === category.id ? null : category.id)
                    }
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                  >
                    <MoreHorizontal />
                  </button>

                  {openMenu === category.id && (
                    <div className="absolute right-6 mt-2 w-32 bg-white border-none rounded-lg shadow-lg z-99">
                      <button
                        onClick={() =>
                          handleDeactivate(category.id, category.isActive)
                        }
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        {category.isActive ? "Desactivar" : "Activar"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <CreateCategoryModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreateCategory}
        />
      )}
    </div>
  );
}
