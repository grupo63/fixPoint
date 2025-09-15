"use client";

import { useEffect, useState } from "react";
import { fetchUsers } from "@/services/userService";
import { User } from "@/types/types";
import UsersList from "./usersTable";
import RoleTabs from "./RoleTabs";

export default function UsersWrapper() {
  const [users, setUsers] = useState<User[]>([]);
  const [filterRole, setFilterRole] = useState<
    "all" | "client" | "professional"
  >("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch {
        setError("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredUsers =
    filterRole === "all" ? users : users.filter((u) => u.role === filterRole);

  if (loading) return <p>Cargando usuarios...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-4">
      <RoleTabs onChange={setFilterRole} />
      <UsersList users={filteredUsers} />
    </div>
  );
}
