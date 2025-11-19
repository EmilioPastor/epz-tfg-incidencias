"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevaIncidenciaPage() {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setCargando(true);

    try {
      const res = await fetch("/api/incidencias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descripcion }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear la incidencia.");
        return;
      }

      setOk("Incidencia creada correctamente.");
      setDescripcion("");
      setTimeout(() => router.push("/incidencias"), 900);
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            Nueva incidencia
          </h1>
          <p className="text-xs text-slate-600">
            Detalla el problema para que pueda ser gestionado por el equipo
            técnico.
          </p>
        </div>
        <button
          onClick={() => router.push("/incidencias")}
          className="border border-slate-400 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-900 hover:bg-slate-100"
        >
          Volver al listado
        </button>
      </div>

      <section className="max-w-3xl border border-slate-300 bg-white p-4 text-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-slate-800">
              Descripción de la incidencia
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={7}
              className="w-full border border-slate-400 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="Ejemplo: El equipo del puesto 3 no arranca, muestra un pitido continuo al encender y no llega a cargar el sistema operativo..."
            />
          </div>

          {error && (
            <p className="border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          {ok && (
            <p className="border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {ok}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="border border-slate-400 bg-white px-4 py-2 text-[12px] font-medium text-slate-900 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="border border-blue-700 bg-blue-700 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {cargando ? "Guardando..." : "Crear incidencia"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
