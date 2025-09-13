"use client";

import fetchCategories from "@/services/categorieServices";
import { updateProfessional } from "@/services/professionalService";
import { Category } from "@/types/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

type Step = 1 | 2 | 3 | 4;

export default function OnboardingProfessionalForm() {
  const [step, setStep] = useState<Step>(1);
  const [categories, setCategories] = useState<Category[]>();
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("❌ Error cargando categorías:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  console.log(categories);

  const [form, setForm] = useState({
    speciality: "",
    aboutMe: "",
    workingLocation: "",
    workingRadius: "",
  });

  const handleChange =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };
  const nextStep = () => setStep((s) => Math.min(s + 1, 4) as Step);

  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // const res = await updateProfessional(user.id, form);

    alert("Profesional registrado!");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto space-y-6 bg-white shadow-lg rounded-xl p-6"
    >
      {step === 1 && (
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Especialidad
          </label>
          <select
            value={form.speciality}
            onChange={handleChange("speciality")}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Seleccioná una opción</option>
            {categories &&
              categories.map((c) => (
                <option key={c.id} value={c.name.toLowerCase()}>
                  {c.name}
                </option>
              ))}
          </select>
        </div>
      )}

      {step === 2 && (
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Sobre mí
          </label>
          <textarea
            value={form.aboutMe}
            onChange={handleChange("aboutMe")}
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Contale a tus clientes quién sos y qué hacés..."
          />
        </div>
      )}

      {step === 3 && (
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Ubicación de trabajo
          </label>
          <input
            type="text"
            value={form.workingLocation}
            onChange={handleChange("workingLocation")}
            placeholder="Ej: CABA, Argentina"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      )}

      {step === 4 && (
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Radio de trabajo (km)
          </label>
          <input
            type="number"
            value={form.workingRadius}
            onChange={handleChange("workingRadius")}
            placeholder="Ej: 10"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      )}

      <div className="flex justify-between">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="px-4 py-2 bg-gray-300 rounded-lg"
          >
            Atrás
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Siguiente
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Finalizar
          </button>
        )}
      </div>
    </form>
  );
}
