"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Incidencia {
  id: number;
  descripcion: string;
  estado: string;
  fechaCreacion: string;
  usuario?: {
    nombre: string;
  } | null;
  tecnico?: {
    nombre: string;
  } | null;
}

function EstadoBadge({ estado }: { estado: string }) {
  const e = estado.toUpperCase();
  if (e === "CERRADA") {
    return (
      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-200">
        CERRADA
      </span>
    );
  }
  if (e === "EN_PROCESO") {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 ring-1 ring-amber-200">
        EN PROCESO
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-200">
      ABIERTA
    </span>
  );
}

export default function IncidenciasPage() {
  const router = useRouter();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncidencias() {
      try {
        const res = await fetch("/api/incidencias");
        const data = await res.json();

        if (res.status === 401) {
          setError("No autenticado");
          return;
        }

        if (!res.ok) {
          setError(data.error || "Error al cargar incidencias");
          return;
        }

        setIncidencias(data);
      } catch {
        setError("Error de conexión con el servidor");
      } finally {
        setCargando(false);
      }
    }

    fetchIncidencias();
  }, []);

  if (cargando) {
    return (
      <main className="p-6 text-sm text-slate-600">
        Cargando incidencias...
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6">
        <p className="mb-3 text-sm text-red-600">{error}</p>
        {error === "No autenticado" && (
          <button
            onClick={() => router.push("/")}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Ir al inicio de sesión
          </button>
        )}
      </main>
    );
  }

  return (
    <main className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Incidencias</h1>
          <p className="text-xs text-slate-600">
            Listado de incidencias visibles según tu rol.
          </p>
        </div>
        <button
          onClick={() => router.push("/incidencias/nueva")}
          className="rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700"
        >
          + Nueva incidencia
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {incidencias.length === 0 ? (
          <div className="p-6 text-sm text-slate-600">
            No hay incidencias registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Descripción</th>
                  <th className="px-4 py-2">Estado</th>
                  <th className="px-4 py-2 whitespace-nowrap">
                    Fecha creación
                  </th>
                  <th className="px-4 py-2">Usuario</th>
                  <th className="px-4 py-2">Técnico</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {incidencias.map((inc, idx) => (
                  <tr
                    key={inc.id}
                    className={`border-b border-slate-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                    } hover:bg-slate-100`}
                  >
                    <td className="px-4 py-2 text-slate-700">{inc.id}</td>
                    <td className="px-4 py-2 text-slate-900">
                      <p className="max-w-xs break-words text-[13px]">
                        {inc.descripcion}
                      </p>
                    </td>
                    <td className="px-4 py-2">
                      <EstadoBadge estado={inc.estado} />
                    </td>
                    <td className="px-4 py-2 text-slate-700 whitespace-nowrap">
                      {new Date(inc.fechaCreacion).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {inc.usuario?.nombre ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-slate-700">
                      {inc.tecnico?.nombre ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => router.push(`/incidencias/${inc.id}`)}
                        className="rounded-md border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Ver / gestionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={() => router.push("/dashboard")}
        className="text-xs text-slate-600 hover:text-slate-900"
      >
        ← Volver al dashboard
      </button>
    </main>
  );
}
