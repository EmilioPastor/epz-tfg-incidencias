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
      <div className="grid w-full max-w-4xl gap-6 md:grid-cols-[1.1fr,1fr]">
        {/* Info / contexto */}
        <section className="hidden border border-slate-300 bg-white p-5 text-sm md:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Sistema de incidencias
          </p>
          <h1 className="mt-2 text-lg font-semibold text-slate-900">
            Gestión centralizada de incidencias técnicas.
          </h1>
          <p className="mt-2 text-xs text-slate-600">
            Aplicación interna para registrar, asignar y resolver incidencias en
            el entorno de trabajo. Diseñada para usuarios, técnicos y
            administradores.
          </p>

          <div className="mt-4 grid gap-3 text-xs">
            <div className="border border-slate-300 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-900">
                Registro y trazabilidad
              </p>
              <p className="mt-1 text-slate-600">
                Cada incidencia queda documentada con fechas, estados y datos de
                resolución.
              </p>
            </div>
            <div className="border border-slate-300 bg-slate-50 px-3 py-2">
              <p className="font-semibold text-slate-900">
                Roles y responsabilidades
              </p>
              <p className="mt-1 text-slate-600">
                Acceso adaptado para usuario final, técnico y administrador.
              </p>
            </div>
          </div>
        </section>

        {/* Formulario login */}
        <section className="border border-slate-300 bg-white p-5 text-sm">
          <h2 className="text-base font-semibold text-slate-900">
            Iniciar sesión
          </h2>
          <p className="mt-1 text-xs text-slate-600">
            Introduce tu correo y contraseña para acceder al sistema.
          </p>

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
              className="flex w-full items-center justify-center border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-blue-800 disabled:opacity-60"
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
        </section>
      </div>
    </main>
  );
}
