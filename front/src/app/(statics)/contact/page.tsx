"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Formulario enviado:", form);
    alert("Gracias por contactarte, pronto nos comunicaremos!");
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold mb-6">Contacto</h1>

      <p className="mb-6 text-gray-700">
        Si tenés dudas o consultas, completá el formulario o escribinos a{" "}
        <a href="mailto:grupo63@gmail.com" className="text-blue-600 underline">
          grupo63@gmail.com
        </a>
        .
      </p>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-50 p-6 rounded-xl shadow"
      >
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700"
          >
            Nombre
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            Mensaje
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
        >
          Enviar
        </button>
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-2">Otros medios de contacto</h2>
        <p>
          Email:{" "}
          <a href="mailto:info@fixpoint.com.ar" className="text-blue-600">
            info@fixpoint.com.ar
          </a>
        </p>
        <p>
          Teléfono:{" "}
          <a href="tel:+541145678900" className="text-blue-600">
            +54 11 4567-8900
          </a>
        </p>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Ubicación</h3>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3284.0182801980036!2d-58.384177124813256!3d-34.6036992574964!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4aa9f0a6da5edb%3A0x11bead4e234e558b!2sObelisco!5e0!3m2!1ses-419!2sar!4v1758200839913!5m2!1ses-419!2sar"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded-xl shadow"
          />
        </div>
      </div>
    </main>
  );
}
