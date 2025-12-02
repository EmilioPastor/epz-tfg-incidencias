// lib/auth.ts
import jwt, { Secret } from "jsonwebtoken";

export type UserRole = "USUARIO" | "TECNICO" | "ADMIN";

export interface JwtUserPayload {
  id: number;
  nombre: string;
  email: string;
  rol: UserRole;
}

// Obligamos a TS a que coincida con el tipo real de jwt
const JWT_SECRET: Secret = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error("Falta la variable de entorno JWT_SECRET");
}

// Genera token
export function signUserToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

// Verifica token
export function verifyUserToken(token: string): JwtUserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
  } catch {
    return null;
  }
}

// Recupera usuario desde la cookie del request
export function getCurrentUser(): JwtUserPayload | null {
  try {
    const token =
      typeof window === "undefined"
        ? require("next/headers").cookies().get("token")?.value
        : document.cookie
            ?.split("; ")
            ?.find((c) => c.startsWith("token="))
            ?.split("=")[1];

    if (!token) return null;

    return verifyUserToken(token);
  } catch {
    return null;
  }
}
