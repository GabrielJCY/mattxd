"use server";
import { db } from "@/src/lib/db";
import bcrypt from "bcryptjs"; // <--- Cambiado a bcryptjs

export async function crearPrimerAdmin() {
  const passwordPlano = "MattAdmin2026"; 
  const saltRounds = 10;
  
  // Encriptamos la contraseña
  const hashedPassword = await bcrypt.hash(passwordPlano, saltRounds);

  try {
    await db.execute(
      "INSERT INTO admin (nombre, apellido, correo, password) VALUES (?, ?, ?, ?)",
      ["Gabriel", "Matt", "admin@mattbolivia.com", hashedPassword]
    );
    return { success: true, message: "Admin creado con éxito" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error o el correo ya existe" };
  }
}