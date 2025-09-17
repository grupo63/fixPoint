// "use client";

// import { useState } from "react";
// import { ChevronRight, LogOut, User } from "lucide-react";
// import { useRouter } from "next/navigation";

// export default function SidebarUser({ user }: { user: any }) {
//   const [open, setOpen] = useState(false);
//   const router = useRouter();

//   const handleLogout = () => {
//     console.log("Cerrar sesión");
//     router.push("/");
//   };

//   return (
//     <div className="relative px-4 pb-6">
//       {/* CARD USER */}
//       <div
//         onClick={() => setOpen(!open)}
//         className="flex items-center justify-between rounded-xl p-3 cursor-pointer hover:bg-[#5e7a8d] transition"
//       >
//         <div className="flex items-center gap-3">
//           <img
//             src={
//               user?.profileImg ||
//               "https://www.shutterstock.com/image-vector/user-icon-avatar-symbol-social-260nw-1556375198.jpg"
//             }
//             alt="Usuario"
//             className="w-10 h-10 rounded-full object-cover border-2 border-white"
//           />
//           <div className="flex flex-col">
//             <span className="text-sm font-semibold text-white">
//               {user?.firstName || "User"} {user?.lastName}
//             </span>
//             <span className="text-xs text-blue-200 truncate">
//               {user?.email || "email@example.com"}
//             </span>
//           </div>
//         </div>
//         <ChevronRight
//           className={`w-5 h-5 text-blue-200 transform transition ${
//             open ? "rotate-90" : ""
//           }`}
//         />
//       </div>

//       {/* SUB-SIDEBAR */}
//       {open && (
//         <div
//           className="absolute left-full bottom-2 ml-2 w-56 p-2 flex flex-col gap-2
//                   bg-[#5e7a8d]/90 backdrop-blur-md
//                   rounded-tr-[20px] rounded-bl-[20px] z-50"
//         >
//           <button
//             onClick={() => router.push("/profile")}
//             className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white
//                  hover:bg-[#5e7a8d]/60 hover:backdrop-blur-lg
//                  rounded-tr-[20px] rounded-bl-[20px] transition"
//           >
//             <User className="w-4 h-4" /> Mi perfil
//           </button>
//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white
//                  hover:bg-[#5e7a8d]/60 hover:backdrop-blur-lg
//                  rounded-tr-[20px] rounded-bl-[20px] transition"
//           >
//             <LogOut className="w-4 h-4" /> Cerrar sesión
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
"use client";

import { useState } from "react";
import { ChevronRight, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // 👈 agregado

export default function SidebarUser({ user }: { user: any }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth(); // 👈 agregado

  const handleLogout = () => {
    logout(); // 👈 llamado al context para limpiar sesión
    router.push("/");
  };

  return (
    <div className="relative px-4 pb-6">
      {/* CARD USER */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between rounded-xl p-3 cursor-pointer hover:bg-[#5e7a8d] transition"
      >
        <div className="flex items-center gap-3">
          <img
            src={
              user?.profileImg ||
              "https://www.shutterstock.com/image-vector/user-icon-avatar-symbol-social-260nw-1556375198.jpg"
            }
            alt="Usuario"
            className="w-10 h-10 rounded-full object-cover border-2 border-white"
          />
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              {user?.firstName || "User"} {user?.lastName}
            </span>
            <span className="text-xs text-blue-200 truncate">
              {user?.email || "email@example.com"}
            </span>
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-blue-200 transform transition ${
            open ? "rotate-90" : ""
          }`}
        />
      </div>

      {/* SUB-SIDEBAR */}
      {open && (
        <div
          className="absolute left-full bottom-2 ml-2 w-56 p-2 flex flex-col gap-2  
                  bg-[#5e7a8d]/90 backdrop-blur-md 
                  rounded-tr-[20px] rounded-bl-[20px] z-50"
        >
          <button
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white 
                 hover:bg-[#5e7a8d]/60 hover:backdrop-blur-lg 
                 rounded-tr-[20px] rounded-bl-[20px] transition"
          >
            <User className="w-4 h-4" /> Mi perfil
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white 
                 hover:bg-[#5e7a8d]/60 hover:backdrop-blur-lg 
                 rounded-tr-[20px] rounded-bl-[20px] transition"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
