// prisma.config.ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  engine: 'classic',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // Aquí va la URL de la BD (Neon) desde tu .env
    url: env('DATABASE_URL'),
  },
});
