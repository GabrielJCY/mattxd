"use server";

import { db } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { registrarAuditoria } from "@/src/lib/auditoria";

// Identifica al administrador responsable mediante los dos inicios de sesión del prototipo.
async function obtenerIdAdministrador(): Promise<number | null> {
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as any).role === "admin") {
    const id = Number((session.user as any).id);
    if (Number.isSafeInteger(id) && id > 0) return id;
  }

  const cookieStore = await cookies();
  const valor = cookieStore.get("matt_session")?.value;
  if (!valor) return null;

  try {
    const sesionManual = JSON.parse(valor);
    const id = Number(sesionManual.id);
    if (sesionManual.role === "admin" && Number.isSafeInteger(id) && id > 0) {
      return id;
    }
  } catch {
    return null;
  }
  return null;
}

// --- CREAR ---
export async function crearAdmin(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const password = formData.get("password") as string;

  // --- VALIDACIÓN DE NOMBRE ---
  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(nombre.trim())
  ) {
    return { error: "El nombre solo permite letras y espacios (2 a 80 caracteres)." };
  }

  // --- VALIDACIÓN DE APELLIDO ---
  if (
    typeof apellido !== "string" ||
    apellido.trim().length < 2 ||
    apellido.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(apellido.trim())
  ) {
    return { error: "El apellido solo permite letras y espacios (2 a 80 caracteres)." };
  }

  // --- VALIDACIÓN DE CORREO ---
  if (
    typeof correo !== "string" ||
    correo.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  // --- VALIDACIÓN DE CONTRASEÑA ---
  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return { error: "La contraseña debe tener al menos 8 caracteres y no superar 72 bytes." };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const resultado = await db.execute({
    sql: "INSERT INTO admin (nombre, apellido, correo, password) VALUES (?, ?, ?, ?) RETURNING id_admin",
    args: [nombre, apellido, correo, hashedPassword],
  });

  const idNuevo = Number(resultado.rows[0]?.id_admin ?? resultado.lastInsertRowid);
  await registrarAuditoria({
    accion: "CREAR",
    modulo: "ADMINISTRADORES",
    id_registro: Number.isSafeInteger(idNuevo) && idNuevo > 0 ? idNuevo : null,
    descripcion: `Se creó el administrador: ${nombre} ${apellido}`,
  });

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

  // --- VALIDACIÓN DE ID ---
  if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
    return { error: "El ID del administrador no es válido." };
  }

  // --- VALIDACIÓN DE NOMBRE ---
  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(nombre.trim())
  ) {
    return { error: "El nombre solo permite letras y espacios (2 a 80 caracteres)." };
  }

  // --- VALIDACIÓN DE APELLIDO ---
  if (
    typeof apellido !== "string" ||
    apellido.trim().length < 2 ||
    apellido.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(apellido.trim())
  ) {
    return { error: "El apellido solo permite letras y espacios (2 a 80 caracteres)." };
  }

  // --- VALIDACIÓN DE CORREO ---
  if (
    typeof correo !== "string" ||
    correo.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  // --- VALIDACIÓN DE CONTRASEÑA NUEVA ---
  if (
    passwordNueva &&
    (typeof passwordNueva !== "string" ||
      passwordNueva.length < 8 ||
      Buffer.byteLength(passwordNueva, "utf8") > 72)
  ) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres y no superar 72 bytes." };
  }

  let resultado;
  if (passwordNueva && passwordNueva.length > 0) {
    // Si escribió una nueva contraseña, la actualizamos con hash
    const hashedPassword = await bcrypt.hash(passwordNueva, 10);
    resultado = await db.execute(
      "UPDATE admin SET nombre = ?, apellido = ?, correo = ?, password = ? WHERE id_admin = ?",
      [nombre, apellido, correo, hashedPassword, id]
    );
  } else {
    // Si no escribió nada, mantenemos la anterior
    resultado = await db.execute(
      "UPDATE admin SET nombre = ?, apellido = ?, correo = ? WHERE id_admin = ?",
      [nombre, apellido, correo, id]
    );
  }

  if (resultado.rowsAffected > 0) {
    await registrarAuditoria({
      accion: "EDITAR",
      modulo: "ADMINISTRADORES",
      id_registro: Number(id),
      descripcion: `Se actualizó el administrador: ${nombre} ${apellido}`,
    });
  }

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

// --- ELIMINAR (ENVIAR A PAPELERA) ---
export async function eliminarAdmin(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { success: false, error: "ID de administrador no válido." };
  }

  const idResponsable = await obtenerIdAdministrador();
  if (idResponsable === null) {
    return { success: false, error: "No se pudo identificar al administrador." };
  }

  // Evita que el administrador en sesión archive su propia cuenta.
  if (idResponsable === id) {
    return { success: false, error: "No puedes enviar tu propia cuenta a la papelera." };
  }

  const tx = await db.transaction("write");
  try {
    // Nunca se copia la contraseña (ni su hash) a datos_json.
    const consulta = await tx.execute({
      sql: "SELECT id_admin, nombre, apellido, correo FROM admin WHERE id_admin = ?",
      args: [id],
    });

    if (consulta.rows.length === 0) {
      await tx.rollback();
      return { success: false, error: "El administrador no existe." };
    }

    const existente = await tx.execute({
      sql: "SELECT id_papelera FROM papelera WHERE tabla_origen = 'admin' AND id_registro = ? LIMIT 1",
      args: [id],
    });

    if (existente.rows.length > 0) {
      await tx.rollback();
      return { success: false, error: "Este administrador ya está en la papelera." };
    }

    await tx.execute({
      sql: `INSERT INTO papelera
        (tabla_origen, id_registro, datos_json, fecha_eliminacion, fecha_expiracion, id_admin)
        VALUES ('admin', ?, ?, CURRENT_TIMESTAMP, datetime('now', '+1 day'), ?)`,
      args: [id, JSON.stringify(consulta.rows[0]), idResponsable],
    });
    await tx.commit();

    await registrarAuditoria({
      accion: "ELIMINAR",
      modulo: "ADMINISTRADORES",
      id_registro: id,
      descripcion: `Se envió el administrador ${String(consulta.rows[0].correo)} a la papelera.`,
    });

    revalidatePath("/admin/usuarios");
    revalidatePath("/admin/papelera");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    await tx.rollback().catch(() => {});
    console.error("Error al enviar administrador a la papelera:", error);
    return { success: false, error: "No se pudo enviar el administrador a la papelera." };
  }
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

    // COMPARACIÓN SEGURA
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
