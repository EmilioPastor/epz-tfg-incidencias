    'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NuevaIncidenciaPage() {
  const router = useRouter();
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setLoading(true);

    try {
      const res = await fetch('/api/incidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ descripcion }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al crear la incidencia');
        return;
      }

      setOk('Incidencia creada correctamente.');
      setDescripcion('');

      // si quieres redirigir al listado:
      // router.push('/incidencias');
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Nueva incidencia</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>Descripción</label>
          <textarea
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: 6 }}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {ok && <p style={{ color: 'green' }}>{ok}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : 'Crear incidencia'}
        </button>
      </form>

      <p style={{ marginTop: 10 }}>
        <a href="/incidencias">Ver listado de incidencias</a>
      </p>
    </main>
  );
}
