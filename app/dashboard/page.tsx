'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'USUARIO' | 'TECNICO' | 'ADMIN';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else {
          setError(data.error || 'Error al cargar usuario');
        }
      } catch (err) {
        console.error(err);
        setError('Error de conexión con el servidor');
      } finally {
        setCargando(false);
      }
    }

    fetchUser();
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error(err);
    } finally {
      router.push('/');
    }
  }

  if (cargando) return <p style={{ padding: 20 }}>Cargando...</p>;

  if (!user) {
    return (
      <main style={{ padding: 20 }}>
        <p>No estás autenticado.</p>
        <button onClick={() => router.push('/')}>Ir al login</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 20, fontFamily: 'sans-serif', maxWidth: 800, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h1>Dashboard</h1>
          <p>
            Bienvenido, <strong>{user.nombre}</strong> ({user.rol})
          </p>
        </div>
        <button onClick={handleLogout}>Cerrar sesión</button>
      </header>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section>
        <h2>Incidencias</h2>
        <ul>
          <li>
            <a href="/incidencias/nueva">Crear nueva incidencia</a>
          </li>
          <li>
            <a href="/incidencias">Ver incidencias</a>
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 20 }}>
        <h2>Panel según rol</h2>
        {user.rol === 'ADMIN' && <p>Acceso completo: gestión de usuarios, técnicos e incidencias.</p>}
        {user.rol === 'TECNICO' && <p>Verás tus incidencias asignadas en el listado.</p>}
        {user.rol === 'USUARIO' && <p>Puedes crear incidencias y ver su estado.</p>}
      </section>
    </main>
  );
}
