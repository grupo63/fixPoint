// app/(statics)/como-funciona/page.tsx
import Link from "next/link";

export const metadata = {
  title: "Cómo funciona | FixPoint",
  description: "Paso a paso para clientes y profesionales en FixPoint.",
};

export default function ComoFuncionaPage() {
  return (
    <main className="mx-auto max-w-5xl p-6 space-y-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold">¿Cómo funciona?</h1>
        <p className="text-gray-600">
          Encontrá profesionales en minutos o gestioná tus servicios si sos profesional.
        </p>
      </header>

      {/* Clientes */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Para clientes</h2>
        <ol className="space-y-3 text-sm">
          <li>
            <span className="font-medium">1) Buscá:</span> entrá a{" "}
            <Link href="/profesionales" className="underline">Profesionales</Link> y filtrá por categoría o ciudad.
          </li>
          <li>
            <span className="font-medium">2) Elegí y contactá:</span> abrí el perfil, revisá reseñas y enviá una solicitud.
          </li>
          <li>
            <span className="font-medium">3) Coordiná y calificá:</span> al finalizar, dejá tu reseña.
          </li>
        </ol>
        <Link
          href="/register"
          className="inline-block rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Crear cuenta
        </Link>
      </section>

      {/* Profesionales */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Para profesionales</h2>
        <ol className="space-y-3 text-sm">
          <li>
            <span className="font-medium">1) Registrate:</span> completá tu perfil, especialidad y zona de trabajo.
          </li>
          <li>
            <span className="font-medium">2) Publicá servicios:</span> definí precios y disponibilidad desde tu dashboard.
          </li>
          <li>
            <span className="font-medium">3) Gestioná solicitudes:</span> confirmá trabajos y respondé mensajes.
          </li>
        </ol>
        <Link
          href="/register"
          className="inline-block rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Quiero ofrecer servicios
        </Link>
      </section>

      <section className="rounded-lg border bg-gray-50 p-4">
        <h3 className="font-medium mb-1">¿Dudas?</h3>
        <p className="text-sm text-gray-700">
          Mirá las <Link href="/faq" className="underline">Preguntas frecuentes</Link> o escribinos en{" "}
          <Link href="/contact" className="underline">Contacto</Link>.
        </p>
      </section>
    </main>
  );
}
