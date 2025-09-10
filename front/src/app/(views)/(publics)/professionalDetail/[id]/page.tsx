import { getProfessionalById } from "@/services/getProfessionalsById";
import { ProfessionalCard } from "@/components/profesionalCard/ProfesionalCard";

type Props = {
  params: {
    id: string;
  };
};

export default async function Page({ params }: Props) {
  const  {id}= params;
console.log(id)
  const professional = await getProfessionalById(id);

  console.log("ahahahahah", professional)

  if (!professional) {
    return <p>No se encontró el profesional.</p>;
  }

  return (
    <div className="flex justify-center items-center h-full">
      <ProfessionalCard key={professional.id} pro={professional} />
    </div>
  );
}
