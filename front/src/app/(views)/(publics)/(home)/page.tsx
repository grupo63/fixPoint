"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="relative w-[100vw]">
      {/* VIDEO DE FONDO */}
      <video
        className="absolute top-20 left-200 h-[90%] w-[40%]  object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/home-video.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      {/* CONTENIDO */}
      <div className="relative z-20 flex items-center justify-start min-h-screen px-6 mx-10">
        <div className="bg-[#162748]/95 text-white max-w-4xl w-full p-10 md:p-16 rounded-tl-[80px] rounded-br-[80px] shadow-2xl">
          <h1 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight">
            Solucioná tu problema
            <br />
            con profesionales
            <br />
            verificados.
          </h1>

          <p className="text-lg mb-8 text-white/90">
            En FixPoint conectamos personas con especialistas de confianza. Pedí
            un presupuesto, reservá un turno y solucioná lo que necesitás rápido
            y fácil.
          </p>

          <div className="flex flex-wrap gap-4">
            <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl">
              Registrarse
            </button>

            <Link href="/professionals">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl">
                Ver Profesionales
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

// "use client";

// import Image from "next/image";
// import { ShieldCheck, Clock, Smile } from "lucide-react";
// import { motion } from "framer-motion";

// const benefits = [
//   {
//     title: "Profesionales verificados",
//     description: "Solo trabajamos con expertos calificados y con reseñas verificadas.",
//     icon: ShieldCheck,
//   },
//   {
//     title: "Reservá rápido y fácil",
//     description: "Agendá un turno en menos de 1 minuto desde cualquier dispositivo.",
//     icon: Clock,
//   },
//   {
//     title: "Garantía de satisfacción",
//     description: "Si no estás conforme, te devolvemos el dinero o lo resolvemos gratis.",
//     icon: Smile,
//   },
// ];

// export default function Home() {
//   return (
//     <main className="flex justify-center items-center h-screen p-10 bg-blue-50">
//       <div className="flex items-center gap-12 w-full justify-between max-w-7xl mx-auto">
//         {/* Tarjetas animadas */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
//           {benefits.map(({ title, description, icon: Icon }, i) => (
//             <motion.div
//               key={i}
//               className="w-64 h-[400px] bg-white border rounded-2xl shadow-xl p-6 flex flex-col items-center text-center"
//               initial={{ opacity: 0, y: 40 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: i * 0.2, duration: 0.5, type: "spring" }}
//               whileHover={{ scale: 1.05 }}
//             >
//               <div className="bg-blue-600 text-white p-4 rounded-full mb-6">
//                 <Icon size={32} />
//               </div>
//               <h3 className="text-xl font-bold mb-3">{title}</h3>
//               <p className="text-sm text-gray-600">{description}</p>
//             </motion.div>
//           ))}
//         </div>

//         {/* Imagen */}
//         <Image
//           src="/plomero.jpg"
//           alt="Plomero trabajando"
//           width={400}
//           height={300}
//           className="rounded-xl shadow-2xl object-cover"
//         />
//       </div>
//     </main>
//   );
// }
