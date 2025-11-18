// app/api/incidencias/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

interface NuevaIncidenciaBody {
  descripcion: string;
}

export async function GET() {
  try {
    const user = getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    let whereClause: any = {};

    if (user.rol === 'ADMIN') {
      // ve todas
      whereClause = {};
    } else if (user.rol === 'TECNICO') {
      // ve las asignadas a él
      whereClause = { tecnicoId: user.id };
    } else {
      // USUARIO: ve las que ha creado
      whereClause = { usuarioId: user.id };
    }

    const incidencias = await prisma.incidencia.findMany({
      where: whereClause,
      include: {
        usuario: true,
        tecnico: true,
      },
      orderBy: {
        fechaCreacion: 'desc',
      },
    });

    return NextResponse.json(incidencias, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/incidencias:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as NuevaIncidenciaBody;
    const { descripcion } = body;

    if (!descripcion || !descripcion.trim()) {
      return NextResponse.json(
        { error: 'La descripción es obligatoria' },
        { status: 400 }
      );
    }

    const incidencia = await prisma.incidencia.create({
      data: {
        descripcion: descripcion.trim(),
        usuarioId: user.id,
        // estado y fechaCreacion tienen valores por defecto en Prisma
      },
    });

    return NextResponse.json(incidencia, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/incidencias:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
