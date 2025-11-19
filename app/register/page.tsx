"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setCargando(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en el registro.");
        return;
      }

      setOk("Usuario creado correctamente. Redirigiendo al inicio de sesión...");
      setNombre("");
      setEmail("");
      setPassword("");

      setTimeout(() => router.push("/"), 1000);
    } catch {
      setError("Error de conexión con el servidor.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-96px)] items-center justify-center px-4">
      <div className="w-full max-w-md border border-slate-300 bg-white p-5 text-sm">
        <h1 className="text-base font-semibold text-slate-900">
          Crear usuario
        </h1>
        <p className="mt-1 text-xs text-slate-600">
          Este formulario crea un usuario estándar para poder registrar
          incidencias en el sistema.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-sm">
          <div>
            <label className="mb-1 block text-[13px] font-medium text-slate-800">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-slate-400 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600"
              placeholder="Nombre completo"
            />
          </div>

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
          {ok && (
            <p className="border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {ok}
            </p>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="flex w-full items-center justify-center border border-blue-700 bg-blue-700 px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {cargando ? "Creando..." : "Registrar usuario"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-600">
          ¿Ya tienes cuenta?{" "}
          <button
            type="button"
            onClick={() => router.push("/")}
            className="font-medium text-blue-700 hover:text-blue-900"
          >
            Volver al inicio de sesión
          </button>
        </p>
      </div>
    </main>
  );
}
