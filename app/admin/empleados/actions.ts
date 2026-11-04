"use server";

import { db } from "@/src/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { registrarAuditoria } from "@/src/lib/auditoria";
import { enviarAPapelera } from "@/src/lib/papelera";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

// Obtiene el administrador desde los dos métodos de acceso del prototipo.
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
    const manual = JSON.parse(valor);
    const id = Number(manual.id);
    return manual.role === "admin" && Number.isSafeInteger(id) && id > 0
      ? id
      : null;
  } catch {
    return null;
  }
}

/**
 * OBTIENE EMPLEADOS.
 * No muestra empleados enviados a la papelera.
 * Convierte los resultados en objetos planos para Client Components.
 */
export async function getEmpleados() {
  const res = await db.execute(`
    SELECT e.id_empleado, e.nombre, e.apellido, e.correo, e.telefono
    FROM empleado e
    WHERE NOT EXISTS (
      SELECT 1 FROM papelera pa
      WHERE pa.tabla_origen = 'empleado'
        AND pa.id_registro = e.id_empleado
    )
    ORDER BY e.nombre ASC
  `);

  return res.rows.map((row: any) => ({
    id_empleado: Number(row.id_empleado),
    nombre: String(row.nombre || ""),
    apellido: String(row.apellido || ""),
    correo: String(row.correo || ""),
    telefono: String(row.telefono || ""),
  }));
}

/** CREA EMPLEADO */
export async function crearEmpleado(formData: FormData) {
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const telefono = formData.get("telefono") as string;
  const password = formData.get("password") as string;

  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(nombre.trim())
  ) {
    return { error: "El nombre solo permite letras y espacios (2 a 80 caracteres)." };
  }

  if (
    typeof apellido !== "string" ||
    apellido.trim().length < 2 ||
    apellido.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(apellido.trim())
  ) {
    return { error: "El apellido solo permite letras y espacios (2 a 80 caracteres)." };
  }

  if (
    typeof correo !== "string" ||
    correo.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  if (typeof telefono !== "string" || !/^\d{7,15}$/.test(telefono)) {
    return { error: "El teléfono debe contener entre 7 y 15 números, sin letras ni símbolos." };
  }

  if (
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return { error: "La contraseña debe tener al menos 8 caracteres y no superar 72 bytes." };
  }

  const hashedPw = await bcrypt.hash(password, 10);

  const resultado = await db.execute({
    sql: "INSERT INTO empleado (nombre, apellido, correo, telefono, password) VALUES (?, ?, ?, ?, ?) RETURNING id_empleado",
    args: [nombre, apellido, correo, telefono, hashedPw],
  });

  const idNuevo = Number(resultado.rows[0]?.id_empleado ?? resultado.lastInsertRowid);
  await registrarAuditoria({
    accion: "CREAR",
    modulo: "EMPLEADOS",
    id_registro: Number.isSafeInteger(idNuevo) && idNuevo > 0 ? idNuevo : null,
    descripcion: `Se creó el empleado: ${nombre} ${apellido}`,
  });

  revalidatePath("/admin/empleados");
  revalidatePath("/", "layout");
}

/** EDITA EMPLEADO; solo cambia la contraseña si se proporciona otra. */
export async function editarEmpleado(formData: FormData) {
  const id_empleado = formData.get("id_empleado") as string;
  const nombre = formData.get("nombre") as string;
  const apellido = formData.get("apellido") as string;
  const correo = formData.get("correo") as string;
  const telefono = formData.get("telefono") as string;
  const password = formData.get("password") as string;

  if (typeof id_empleado !== "string" || !/^[1-9]\d*$/.test(id_empleado)) {
    return { error: "El ID del empleado no es válido." };
  }

  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(nombre.trim())
  ) {
    return { error: "El nombre solo permite letras y espacios (2 a 80 caracteres)." };
  }

  if (
    typeof apellido !== "string" ||
    apellido.trim().length < 2 ||
    apellido.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(apellido.trim())
  ) {
    return { error: "El apellido solo permite letras y espacios (2 a 80 caracteres)." };
  }

  if (
    typeof correo !== "string" ||
    correo.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    return { error: "Ingresa un correo electrónico válido." };
  }

  if (typeof telefono !== "string" || !/^\d{7,15}$/.test(telefono)) {
    return { error: "El teléfono debe contener entre 7 y 15 números, sin letras ni símbolos." };
  }

  if (
    password &&
    (typeof password !== "string" || password.length < 8 || Buffer.byteLength(password, "utf8") > 72)
  ) {
    return { error: "La nueva contraseña debe tener al menos 8 caracteres y no superar 72 bytes." };
  }

  let resultado;
  if (password && password.trim() !== "") {
    const hashedPw = await bcrypt.hash(password, 10);
    resultado = await db.execute(
      "UPDATE empleado SET nombre = ?, apellido = ?, correo = ?, telefono = ?, password = ? WHERE id_empleado = ?",
      [nombre, apellido, correo, telefono, hashedPw, id_empleado]
    );
  } else {
    resultado = await db.execute(
      "UPDATE empleado SET nombre = ?, apellido = ?, correo = ?, telefono = ? WHERE id_empleado = ?",
      [nombre, apellido, correo, telefono, id_empleado]
    );
  }

  if (resultado.rowsAffected > 0) {
    await registrarAuditoria({
      accion: "EDITAR",
      modulo: "EMPLEADOS",
      id_registro: Number(id_empleado),
      descripcion: `Se actualizó el empleado: ${nombre} ${apellido}`,
    });
  }

  revalidatePath("/admin/empleados");
  revalidatePath("/", "layout");
}

/** Envía empleado a papelera sin borrar físicamente su historial. */
export async function eliminarEmpleado(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    return { success: false, message: "ID de empleado no válido." };
  }

  const idAdmin = await obtenerIdAdministrador();
  if (idAdmin === null) {
    return { success: false, message: "No se pudo identificar al administrador." };
  }

  try {
    const resultado = await enviarAPapelera("empleado", id, idAdmin);
    if (!resultado.success) {
      return { success: false, message: resultado.error || "No se pudo enviar a la papelera." };
    }

    await registrarAuditoria({
      accion: "ELIMINAR",
      modulo: "EMPLEADOS",
      id_registro: id,
      descripcion: `Se envió el empleado con ID ${id} a la papelera.`,
    });

    revalidatePath("/admin/empleados");
    revalidatePath("/admin/papelera");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error al enviar empleado a la papelera:", error);
    return { success: false, message: "Error de sistema al enviar el empleado a la papelera." };
  }
}
