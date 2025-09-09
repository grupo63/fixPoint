// src/services/mappers/userMapper.ts
import type { MeResponse, UserProfile } from "@/types/types";

export function mapMeToUserProfile(me: MeResponse): UserProfile {
  return {
    userId: me.id,
    name: me.name,
    email: me.email,
    role: me.role,
    phone: me.phone ?? null,
    city: me.city ?? null,
    address: me.address ?? null,
    zipCode: me.zipCode ?? null,
    registrationDate: me.registrationDate ?? null,
    profileImg: me.profileImg ?? null,
  };
}
