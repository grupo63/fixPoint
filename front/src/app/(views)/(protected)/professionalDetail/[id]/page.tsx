import { getProfessionalById } from "@/services/getProfessionalsById";
import { ProfessionalDetail } from "@/components/professional/ProfesionalDetail";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const professional = await getProfessionalById(id);

  if (!professional) return <p>No se encontró el profesional.</p>;

  return (
    <main className="flex justify-center items-start px-4 py-10 bg-gray-50 min-h-screen">
      <div className="w-full max-w-4xl">
        <ProfessionalDetail pro={professional as any} />
      </div>
    </main>
  );
}
