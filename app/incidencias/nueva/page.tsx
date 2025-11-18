"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaIncidenciaPage() {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setLoading(true);

    try {
      const res = await fetch("/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la incidencia");
        return;
      }

      setOk("Incidencia creada correctamente.");
      setDescripcion("");
      setTimeout(() => router.push("/incidencias"), 1000);
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-4">
      <button
        onClick={() => router.push("/incidencias")}
        className="text-xs text-slate-600 hover:text-slate-900"
      >
        ← Volver al listado
      </button>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-semibold">Nueva incidencia</h1>
        <p className="text-xs text-slate-600">
          Describe de forma clara el problema detectado para que pueda ser
          gestionado por el equipo técnico.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Descripción de la incidencia
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Ejemplo: El equipo del puesto 3 no enciende, muestra un pitido continuo al arrancar y no llega a cargar el sistema operativo..."
            />
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          {ok && (
            <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {ok}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/incidencias")}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Guardando..." : "Crear incidencia"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
