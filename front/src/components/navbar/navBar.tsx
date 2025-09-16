"use client";

import Image from "next/image";
import Link from "next/link";
import { routes } from "@/routes";
import { usePathname } from "next/navigation";

export default function Navbar() {
  return (
    <div className="sticky top-0 z-50 bg-white flex items-center w-full justify-around px-6 py-6">
      {/* Logo fuera del fondo beige */}
      <div className="flex-shrink-0 ">
        <Image
          src="/fixPoint.png"
          alt="FixPoint Logo"
          width={150}
          height={150}
        />
      </div>

      {/* Navbar con fondo beige, separado */}
      <header
        className="ml-4 bg-[#f9f7f1] rounded-tl-[40px] rounded-br-[40px] w-[60vw] 
        px-8 py-4 flex items-center justify-between shadow-sm"
      >
        {/* Links */}
        <ul className="flex items-center gap-10">
          <li>
            <Link
              href={routes.como_funciona}
              className="text-sm font-medium text-gray-800 hover:underline hover:decoration-2 hover:underline-offset-4 hover:decoration-orange-500"
            >
              Como Funciona
            </Link>
          </li>
          <li>
            <Link
              href={routes.como_funciona}
              className="text-sm font-medium text-gray-800 hover:underline hover:decoration-2 hover:underline-offset-4 hover:decoration-orange-500"
            >
              Preguntas Frecuentes
            </Link>
          </li>
          <li>
            <Link
              href={routes.contacto}
              className="text-sm font-medium text-gray-800 hover:underline hover:decoration-2 hover:underline-offset-4 hover:decoration-orange-500"
            >
              Contacto
            </Link>
          </li>
        </ul>

        {/* Botones */}
        <div className="flex items-center gap-3">
          <Link
            href={routes.signin}
            className="rounded-tl-[20px] rounded-br-[20px] bg-[#b45d27] px-5 py-2 text-sm font-medium text-white hover:bg-[#ed7d31] transition"
          >
            Ingresar
          </Link>
          <Link
            href={routes.register}
            className="rounded-tl-[20px] rounded-br-[20px] bg-[#5a758a] px-5 py-2 text-sm font-medium text-white hover:bg-[#70a3c9] transition"
          >
            Registrarme
          </Link>
        </div>
      </header>
    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { routes } from "@/routes";

// export default function Navbar() {
//   return (
//     <header className="sticky top-5 z-50 bg-[#f9f7f1] border-none  w-[80vw] m-4 rounded-br-[30px] rounded-tl-[30px] pl-2">
//       <nav className="flex h-16 max-w-7xl items-center justify-between h-20  p-4">
//         {/* Links a la izquierda */}
//         <ul className="flex items-center gap-8">
//           <li>
//             <Link
//               href={routes.como_funciona}
//               className="text-sm font-medium text-gray-800 hover:underline hover:decoration-2 hover:underline-offset-4 hover:decoration-orange-500"
//             >
//               Como Funciona
//             </Link>
//           </li>

//           <li>
//             <Link
//               href={routes.como_funciona}
//               className="text-sm font-medium text-gray-800 hover:underline hover:decoration-2 hover:underline-offset-4 hover:decoration-orange-500"
//             >
//               Preguntas Frecuentes
//             </Link>
//           </li>
//           <li>
//             <Link
//               href={routes.contacto}
//               className="text-sm font-medium text-gray-800 hover:underline hover:decoration-2 hover:underline-offset-4 hover:decoration-orange-500"
//             >
//               Contacto {/* Línea activa */}
//             </Link>
//           </li>
//         </ul>

//         {/* Botones a la derecha */}
//         <div className="flex items-center gap-3 h-full">
//           <Link
//             href={routes.signin}
//             className="h-full flex items-center justify-center
//                rounded-tl-[20px] rounded-br-[20px]
//                bg-[#b45d27] px-5 text-sm font-medium text-white
//                hover:bg-[#ed7d31] transition"
//           >
//             Log In
//           </Link>
//           <Link
//             href={routes.register}
//             className="h-full flex items-center justify-center
//                rounded-tl-[20px] rounded-br-[20px]
//                bg-[#5a758a] px-5 text-sm font-medium text-white
//                hover:bg-[#70a3c9] transition"
//           >
//             Register
//           </Link>
//         </div>
//       </nav>
//     </header>
//   );
// }
