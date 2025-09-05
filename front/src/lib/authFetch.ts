import { useAuth } from "@/context/AuthContext";

/**
 * Hook que devuelve un fetch autenticado que:
 * 1) agrega Authorization: Bearer <accessToken>
 * 2) si recibe 401, pide /api/auth/refresh con refreshToken, actualiza accessToken y reintenta una vez
 */
export function useAuthFetch() {
  const { accessToken, refreshToken, updateAccessToken, logout } = useAuth() as any;

  const authFetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const withAuth = (token: string | null) => ({
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": (init.headers as any)?.["Content-Type"] || "application/json",
      },
    });

    // 1° intento con el accessToken actual
    let res = await fetch(input, withAuth(accessToken));

    // Si expira, intentamos refrescar
    if (res.status === 401 && refreshToken) {
      const r = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (r.ok) {
        const { accessToken: newAccess } = await r.json();
        updateAccessToken(newAccess);
        // Reintento con el nuevo token
        res = await fetch(input, withAuth(newAccess));
      } else {
        // refresh falló → cerramos sesión
        await logout();
      }
    }

    return res;
  };

  return authFetch;
}
