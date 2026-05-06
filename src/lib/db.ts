import { createClient } from "@libsql/client";

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

/**
 * Función auxiliar para ejecutar queries en Turso de forma sencilla
 * compatible con el flujo de NextAuth y tus 3 tablas.
 */
export async function executeQuery(sql: string, args: any[] = []) {
  try {
    const result = await db.execute({
      sql: sql,
      args: args,
    });
    // Turso devuelve las filas en la propiedad 'rows'
    return result.rows;
  } catch (error) {
    console.error("Error en Turso DB:", error);
    throw error;
  }
}