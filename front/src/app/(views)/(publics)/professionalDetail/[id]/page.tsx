import { getProfessionalById } from "@/services/getProfessionalsById";
import { routes } from "@/routes";
import { ProfessionalCard } from "@/components/profesionalCard/ProfesionalCard";
import { redirect } from "next/navigation";

// 🔧 Ajustamos los params esperados
type Params = { id: string }; // ← el nombre del archivo debe ser [id].tsx

export default async function Page({ params }: { params: Params }) {
  const { id } = params;

  // ✅ Hacemos fetch al profesional
  const professional = await getProfessionalById(id);

  // 🚨 Si no existe, redirigimos
  if (!professional) {
    // return redirect(routes.home);
    alert ("No hay proffesiopnels")
  }
console.log("Recibido slug ID:", id);
  return (
    <div className="flex justify-center items-center h-full">
      <ProfessionalCard  />
    </div>
  );
}
