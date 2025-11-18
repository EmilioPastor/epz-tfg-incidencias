import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gestión de Incidencias - TFG",
  description: "Aplicación de gestión de incidencias técnicas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-white/5 bg-slate-950/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold">
                  IT
                </div>
                <div>
                  <p className="text-sm font-semibold leading-none">
                    Gestor de Incidencias
                  </p>
                  <p className="text-xs text-slate-400">
                    Proyecto TFG DAW · Emilio Pastor
                  </p>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
          </main>

          <footer className="border-t border-white/5 bg-slate-950/70 py-3 text-center text-xs text-slate-500">
            Sistema de gestión de incidencias técnicas · TFG DAW
          </footer>
        </div>
      </body>
    </html>
  );
}
