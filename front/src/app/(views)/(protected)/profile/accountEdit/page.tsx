"use client";

import { useState } from "react";
import Link from "next/link";
import { routes } from "@/routes";

export default function AccountEditPage() {
  const [firstName, setFirstName] = useState("Ivan");
  const [lastName, setLastName] = useState("Rola");
  const [email, setEmail] = useState("rollaivanh@hotmail.com");
  const [phone, setPhone] = useState("");
  const [timezone, setTimezone] = useState("America/Argentina/Buenos_Aires");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      firstName,
      lastName,
      email,
      phone,
      timezone,
    });
    // fetch al backend para actualizar datos
  };

  return (
    <section className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Volver */}
      <Link
        href={routes.profile_information}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Volver a Configuración
      </Link>

      <h1 className="text-2xl font-bold text-gray-800">
        Editar información personal
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md p-6 space-y-6"
      >
        {/* Nombre y Apellido */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de pila
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Apellido
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Correo electrónico */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico
          </label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-500 cursor-not-allowed"
          />
          <Link
            href="#"
            className="text-blue-600 text-sm hover:underline mt-1 inline-block"
          >
            Cambiar su dirección de correo electrónico
          </Link>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="+54 11 1234 5678"
          />
        </div>

  
       

        {/* Botones */}
        <div className="flex gap-3 justify-end">
          <Link
            href={routes.profile_information}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Guardar
          </button>
        </div>
      </form>
    </section>
  );
}
