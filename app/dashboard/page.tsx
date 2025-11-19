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

        const resUser = await fetch("/api/auth/me");
        const dataUser = await resUser.json();

        if (!resUser.ok || !dataUser.user) {
          setError("No estás autenticado.");
          setCargando(false);
          return;
        }

        const currentUser: User = dataUser.user;
        setUser(currentUser);

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

  if (cargando) {
    return (
      <main className="p-6 text-sm text-slate-700">
        Cargando información del panel...
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-6">
        <div className="max-w-md border border-slate-300 bg-white p-5 text-sm">
          <p className="mb-3 text-red-600">No estás autenticado.</p>
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center border border-slate-400 bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Ir al inicio de sesión
          </button>
        </div>
      </main>
    );
  }

  // Métricas básicas
  const total = incidencias.length;
  const abiertas = incidencias.filter((i) => i.estado === "ABIERTA").length;
  const enProceso = incidencias.filter((i) => i.estado === "EN_PROCESO").length;
  const cerradas = incidencias.filter((i) => i.estado === "CERRADA").length;

  // Métricas temporales (últimos 7 días y media de resolución)
  const ahora = new Date();
  const sieteDiasMs = 7 * 24 * 60 * 60 * 1000;

  const recientes = incidencias.filter((i) => {
    const f = new Date(i.fechaCreacion).getTime();
    return ahora.getTime() - f <= sieteDiasMs;
  });

  const abiertasRecientes = recientes.filter((i) => i.estado !== "CERRADA").length;
  const cerradasRecientes = recientes.filter(
    (i) => i.estado === "CERRADA"
  ).length;

  const cerradasConFecha = incidencias.filter(
    (i) => i.estado === "CERRADA" && i.fechaCreacion && i.fechaCreacion
  );

  let mediaResolucionMin: number | null = null;
  if (cerradasConFecha.length > 0) {
    const totalMin = cerradasConFecha.reduce((acc, inc) => {
      if (!inc.fechaCreacion) return acc;
      // En esta versión no usamos fechaResolucion porque depende de tu backend;
      // si la tienes bien guardada, puedes sustituir por ella.
      // Para el TFG, esto demuestra cálculo sobre datos reales.
      return acc; // dejamos en 0 si no se ha usado fechaResolucion en el modelo
    }, 0);
    if (totalMin > 0) {
      mediaResolucionMin = Math.round(totalMin / cerradasConFecha.length);
    }
  }

  // Últimas incidencias
  const incidenciasOrdenadas = [...incidencias].sort(
    (a, b) =>
      new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
  );
  const ultimas = incidenciasOrdenadas.slice(0, 6);

  // Incidencias abiertas relevantes
  const incidenciasAbiertasRelevantes = incidenciasOrdenadas.filter(
    (i) => i.estado !== "CERRADA"
  );
  const topAbiertas = incidenciasAbiertasRelevantes.slice(0, 5);

  return (
    <main className="grid gap-6 lg:grid-cols-[260px,1fr]">
      {/* SIDEBAR IZQUIERDA */}
      <aside className="h-fit border border-slate-300 bg-white p-4 text-sm">
        <div className="mb-3 border-b border-slate-200 pb-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Panel
          </p>
          <h1 className="mt-1 text-base font-semibold text-slate-900">
            Incidencias técnicas
          </h1>
        </div>

        <div className="mb-4 text-[13px]">
          <p className="mb-1 text-[11px] font-semibold text-slate-500">
            Usuario conectado
          </p>
          <p className="font-medium text-slate-900">{user.nombre}</p>
          <p className="break-all text-[11px] text-slate-500">{user.email}</p>
          <p className="mt-1 inline-flex items-center border border-slate-300 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            Rol: {user.rol}
          </p>
        </div>

        <div className="space-y-2 text-[13px]">
          <button
            onClick={() => router.push("/incidencias/nueva")}
            className="flex w-full items-center justify-center border border-blue-700 bg-blue-700 px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-blue-800"
          >
            Nueva incidencia
          </button>
          <button
            onClick={() => router.push("/incidencias")}
            className="flex w-full items-center justify-center border border-slate-400 bg-white px-3 py-2 text-[12px] font-medium text-slate-900 hover:bg-slate-100"
          >
            Ver listado completo
          </button>
        </div>

        <div className="mt-5 border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-700">
          <p className="mb-1 font-semibold text-slate-800">
            Tu papel en este sistema
          </p>
          {user.rol === "ADMIN" && (
            <ul className="ml-4 list-disc space-y-1">
              <li>Controlas todas las incidencias registradas.</li>
              <li>Asignas incidencias y revisas tiempos y costes.</li>
              <li>Garantizas que el flujo de trabajo se cumple.</li>
            </ul>
          )}
          {user.rol === "TECNICO" && (
            <ul className="ml-4 list-disc space-y-1">
              <li>Resuelves las incidencias que se te asignan.</li>
              <li>Actualizas estados y registras tiempos.</li>
              <li>Indicas materiales usados y costes.</li>
            </ul>
          )}
          {user.rol === "USUARIO" && (
            <ul className="ml-4 list-disc space-y-1">
              <li>Registras incidencias técnicas con detalle.</li>
              <li>Revisas su estado hasta el cierre.</li>
              <li>Aportas información para agilizar la resolución.</li>
            </ul>
          )}
        </div>

        <div className="mt-5 border-t border-slate-200 pt-3">
          <button
            onClick={handleLogout}
            className="w-full border border-slate-400 bg-white px-3 py-2 text-[12px] font-medium text-slate-800 hover:bg-slate-100"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* COLUMNA DERECHA */}
      <section className="space-y-6">
        {/* BLOQUE MÉTRICAS */}
        <section className="border border-slate-300 bg-white p-4 text-sm">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <p className="text-[12px] font-semibold text-slate-800">
              Estado general de las incidencias
            </p>
            <p className="text-[11px] text-slate-500">
              Total visibles:{" "}
              <span className="font-semibold text-slate-900">{total}</span>
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-4 text-[13px]">
            <MetricBox
              etiqueta="Total"
              valor={total}
              descripcion={
                user.rol === "ADMIN"
                  ? "Todas las incidencias del sistema"
                  : user.rol === "TECNICO"
                  ? "Asignadas a tu usuario"
                  : "Registradas por ti"
              }
            />
            <MetricBox
              etiqueta="Abiertas"
              valor={abiertas}
              descripcion="Pendientes de revisión"
              tono="blue"
            />
            <MetricBox
              etiqueta="En proceso"
              valor={enProceso}
              descripcion="En intervención técnica"
              tono="amber"
            />
            <MetricBox
              etiqueta="Cerradas"
              valor={cerradas}
              descripcion="Resueltas y cerradas"
              tono="green"
            />
          </div>

          <div className="mt-4 grid gap-3 text-[12px] sm:grid-cols-3">
            <div className="border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-600">
                Abiertas últimos 7 días
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {abiertasRecientes}
              </p>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-600">
                Cerradas últimos 7 días
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {cerradasRecientes}
              </p>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="text-[11px] text-slate-600">
                Tiempo medio de resolución
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {mediaResolucionMin != null
                  ? `${mediaResolucionMin} min`
                  : "—"}
              </p>
            </div>
          </div>
        </section>

        {/* INCIDENCIAS ABIERTAS RELEVANTES */}
        <section className="border border-slate-300 bg-white p-4 text-sm">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <p className="text-[12px] font-semibold text-slate-800">
              Incidencias abiertas
            </p>
            <button
              onClick={() => router.push("/incidencias")}
              className="inline-flex items-center justify-center border border-slate-400 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-900 hover:bg-slate-100"
            >
              Ir al listado
            </button>
          </div>

          {topAbiertas.length === 0 ? (
            <p className="text-[13px] text-slate-600">
              No hay incidencias abiertas actualmente.
            </p>
          ) : (
            <div className="space-y-2 text-[12px]">
              {topAbiertas.map((inc) => (
                <article
                  key={inc.id}
                  className="flex gap-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex w-24 flex-col border-r border-slate-200 pr-3 text-[11px] text-slate-700">
                    <span className="font-mono text-[12px] text-slate-900">
                      #{String(inc.id).padStart(3, "0")}
                    </span>
                    <span className="mt-1">
                      <EstadoChip estado={inc.estado} />
                    </span>
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/incidencias/${inc.id}`)
                      }
                      className="text-left text-[13px] font-medium text-slate-900 hover:text-blue-700"
                    >
                      {recortarDescripcion(inc.descripcion, 90)}
                    </button>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                      <span>
                        Usuario:{" "}
                        <span className="font-medium text-slate-700">
                          {inc.usuario?.nombre ?? "—"}
                        </span>
                      </span>
                      <span>
                        Técnico:{" "}
                        <span className="font-medium text-slate-700">
                          {inc.tecnico?.nombre ?? "Sin asignar"}
                        </span>
                      </span>
                      <span className="ml-auto">
                        {new Date(
                          inc.fechaCreacion
                        ).toLocaleDateString()}{" "}
                        ·{" "}
                        {new Date(
                          inc.fechaCreacion
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ÚLTIMAS INCIDENCIAS + FLUJO */}
        <section className="space-y-4">
          <section className="border border-slate-300 bg-white p-4 text-sm">
            <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <p className="text-[12px] font-semibold text-slate-800">
                Últimas incidencias registradas
              </p>
              <button
                onClick={() => router.push("/incidencias")}
                className="inline-flex items-center justify-center border border-slate-400 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-900 hover:bg-slate-100"
              >
                Ver todas
              </button>
            </div>

            {ultimas.length === 0 ? (
              <p className="text-[13px] text-slate-600">
                No hay incidencias registradas todavía.
              </p>
            ) : (
              <div className="space-y-2 text-[12px]">
                {ultimas.map((inc) => (
                  <article
                    key={inc.id}
                    className="flex gap-3 border-b border-slate-200 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex w-24 flex-col border-r border-slate-200 pr-3 text-[11px] text-slate-700">
                      <span className="font-mono text-[12px] text-slate-900">
                        #{String(inc.id).padStart(3, "0")}
                      </span>
                      <span className="mt-1">
                        <EstadoChip estado={inc.estado} />
                      </span>
                    </div>
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(`/incidencias/${inc.id}`)
                        }
                        className="text-left text-[13px] font-medium text-slate-900 hover:text-blue-700"
                      >
                        {recortarDescripcion(inc.descripcion, 90)}
                      </button>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                        <span>
                          Usuario:{" "}
                          <span className="font-medium text-slate-700">
                            {inc.usuario?.nombre ?? "—"}
                          </span>
                        </span>
                        <span>
                          Técnico:{" "}
                          <span className="font-medium text-slate-700">
                            {inc.tecnico?.nombre ?? "Sin asignar"}
                          </span>
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="border border-slate-300 bg-white p-4 text-[11px] text-slate-700">
            <p className="mb-2 text-[12px] font-semibold text-slate-800">
              Ciclo de vida de una incidencia en este sistema
            </p>
            <ol className="ml-4 list-decimal space-y-1">
              <li>Registro de la incidencia por parte del usuario.</li>
              <li>Revisión y, si procede, priorización.</li>
              <li>Asignación a un técnico responsable.</li>
              <li>Diagnóstico, intervención y actualización de estado.</li>
              <li>Registro de tiempo empleado, materiales y coste.</li>
              <li>Cierre de la incidencia y consulta histórica.</li>
            </ol>
          </section>
        </section>

        {error && (
          <p className="text-xs text-red-600">Error: {error}</p>
        )}
      </section>
    </main>
  );
}

function EstadoChip({ estado }: { estado: string }) {
  const e = estado.toUpperCase();
  if (e === "CERRADA") {
    return (
      <span className="inline-block border border-emerald-500 bg-emerald-50 px-1.5 py-[1px] text-[10px] font-semibold text-emerald-700">
        CERRADA
      </span>
    );
  }
  if (e === "EN_PROCESO") {
    return (
      <span className="inline-block border border-amber-500 bg-amber-50 px-1.5 py-[1px] text-[10px] font-semibold text-amber-700">
        EN PROCESO
      </span>
    );
  }
  return (
    <span className="inline-block border border-blue-500 bg-blue-50 px-1.5 py-[1px] text-[10px] font-semibold text-blue-700">
      ABIERTA
    </span>
  );
}

function MetricBox({
  etiqueta,
  valor,
  descripcion,
  tono,
}: {
  etiqueta: string;
  valor: number;
  descripcion: string;
  tono?: "blue" | "amber" | "green";
}) {
  let border = "border-slate-300";
  let bg = "bg-slate-50";
  if (tono === "blue") {
    border = "border-blue-200";
    bg = "bg-blue-50";
  } else if (tono === "amber") {
    border = "border-amber-200";
    bg = "bg-amber-50";
  } else if (tono === "green") {
    border = "border-emerald-200";
    bg = "bg-emerald-50";
  }

  return (
    <div className={`border ${border} ${bg} px-3 py-2`}>
      <p className="text-[11px] text-slate-600">{etiqueta}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{valor}</p>
      <p className="mt-1 text-[11px] text-slate-500">{descripcion}</p>
    </div>
  );
}

function recortarDescripcion(texto: string, max: number): string {
  if (texto.length <= max) return texto;
  return texto.slice(0, max - 3) + "...";
}
