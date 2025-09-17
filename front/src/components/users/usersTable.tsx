// "use client";

// import { toast } from "sonner";
// import { useState } from "react";
// import { deactivateUser } from "@/services/userService";
// import { User } from "@/types/types";
// import { MoreHorizontal } from "lucide-react";

// type Props = {
//   users: User[];
// };

// export default function UsersList({ users }: Props) {
//   const [userList, setUserList] = useState(users);
//   const [loading, setLoading] = useState(false);
//   const [openMenu, setOpenMenu] = useState<string | null>(null);

//   const handleDeactivate = async (id: string, status: boolean) => {
//     try {
//       setLoading(true);
//       await deactivateUser(id, status);
//       setUserList((prev) =>
//         prev.map((u) => (u.id === id ? { ...u, isActive: !status } : u))
//       );
//       toast.success(`Usuario dado de ${status ? "baja" : "alta"}`);
//     } catch (err: any) {
//       toast.error(
//         err.message || `Error al dar de  ${status ? "baja" : "alta"}`
//       );
//     } finally {
//       setLoading(false);
//       setOpenMenu(null);
//     }
//   };

//   return (
//     <div className="bg-white shadow-md rounded-xl overflow-hidden">
//       <div className="p-4 border-b flex justify-between items-center">
//         <h2 className="text-lg font-bold text-gray-800">Usuarios</h2>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
//             <tr>
//               <th className="px-6 py-3">#</th>
//               <th className="px-6 py-3">Nombre</th>
//               <th className="px-6 py-3">Email</th>
//               <th className="px-6 py-3">Rol</th>
//               <th className="px-6 py-3">Estado</th>
//               <th className="px-6 py-3">Alta</th>
//               <th className="px-6 py-3 text-right">Acciones</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {userList.map((user) => (
//               <tr key={user.id} className="hover:bg-gray-50 relative">
//                 <td className="px-6 py-4 text-gray-700">{user.id}</td>
//                 <td className="px-6 py-4 font-medium text-gray-900">
//                   {user.firstName}
//                 </td>
//                 <td className="px-6 py-4 text-gray-600">{user.email}</td>
//                 <td className="px-6 py-4">
//                   <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                     {user.role}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4">
//                   {user.isActive ? (
//                     <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
//                       Activo
//                     </span>
//                   ) : (
//                     <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
//                       Inactivo
//                     </span>
//                   )}
//                 </td>
//                 <td className="px-6 py-4 text-gray-500">{user.createdAt}</td>
//                 <td className="px-6 py-4 text-right relative">
//                   <button
//                     onClick={() =>
//                       setOpenMenu(openMenu === user.id ? null : user.id)
//                     }
//                     className="p-2 rounded-full hover:bg-gray-200 transition"
//                   >
//                     <MoreHorizontal />
//                   </button>

//                   {openMenu === user.id && (
//                     <div className="absolute right-6 mt-2 w-32 bg-white border-none rounded-lg shadow-lg z-10">
//                       <button
//                         onClick={() => handleDeactivate(user.id, user.isActive)}
//                         className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
//                       >
//                         Dar de {user.isActive ? "baja" : "alta"}
//                       </button>
//                     </div>
//                   )}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }
"use client";

import { toast } from "sonner";
import { useState, useEffect } from "react";
import { deactivateUser } from "@/services/userService";
import { User } from "@/types/types";
import { MoreHorizontal } from "lucide-react";

type Props = {
  users: User[];
};

export default function UsersList({ users }: Props) {
  const [userList, setUserList] = useState<User[]>(users);
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // 👇 sincronizar el estado local con las props
  useEffect(() => {
    setUserList(users);
  }, [users]);

  const handleDeactivate = async (id: string, status: boolean) => {
    try {
      setLoading(true);
      await deactivateUser(id, status);
      setUserList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: !status } : u))
      );
      toast.success(`Usuario dado de ${status ? "baja" : "alta"}`);
    } catch (err: any) {
      toast.error(
        err.message || `Error al dar de  ${status ? "baja" : "alta"}`
      );
    } finally {
      setLoading(false);
      setOpenMenu(null);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-xl overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Usuarios</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Nombre</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Rol</th>
              <th className="px-6 py-3">Estado</th>
              <th className="px-6 py-3">Alta</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {userList.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 relative">
                <td className="px-6 py-4 text-gray-700">{user.id}</td>
                <td className="px-6 py-4 font-medium text-gray-900">
                  {user.firstName}
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.isActive ? (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Activo
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                      Inactivo
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-500">{user.createdAt}</td>
                <td className="px-6 py-4 text-right relative">
                  <button
                    onClick={() =>
                      setOpenMenu(openMenu === user.id ? null : user.id)
                    }
                    className="p-2 rounded-full hover:bg-gray-200 transition"
                  >
                    <MoreHorizontal />
                  </button>

                  {openMenu === user.id && (
                    <div className="absolute right-6 mt-2 w-32 bg-white border-none rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => handleDeactivate(user.id, user.isActive)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Dar de {user.isActive ? "baja" : "alta"}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
