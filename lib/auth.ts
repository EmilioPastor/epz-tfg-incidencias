// lib/auth.ts
import jwt from "jsonwebtoken";

export type UserRole = "USUARIO" | "TECNICO" | "ADMIN";

export interface JwtUserPayload {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

// Forzamos el tipo a string (TypeScript deja de quejarse)
const JWT_SECRET = process.env.JWT_SECRET as string;

// Comprobación en runtime (por si acaso)
if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET");
}

export function signUserToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}
