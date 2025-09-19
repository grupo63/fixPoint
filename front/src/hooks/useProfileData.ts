// src/hooks/useProfileData.ts
"use client";

import { useEffect, useState } from "react";
import type { MeResponse } from "@/types/types";
import {
  getMeClient,
  getUserByIdClient,
  getMyProfessionalClient,
  type ProfessionalDTO,
} from "@/services/userService";

type RoleSource = "users/:id" | "jwt" | "none";

export type ProfileBundle = {
  loading: boolean;
  error: string | null;
  me: MeResponse | null;
  professional: ProfessionalDTO | null;
  isProfessional: boolean;
  roleUpper: string; // para debug
  roleSource: RoleSource; // para debug
};

function readToken(): string | null {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function decodeRoleFromJWT(bearer?: string | null): string | null {
  try {
    if (!bearer) return null;
    const [, payload] = bearer.split(".");
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );
    return (
      json.role ||
      json.roles?.[0] ||
      json.auth ||
      json.authorities?.[0] ||
      ""
    ).toString();
  } catch {
    return null;
  }
}

export function useProfileData(): ProfileBundle {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [professional, setProfessional] = useState<ProfessionalDTO | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [roleUpper, setRoleUpper] = useState<string>("");
  const [roleSource, setRoleSource] = useState<RoleSource>("none");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Yo (/auth/me)
        const meResp = await getMeClient();
        if (!alive) return;
        setMe(meResp);

        // 2) Rol (users/:id o JWT)
        let roleU = "";
        try {
          const user = await getUserByIdClient(meResp.id);
          roleU = (user?.role ?? "").toString().toUpperCase();
          if (roleU) {
            if (!alive) return;
            setRoleUpper(roleU);
            setRoleSource("users/:id");
          }
        } catch {
          /* ignore */
        }

        if (!roleU) {
          const token = readToken();
          const fromJwt = (decodeRoleFromJWT(token) ?? "").toUpperCase();
          if (!alive) return;
          roleU = fromJwt;
          setRoleUpper(fromJwt);
          setRoleSource(fromJwt ? "jwt" : "none");
        }

        // 3) Professional SÓLO si el rol es PROFESSIONAL
        if (roleU === "PROFESSIONAL") {
          const pro = await getMyProfessionalClient(meResp.id).catch(
            () => null
          );

          if (!alive) return;
          setProfessional(pro ?? null);
        } else {
          setProfessional(null); // limpiar si no es professional
        }
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Error cargando perfil");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ Regla clara: es professional sólo si el rol lo dice
  const isProfessional = roleUpper === "PROFESSIONAL";

  return {
    loading,
    error,
    me,
    professional,
    isProfessional,
    roleUpper,
    roleSource,
  };
}
