// app/api/auth/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

interface RegisterBody {
  nombre: string;
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const { nombre, email, password } = body;

    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const existing = await prisma.usuario.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password: hashed,
        rol: 'USUARIO', // por defecto
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Error en /api/auth/register:', error);
    return NextResponse.json(
      { error: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
