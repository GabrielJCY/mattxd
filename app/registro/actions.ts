"use server";

import { executeQuery } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function registrarNuevoCliente(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const telefono = formData.get("telefono") as string;
  const password = formData.get("password") as string;

  try {
    // 1. Insertar en la tabla cliente
    await executeQuery(
      `INSERT INTO cliente (nombre, apellido, correo, telefono, password) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        nombre.toUpperCase(), 
        apellido.toUpperCase(), 
        correo.toLowerCase(), 
        telefono, 
        password || "google_account"
      ]
    );

    // 2. ⚡ REVALIDACIÓN INTEGRAL
    // Revalidamos el Home con "layout" para que el middleware fuerce la nueva lectura.
    // Revalidamos /registro para que el servidor sepa que esta tarea ya terminó.
    revalidatePath("/", "layout");
    revalidatePath("/registro");
    
    return { success: true };
  } catch (error: any) {
    console.error("❌ ERROR AL REGISTRAR CLIENTE:", error);
    
    // Captura errores de duplicados tanto en SQLite como en MySQL/PostgreSQL
    const errorMsg = error.message || "";
    if (
      errorMsg.includes("UNIQUE constraint failed") || 
      errorMsg.includes("Duplicate entry") || 
      errorMsg.includes("already exists")
    ) {
      return { success: false, message: "Este correo ya está registrado." };
    }
    
    return { success: false, message: "Error interno en el servidor." };
  }
}