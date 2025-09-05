export const metadata = {
  title: "Preguntas frecuentes | FixPoint",
  description: "Respuestas rápidas a dudas comunes sobre FixPoint.",
};

export default function FaqPage() {
  const faqs = [
    { q: "¿Cómo creo una cuenta?", a: "Desde /register completás tus datos y confirmás el email." },
    { q: "¿Cómo contacto a un profesional?", a: "Buscá en /professionals, abrí su perfil y usá el botón de contacto." },
    { q: "¿Cómo cancelo una solicitud?", a: "Desde tu perfil /profile en la sección de solicitudes." },
  ];

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold">Preguntas frecuentes</h1>
      <ul className="mt-6 space-y-4">
        {faqs.map((item, i) => (
          <li key={i} className="rounded-lg border p-4">
            <h2 className="font-medium">{item.q}</h2>
            <p className="text-sm text-gray-700 mt-1">{item.a}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
