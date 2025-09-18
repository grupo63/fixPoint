"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import fetchCategories from "@/services/categorieServices";

type Category = { id: string; name: string };
type ServiceItem = {
  id: string;
  title: string;
  description?: string | null;
  category?: { id: string; name: string } | null;
  categoryId?: string; // por si tu entity expone FK
  professional?: { id: string } | null;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

// --- helpers locales (si ya creaste servicesApi, podés importarlos en vez de esto) ---
async function getServicesByProfessional(professionalId: string): Promise<ServiceItem[]> {
  // Si aún no expusiste GET /services?professionalId=..., puedes usar GET /services y filtrar client-side
  const url = `${API}/services?professionalId=${encodeURIComponent(professionalId)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "No se pudieron obtener los servicios");
  }
  return res.json();
}

async function createService(input: {
  title: string;
  description?: string;
  categoryId: string;
  professionalId: string;
}): Promise<ServiceItem> {
  const res = await fetch(`${API}/services`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "No se pudo crear el servicio");
  }
  return res.json();
}
// -------------------------------------------------------------------------------

export default function ServicesPage() {
  const { user } = useAuth();
  const professionalId = useMemo(() => (user as any)?.professional?.id ?? "", [user]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // form crear
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
  });
  const isCreateDisabled = !form.categoryId || !form.title.trim();

  useEffect(() => {
    const load = async () => {
      try {
        setErr(null);
        const [cats] = await Promise.all([fetchCategories()]);
        setCategories(cats ?? []);
      } catch (e: any) {
        setErr(e?.message ?? "Error cargando categorías");
      }
    };
    load();
  }, []);

  const refreshServices = async () => {
    if (!professionalId) return;
    try {
      setErr(null);
      setLoading(true);
      const list = await getServicesByProfessional(professionalId);
      setServices(list);
    } catch (e: any) {
      setErr(e?.message ?? "Error cargando servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [professionalId]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId) {
      setErr("No se detectó el profesional.");
      return;
    }
    try {
      setErr(null);
      await createService({
        professionalId,
        categoryId: form.categoryId,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
      });
      setForm({ categoryId: form.categoryId, title: "", description: "" });
      await refreshServices();
    } catch (e: any) {
      setErr(e?.message ?? "Error al crear el servicio");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Mis servicios</h1>
      </header>

      {/* Crear nuevo servicio */}
      <section className="bg-white rounded-xl shadow p-5 space-y-4">
        <h2 className="text-lg font-medium">Crear servicio</h2>
        <form onSubmit={onCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Categoría</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">Elegí una categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Título del servicio</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Ej: Colocación de revoques"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-medium mb-1">Descripción (opcional)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Detalles, materiales, etc."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

        <div className="col-span-1 md:col-span-3">
          <button
            type="submit"
            disabled={isCreateDisabled}
            className="px-4 py-2 bg-[#162748] text-white rounded-lg disabled:opacity-50"
          >
            Crear servicio
          </button>
        </div>
        </form>
        {err && <p className="text-sm text-red-600">{err}</p>}
      </section>

      {/* Listado */}
      {/* <section className="bg-white rounded-xl shadow p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">Servicios creados</h2>
          <button
            onClick={refreshServices}
            className="px-3 py-1.5 border rounded-lg text-sm"
          >
            Actualizar
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Cargando…</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-gray-500">Todavía no creaste servicios.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {services.map((s) => (
              <li key={s.id} className="border rounded-lg p-4">
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-gray-600">
                  {s.category?.name ?? "Sin categoría"}
                </p>
                {s.description && (
                  <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                )}
                <p className="text-[11px] text-gray-400 mt-2">
                  serviceId: <code>{s.id}</code>
                </p>
              </li>
            ))}
          </ul>
        )}
      </section> */}
    </div>
  );
}
