"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en el inicio de sesión.");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4">
      <div className="grid w-full max-w-5xl gap-6 md:grid-cols-[1.1fr,1fr]">
        {/* Info / contexto */}
        <section className="hidden border border-slate-200 bg-white/90 p-5 text-sm shadow-sm backdrop-blur md:block">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-sky-700">
              <span className="text-base font-semibold">IT</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sistema de incidencias
              </p>
              <h1 className="text-lg font-semibold text-slate-900">
                Centro de operaciones y soporte
              </h1>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-slate-600">
            Aplicación interna para registrar, asignar y resolver incidencias en
            entornos corporativos. Pensada para roles de usuario final, técnico
            y administrador con trazabilidad completa de cada caso.
          </p>

          <div className="mt-4 grid gap-3 text-xs md:grid-cols-2">
            <div className="border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-900">Registro y trazabilidad</p>
              <p className="mt-1 text-slate-600">
                Cada incidencia queda documentada con fechas, estados, costes y
                datos de resolución para auditar el servicio.
              </p>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-900">Roles claros</p>
              <p className="mt-1 text-slate-600">
                Perfiles para usuario, técnico y administrador con acciones
                orientadas a su responsabilidad.
              </p>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-900">Alertas y SLA</p>
              <p className="mt-1 text-slate-600">
                Indicadores de vencimiento y seguimiento del tiempo empleado en
                cada intervención.
              </p>
            </div>
            <div className="border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-900">Seguridad y contexto</p>
              <p className="mt-1 text-slate-600">
                Datos protegidos, inicio de sesión controlado y registro de las
                acciones realizadas.
              </p>
            </div>
          </div>
        </section>

        {/* Formulario login */}
        <section className="border border-slate-200 bg-white p-5 text-sm shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Iniciar sesión</h2>
              <p className="mt-1 text-xs text-slate-600">
                Controla tus incidencias, estados y tiempos en un único panel.
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
              Acceso seguro
            </span>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-[13px] font-medium text-slate-800">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-400 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-[13px] font-medium text-slate-800">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-400 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="flex w-full items-center justify-center border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white transition hover:-translate-y-[1px] hover:bg-blue-800 disabled:opacity-60"
            >
              {cargando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            ¿No tienes cuenta?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="font-medium text-blue-700 hover:text-blue-900"
            >
              Crear usuario
            </button>
          </p>

          <div className="mt-5 grid gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-[12px]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <p className="font-semibold text-slate-900">Autenticación verificada</p>
            </div>
            <ul className="ml-4 list-disc space-y-1 text-slate-600">
              <li>Accede al panel con tus incidencias activas.</li>
              <li>Comparte información con tu equipo técnico.</li>
              <li>Consulta estados, fechas y costes registrados.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
