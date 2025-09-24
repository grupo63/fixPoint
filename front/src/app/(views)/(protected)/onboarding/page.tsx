"use client";

import fetchCategories from "@/services/categorieServices";
import { updateProfessional } from "@/services/professionalService";
import { Category } from "@/types/types";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProfessionalUpdate } from "@/types/profesionalTypes";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Step = 1 | 2 | 3 | 4;

export default function OnboardingProfessionalForm() {
  const router = useRouter();
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

  const [form, setForm] = useState<ProfessionalUpdate>({
    aboutMe: "",
    speciality: "",
    location: "",
    workingRadius: 10,
  });

  const handleChange =
    (key: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => {
      const value = e.target.value;
      setForm((prev) => ({
        ...prev,
        [key]: key === "workingRadius" ? Number(value) : value,
      }));
    };

  const nextStep = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    setStep((s) => Math.min(s + 1, 4) as Step);
  };
  const prevStep = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step !== 4) return;

    if (user && user.professional) {
      try {
        await updateProfessional(user.professional.id, form);
        toast.success("Perfil completado con exito");
        router.push("/redirect");
      } catch (err) {
        console.error("❌ Error actualizando el perfil:", err);
        toast.error("Hubo un problema guardando tu perfil");
        router.push("/");
      }
    }
  };

  const isStepValid = () => {
    if (step === 1) return form.speciality?.trim() !== "";
    if (step === 2) return form.aboutMe?.trim() !== "";
    if (step === 3) return form.location?.trim() !== "";
    if (step === 4) return (form.workingRadius ?? 0) > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex items-start mt-40 justify-center ">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg w-full mx-auto space-y-6 bg-white  shadow-lg rounded-xl p-8"
      >
        {/* Título de bienvenida */}
        <h1 className="text-2xl font-bold text-center text-[#162748]  mb-6">
          Bienvenido!
          <br />
          Completa tu perfil para continuar
        </h1>

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
              value={form.location}
              onChange={handleChange("location")}
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

        {/* Botones */}
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
              disabled={!isStepValid()}
              className="ml-auto px-4 py-2  bg-[#ed7d31] text-white rounded-lg disabled:opacity-50"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={!isStepValid()}
              className="ml-auto px-4 py-2 bg-[#ed7d31] text-white rounded-lg disabled:opacity-50"
            >
              Finalizar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
