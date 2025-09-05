"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterForm from "./components/register-form";

type Mode = "NONE" | "USER" | "PRO";

export default function RegisterPage() {
  const [mode, setMode] = useState<Mode>("NONE");
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow p-8">
        {mode === "NONE" && (
          <Chooser onPick={(m) => setMode(m)} />
        )}

        {mode === "USER" && (
          <RegisterForm
            role="CLIENTE"
            onBack={() => setMode("NONE")}
            onSuccess={() => router.push("/signIn")}
          />
        )}

        {mode === "PRO" && (
          <RegisterForm
            role="PROFESIONAL"
            proExtras
            onBack={() => setMode("NONE")}
            onSuccess={() => router.push("/signIn")}
          />
        )}
      </div>
    </main>
  );
}

function Chooser({ onPick }: { onPick: (m: Mode) => void }) {
  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-8">
        Selecciona tu tipo de registro
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={() => onPick("USER")}
          className="group rounded-xl border p-6 text-left hover:shadow-md transition"
        >
          <div className="h-12 w-12 rounded-full border flex items-center justify-center mb-3">
            <span className="text-xl">👤</span>
          </div>
          <h3 className="font-semibold text-lg">Usuario normal</h3>
          <p className="text-sm text-gray-500">Registro estándar para clientes.</p>
        </button>

        <button
          onClick={() => onPick("PRO")}
          className="group rounded-xl border p-6 text-left hover:shadow-md transition"
        >
          <div className="h-12 w-12 rounded-full border flex items-center justify-center mb-3">
            <span className="text-xl">🏢</span>
          </div>
          <h3 className="font-semibold text-lg">Profesional</h3>
          <p className="text-sm text-gray-500">Incluye especialidad y descripción.</p>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-sm text-gray-600">
        
      </div>
    </div>
  );
}
