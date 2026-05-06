"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/**
 * --- CREAR PRODUCTO ---
 * Editado para obtener el ID y redirigir a la creación de modelos.
 */
export async function addProducto(formData: FormData) {
  console.log("--- REGISTRANDO PRODUCTO ---");
  
  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;
  const id_categoria = formData.get("id_categoria") as string;
  const tabla_medidas_url = formData.get("tabla_medidas_url") as string;

  if (!nombre || !id_categoria) {
    return { error: "Nombre y Categoría son requeridos." };
  }

  let newId;

  try {
    const result = await db.execute({
      sql: "INSERT INTO producto (nombre, descripcion, id_categoria, tabla_medidas_url) VALUES (?, ?, ?, ?) RETURNING id_producto",
      args: [
        nombre.toUpperCase(), 
        descripcion || null, 
        id_categoria, 
        tabla_medidas_url || null 
      ],
    });
    
    // Capturamos el ID recién creado
    newId = result.rows[0]?.id_producto || result.lastInsertRowid;

  } catch (error) {
    console.error("Error SQL al crear:", error);
    return { error: "Error de base de datos." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout"); 
  
  // REDIRECCIÓN ESTRATÉGICA: Vamos directo a crear las tallas/modelos
  redirect(`/admin/productos/modelos/${newId}`);
}

/**
 * --- EDITAR PRODUCTO ---
 */
export async function updateProducto(formData: FormData) {
  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;
  const id_categoria = formData.get("id_categoria") as string;
  const tabla_medidas_url = formData.get("tabla_medidas_url") as string;

  if (!id || !nombre || !id_categoria) {
    return { error: "Faltan parámetros críticos." };
  }

  try {
    await db.execute({
      sql: "UPDATE producto SET nombre = ?, descripcion = ?, id_categoria = ?, tabla_medidas_url = ? WHERE id_producto = ?",
      args: [
        nombre.toUpperCase(), 
        descripcion || null, 
        id_categoria, 
        tabla_medidas_url || null, 
        id
      ],
    });
  } catch (error) {
    console.error("Error SQL al editar:", error);
    return { error: "Error de base de datos al actualizar." };
  }

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");
  redirect("/admin/productos");
}

/**
 * --- CONTAR MODELOS ---
 */
export async function countModelos(id: number) {
  const result = await db.execute({
    sql: "SELECT COUNT(*) as total FROM modelo WHERE id_producto = ?",
    args: [id],
  });
  return Number(result.rows[0].total);
}

/**
 * --- ELIMINAR PRODUCTO (PROTEGIDO 🔒) ---
 */
export async function deleteProducto(id: number) {
  const total = await countModelos(id);
  
  if (total > 0) {
    return { 
      error: `No se puede eliminar: Tiene ${total} modelos asociados.` 
    };
  }

  try {
    await db.execute({
      sql: "DELETE FROM producto WHERE id_producto = ?",
      args: [id],
    });
    
    revalidatePath("/admin/productos");
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (e) {
    return { error: "Ocurrió un error inesperado." };
  }
}

/**
 * --- REGISTRAR VENTA QR ---
 */
export async function registrarVentaQR(idModelo: number, idSucursal: number) {
  try {
    const res = await db.execute({
      sql: "SELECT cantidad FROM stock WHERE id_modelo = ? AND id_sucursal = ?",
      args: [idModelo, idSucursal]
    });

    const cantidad = Number(res.rows[0]?.cantidad || 0);

    if (cantidad <= 0) {
      return { success: false, error: "Sin stock en esta sucursal." };
    }

    await db.execute({
      sql: "UPDATE stock SET cantidad = cantidad - 1 WHERE id_modelo = ? AND id_sucursal = ?",
      args: [idModelo, idSucursal]
    });

    revalidatePath("/admin/productos");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Error en registrarVentaQR:", error);
    return { success: false, error: "Error al procesar la venta." };
  }
}