
"use client";

import { apiUrl } from "@/lib/apiUrl";
import type { MeResponse, UserProfile } from "@/types/types";
import { mapMeToUserProfile } from "@/services/mapper/userMapper";

export async function fetchUserClientSide(): Promise<UserProfile | null> {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    

    const res = await fetch(apiUrl("/auth/me"), {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new Error("No autorizado");

    const me: MeResponse = await res.json();

    return mapMeToUserProfile(me);
  } catch (error) {
    console.error("[Client] Error fetching profile:", error);
    return null;
  }
}

// import { serverApiFetch } from "@/lib/api-server";
// import { apiUrl } from "@/lib/apiUrl";
// import type { MeResponse, UserProfile } from "@/types/types";
// import { mapMeToUserProfile } from "@/services/mapper/userMapper";

// export async function getAuthenticatedUserProfile(): Promise<UserProfile | null> {
//   try {
//     const me = await serverApiFetch<MeResponse>(apiUrl("/auth/me"));
//     console.log(me)
//     return mapMeToUserProfile(me);
//   } catch (error) {
//     console.error("[userService] Error fetching profile:", error);
//     return null;
//   }
// }
