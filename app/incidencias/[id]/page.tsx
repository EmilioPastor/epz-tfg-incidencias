'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';

type UserRole = 'USUARIO' | 'TECNICO' | 'ADMIN';

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
  if (!isoString) return '';
  const d = new Date(isoString);
  const iso = d.toISOString(); // YYYY-MM-DDTHH:mm:ss.sssZ
  return iso.slice(0, 16); // YYYY-MM-DDTHH:mm
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

  // Campos de formulario
  const [estado, setEstado] = useState('');
  const [tecnicoId, setTecnicoId] = useState<string>('');
  const [fechaResolucion, setFechaResolucion] = useState('');
  const [tiempoEmpleado, setTiempoEmpleado] = useState<string>('');
  const [materiales, setMateriales] = useState('');
  const [coste, setCoste] = useState<string>('');

  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setOk(null);

        // 1. Usuario actual
        const resMe = await fetch('/api/auth/me');
        const dataMe = await resMe.json();

        if (!resMe.ok || !dataMe.user) {
          setError('No autenticado');
          setLoading(false);
          return;
        }

        const currentUser: User = dataMe.user;
        setUser(currentUser);

        // 2. Detalle de incidencia
        const resInc = await fetch(`/api/incidencias/${id}`);
        const dataInc = await resInc.json();

        if (!resInc.ok) {
          setError(dataInc.error || 'Error al cargar la incidencia');
          setLoading(false);
          return;
        }

        const inc: Incidencia = dataInc;
        setIncidencia(inc);

        // Inicializar campos de formulario
        setEstado(inc.estado || 'ABIERTA');
        setFechaResolucion(toInputDateTimeValue(inc.fechaResolucion));
        setTiempoEmpleado(inc.tiempoEmpleado ? String(inc.tiempoEmpleado) : '');
        setMateriales(inc.materiales ?? '');
        setCoste(inc.coste != null ? String(inc.coste) : '');
        setTecnicoId(inc.tecnicoId != null ? String(inc.tecnicoId) : '');

        // 3. Si es ADMIN, cargar técnicos
        if (currentUser.rol === 'ADMIN') {
          const resTec = await fetch('/api/usuarios/tecnicos');
          const dataTec = await resTec.json();

          if (resTec.ok) {
            setTecnicos(dataTec);
          }
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!incidencia) return;
    if (!user) return;

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

      if (user.rol === 'ADMIN') {
        body.tecnicoId = tecnicoId ? Number(tecnicoId) : null;
      }

      const res = await fetch(`/api/incidencias/${incidencia.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al guardar los cambios');
        return;
      }

      setIncidencia(data);
      setOk('Cambios guardados correctamente.');
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p style={{ padding: 20 }}>Cargando incidencia...</p>;

  if (error) {
    return (
      <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <p style={{ color: 'red' }}>{error}</p>
        {error === 'No autenticado' && (
          <button onClick={() => router.push('/')}>Ir al login</button>
        )}
      </main>
    );
  }

  if (!incidencia || !user) {
    return (
      <main style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <p>Incidencia no encontrada.</p>
        <button onClick={() => router.push('/incidencias')}>Volver</button>
      </main>
    );
  }

  const esAdmin = user.rol === 'ADMIN';
  const esTecnico = user.rol === 'TECNICO';
  const esUsuario = user.rol === 'USUARIO';

  const puedeEditar = esAdmin || esTecnico;

  return (
    <main style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <button onClick={() => router.push('/incidencias')}>← Volver al listado</button>

      <h1>Incidencia #{incidencia.id}</h1>
      <p><strong>Descripción:</strong> {incidencia.descripcion}</p>
      <p>
        <strong>Creada por:</strong> {incidencia.usuario?.nombre} ({incidencia.usuario?.email})
      </p>
      <p>
        <strong>Fecha creación:</strong>{' '}
        {new Date(incidencia.fechaCreacion).toLocaleString()}
      </p>

      {incidencia.tecnico && (
        <p>
          <strong>Técnico asignado:</strong> {incidencia.tecnico.nombre} ({incidencia.tecnico.email})
        </p>
      )}

      {!puedeEditar && (
        <p style={{ marginTop: 20 }}>
          Esta incidencia es solo de lectura para tu rol ({user.rol}).
        </p>
      )}

      {puedeEditar && (
        <section style={{ marginTop: 30 }}>
          <h2>Gestión / resolución</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 10 }}>
              <label>Estado</label>
              <select
                value={estado}
                onChange={e => setEstado(e.target.value)}
                style={{ display: 'block', padding: 6 }}
              >
                <option value="ABIERTA">ABIERTA</option>
                <option value="EN_PROCESO">EN_PROCESO</option>
                <option value="CERRADA">CERRADA</option>
              </select>
            </div>

            {esAdmin && (
              <div style={{ marginBottom: 10 }}>
                <label>Técnico asignado</label>
                <select
                  value={tecnicoId}
                  onChange={e => setTecnicoId(e.target.value)}
                  style={{ display: 'block', padding: 6 }}
                >
                  <option value="">(Sin asignar)</option>
                  {tecnicos.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ marginBottom: 10 }}>
              <label>Fecha resolución</label>
              <input
                type="datetime-local"
                value={fechaResolucion}
                onChange={e => setFechaResolucion(e.target.value)}
                style={{ display: 'block', padding: 6 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Tiempo empleado (minutos)</label>
              <input
                type="number"
                value={tiempoEmpleado}
                onChange={e => setTiempoEmpleado(e.target.value)}
                style={{ display: 'block', padding: 6 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Materiales utilizados</label>
              <textarea
                value={materiales}
                onChange={e => setMateriales(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: 6 }}
              />
            </div>

            <div style={{ marginBottom: 10 }}>
              <label>Coste (€)</label>
              <input
                type="number"
                step="0.01"
                value={coste}
                onChange={e => setCoste(e.target.value)}
                style={{ display: 'block', padding: 6 }}
              />
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {ok && <p style={{ color: 'green' }}>{ok}</p>}

            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
