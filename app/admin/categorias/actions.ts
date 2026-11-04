"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarAuditoria } from "@/src/lib/auditoria";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

/** Obtiene el administrador responsable con los dos accesos del prototipo. */
async function obtenerIdAdministrador(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  const usuario = session?.user as { id?: number | string; role?: string } | undefined;

  if (usuario?.role === "admin") {
    const id = Number(usuario.id);
    if (Number.isSafeInteger(id) && id > 0) return id;
  }

  const cookie = (await cookies()).get("matt_session")?.value;
  if (!cookie) return null;

  try {
    const sesion = JSON.parse(cookie) as { id?: number | string; role?: string };
    const id = Number(sesion.id);
    if (sesion.role === "admin" && Number.isSafeInteger(id) && id > 0) {
      return id;
    }
  } catch {
    return null;
  }

  return null;
}

/** --- CREAR CATEGORÍA --- */
export async function addCategoria(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const genero = formData.get("genero") as string;

  // VALIDACIÓN DE CAMPOS (sin cambios)
  if (
    !nombre ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(nombre.trim())
  ) {
    return;
  }

  if (!["Unisex", "Hombre", "Mujer"].includes(genero)) {
    return;
  }

  const resultado = await db.execute({
    sql: "INSERT INTO categoria (nombre, genero) VALUES (?, ?) RETURNING id_categoria",
    args: [nombre, genero],
  });

  const idCategoria = Number(
    resultado.rows[0]?.id_categoria ?? resultado.lastInsertRowid
  );

  await registrarAuditoria({
    accion: "CREAR",
    modulo: "CATEGORIAS",
    id_registro: Number.isSafeInteger(idCategoria) ? idCategoria : null,
    descripcion: `Se creó la categoría: ${nombre}`,
  });

  revalidatePath("/admin/categorias");
  revalidatePath("/", "layout");
}

/**
 * --- ENVIAR CATEGORÍA A LA PAPELERA ---
 * Conserva la categoría original durante 24 horas y respeta la protección
 * existente para categorías con productos vinculados.
 */
export async function deleteCategoria(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { error: "El identificador de la categoría no es válido." };
  }

  const idAdmin = await obtenerIdAdministrador();
  if (idAdmin === null) {
    return { error: "No se pudo identificar al administrador." };
  }

  let tx: Awaited<ReturnType<typeof db.transaction>> | null = null;

  try {
    tx = await db.transaction("write");

    const resCategoria = await tx.execute({
      sql: "SELECT * FROM categoria WHERE id_categoria = ?",
      args: [id],
    });
    const categoria = resCategoria.rows[0];

    if (!categoria) {
      await tx.rollback();
      return { error: "La categoría no existe." };
    }

    const existePapelera = await tx.execute({
      sql: `SELECT id_papelera FROM papelera
            WHERE tabla_origen = 'categoria' AND id_registro = ? LIMIT 1`,
      args: [id],
    });

    if (existePapelera.rows.length > 0) {
      await tx.rollback();
      return { error: "La categoría ya se encuentra en la papelera." };
    }

    const resCheck = await tx.execute({
      sql: "SELECT COUNT(*) AS total FROM producto WHERE id_categoria = ?",
      args: [id],
    });
    const totalProductos = Number(resCheck.rows[0]?.total ?? 0);

    if (totalProductos > 0) {
      await tx.rollback();
      return {
        error: `BLOQUEO DE SEGURIDAD: No puedes eliminar esta categoría porque tiene ${totalProductos} productos vinculados.`,
      };
    }

    await tx.execute({
      sql: `
        INSERT INTO papelera
          (tabla_origen, id_registro, datos_json, fecha_eliminacion, fecha_expiracion, id_admin)
        VALUES ('categoria', ?, ?, CURRENT_TIMESTAMP, datetime('now', '+1 day'), ?)
      `,
      args: [id, JSON.stringify(categoria), idAdmin],
    });

    await tx.commit();
    tx = null;

    await registrarAuditoria({
      accion: "ELIMINAR",
      modulo: "CATEGORIAS",
      id_registro: id,
      descripcion: `Se envió la categoría "${String(categoria.nombre)}" a la papelera.`,
    });

    revalidatePath("/admin/categorias");
    revalidatePath("/admin/papelera");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    if (tx) await tx.rollback().catch(() => {});
    console.error("Error al enviar categoría a la papelera:", error);
    return { error: "No se pudo enviar la categoría a la papelera." };
  }
}

/** --- EDITAR CATEGORÍA --- */
export async function updateCategoria(formData: FormData) {
  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const genero = formData.get("genero") as string;

  // VALIDACIÓN DE CAMPOS (sin cambios)
  if (
    !nombre ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(nombre.trim())
  ) {
    return;
  }

  if (!["Unisex", "Hombre", "Mujer"].includes(genero)) {
    return;
  }

  const resultado = await db.execute({
    sql: "UPDATE categoria SET nombre = ?, genero = ? WHERE id_categoria = ?",
    args: [nombre, genero, id],
  });

  if (resultado.rowsAffected > 0) {
    await registrarAuditoria({
      accion: "EDITAR",
      modulo: "CATEGORIAS",
      id_registro: Number(id),
      descripcion: `Se actualizó la categoría: ${nombre}`,
    });
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/", "layout");
  redirect("/admin/categorias");
}
