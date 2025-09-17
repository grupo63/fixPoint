"use client";

import { useEffect, useState } from "react";
import { fetchUsers, fetchUsersByRole } from "@/services/userService";
import { User } from "@/types/types";
import UsersList from "./usersTable";
import RoleTabs from "./RoleTabs";

type Role = "all" | "professional" | "client";

export default function UsersWrapper() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cache local por rol
  const [cache, setCache] = useState<Record<Role, User[]>>({
    all: [],
    professional: [],
    client: [],
  });

  // traducción de roles front → back
  const roleMap: Record<"professional" | "client", "PROFESSIONAL" | "USER"> = {
    professional: "PROFESSIONAL",
    client: "USER",
  };

  useEffect(() => {
    loadUsers(); // al inicio: todos
  }, []);

  const loadUsers = async () => {
    // si ya está en cache, no recargamos
    if (cache.all.length > 0) {
      setUsers(cache.all);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
      setCache((c) => ({ ...c, all: data }));
    } catch {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const loadByRole = async (role: "professional" | "client") => {
    if (cache[role].length > 0) {
      setUsers(cache[role]);
      return;
    }

    setLoading(true);
    try {
      const apiRole = roleMap[role];
      const data = await fetchUsersByRole(apiRole);
      setUsers(data);
      setCache((c) => ({ ...c, [role]: data }));
    } catch {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <RoleTabs
        onChange={(role) => {
          if (role === "all") {
            loadUsers();
          } else {
            loadByRole(role);
          }
        }}
      />
      {loading && cache.all.length === 0 && (
        <p className="text-sm text-gray-400">Cargando...</p>
      )}
      {error && <p className="text-red-500">{error}</p>}
      <UsersList users={users} />
    </div>
  );
}
