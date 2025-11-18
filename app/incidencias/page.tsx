'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function IncidenciasPage() {
  const router = useRouter();
  const [incidencias, setIncidencias] = useState<Incidencia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIncidencias() {
      try {
        const res = await fetch('/api/incidencias');
        const data = await res.json();

        if (res.status === 401) {
          setError('No autenticado');
          return;
        }

        if (!res.ok) {
          setError(data.error || 'Error al cargar incidencias');
          return;
        }

        setIncidencias(data);
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor');
      } finally {
        setCargando(false);
      }
    }

    fetchIncidencias();
  }, []);

  if (cargando) return <p style={{ padding: 20 }}>Cargando incidencias...</p>;

  if (error) {
    return (
      <main style={{ padding: 20 }}>
        <p style={{ color: 'red' }}>{error}</p>
        {error === 'No autenticado' && (
          <button onClick={() => router.push('/')}>Ir al login</button>
        )}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Incidencias</h1>

      {incidencias.length === 0 ? (
        <p>No hay incidencias.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
          <thead>
            <tr>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>ID</th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>
                Descripción
              </th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>
                Estado
              </th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>
                Fecha creación
              </th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>
                Usuario
              </th>
              <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left', padding: 6 }}>
                Técnico
              </th>
            </tr>
          </thead>
          <tbody>
            {incidencias.map(inc => (
              <tr key={inc.id}>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{inc.id}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{inc.descripcion}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>{inc.estado}</td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                  {new Date(inc.fechaCreacion).toLocaleString()}
                </td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                  {inc.usuario?.nombre ?? '-'}
                </td>
                <td style={{ borderBottom: '1px solid #eee', padding: 6 }}>
                  {inc.tecnico?.nombre ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <p style={{ marginTop: 10 }}>
        <a href="/dashboard">Volver al dashboard</a>
      </p>
    </main>
  );
}
