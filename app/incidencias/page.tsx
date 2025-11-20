"use client";

import { useEffect, useMemo, useState } from "react";
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

type FiltroEstado = "TODOS" | "ABIERTA" | "EN_PROCESO" | "CERRADA";
type OrdenFecha = "DESC" | "ASC";

export default function IncidenciasPage() {
  const router = useRouter();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("TODOS");
  const [busqueda, setBusqueda] = useState("");
  const [ordenFecha, setOrdenFecha] = useState<OrdenFecha>("DESC");

  useEffect(() => {
    async function fetchIncidencias() {
      try {
        setCargando(true);
        setError(null);

        const res = await fetch("/api/incidencias");
        const data = await res.json();

        if (res.status === 401) {
          setError("No autenticado");
          setCargando(false);
          return;
        }

        if (!res.ok) {
          setError(data.error || "Error al cargar incidencias.");
          setCargando(false);
          return;
        }

        setIncidencias(data);
      } catch {
        setError("Error de conexión con el servidor.");
      } finally {
        setCargando(false);
      }
    }

    fetchIncidencias();
  }, []);

  const incidenciasFiltradas = useMemo(() => {
    let lista = [...incidencias];

    if (filtroEstado !== "TODOS") {
      lista = lista.filter((i) => i.estado === filtroEstado);
    }

    if (busqueda.trim() !== "") {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((i) => {
        const desc = i.descripcion.toLowerCase();
        const idStr = String(i.id);
        return desc.includes(q) || idStr.includes(q);
      });
    }

    lista.sort((a, b) => {
      const da = new Date(a.fechaCreacion).getTime();
      const db = new Date(b.fechaCreacion).getTime();
      if (ordenFecha === "DESC") {
        return db - da;
      }
      return da - db;
    });

    return lista;
  }, [incidencias, filtroEstado, busqueda, ordenFecha]);

  function limpiarFiltros() {
    setFiltroEstado("TODOS");
    setBusqueda("");
    setOrdenFecha("DESC");
  }

  const totalIncidencias = incidencias.length;
  const abiertas = incidencias.filter((i) => i.estado === "ABIERTA").length;
  const enProceso = incidencias.filter((i) => i.estado === "EN_PROCESO").length;
  const cerradas = incidencias.filter((i) => i.estado === "CERRADA").length;
  const sinAsignar = incidencias.filter(
    (i) => i.estado !== "CERRADA" && !i.tecnico
  ).length;
  const ahora = new Date();
  const vencidasSLA = incidencias.filter((i) => {
    if (i.estado === "CERRADA") return false;
    const horas =
      (ahora.getTime() - new Date(i.fechaCreacion).getTime()) /
      (1000 * 60 * 60);
    return horas >= 72;
  }).length;

  if (cargando) {
    return (
      <main className="p-6 text-sm text-slate-700">
        Cargando incidencias...
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 text-sm">
        <div className="max-w-md border border-slate-300 bg-white p-4">
          <p className="mb-3 text-sm text-red-600">{error}</p>
          {error === "No autenticado" ? (
            <button
              onClick={() => router.push("/")}
              className="border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Ir al inicio de sesión
            </button>
          ) : (
            <button
              onClick={() => router.push("/dashboard")}
              className="border border-slate-400 bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
            >
              Volver al panel
            </button>
          )}
        </div>
      </main>
    );
  }

  const hayIncidencias = incidencias.length > 0;
  const hayFiltradas = incidenciasFiltradas.length > 0;

  return (
    <main className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-base font-semibold text-slate-900">
            Listado de incidencias
          </h1>
          <p className="text-xs text-slate-600">
            Vista de las incidencias accesibles según tu rol, con filtros y
            búsqueda.
          </p>
        </div>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => router.push("/incidencias/nueva")}
            className="border border-blue-700 bg-blue-700 px-3 py-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-white hover:bg-blue-800"
          >
            Nueva incidencia
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="border border-slate-400 bg-white px-3 py-1.5 text-[12px] font-medium text-slate-900 hover:bg-slate-100"
          >
            Volver al panel
          </button>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4 text-[12px]">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-600">Total registradas</p>
          <p className="text-xl font-semibold text-slate-900">{totalIncidencias}</p>
          <p className="text-[11px] text-slate-500">Visibles según tu rol.</p>
        </div>
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
          <p className="text-[11px] text-blue-700">Abiertas / En proceso</p>
          <p className="text-xl font-semibold text-blue-900">{abiertas + enProceso}</p>
          <p className="text-[11px] text-blue-800">
            {abiertas} pendientes · {enProceso} en intervención
          </p>
        </div>
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[11px] text-emerald-700">Cerradas</p>
          <p className="text-xl font-semibold text-emerald-900">{cerradas}</p>
          <p className="text-[11px] text-emerald-800">Histórico disponible.</p>
        </div>
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="text-[11px] text-amber-700">Alertas</p>
          <p className="text-xl font-semibold text-amber-900">{vencidasSLA}</p>
          <p className="text-[11px] text-amber-800">Con más de 72h abiertas.</p>
        </div>
      </section>

      <section className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
        <p className="font-semibold text-slate-800">Filtros rápidos:</p>
        <button
          onClick={() => setFiltroEstado("TODOS")}
          className={`rounded-full border px-3 py-1 ${
            filtroEstado === "TODOS"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltroEstado("ABIERTA")}
          className={`rounded-full border px-3 py-1 ${
            filtroEstado === "ABIERTA"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Abiertas
        </button>
        <button
          onClick={() => setFiltroEstado("EN_PROCESO")}
          className={`rounded-full border px-3 py-1 ${
            filtroEstado === "EN_PROCESO"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          En proceso
        </button>
        <button
          onClick={() => setFiltroEstado("CERRADA")}
          className={`rounded-full border px-3 py-1 ${
            filtroEstado === "CERRADA"
              ? "border-blue-600 bg-blue-600 text-white"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
          }`}
        >
          Cerradas
        </button>
        <div className="ml-auto flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          {sinAsignar} sin asignar · {vencidasSLA} alerta SLA
        </div>
      </section>

      {/* Barra de filtros */}
      <section className="border border-slate-300 bg-white p-3 text-[12px]">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">
              Estado
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as FiltroEstado)}
              className="border border-slate-400 bg-white px-2 py-1.5 text-[12px] outline-none focus:border-blue-600"
            >
              <option value="TODOS">Todos</option>
              <option value="ABIERTA">Abiertas</option>
              <option value="EN_PROCESO">En proceso</option>
              <option value="CERRADA">Cerradas</option>
            </select>
          </div>

          <div className="min-w-[220px]">
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">
              Búsqueda (ID o descripción)
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Ejemplo: impresora, red, #12..."
              className="w-full border border-slate-400 bg-white px-2 py-1.5 text-[12px] outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-700">
              Orden por fecha
            </label>
            <select
              value={ordenFecha}
              onChange={(e) => setOrdenFecha(e.target.value as OrdenFecha)}
              className="border border-slate-400 bg-white px-2 py-1.5 text-[12px] outline-none focus:border-blue-600"
            >
              <option value="DESC">Más recientes primero</option>
              <option value="ASC">Más antiguas primero</option>
            </select>
          </div>

          <button
            type="button"
            onClick={limpiarFiltros}
            className="ml-auto border border-slate-400 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-900 hover:bg-slate-100"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {/* Tabla */}
      <section className="border border-slate-300 bg-white text-sm">
        {!hayIncidencias ? (
          <div className="p-4 text-sm text-slate-600">
            No hay incidencias registradas todavía.
          </div>
        ) : !hayFiltradas ? (
          <div className="p-4 text-sm text-slate-600">
            No hay incidencias que cumplan los filtros actuales.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[12px]">
              <thead className="border-b border-slate-300 bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                <tr>
                  <th className="px-3 py-2">ID</th>
                  <th className="px-3 py-2">Descripción</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2 whitespace-nowrap">
                    Fecha creación
                  </th>
                  <th className="px-3 py-2">Usuario</th>
                  <th className="px-3 py-2">Técnico</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {incidenciasFiltradas.map((inc, idx) => (
                  <tr
                    key={inc.id}
                    className={`border-b border-slate-200 ${
                      idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                    } hover:bg-slate-100`}
                  >
                    <td className="px-3 py-2 text-slate-800">
                      #{String(inc.id).padStart(3, "0")}
                    </td>
                    <td className="px-3 py-2 text-slate-900">
                      <span className="line-clamp-2 max-w-xs">
                        {inc.descripcion}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <EstadoChip estado={inc.estado} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-slate-700">
                      {new Date(inc.fechaCreacion).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {inc.usuario?.nombre ?? "—"}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {inc.tecnico?.nombre ?? "Sin asignar"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => router.push(`/incidencias/${inc.id}`)}
                        className="border border-slate-400 bg-white px-3 py-1 text-[11px] font-medium text-slate-900 hover:bg-slate-100"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
