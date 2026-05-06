"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

/**
 * --- GUARDAR / ACTUALIZAR CLIENTE ---
 * Maneja tanto la creación como la edición, incluyendo el hash de contraseña.
 */
export async function saveCliente(formData: FormData) {
  const id_cliente = formData.get("id_cliente") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const telefono = formData.get("telefono") as string;
  const password = formData.get("password") as string;

  try {
    if (id_cliente) {
      // --- LÓGICA DE ACTUALIZACIÓN ---
      if (password && password.length > 0) {
        // Si el admin escribió una nueva contraseña, la hasheamos
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        await db.execute({
          sql: "UPDATE cliente SET nombre=?, apellido=?, correo=?, telefono=?, password=? WHERE id_cliente=?",
          args: [nombre, apellido, correo, telefono, hashed, id_cliente],
        });
      } else {
        // Si no hay contraseña nueva, actualizamos solo los datos básicos
        await db.execute({
          sql: "UPDATE cliente SET nombre=?, apellido=?, correo=?, telefono=? WHERE id_cliente=?",
          args: [nombre, apellido, correo, telefono, id_cliente],
        });
      }
    } else {
      // --- LÓGICA DE CREACIÓN ---
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      await db.execute({
        sql: "INSERT INTO cliente (nombre, apellido, correo, telefono, password) VALUES (?, ?, ?, ?, ?)",
        args: [nombre, apellido, correo, telefono, hashed],
      });
    }

    // INVALIDACIÓN DE CACHÉ:
    // Forzamos la actualización de la ruta específica y del layout global
    revalidatePath("/admin/clientes");
    revalidatePath("/", "layout"); 

    return { success: true };
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    return { success: false, message: "Error en la base de datos al guardar." };
  }
}

/**
 * --- ELIMINAR CLIENTE (CON PROTECCIÓN CONTABLE) ---
 */
export async function deleteCliente(id_cliente: number) {
  try {
    // 1. VERIFICACIÓN DE VENTAS: Consultamos la tabla de ventas
    const checkVentas = await db.execute({
      sql: "SELECT COUNT(*) as total FROM venta WHERE id_cliente = ?",
      args: [id_cliente]
    });

    const totalVentas = Number(checkVentas.rows[0].total);

    // Si tiene ventas, bloqueamos el borrado para mantener integridad referencial
    if (totalVentas > 0) {
      return { 
        success: false, 
        message: `ACCIÓN DENEGADA: El cliente tiene ${totalVentas} venta(s) registrada(s). No se puede eliminar para no romper el historial contable de Matt Bolivia.` 
      };
    }

    // 2. LIMPIEZA DE DATOS SECUNDARIOS (Cascada manual)
    // Borramos datos que no afectan la contabilidad (likes y reseñas)
    await db.execute({ sql: "DELETE FROM like_producto WHERE id_cliente = ?", args: [id_cliente] });
    await db.execute({ sql: "DELETE FROM resena WHERE id_cliente = ?", args: [id_cliente] });
    
    // 3. BORRADO FINAL
    await db.execute({ 
      sql: "DELETE FROM cliente WHERE id_cliente = ?", 
      args: [id_cliente] 
    });
    
    // INVALIDACIÓN DE CACHÉ:
    revalidatePath("/admin/clientes");
    revalidatePath("/", "layout");

    return { success: true };

  } catch (error: any) {
    console.error("Error al eliminar cliente:", error);
    
    // Doble validación por si falla la FK a nivel base de datos
    if (error.code === 'SQLITE_CONSTRAINT' || error.message?.includes('FOREIGN KEY')) {
      return { 
        success: false, 
        message: "No se puede eliminar: Existen registros vinculados que impiden el borrado por seguridad de datos." 
      };
    }

    return { 
      success: false, 
      message: "Error inesperado: No se pudo procesar la eliminación." 
    };
  }
}