

type Professional = { id: string; name: string; speciality: string };

export default function AdminProfessionalsPage() {
  const professionals: Professional[] = [
    { id: "p1", name: "Carlos Gómez", speciality: "Plomero" },
    { id: "p2", name: "María Ruiz", speciality: "Electricista" },
    { id: "p3", name: "Juan Pérez", speciality: "Carpintero" },
  ];

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Profesionales</h1>

      <ul className="divide-y rounded-2xl border">
        {professionals.map((p) => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-500">{p.speciality}</div>
            </div>
            <a
              href={`/admin/professionals/${p.id}`}
              className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
            >
              Ver
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
