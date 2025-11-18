"use client";

import { useEffect, useState, FormEvent } from "react";
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
          setError(dataInc.error || "Error al cargar la incidencia");
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
          if (resTec.ok) {
            setTecnicos(dataTec);
          }
        }
      } catch {
        setError("Error de conexión con el servidor");
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!incidencia || !user) return;

    setError(null);
    setOk(null);
    setSaving(true);

    try {
      const body: any = {
        estado,
        fechaResolucion: fechaResolucion || null,
        tiempoEmpleado: tiempoEmpleado ? Number(tiempoEmpleado) : null,
        materiales: materiales || null,
        coste: coste ? Number(coste) : null,
      };

      if (user.rol === "ADMIN") {
        body.tecnicoId = tecnicoId ? Number(tecnicoId) : null;
      }

      const res = await fetch(`/api/incidencias/${incidencia.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al guardar los cambios");
        return;
      }

      setIncidencia(data);
      setOk("Cambios guardados correctamente.");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="p-6 text-sm text-slate-600">
        Cargando incidencia...
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 text-sm text-slate-800">
        <p className="mb-3 text-sm text-red-600">{error}</p>
        {error === "No autenticado" ? (
          <button
            onClick={() => router.push("/")}
            className="rounded-md bg-sky-600 px-4 py-2 text-xs font-medium text-white hover:bg-sky-700"
          >
            Ir al inicio de sesión
          </button>
        ) : (
          <button
            onClick={() => router.push("/incidencias")}
            className="rounded-md bg-slate-100 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-200"
          >
            Volver al listado
          </button>
        )}
      </main>
    );
  }

  if (!incidencia || !user) {
    return (
      <main className="p-6 text-sm text-slate-800">
        <p className="mb-3">Incidencia no encontrada.</p>
        <button
          onClick={() => router.push("/incidencias")}
          className="rounded-md bg-slate-100 px-4 py-2 text-xs font-medium text-slate-800 hover:bg-slate-200"
        >
          Volver al listado
        </button>
      </main>
    );
  }

  const esAdmin = user.rol === "ADMIN";
  const esTecnico = user.rol === "TECNICO";
  const puedeEditar = esAdmin || esTecnico;

  return (
    <main className="space-y-4">
      <button
        onClick={() => router.push("/incidencias")}
        className="text-xs text-slate-600 hover:text-slate-900"
      >
        ← Volver al listado
      </button>

      <div className="grid gap-4 md:grid-cols-[1.1fr,1fr]">
        {/* Ficha de la incidencia */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-slate-500">
            Incidencia #{incidencia.id}
          </p>
          <h1 className="mt-1 text-lg font-semibold">
            Detalle de la incidencia
          </h1>

          <div className="mt-4 space-y-3 text-sm">
            <div>
              <p className="text-xs font-medium text-slate-500">Descripción</p>
              <p className="mt-1 text-slate-900">{incidencia.descripcion}</p>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Creada por</p>
                <p className="mt-1 text-slate-900">
                  {incidencia.usuario?.nombre}
                  <span className="block text-[11px] text-slate-500">
                    {incidencia.usuario?.email}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-slate-500">Fecha de creación</p>
                <p className="mt-1 text-slate-900">
                  {new Date(incidencia.fechaCreacion).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Estado actual</p>
                <p className="mt-1 text-slate-900">{incidencia.estado}</p>
              </div>
              <div>
                <p className="text-slate-500">Técnico asignado</p>
                <p className="mt-1 text-slate-900">
                  {incidencia.tecnico
                    ? `${incidencia.tecnico.nombre} (${incidencia.tecnico.email})`
                    : "Sin asignar"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-xs sm:grid-cols-3">
              <div>
                <p className="text-slate-500">Fecha de resolución</p>
                <p className="mt-1 text-slate-900">
                  {incidencia.fechaResolucion
                    ? new Date(incidencia.fechaResolucion).toLocaleString()
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Tiempo empleado (min)</p>
                <p className="mt-1 text-slate-900">
                  {incidencia.tiempoEmpleado ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Coste (€)</p>
                <p className="mt-1 text-slate-900">
                  {incidencia.coste != null ? incidencia.coste.toFixed(2) : "-"}
                </p>
              </div>
            </div>

            {incidencia.materiales && (
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Materiales utilizados
                </p>
                <p className="mt-1 text-xs text-slate-800">
                  {incidencia.materiales}
                </p>
              </div>
            )}

            {!puedeEditar && (
              <p className="mt-3 text-xs text-slate-600">
                Esta incidencia es de solo lectura para tu rol ({user.rol}).
              </p>
            )}
          </div>
        </section>

        {/* Panel de gestión */}
        {puedeEditar && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-sm">
            <h2 className="text-sm font-semibold">Gestión y resolución</h2>
            <p className="mt-1 text-xs text-slate-600">
              Actualiza el estado, la asignación y los datos de resolución.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="ABIERTA">ABIERTA</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="CERRADA">CERRADA</option>
                </select>
              </div>

              {esAdmin && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Técnico asignado
                  </label>
                  <select
                    value={tecnicoId}
                    onChange={(e) => setTecnicoId(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
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
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Fecha de resolución
                </label>
                <input
                  type="datetime-local"
                  value={fechaResolucion}
                  onChange={(e) => setFechaResolucion(e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tiempo empleado (min)
                  </label>
                  <input
                    type="number"
                    value={tiempoEmpleado}
                    onChange={(e) => setTiempoEmpleado(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Coste (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={coste}
                    onChange={(e) => setCoste(e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  Materiales utilizados
                </label>
                <textarea
                  value={materiales}
                  onChange={(e) => setMateriales(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
                  {error}
                </p>
              )}
              {ok && (
                <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-700">
                  {ok}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => router.push("/incidencias")}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-sky-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}
