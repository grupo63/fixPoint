"use client";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/getCurrent";
import { IUser } from "@/types/types";
import UserProfileCard from "@/components/profileView/profileSummary";

export default function ProfilePage() {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    getCurrentUser().then((data) => setUser(data));
  }, []);

  if (!user) return <p className="text-center mt-10">Cargando...</p>;

  return (
    <main className="min-h-screen py-10 px-4 bg-gray-50">
      <UserProfileCard user={user} />
    </main>
  );
}
