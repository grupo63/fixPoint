"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="relative w-[100vw]">
      {/* VIDEO DE FONDO */}
      <video
        className="absolute top-0 left-200 h-[90%] w-[40%]  object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/home-video.mp4" type="video/mp4" />
        Tu navegador no soporta el video.
      </video>

      {/* CONTENIDO */}
      <div className="relative z-20 flex items-start justify-start min-h-screen px-6 mx-10">
        <div className="bg-[#162748]/95 text-white max-w-4xl w-full p-10 mt-15 md:p-16 rounded-tl-[80px] rounded-br-[80px] shadow-2xl">
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
            <Link href="/register">
              <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl">
                Registrarme{" "}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
