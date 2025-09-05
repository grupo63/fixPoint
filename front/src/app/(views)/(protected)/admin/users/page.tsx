// front/src/app/(views)/(protected)/admin/users/page.tsx
import { mockUsers } from "@/helper/mockUsers";
import type { IUser, Role } from "@/types/types";

type SearchParams = { q?: string; rol?: Role | "todos" };

type Props = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminUsersPage({ searchParams }: Props) {
  // ✅ Esperamos la promesa
  const resolvedParams = await searchParams;

  // ✅ Nombres más descriptivos
  const searchQuery = (resolvedParams.q ?? "").toLowerCase();
  const selectedRole = (resolvedParams.rol ?? "todos") as Role | "todos";

  const filteredUsers: IUser[] = mockUsers.filter((user) => {
    const matchesQuery =
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery) ||
      user.email.toLowerCase().includes(searchQuery) ||
      (user.city ?? "").toLowerCase().includes(searchQuery);

    const matchesRole =
      selectedRole === "todos" ? true : user.role === selectedRole;

    return matchesQuery && matchesRole;
  });

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Usuarios</h1>

      <form className="flex gap-3">
        <input
          type="text"
          name="q"
          placeholder="Buscar (nombre, email, ciudad)"
          defaultValue={resolvedParams.q ?? ""}
          className="border rounded-lg px-3 py-2 text-sm w-72"
        />
        <select
          name="rol"
          defaultValue={resolvedParams.rol ?? "todos"}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="todos">Todos</option>
          <option value="CLIENTE">Cliente</option>
          <option value="PROFESIONAL">Profesional</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button className="border rounded-lg px-3 py-2 text-sm">Filtrar</button>
      </form>

      <ul className="divide-y rounded-2xl border">
        {filteredUsers.map((user) => (
          <li key={user.userId} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">
                {user.email} · {user.role}
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {user.city ?? "—"}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}