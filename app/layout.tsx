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
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <div className="flex min-h-screen flex-col">
          {/* Barra superior */}
          <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-xs font-semibold text-white shadow-sm">
                  IT
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight">
                    Gestor de Incidencias
                  </p>
                  <p className="text-xs text-slate-500">
                    Proyecto TFG · Desarrollo de Aplicaciones Web
                  </p>
                </div>
              </div>
              <div className="hidden text-xs text-slate-500 sm:block">
                <p>Sistema interno de gestión de incidencias técnicas</p>
              </div>
            </div>
          </header>

          {/* Contenido */}
          <main className="flex-1">
            <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
              {/* Columna principal */}
              <div className="flex-1">{children}</div>
            </div>
          </main>

          {/* Pie */}
          <footer className="border-t border-slate-200 bg-white py-3 text-center text-[11px] text-slate-500">
            Sistema de gestión de incidencias técnicas · TFG DAW
          </footer>
        </div>
      </body>
    </html>
  );
}
