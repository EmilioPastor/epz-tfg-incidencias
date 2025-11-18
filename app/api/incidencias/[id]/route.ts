// app/api/incidencias/[id]/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface UpdateIncidenciaBody {
  estado?: string;
  tecnicoId?: number | null;
  fechaResolucion?: string | null;
  tiempoEmpleado?: number | null;
  materiales?: string | null;
  coste?: number | null;
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const incidenciaId = Number(params.id);
    if (Number.isNaN(incidenciaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const incidencia = await prisma.incidencia.findUnique({
      where: { id: incidenciaId },
      include: {
        usuario: true,
        tecnico: true,
      },
    });

    if (!incidencia) {
      return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 });
    }

    // Control de acceso:
    if (user.rol === 'USUARIO' && incidencia.usuarioId !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (user.rol === 'TECNICO' && incidencia.tecnicoId !== user.id) {
      // El técnico solo ve incidencias asignadas a él
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(incidencia, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/incidencias/[id]:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    const incidenciaId = Number(params.id);
    if (Number.isNaN(incidenciaId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = (await request.json()) as UpdateIncidenciaBody;

    const incidencia = await prisma.incidencia.findUnique({
      where: { id: incidenciaId },
    });

    if (!incidencia) {
      return NextResponse.json({ error: 'Incidencia no encontrada' }, { status: 404 });
    }

    // Autorización:
    if (user.rol === 'USUARIO') {
      // un usuario normal no puede editar
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    if (user.rol === 'TECNICO' && incidencia.tecnicoId !== user.id) {
      // un técnico solo puede editar incidencias asignadas a él
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const data: any = {};

    // Todos (ADMIN + TECNICO) pueden actualizar estado y campos de resolución
    if (body.estado !== undefined) {
      data.estado = body.estado;
    }

    if (body.fechaResolucion !== undefined) {
      data.fechaResolucion = body.fechaResolucion
        ? new Date(body.fechaResolucion)
        : null;
    }

    if (body.tiempoEmpleado !== undefined) {
      data.tiempoEmpleado = body.tiempoEmpleado ?? null;
    }

    if (body.materiales !== undefined) {
      data.materiales = body.materiales ?? null;
    }

    if (body.coste !== undefined) {
      data.coste = body.coste ?? null;
    }

    // Solo ADMIN puede cambiar el técnico asignado
    if (user.rol === 'ADMIN' && body.tecnicoId !== undefined) {
      if (body.tecnicoId === null) {
        data.tecnicoId = null;
      } else {
        const tecnicoIdNumber = Number(body.tecnicoId);
        if (!Number.isNaN(tecnicoIdNumber)) {
          // opcional: comprobar que existe y es TECNICO
          const tecnico = await prisma.usuario.findUnique({
            where: { id: tecnicoIdNumber },
          });

          if (!tecnico || tecnico.rol !== 'TECNICO') {
            return NextResponse.json(
              { error: 'Técnico no válido' },
              { status: 400 }
            );
          }

          data.tecnicoId = tecnicoIdNumber;
        }
      }
    }

    const updated = await prisma.incidencia.update({
      where: { id: incidenciaId },
      data,
      include: {
        usuario: true,
        tecnico: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error en PATCH /api/incidencias/[id]:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
