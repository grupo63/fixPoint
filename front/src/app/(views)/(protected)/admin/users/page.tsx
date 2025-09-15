import UsersWrapper from "@/components/users/usersWrapper";

export default async function AdminPage() {
  return (
    <main className="flex flex-col p-6 gap-4">
      <h1 className="text-2xl font-semibold">Usuarios</h1>
      <p className="text-sm text-gray-500">Listado de usuarios de la app</p>
      <UsersWrapper />
    </main>
  );
}
