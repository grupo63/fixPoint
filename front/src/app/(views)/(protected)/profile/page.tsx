"use client";
import { useEffect, useState } from "react";
import { fetchUserClientSide } from "@/services/userService";
import type { UserProfile } from "@/types/types";
import ProfileSummary from "@/components/profileView/profileSummary";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUserClientSide().then(setUser);
  }, []);

  if (!user) return <p>Cargando…</p>;

  return (
    <div>
      {/* <h2>Hola, {user.name}</h2>
      <p>Email: {user.email}</p>
      <p></p> */}
<ProfileSummary user={{
        id:user.userId ,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        city: user.city,
        address: user.address,
        zipCode: user.zipCode,
        registrationDate: user.registrationDate,
        profileImg: user.profileImg
      }}/>
    </div>
  );
}
