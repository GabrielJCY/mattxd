
import "server-only";
import { db } from "@/src/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

interface DatosAuditoria {
  accion: string;
  modulo: string;
  id_registro?: number | null;
  descripcion?: string;
}

export async function registrarAuditoria({
  accion,
  modulo,
  id_registro = null,
  descripcion = "",
}: DatosAuditoria) {
  try {
    let id_admin: number | null = null;

    // 1. Buscar sesión de Google
    const session = await getServerSession(authOptions);

    if (
      session?.user &&
      (session.user as any).role === "admin"
    ) {
      id_admin = Number((session.user as any).id);
    }

    // 2. Si no existe, buscar sesión manual
    if (id_admin === null) {
      const cookieStore = await cookies();
      const cookie = cookieStore.get("matt_session")?.value;

      if (cookie) {
        try {
          const manualSession = JSON.parse(cookie);

          if (manualSession.role === "admin") {
            id_admin = Number(manualSession.id);
          }
        } catch {
          return {
            success: false,
            error: "Sesión manual no válida",
          };
        }
      }
    }

    // 3. Validar administrador
    if (
      id_admin === null ||
      !Number.isSafeInteger(id_admin) ||
      id_admin <= 0
    ) {
      return {
        success: false,
        error: "Administrador no identificado",
      };
    }

    // 4. Registrar actividad
    await db.execute({
      sql: `
        INSERT INTO log_auditoria
        (id_admin, accion, modulo, id_registro, descripcion)
        VALUES (?, ?, ?, ?, ?)
      `,
      args: [
        id_admin,
        accion,
        modulo,
        id_registro,
        descripcion,
      ],
    });

    return { success: true };
  } catch (error) {
    console.error("Error al registrar auditoría:", error);

    return {
      success: false,
      error: "No se pudo registrar la actividad",
    };
  }
}
