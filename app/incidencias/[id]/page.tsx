"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  usuarioId: number;
  tecnicoId: number | null;
  fechaResolucion: string | null;
  tiempoEmpleado: number | null;
  materiales: string | null;
  coste: number | null;
  usuario?: {
    nombre: string;
    email: string;
  } | null;
  tecnico?: {
    nombre: string;
    email: string;
  } | null;
}

interface Tecnico {
  id: number;
  nombre: string;
  email: string;
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

function toInputDateTimeValue(isoString: string | null): string {
  if (!isoString) return "";
  const d = new Date(isoString);
  const iso = d.toISOString();
  return iso.slice(0, 16);
}

export default function IncidenciaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [incidencia, setIncidencia] = useState<Incidencia | null>(null);
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [estado, setEstado] = useState("");
  const [tecnicoId, setTecnicoId] = useState<string>("");
  const [fechaResolucion, setFechaResolucion] = useState("");
  const [tiempoEmpleado, setTiempoEmpleado] = useState<string>("");
  const [materiales, setMateriales] = useState("");
  const [coste, setCoste] = useState<string>("");

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setOk(null);

        const resMe = await fetch("/api/auth/me");
        const dataMe = await resMe.json();

        if (!resMe.ok || !dataMe.user) {
          setError("No autenticado");
          setLoading(false);
          return;
        }

        const currentUser: User = dataMe.user;
        setUser(currentUser);

        const resInc = await fetch(`/api/incidencias/${id}`);
        const dataInc = await resInc.json();

        if (!resInc.ok) {
          setError(dataInc.error || "Error al cargar la incidencia.");
          setLoading(false);
          return;
        }

        const inc: Incidencia = dataInc;
        setIncidencia(inc);

        setEstado(inc.estado || "ABIERTA");
        setFechaResolucion(toInputDateTimeValue(inc.fechaResolucion));
        setTiempoEmpleado(inc.tiempoEmpleado ? String(inc.tiempoEmpleado) : "");
        setMateriales(inc.materiales ?? "");
        setCoste(inc.coste != null ? String(inc.coste) : "");
        setTecnicoId(inc.tecnicoId != null ? String(inc.tecnicoId) : "");

        if (currentUser.rol === "ADMIN") {
          const resTec = await fetch("/api/usuarios/tecnicos");
          const dataTec = await resTec.json();
          if (resTec.ok) setTecnicos(dataTec);
        }
      } catch {
        setError("Error de conexión con el servidor.");
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  const esAdmin = user?.rol === "ADMIN";
  const esTecnico = user?.rol === "TECNICO";
  const puedeEditar = !!user && (esAdmin || esTecnico);
  const estaCerrada = incidencia?.estado === "CERRADA";
  const horasAbierta = incidencia
    ? Math.round(
        (new Date().getTime() - new Date(incidencia.fechaCreacion).getTime()) /
          (1000 * 60 * 60)
      )
    : 0;
  const riesgoSLA =
    incidencia && incidencia.estado !== "CERRADA" && horasAbierta >= 72;

  async function actualizarIncidencia(
    extra: Partial<{
      estado: string;
      fechaResolucion: string | null;
      tiempoEmpleado: number | null;
      materiales: string | null;
      coste: number | null;
      tecnicoId: number | null;
    }> = {}
  ) {
    if (!incidencia || !user) return;

    setSaving(true);
    setError(null);
    setOk(null);

    try {
      const base: any = {
        estado,
        fechaResolucion: fechaResolucion || null,
        tiempoEmpleado: tiempoEmpleado
          ? Number(tiempoEmpleado)
          : null,
        materiales: materiales || null,
        coste: coste ? Number(coste) : null,
      };

      if (esAdmin) {
        base.tecnicoId = tecnicoId ? Number(tecnicoId) : null;
      }

      const body = { ...base, ...extra };

      const res = await fetch(`/api/incidencias/${incidencia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al guardar los cambios.");
        return;
      }

      const incActualizada: Incidencia = data;
      setIncidencia(incActualizada);

      // Sincronizamos el formulario con lo que viene del backend
      setEstado(incActualizada.estado);
      setFechaResolucion(
        toInputDateTimeValue(incActualizada.fechaResolucion)
      );
      setTiempoEmpleado(
        incActualizada.tiempoEmpleado
          ? String(incActualizada.tiempoEmpleado)
          : ""
      );
      setMateriales(incActualizada.materiales ?? "");
      setCoste(
        incActualizada.coste != null
          ? String(incActualizada.coste)
          : ""
      );
      setTecnicoId(
        incActualizada.tecnicoId != null
          ? String(incActualizada.tecnicoId)
          : ""
      );

      setOk("Cambios guardados correctamente.");
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await actualizarIncidencia();
  }

  async function marcarEnProceso() {
    if (!incidencia || !puedeEditar) return;
    setEstado("EN_PROCESO");
    await actualizarIncidencia({ estado: "EN_PROCESO" });
  }

  async function cerrarAhora() {
    if (!incidencia || !puedeEditar) return;

    const ahora = new Date();
    const creada = new Date(incidencia.fechaCreacion);
    const diffMin = Math.max(
      1,
      Math.round((ahora.getTime() - creada.getTime()) / 60000)
    );

    const tiempo =
      tiempoEmpleado && !Number.isNaN(Number(tiempoEmpleado))
        ? Number(tiempoEmpleado)
        : diffMin;

    const isoAhora = ahora.toISOString();

    setEstado("CERRADA");
    setFechaResolucion(toInputDateTimeValue(isoAhora));
    setTiempoEmpleado(String(tiempo));

    await actualizarIncidencia({
      estado: "CERRADA",
      fechaResolucion: isoAhora,
      tiempoEmpleado: tiempo,
    });
  }

  function calcularCosteAutomatico() {
    const minutos = Number(tiempoEmpleado);
    if (!minutos || Number.isNaN(minutos)) return;

    const tarifaHora = 30; // €/hora (puedes documentarlo en la memoria)
    const horas = minutos / 60;
    const costeCalculado = +(horas * tarifaHora).toFixed(2);
    setCoste(String(costeCalculado));
  }

  if (loading) {
    return (
      <main className="p-6 text-sm text-slate-700">
        Cargando incidencia...
      </main>
    );
  }

  if (error && (!incidencia || !user)) {
    return (
      <main className="p-6 text-sm">
        <div className="max-w-md border border-slate-300 bg-white p-4">
          <p className="mb-3 text-sm text-red-600">{error}</p>
          {error === "No autenticado" ? (
            <button
              onClick={() => router.push("/")}
              className="border border-blue-700 bg-blue-700 px-4 py-2 text-xs font-medium text-white hover:bg-blue-800"
            >
              Ir al inicio de sesión
            </button>
          ) : (
            <button
              onClick={() => router.push("/incidencias")}
              className="border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-900 hover:bg-slate-100"
            >
              Volver al listado
            </button>
          )}
        </div>
      </main>
    );
  }

  if (!incidencia || !user) {
    return (
      <main className="p-6 text-sm">
        <div className="max-w-md border border-slate-300 bg-white p-4">
          <p className="mb-3">Incidencia no encontrada.</p>
          <button
            onClick={() => router.push("/incidencias")}
            className="border border-slate-400 bg-white px-4 py-2 text-xs font-medium text-slate-900 hover:bg-slate-100"
          >
            Volver al listado
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-4 p-4 text-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Incidencia #{String(incidencia.id).padStart(3, "0")}
          </p>
          <h1 className="mt-1 text-base font-semibold text-slate-900">
            Detalle de incidencia
          </h1>
        </div>
        <button
          onClick={() => router.push("/incidencias")}
          className="border border-slate-400 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-900 hover:bg-slate-100"
        >
          Volver al listado
        </button>
      </div>

      <section className="grid gap-3 text-[12px] md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-600">Estado actual</p>
          <div className="mt-1 flex items-center gap-2">
            <EstadoChip estado={incidencia.estado} />
            <span className="text-[12px] font-semibold text-slate-900">
              {incidencia.estado === "CERRADA"
                ? "Resuelta"
                : incidencia.estado === "EN_PROCESO"
                ? "En intervención"
                : "Pendiente de revisión"}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            Creada el {new Date(incidencia.fechaCreacion).toLocaleString()}
          </p>
        </div>
        <div className={`rounded-md border p-3 ${
          riesgoSLA
            ? "border-amber-300 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        }`}>
          <p className="text-[11px] text-slate-600">Seguimiento de SLA</p>
          <p className="text-xl font-semibold text-slate-900">
            {horasAbierta} h en curso
          </p>
          <p className="mt-1 text-[11px] text-slate-600">
            {riesgoSLA
              ? "Más de 72h abierta. Prioriza su asignación o cierre."
              : "Dentro de la ventana operativa prevista."}
          </p>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-600">Siguiente paso</p>
          <ul className="ml-4 mt-1 list-disc space-y-1 text-slate-700">
            <li>Valida la descripción y adjunta materiales usados.</li>
            <li>Actualiza el estado o asigna un técnico.</li>
            <li>Guarda los tiempos para calcular el coste.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        {/* FICHA */}
        <article className="border border-slate-300 bg-white p-4 text-sm">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[13px] text-slate-900">
                #{String(incidencia.id).padStart(3, "0")}
              </span>
              <EstadoChip estado={incidencia.estado} />
            </div>
            <span className="text-[11px] text-slate-500">
              Creada el{" "}
              {new Date(incidencia.fechaCreacion).toLocaleString()}
            </span>
          </div>

          <div className="space-y-3 text-[13px]">
            <div>
              <p className="text-[11px] font-semibold text-slate-700">
                Descripción
              </p>
              <p className="mt-1 whitespace-pre-line text-slate-900">
                {incidencia.descripcion}
              </p>
            </div>

            <div className="grid gap-3 text-[12px] md:grid-cols-2">
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Usuario que registra
                </p>
                <p className="mt-1 text-slate-900">
                  {incidencia.usuario?.nombre}
                </p>
                <p className="text-[11px] text-slate-500">
                  {incidencia.usuario?.email}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Técnico asignado
                </p>
                <p className="mt-1 text-slate-900">
                  {incidencia.tecnico
                    ? incidencia.tecnico.nombre
                    : "Sin asignar"}
                </p>
                {incidencia.tecnico && (
                  <p className="text-[11px] text-slate-500">
                    {incidencia.tecnico.email}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-3 text-[12px] md:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Fecha de resolución
                </p>
                <p className="mt-1 text-slate-900">
                  {incidencia.fechaResolucion
                    ? new Date(
                        incidencia.fechaResolucion
                      ).toLocaleString()
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Tiempo empleado (min)
                </p>
                <p className="mt-1 text-slate-900">
                  {incidencia.tiempoEmpleado ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Coste (€)
                </p>
                <p className="mt-1 text-slate-900">
                  {incidencia.coste != null
                    ? incidencia.coste.toFixed(2)
                    : "—"}
                </p>
              </div>
            </div>

            {incidencia.materiales && (
              <div>
                <p className="text-[11px] font-semibold text-slate-700">
                  Materiales utilizados
                </p>
                <p className="mt-1 text-[12px] text-slate-900">
                  {incidencia.materiales}
                </p>
              </div>
            )}

            {!puedeEditar && (
              <p className="mt-2 text-[11px] text-slate-600">
                Para tu rol ({user.rol}) esta incidencia es de solo lectura.
              </p>
            )}
          </div>
        </article>

        {/* PANEL EDICIÓN */}
        {puedeEditar && (
          <aside className="border border-slate-300 bg-white p-4 text-[13px]">
            <p className="mb-2 text-[12px] font-semibold text-slate-800">
              Gestión técnica / administrativa
            </p>
            <p className="mb-3 text-[11px] text-slate-600">
              Actualiza el estado, asignación y datos de resolución de la
              incidencia.
            </p>

            {/* Acciones rápidas */}
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving || incidencia.estado === "EN_PROCESO" || estaCerrada}
                onClick={marcarEnProceso}
                className="border border-amber-500 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Marcar en proceso
              </button>
              <button
                type="button"
                disabled={saving || estaCerrada}
                onClick={cerrarAhora}
                className="border border-emerald-600 bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cerrar ahora
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-[12px]">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full border border-slate-400 bg-white px-2 py-2 text-[12px] outline-none focus:border-blue-600"
                >
                  <option value="ABIERTA">ABIERTA</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="CERRADA">CERRADA</option>
                </select>
              </div>

              {esAdmin && (
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                    Técnico asignado
                  </label>
                  <select
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    className="w-full border border-slate-400 bg-white px-2 py-2 text-[12px] outline-none focus:border-blue-600"
                  >
                    <option value="">(Sin asignar)</option>
                    {tecnicos.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                  Fecha de resolución
                </label>
                <input
                  type="datetime-local"
                  value={fechaResolucion}
                  onChange={(e) => setFechaResolucion(e.target.value)}
                  className="w-full border border-slate-400 bg-white px-2 py-2 text-[12px] outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                    Tiempo empleado (min)
                  </label>
                  <input
                    type="number"
                    value={tiempoEmpleado}
                    onChange={(e) => setTiempoEmpleado(e.target.value)}
                    className="w-full border border-slate-400 bg-white px-2 py-2 text-[12px] outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                    Coste (€)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="0.01"
                      value={coste}
                      onChange={(e) => setCoste(e.target.value)}
                      className="w-full border border-slate-400 bg-white px-2 py-2 text-[12px] outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={calcularCosteAutomatico}
                      className="border border-slate-400 bg-slate-50 px-2 py-2 text-[10px] font-medium text-slate-800 hover:bg-slate-100"
                    >
                      Calcular coste
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Calculado a partir del tiempo (tarifa base 30 €/h). Guarda
                    para aplicar los cambios.
                  </p>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-slate-700">
                  Materiales utilizados
                </label>
                <textarea
                  value={materiales}
                  onChange={(e) => setMateriales(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-400 bg-white px-2 py-2 text-[12px] outline-none focus:border-blue-600"
                />
              </div>

              {error && (
                <p className="border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {error}
                </p>
              )}
              {ok && (
                <p className="border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                  {ok}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => router.push("/incidencias")}
                  className="border border-slate-400 bg-white px-4 py-2 text-[11px] font-medium text-slate-900 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="border border-blue-700 bg-blue-700 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </aside>
        )}
      </section>
    </main>
  );
}
