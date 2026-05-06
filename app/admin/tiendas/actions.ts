"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Guarda o actualiza una sucursal en la base de datos.
 * Maneja tanto la creación (INSERT) como la edición (UPDATE).
 */
export async function saveSucursal(formData: FormData) {
  // Extraemos los datos del FormData
  const id = formData.get("id") as string;
  const nombre_tienda = formData.get("nombre_tienda") as string;
  const direccion = formData.get("direccion") as string;
  const ciudad = formData.get("ciudad") as string;
  const telefono = formData.get("telefono") as string;
  const horario = formData.get("horario") as string;
  const google_maps_url = formData.get("google_maps_url") as string;
  const imagen_url = formData.get("imagen_url") as string;

  try {
    if (id && id !== "") {
      // MODO EDICIÓN: UPDATE
      // CORRECCIÓN: Se cambió 'id' por 'id_sucursal' en el WHERE
      await db.execute({
        sql: `UPDATE sucursal 
              SET nombre_tienda = ?, 
                  direccion = ?, 
                  ciudad = ?, 
                  telefono = ?, 
                  horario = ?, 
                  google_maps_url = ?, 
                  imagen_url = ? 
              WHERE id_sucursal = ?`,
        args: [
          nombre_tienda, 
          direccion, 
          ciudad, 
          telefono, 
          horario, 
          google_maps_url, 
          imagen_url, 
          Number(id)
        ],
      });
      console.log(`✅ Sucursal actualizada: ${nombre_tienda}`);
    } else {
      // MODO NUEVO: INSERT
      await db.execute({
        sql: `INSERT INTO sucursal 
              (nombre_tienda, direccion, ciudad, telefono, horario, google_maps_url, imagen_url) 
              VALUES (?, ?, ?, ?, ?, ?, ?)`,
        args: [
          nombre_tienda, 
          direccion, 
          ciudad, 
          telefono, 
          horario, 
          google_maps_url, 
          imagen_url
        ],
      });
      console.log(`✅ Nueva sucursal creada: ${nombre_tienda}`);
    }

    // --- REVALIDACIÓN DE CACHÉ ---
    revalidatePath("/tiendas");
    revalidatePath("/admin/tiendas");
    revalidatePath("/", "layout"); 
    
    return { success: true };

  } catch (error) {
    console.error("❌ Error en saveSucursal:", error);
    return { 
      success: false, 
      message: "Error al procesar la base de datos. Revisa la consola." 
    };
  }
}

/**
 * Elimina una sucursal permanentemente.
 */
export async function deleteSucursal(id: number) {
  try {
    const idSucursal = Number(id);

    // CORRECCIÓN: Se cambió 'WHERE id' por 'WHERE id_sucursal'
    await db.execute({
      sql: "DELETE FROM sucursal WHERE id_sucursal = ?",
      args: [idSucursal]
    });

    console.log(`🗑️ Sucursal eliminada ID: ${idSucursal}`);

    // --- REVALIDACIÓN DE CACHÉ ---
    revalidatePath("/tiendas");
    revalidatePath("/admin/tiendas");
    revalidatePath("/", "layout");

    return { success: true };

  } catch (error) {
    console.error("❌ Error al eliminar sucursal:", error);
    return { 
      success: false, 
      message: "No se pudo eliminar la sucursal de la base de datos." 
    };
  }
}