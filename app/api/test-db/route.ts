// app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const count = await prisma.usuario.count();
    return NextResponse.json({ ok: true, usuarios: count });
  } catch (error) {
    console.error('Error test-db:', error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
