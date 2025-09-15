"use client";

import { useState } from "react";

type Props = {
  onClose: () => void;
  onCreate: (data: { name: string; description: string }) => void;
};

export default function CreateCategoryModal({ onClose, onCreate }: Props) {
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h3 className="text-lg font-bold mb-4">Nueva categoría</h3>

        <input
          type="text"
          placeholder="Nombre"
          className="w-full mb-3 p-2 border rounded"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory((prev) => ({ ...prev, name: e.target.value }))
          }
        />
        <textarea
          placeholder="Descripción"
          className="w-full mb-4 p-2 border rounded"
          value={newCategory.description}
          onChange={(e) =>
            setNewCategory((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-black"
          >
            Cancelar
          </button>
          <button
            onClick={() => onCreate(newCategory)}
            className="px-4 py-2 bg-[#ed7d31] text-white rounded hover:bg-[#b45d27]"
          >
            Crear
          </button>
        </div>
      </div>
    </div>
  );
}
