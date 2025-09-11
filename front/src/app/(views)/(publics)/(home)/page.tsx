"use client";

import Image from "next/image";
import { ShieldCheck, Clock, Smile } from "lucide-react";
import { motion } from "framer-motion";

const benefits = [
  {
    title: "Profesionales verificados",
    description: "Solo trabajamos con expertos calificados y con reseñas verificadas.",
    icon: ShieldCheck,
  },
  {
    title: "Reservá rápido y fácil",
    description: "Agendá un turno en menos de 1 minuto desde cualquier dispositivo.",
    icon: Clock,
  },
  {
    title: "Garantía de satisfacción",
    description: "Si no estás conforme, te devolvemos el dinero o lo resolvemos gratis.",
    icon: Smile,
  },
];

export default function Home() {
  return (
    <main className="flex justify-center items-center h-screen p-10 bg-blue-50">
      <div className="flex items-center gap-12 w-full justify-between max-w-7xl mx-auto">
        {/* Tarjetas animadas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {benefits.map(({ title, description, icon: Icon }, i) => (
            <motion.div
              key={i}
              className="w-64 h-[400px] bg-white border rounded-2xl shadow-xl p-6 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.5, type: "spring" }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="bg-blue-600 text-white p-4 rounded-full mb-6">
                <Icon size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </motion.div>
          ))}
        </div>

        {/* Imagen */}
        <Image
          src="/plomero.jpg"
          alt="Plomero trabajando"
          width={400}
          height={300}
          className="rounded-xl shadow-2xl object-cover"
        />
      </div>
    </main>
  );
}
