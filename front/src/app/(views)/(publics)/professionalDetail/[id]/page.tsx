import { getProfessionalById } from "@/services/getProfessionalsById";
import { ProfessionalCard } from "@/components/profesionalCard/ProfesionalCard";
import { IUser } from "@/types/types";
import { Professional } from "@/types/profesionalTypes";

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
    <div className="flex justify-center items-center h-full">
     <ProfessionalCard key={professional.id} pro={professional} />
    </div>
  );
}
