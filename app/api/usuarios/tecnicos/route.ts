// app/api/usuarios/tecnicos/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }

    if (user.rol !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const tecnicos = await prisma.usuario.findMany({
      where: { rol: 'TECNICO' },
      select: { id: true, nombre: true, email: true },
      orderBy: { nombre: 'asc' },
    });

    return NextResponse.json(tecnicos, { status: 200 });
  } catch (error) {
    console.error('Error en GET /api/usuarios/tecnicos:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
