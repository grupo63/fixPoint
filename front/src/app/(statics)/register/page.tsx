"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "./components/register-form";

export default function RegisterPage() {
  const router = useRouter();

  return (
    <main>
      <RegisterForm />
    </main>
  );
}
