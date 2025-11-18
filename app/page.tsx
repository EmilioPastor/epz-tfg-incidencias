"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en el inicio de sesión");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-96px)] items-center justify-center">
      <div className="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-[1.2fr,1fr]">
        {/* Panel informativo */}
        <section className="hidden flex-col justify-center rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm md:flex">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-sky-600">
            Panel de incidencias
          </p>
          <h1 className="mt-2 text-2xl font-semibold">
            Gestión centralizada de incidencias técnicas.
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Usuarios, técnicos y administradores trabajan sobre el mismo sistema
            para registrar, asignar y resolver incidencias de forma ordenada.
          </p>

          <div className="mt-4 grid gap-3 text-xs text-slate-700 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-900">
                Trazabilidad completa
              </p>
              <p className="mt-1">
                Registro de estados, fechas, tiempo empleado, materiales y
                coste.
              </p>
            </div>
            <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2">
              <p className="font-semibold text-slate-900">Roles diferenciados</p>
              <p className="mt-1">
                Acceso adaptado para usuarios, técnicos y administradores.
              </p>
            </div>
          </div>
        </section>

        {/* Card de login */}
        <section className="rounded-xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <h2 className="text-lg font-semibold">Iniciar sesión</h2>
          <p className="mt-1 text-xs text-slate-600">
            Introduce tus credenciales para acceder al sistema.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <input
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-600">
            ¿No tienes cuenta?{" "}
            <a
              href="/register"
              className="font-medium text-sky-700 hover:text-sky-800"
            >
              Crear cuenta
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
