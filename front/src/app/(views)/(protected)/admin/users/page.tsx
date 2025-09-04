// front/src/app/(views)/(protected)/admin/users/page.tsx
import { mockUsers } from "@/helper/mockUsers";
import type { IUser, Role } from "@/types/types";

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(iso));
}

// SSR con searchParams (simple y sin window)
export default function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; rol?: Role | "todos" };
}) {
  const q = (searchParams.q ?? "").toLowerCase();
  const rol = (searchParams.rol ?? "todos") as Role | "todos";

  const rows: IUser[] = mockUsers.filter((u) => {
    const okQ =
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q);
    const okRol = rol === "todos" ? true : u.role === rol;
    return okQ && okRol;
  });

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuarios</h1>

        <form className="flex items-center gap-2" action="/admin/users">
          <input
            name="q"
            placeholder="Buscar (nombre, email, ciudad)"
            defaultValue={searchParams.q ?? ""}
            className="border rounded-lg px-3 py-2 text-sm w-72"
          />
          <select
            name="rol"
            defaultValue={rol}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value="todos">Rol: Todos</option>
            <option value="CLIENTE">Cliente</option>
            <option value="PROFESIONAL">Profesional</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button className="px-3 py-2 rounded-lg border text-sm hover:bg-gray-50">
            Filtrar
          </button>
        </form>
      </header>

      <ul className="divide-y rounded-2xl border">
        {rows.map((u) => (
          <li key={u.userId} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={u.profileImg}
                alt={u.name}
                className="size-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">{u.name}</div>
                <div className="text-sm text-gray-500">
                  {u.email} · {u.role} · Alta {fmtDate(u.registrationDate)}
                </div>
              </div>
            </div>
            <a
              href={`/admin/users/${u.userId}`}
              className="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
            >
              Ver
            </a>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="p-6 text-center text-gray-500">Sin resultados.</li>
        )}
      </ul>
    </main>
  );
}
