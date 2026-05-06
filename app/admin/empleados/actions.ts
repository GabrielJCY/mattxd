"use server";

import { db } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

/**
 * OBTIENE EMPLEADOS
 * Limpiamos los objetos para que sean "Plain Objects" y Next.js no dé error
 * al pasarlos de Server a Client Components.
 */
export async function getEmpleados() {
  // Realizamos la consulta directamente a la base de datos
  const res = await db.execute("SELECT id_empleado, nombre, apellido, correo, telefono FROM empleado ORDER BY nombre ASC");
  
  // Mapeo manual para asegurar que los datos sean tipos primitivos puros
  return res.rows.map((row: any) => ({
    id_empleado: Number(row.id_empleado),
    nombre: String(row.nombre || ""),
    apellido: String(row.apellido || ""),
    correo: String(row.correo || ""),
    telefono: String(row.telefono || ""),
  }));
}

/**
 * CREA EMPLEADO
 */
export async function crearEmpleado(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const telefono = formData.get("telefono") as string;
  const password = formData.get("password") as string;

  const hashedPw = await bcrypt.hash(password, 10);

  await db.execute(
    "INSERT INTO empleado (nombre, apellido, correo, telefono, password) VALUES (?, ?, ?, ?, ?)",
    [nombre, apellido, correo, telefono, hashedPw]
  );

  // INVALIDACIÓN DE CACHÉ TOTAL
  revalidatePath("/admin/empleados");
  revalidatePath("/", "layout"); 
}

/**
 * EDITA EMPLEADO
 * Solo actualiza la contraseña si se proporciona una nueva.
 */
export async function editarEmpleado(formData: FormData) {
  const id_empleado = formData.get("id_empleado") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const telefono = formData.get("telefono") as string;
  const password = formData.get("password") as string;

  if (password && password.trim() !== "") {
    const hashedPw = await bcrypt.hash(password, 10);
    await db.execute(
      "UPDATE empleado SET nombre = ?, apellido = ?, correo = ?, telefono = ?, password = ? WHERE id_empleado = ?",
      [nombre, apellido, correo, telefono, hashedPw, id_empleado]
    );
  } else {
    await db.execute(
      "UPDATE empleado SET nombre = ?, apellido = ?, correo = ?, telefono = ? WHERE id_empleado = ?",
      [nombre, apellido, correo, telefono, id_empleado]
    );
  }

  // INVALIDACIÓN DE CACHÉ TOTAL
  revalidatePath("/admin/empleados");
  revalidatePath("/", "layout");
}

/**
 * ELIMINA EMPLEADO
 * Maneja el error de restricción de llave foránea para proteger la integridad de los datos.
 */
export async function eliminarEmpleado(id: number) {
  try {
    await db.execute("DELETE FROM empleado WHERE id_empleado = ?", [id]);
    
    // INVALIDACIÓN DE CACHÉ TOTAL
    revalidatePath("/admin/empleados");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    // Verificamos si el error es por una restricción de llave foránea (datos vinculados)
    if (error.message && (error.message.includes("FOREIGN KEY") || error.code === 'SQLITE_CONSTRAINT')) {
      return { 
        success: false, 
        message: "PROTECCIÓN DE DATOS: No se puede eliminar este empleado porque tiene registros de ventas, pedidos o historial asociados en el sistema." 
      };
    }

    // Otros errores de base de datos
    return { 
      success: false, 
      message: "Error de sistema al intentar eliminar el registro." 
    };
  }
}