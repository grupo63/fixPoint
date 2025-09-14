import { getProfessionalById } from "@/services/getProfessionalsById";
import { ProfessionalCard } from "@/components/profesionalCard/ProfesionalCard";
import { IUser } from "@/types/types";
import { Professional, ProfessionalResponse } from "@/types/profesionalTypes";

type Props = {
  params: {
    id: string;
    
  
  };
};

export default async function Page({ params }: Props) {
  const  {id}= params;
  

  const professional = await getProfessionalById(id);



  if (!professional) {
    return <p>No se encontró el profesional.</p>;
  }

  return (
   <div className="flex justify-center items-center min-h-screen">
  <div className="w-full max-w-3xl p-6">
    <ProfessionalCard key={professional.id} pro={professional as any} />
  </div>
</div>
  );
}
