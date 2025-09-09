"use client";

import * as React from "react";
import Image from "next/image";
import { apiFetch } from "@/lib/api-client";
import { IUser } from "@/types/types";
import { Professional } from "@/types/profesionalTypes";
import { ProfileSummary } from "@/components/profileView/profileSummary";
import { DashboardCard } from "@/components/profesionalProfile/dashboardCard";

type MeResponse = {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
};

function mapMeToIUser(me: MeResponse): IUser {
  return {
    userId: me.id,
    email: me.email,
    name: me.name ?? "",
    profileImg: me.avatar ?? "",
    password: "",
    birthDate: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    role: "CLIENTE",
    registrationDate: new Date().toISOString(),
  };
}

function formatSince(iso?: string) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return new Intl.DateTimeFormat("es-AR", {
    month: "short",
    year: "numeric",
  }).format(d);
}

export default function ProfilePage() {
  const [user, setUser] = React.useState<IUser | null>(null);
  const [pro, setPro] = React.useState<Professional | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const me = (await apiFetch("http://localhost:3001/auth/me")) as MeResponse;
        const u = mapMeToIUser(me);

        if (!mounted) return;
        setUser(u);

        // Si tenés endpoint de profesional, podés usar esto también:
        // const prof = await apiFetch(`http://localhost:3001/professional/${u.userId}`);
        // setPro(prof as Professional);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "No se pudo cargar el perfil");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-2">Cargando…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-red-600 mt-2">{error}</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Mi perfil</h1>
        <p className="text-sm text-red-600 mt-2">No se encontró el usuario.</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mi perfil</h1>

      <div className="flex items-center gap-4">
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name || user.email || "avatar"}
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-200" />
        )}
        <div>
          <p className="font-medium">{user.name || "Sin nombre"}</p>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </div>

      <ProfileSummary user={user} />

      {pro && (
        <DashboardCard title="Información profesional">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Especialidad:</span> {pro.speciality}
            </div>
            <div>
              <span className="font-medium">Ubicación:</span> {pro.location ?? "-"}
            </div>
            <div>
              <span className="font-medium">Radio:</span> {pro.workingRadius} km
            </div>
            <div>
              <span className="font-medium">Estado:</span>{" "}
              <span className={pro.isActive ? "text-emerald-700" : "text-gray-500"}>
                {pro.isActive ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="font-medium">Desde:</span> {formatSince(pro.createdAt)}
            </div>
            {pro.averageRating != null && pro.reviewsCount != null && (
              <div className="col-span-2">
                <span className="font-medium">Rating:</span> {pro.averageRating} ⭐ ({pro.reviewsCount} reseñas)
              </div>
            )}
          </div>
        </DashboardCard>
      )}
    </main>
  );
}
