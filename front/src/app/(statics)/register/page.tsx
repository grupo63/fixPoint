"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "./components/register-form";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-8">
        <RegisterForm onSuccess={() => router.push("/signin")} />
      </div>
    </main>
  );
}
