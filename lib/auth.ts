// lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export type UserRole = 'USUARIO' | 'TECNICO' | 'ADMIN';

export interface JwtUserPayload {
  id: number;
  rol: UserRole;
  nombre: string;
  email: string;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET no está definido en las variables de entorno');
}

export function signUserToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function getCurrentUser(): JwtUserPayload | null {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtUserPayload;
    return decoded;
  } catch {
    return null;
  }
}
