"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * --- CREAR CATEGORÍA ---
 */
export async function addCategoria(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const genero = formData.get("genero") as string;

  await db.execute({
    sql: "INSERT INTO categoria (nombre, genero) VALUES (?, ?)",
    args: [nombre, genero],
  });

  // Limpiamos la ruta específica y el layout global para refrescar selectores en otras páginas
  revalidatePath("/admin/categorias");
  revalidatePath("/", "layout"); 
}

/**
 * --- ELIMINAR CATEGORÍA ---
 * Incluye validación de integridad referencial manual.
 */
export async function deleteCategoria(id: number) {
  try {
    // 1. Verificamos si existen productos usando esta categoría
    const resCheck = await db.execute({
      sql: "SELECT COUNT(*) as total FROM producto WHERE id_categoria = ?",
      args: [id],
    });

    const totalProductos = Number(resCheck.rows[0].total);

    // 2. Si hay productos, lanzamos un error para detener la operación
    if (totalProductos > 0) {
      throw new Error(`BLOQUEO DE SEGURIDAD: No puedes eliminar esta categoría porque tiene ${totalProductos} productos vinculados.`);
    }

    // 3. Si está limpia, procedemos a borrar
    await db.execute({
      sql: "DELETE FROM categoria WHERE id_categoria = ?",
      args: [id],
    });

    // Forzamos la actualización de la interfaz
    revalidatePath("/admin/categorias");
    revalidatePath("/", "layout");
    
    return { success: true };

  } catch (error: any) {
    console.error("Error al eliminar categoría:", error.message);
    return { error: error.message };
  }
}

/**
 * --- EDITAR CATEGORÍA ---
 */
export async function updateCategoria(formData: FormData) {
  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const genero = formData.get("genero") as string;

  await db.execute({
    sql: "UPDATE categoria SET nombre = ?, genero = ? WHERE id_categoria = ?",
    args: [nombre, genero, id],
  });

  // 1. Limpiamos caché
  revalidatePath("/admin/categorias");
  revalidatePath("/", "layout");

  // 2. Redireccionamos (El redirect debe ir siempre al final)
  redirect("/admin/categorias");
}