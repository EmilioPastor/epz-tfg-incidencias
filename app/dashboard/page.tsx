"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserRole = "USUARIO" | "TECNICO" | "ADMIN";

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

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

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setCargando(true);
        setError(null);

        // 1) Usuario autenticado
        const resUser = await fetch("/api/auth/me");
        const dataUser = await resUser.json();

        if (!resUser.ok || !dataUser.user) {
          setError("No estás autenticado.");
          setCargando(false);
          return;
        }

        const currentUser: User = dataUser.user;
        setUser(currentUser);

        // 2) Incidencias visibles para ese usuario (según backend)
        const resInc = await fetch("/api/incidencias");
        const dataInc = await resInc.json();

        if (!resInc.ok) {
          setError(dataInc.error || "Error al cargar incidencias.");
          setCargando(false);
          return;
        }

        setIncidencias(dataInc);
      } catch {
        setError("Error de conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    }

    load();
  }, []);

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).finally(() => {
      router.push("/");
    });
  }

  // Métricas básicas
  const total = incidencias.length;
  const abiertas = incidencias.filter((i) => i.estado === "ABIERTA").length;
  const enProceso = incidencias.filter((i) => i.estado === "EN_PROCESO").length;
  const cerradas = incidencias.filter((i) => i.estado === "CERRADA").length;

  const incidenciasOrdenadas = [...incidencias].sort(
    (a, b) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  );
  const ultimas = incidenciasOrdenadas.slice(0, 5);

  if (cargando) {
    return (
      <main className="p-6 text-sm text-slate-600">
        Cargando información del panel...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <div className="max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-red-600 mb-3">No estás autenticado.</p>
          <button
            onClick={() => router.push("/")}
            className="rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Cabecera del panel */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-1 rounded-full bg-sky-500" />
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-[0.15em]">
                  Panel de control
                </p>
                <h1 className="mt-1 text-lg font-semibold">
                  Incidencias técnicas
                </h1>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-600 max-w-md">
              Resumen general de las incidencias que puedes gestionar según tu
              rol en el sistema.
            </p>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700">
                {user.nombre}
              </span>
              <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[11px] font-medium text-sky-700">
                Rol: {user.rol}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-[11px] text-slate-500 hover:text-slate-800"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </section>

      {/* Métricas + últimas incidencias + bloque info rol */}
      <section className="grid gap-5 lg:grid-cols-[2fr,1.1fr]">
        {/* Columna izquierda: métricas + últimas incidencias */}
        <div className="space-y-5">
          {/* Métricas */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-3">
              Resumen de incidencias
            </p>
            <div className="grid gap-3 sm:grid-cols-4 text-sm">
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">Total</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {total}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {user.rol === "ADMIN"
                    ? "Todas las incidencias"
                    : user.rol === "TECNICO"
                    ? "Asignadas a ti"
                    : "Registradas por ti"}
                </p>
              </div>
              <div className="rounded-lg border border-sky-100 bg-sky-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">Abiertas</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {abiertas}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Pendientes de tratar
                </p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">En proceso</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {enProceso}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  En intervención técnica
                </p>
              </div>
              <div className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                <p className="text-[11px] text-slate-500">Cerradas</p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {cerradas}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Resueltas y finalizadas
                </p>
              </div>
            </div>
          </div>

          {/* Últimas incidencias */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-500">
                Últimas incidencias
              </p>
              <button
                onClick={() => router.push("/incidencias")}
                className="text-[11px] text-sky-700 hover:text-sky-900"
              >
                Ver todas
              </button>
            </div>

            {ultimas.length === 0 ? (
              <p className="text-sm text-slate-600">
                No hay incidencias registradas todavía.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    <tr>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Descripción</th>
                      <th className="px-3 py-2">Estado</th>
                      <th className="px-3 py-2 whitespace-nowrap">
                        Fecha creación
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ultimas.map((inc) => (
                      <tr
                        key={inc.id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                      >
                        <td className="px-3 py-2 text-slate-700">
                          #{inc.id}
                        </td>
                        <td className="px-3 py-2 text-slate-900">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/incidencias/${inc.id}`)
                            }
                            className="line-clamp-2 max-w-xs text-left text-[13px] text-slate-900 hover:text-sky-700"
                          >
                            {inc.descripcion}
                          </button>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {inc.usuario?.nombre ?? "Sin usuario"}
                            {inc.tecnico?.nombre &&
                              ` · Técnico: ${inc.tecnico.nombre}`}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-slate-700">
                          <EstadoPill estado={inc.estado} />
                        </td>
                        <td className="px-3 py-2 text-slate-700 whitespace-nowrap">
                          {new Date(inc.fechaCreacion).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: bloque contextual según rol */}
        <aside className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-slate-500 mb-2">
              Tu papel en el sistema
            </p>
            {user.rol === "ADMIN" && (
              <ul className="ml-4 list-disc space-y-1 text-xs text-slate-700">
                <li>Supervisas todas las incidencias registradas.</li>
                <li>Controlas el flujo de trabajo de usuarios y técnicos.</li>
                <li>
                  Puedes definir la política de respuesta y priorización (SLA).
                </li>
              </ul>
            )}
            {user.rol === "TECNICO" && (
              <ul className="ml-4 list-disc space-y-1 text-xs text-slate-700">
                <li>Resuelves las incidencias que se te asignan.</li>
                <li>Registras tiempos, materiales y coste de la actuación.</li>
                <li>Actualizas el estado para reflejar el progreso real.</li>
              </ul>
            )}
            {user.rol === "USUARIO" && (
              <ul className="ml-4 list-disc space-y-1 text-xs text-slate-700">
                <li>Comunicas problemas técnicos de forma estructurada.</li>
                <li>Haces seguimiento del estado de tus incidencias.</li>
                <li>Facilitas información clara para una resolución rápida.</li>
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-[11px] text-slate-600">
            <p className="font-medium text-slate-700 mb-1">
              Flujo de vida de una incidencia
            </p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Registro de la incidencia (usuario).</li>
              <li>Revisión y posible asignación (admin / técnico).</li>
              <li>Diagnóstico y resolución (técnico).</li>
              <li>Registro de tiempos, materiales y coste.</li>
              <li>Cierre y consulta histórica.</li>
            </ol>
          </div>
        </aside>
      </section>

      {error && (
        <p className="text-xs text-red-600">Error: {error}</p>
      )}
    </main>
  );
}

function EstadoPill({ estado }: { estado: string }) {
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
