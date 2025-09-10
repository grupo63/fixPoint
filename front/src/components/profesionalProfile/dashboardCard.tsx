// "use client";
// import * as React from "react";
// import { Professional } from "@/types/profesionalTypes";
// type Props = {
//   title?: string;
//   children: React.ReactNode;
//   className?: string;
//   professional: Professional;
  
// };

//   pId: string;
//   userId: string;
//   speciality: string;
//   aboutMe?: string | null;
//   longitude?: number | null;
//   latitude?: number | null;
//   workingRadius: number;
//   createdAt: string;
//   location?: string | null;
//   profileImg?: string | null;
//   isActive: boolean;

//   displayName?: string | null;
//   averageRating?: number | null;
//   reviewsCount?: number | null;
// };

// export function DashboardCard({ title, children, className = "" ,professional}: Props) {
//   return (
//     <section className={`rounded-lg border p-4 bg-white ${className}`}>
//       {title && <h3 className="font-semibold mb-2">{title}</h3>}
//       {children}
//       <p>Especialidad:{professional.speciality} </p>
//       <p>Acerca de mi: {professional.aboutMe} </p>
//       <p></p>
//     </section>
//   );
// }

// export default DashboardCard;
