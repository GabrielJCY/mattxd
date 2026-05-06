"use server";
import { db } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth"; // Añadido para la verificación

// --- CREAR ---
export async function crearAdmin(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  const hashedPassword = await bcrypt.hash(password, 10);

  await db.execute(
    "INSERT INTO admin (nombre, apellido, correo, password) VALUES (?, ?, ?, ?)",
    [nombre, apellido, correo, hashedPassword]
  );

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

// --- EDITAR ---
export async function editarAdmin(formData: FormData) {
  const id = formData.get("id_admin") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const passwordNueva = formData.get("password") as string;

  if (passwordNueva && passwordNueva.length > 0) {
    // Si escribió una nueva contraseña, la actualizamos con hash
    const hashedPassword = await bcrypt.hash(passwordNueva, 10);
    await db.execute(
      "UPDATE admin SET nombre = ?, apellido = ?, correo = ?, password = ? WHERE id_admin = ?",
      [nombre, apellido, correo, hashedPassword, id]
    );
  } else {
    // Si no escribió nada, mantenemos la anterior
    await db.execute(
      "UPDATE admin SET nombre = ?, apellido = ?, correo = ? WHERE id_admin = ?",
      [nombre, apellido, correo, id]
    );
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

// --- ELIMINAR ---
export async function eliminarAdmin(id: number) {
  await db.execute("DELETE FROM admin WHERE id_admin = ?", [id]);
  revalidatePath("/admin/usuarios");
}

// --- VERIFICAR CLAVE (Para AdminGuard) ---
/**
 * Compara la clave ingresada con el hash guardado en la base de datos
 * usando el correo del administrador que tiene la sesión activa.
 */
export async function verifyAdminKey(passwordIngresada: string) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return { success: false, error: "Sesión no detectada" };
    }

    // Buscamos el hash de la contraseña en la DB
    const result = await db.execute(
      "SELECT password FROM admin WHERE correo = ?",
      [session.user.email]
    );

    const admin = result.rows[0];

    if (!admin) {
      return { success: false, error: "Admin no encontrado" };
    }

    // 🛡️ COMPARACIÓN SEGURA: bcrypt.compare hace el trabajo sucio
    const isMatch = await bcrypt.compare(passwordIngresada, admin.password as string);

    if (isMatch) {
      return { success: true };
    } else {
      return { success: false, error: "Clave incorrecta" };
    }
  } catch (error) {
    console.error("Error en validación de Admin:", error);
    return { success: false, error: "Error de servidor" };
  }
}