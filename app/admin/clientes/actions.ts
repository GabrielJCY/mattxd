"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { registrarAuditoria } from "@/src/lib/auditoria";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

// Identifica al administrador con los dos métodos de sesión del prototipo.
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

  // --- VALIDACIÓN DE NOMBRE ---
  if (
    typeof nombre !== "string" ||
    nombre.trim().length < 2 ||
    nombre.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(nombre.trim())
  ) {
    return { success: false, message: "El nombre solo permite letras y espacios (2 a 80 caracteres)." };
  }

  // --- VALIDACIÓN DE APELLIDO ---
  if (
    typeof apellido !== "string" ||
    apellido.trim().length < 2 ||
    apellido.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(apellido.trim())
  ) {
    return { success: false, message: "El apellido solo permite letras y espacios (2 a 80 caracteres)." };
  }

  // --- VALIDACIÓN DE CORREO ---
  if (
    typeof correo !== "string" ||
    correo.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
  ) {
    return { success: false, message: "Ingresa un correo electrónico válido." };
  }

  // --- VALIDACIÓN DE TELÉFONO ---
  if (
    typeof telefono !== "string" ||
    !/^\d{7,15}$/.test(telefono)
  ) {
    return { success: false, message: "El teléfono debe contener entre 7 y 15 números, sin letras ni símbolos." };
  }

  // --- VALIDACIÓN DE ID AL EDITAR ---
  if (id_cliente && !/^[1-9]\d*$/.test(id_cliente)) {
    return { success: false, message: "El ID del cliente no es válido." };
  }

  // --- VALIDACIÓN DE CONTRASEÑA ---
  if (!id_cliente || (password && password.length > 0)) {
    if (
      typeof password !== "string" ||
      password.length < 8 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return { success: false, message: "La contraseña debe tener al menos 8 caracteres y no superar 72 bytes." };
    }
  }

  try {
    if (id_cliente) {
      // --- LÓGICA DE ACTUALIZACIÓN ---
      let resultado;
      if (password && password.length > 0) {
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);
        resultado = await db.execute({
          sql: "UPDATE cliente SET nombre=?, apellido=?, correo=?, telefono=?, password=? WHERE id_cliente=?",
          args: [nombre, apellido, correo, telefono, hashed, id_cliente],
        });
      } else {
        resultado = await db.execute({
          sql: "UPDATE cliente SET nombre=?, apellido=?, correo=?, telefono=? WHERE id_cliente=?",
          args: [nombre, apellido, correo, telefono, id_cliente],
        });
      }

      if (resultado.rowsAffected > 0) {
        await registrarAuditoria({
          accion: "EDITAR",
          modulo: "CLIENTES",
          id_registro: Number(id_cliente),
          descripcion: `Se actualizó el cliente: ${nombre} ${apellido}`,
        });
      }
    } else {
      // --- LÓGICA DE CREACIÓN ---
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(password, salt);
      const resultado = await db.execute({
        sql: "INSERT INTO cliente (nombre, apellido, correo, telefono, password) VALUES (?, ?, ?, ?, ?) RETURNING id_cliente",
        args: [nombre, apellido, correo, telefono, hashed],
      });
      const nuevoId = Number(resultado.rows[0]?.id_cliente ?? resultado.lastInsertRowid);
      await registrarAuditoria({
        accion: "CREAR",
        modulo: "CLIENTES",
        id_registro: Number.isSafeInteger(nuevoId) ? nuevoId : null,
        descripcion: `Se registró el cliente: ${nombre} ${apellido}`,
      });
    }

    // INVALIDACIÓN DE CACHÉ
    revalidatePath("/admin/clientes");
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error al guardar cliente:", error);
    return { success: false, message: "Error en la base de datos al guardar." };
  }
}

/**
 * --- ENVIAR CLIENTE A PAPELERA ---
 * Conserva cliente, reseñas, likes, pedidos y ventas en sus tablas originales.
 * Guarda solo datos no sensibles como copia de visualización en la papelera.
 */
export async function deleteCliente(id_cliente: number) {
  if (!Number.isSafeInteger(id_cliente) || id_cliente <= 0) {
    return { success: false, message: "El ID del cliente no es válido." };
  }

  const idAdmin = await obtenerIdAdministrador();
  if (idAdmin === null) {
    return { success: false, message: "No se pudo identificar al administrador." };
  }

  let tx;
  try {
    tx = await db.transaction("write");
    const cliente = await tx.execute({
      sql: "SELECT id_cliente, nombre, apellido, correo, telefono, direccion FROM cliente WHERE id_cliente = ?",
      args: [id_cliente],
    });
    if (!cliente.rows.length) {
      await tx.rollback();
      return { success: false, message: "El cliente no existe." };
    }

    const existente = await tx.execute({
      sql: "SELECT id_papelera FROM papelera WHERE tabla_origen = 'cliente' AND id_registro = ? LIMIT 1",
      args: [id_cliente],
    });
    if (existente.rows.length) {
      await tx.rollback();
      return { success: false, message: "El cliente ya está en la papelera." };
    }

    await tx.execute({
      sql: `INSERT INTO papelera
              (tabla_origen, id_registro, datos_json, fecha_eliminacion, fecha_expiracion, id_admin)
            VALUES ('cliente', ?, ?, CURRENT_TIMESTAMP, datetime('now', '+1 day'), ?)`,
      args: [id_cliente, JSON.stringify(cliente.rows[0]), idAdmin],
    });
    await tx.commit();
  } catch (error) {
    if (tx) await tx.rollback().catch(() => {});
    console.error("Error al enviar cliente a la papelera:", error);
    return { success: false, message: "No se pudo enviar el cliente a la papelera." };
  }

  const auditoria = await registrarAuditoria({
    accion: "ELIMINAR",
    modulo: "CLIENTES",
    id_registro: id_cliente,
    descripcion: `Se envió el cliente con ID ${id_cliente} a la papelera.`,
  });
  if (!auditoria.success) {
    console.error("Cliente archivado, pero no se pudo guardar su log:", auditoria.error);
  }

  revalidatePath("/admin/clientes");
  revalidatePath("/admin/papelera");
  revalidatePath("/", "layout");
  return { success: true };
}
