// "use client";

// import { useState } from "react";
// import { toast } from "sonner";

// export default function ContactPage() {
//   const [form, setForm] = useState({ name: "", email: "", message: "" });

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     console.log("Formulario enviado:", form);
//     toast.success("Gracias por contactarte, pronto nos comunicaremos!");
//   };

//   return (
//     <main className="max-w-3xl mx-auto px-6 py-12">
//       <h1 className="text-3xl font-semibold mb-6">Contacto</h1>

//       <p className="mb-6 text-gray-700">
//         Si tenés dudas o consultas, completá el formulario o escribinos a{" "}
//         <a href="mailto:grupo63@gmail.com" className="text-blue-600 underline">
//           grupo63@gmail.com
//         </a>
//         .
//       </p>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-4 bg-gray-50 p-6 rounded-xl shadow"
//       >
//         <div>
//           <label
//             htmlFor="name"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Nombre
//           </label>
//           <input
//             type="text"
//             id="name"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border border-gray-300 p-2"
//             required
//           />
//         </div>

//         <div>
//           <label
//             htmlFor="email"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Correo electrónico
//           </label>
//           <input
//             type="email"
//             id="email"
//             name="email"
//             value={form.email}
//             onChange={handleChange}
//             className="mt-1 block w-full rounded-md border border-gray-300 p-2"
//             required
//           />
//         </div>

//         <div>
//           <label
//             htmlFor="message"
//             className="block text-sm font-medium text-gray-700"
//           >
//             Mensaje
//           </label>
//           <textarea
//             id="message"
//             name="message"
//             value={form.message}
//             onChange={handleChange}
//             rows={4}
//             className="mt-1 block w-full rounded-md border border-gray-300 p-2"
//             required
//           />
//         </div>

//         <button
//           type="submit"
//           className="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
//         >
//           Enviar
//         </button>
//       </form>

//       <div className="mt-10">
//         <h2 className="text-xl font-semibold mb-2">Otros medios de contacto</h2>
//         <p>
//           Email:{" "}
//           <a href="mailto:info@fixpoint.com.ar" className="text-blue-600">
//             info@fixpoint.com.ar
//           </a>
//         </p>
//         <p>
//           Teléfono:{" "}
//           <a href="tel:+541145678900" className="text-blue-600">
//             +54 11 4567-8900
//           </a>
//         </p>

//         <div className="mt-6">
//           <h3 className="text-lg font-medium mb-2">Ubicación</h3>
//           <iframe
//             src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.6729829619735!2d-58.44296032481552!3d-34.561834355286535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb5c9d5babebb%3A0x26bbc61add16f57e!2sAv.%20del%20Libertador%201700%2C%20C1426%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1758640972433!5m2!1ses-419!2sar"
//             width="100%"
//             height="300"
//             style={{ border: 0 }}
//             allowFullScreen
//             loading="lazy"
//             referrerPolicy="no-referrer-when-downgrade"
//             className="rounded-xl shadow"
//           />
//         </div>
//       </div>
//     </main>
//   );
// }
"use client";

import { useState } from "react";
import { toast } from "sonner";

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
    toast.success("Gracias por contactarte, pronto nos comunicaremos!");
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Texto */}
        <div>
          <h1 className="text-3xl font-semibold mb-6 text-[#0E2A47]">
            Contactanos
          </h1>
          <p className="mb-6 text-gray-600 leading-relaxed">
            Si tenés dudas o consultas, completá el formulario o escribinos a{" "}
            <a
              href="mailto:info@fixpoint.com.ar"
              className="text-[#B54C1F] font-medium"
            >
              info@fixpoint.com.ar
            </a>
            . También podés llamarnos al{" "}
            <a href="tel:+541145678900" className="text-[#B54C1F] font-medium">
              +54 11 4567-8900
            </a>
            .
          </p>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2 text-[#0E2A47]">
              Ubicación
            </h3>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3285.6729829619735!2d-58.44296032481552!3d-34.561834355286535!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bcb5c9d5babebb%3A0x26bbc61add16f57e!2sAv.%20del%20Libertador%201700%2C%20C1426%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses-419!2sar!4v1758640972433!5m2!1ses-419!2sar"
              width="100%"
              height="250"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="rounded-xl shadow"
            />
          </div>
        </div>

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-2xl shadow-lg space-y-5 max-w-md mx-auto w-full"
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
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#B54C1F] focus:outline-none"
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
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#B54C1F] focus:outline-none"
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
              className="mt-1 block w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-[#B54C1F] focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-[#B54C1F] px-4 py-2 text-white font-medium hover:bg-[#9c3e19] transition-colors"
          >
            Enviar
          </button>
        </form>
      </div>
    </main>
  );
}
