"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { registrarAuditoria } from "@/src/lib/auditoria";
import { enviarAPapelera } from "@/src/lib/papelera";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

// Obtiene el ID del administrador usando los dos inicios de sesión del prototipo.
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

  // --- VALIDACIÓN DE CAMPOS ---
  if (
    !nombre_tienda ||
    nombre_tienda.trim().length < 2 ||
    nombre_tienda.trim().length > 100 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 -]+$/.test(nombre_tienda.trim())
  ) {
    return {
      success: false,
      message: "El nombre de la tienda solo permite letras, números, espacios y guiones (2 a 100 caracteres)."
    };
  }

  if (
    !direccion ||
    direccion.trim().length < 5 ||
    direccion.trim().length > 200 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 .,°º#/-]+$/.test(direccion.trim())
  ) {
    return {
      success: false,
      message: "La dirección contiene caracteres no permitidos o debe tener entre 5 y 200 caracteres."
    };
  }

  if (
    !ciudad ||
    ciudad.trim().length < 2 ||
    ciudad.trim().length > 80 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ ]+$/.test(ciudad.trim())
  ) {
    return {
      success: false,
      message: "La ciudad solo puede contener letras y espacios (2 a 80 caracteres)."
    };
  }

  if (telefono && !/^\d{7,15}$/.test(telefono.trim())) {
    return {
      success: false,
      message: "El teléfono solo debe contener números (entre 7 y 15 dígitos)."
    };
  }

  if (
    horario &&
    (horario.length > 150 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9 :.,/-]+$/.test(horario.trim()))
  ) {
    return { success: false, message: "El horario contiene caracteres no permitidos." };
  }

  if (google_maps_url) {
    try {
      const url = new URL(google_maps_url);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { success: false, message: "La URL de Google Maps no es válida." };
      }
    } catch {
      return { success: false, message: "La URL de Google Maps no es válida." };
    }
  }

  if (imagen_url) {
    try {
      const url = new URL(imagen_url);
      if (!["http:", "https:"].includes(url.protocol)) {
        return { success: false, message: "La URL de la imagen no es válida." };
      }
    } catch {
      return { success: false, message: "La URL de la imagen no es válida." };
    }
  }

  try {
    if (id && id !== "") {
      // MODO EDICIÓN: UPDATE
      const resultado = await db.execute({
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

      if (resultado.rowsAffected > 0) {
        const log = await registrarAuditoria({
          accion: "EDITAR",
          modulo: "SUCURSALES",
          id_registro: Number(id),
          descripcion: `Se actualizó la sucursal: ${nombre_tienda}`,
        });
        if (!log.success) console.error("No se registró la auditoría de edición:", log.error);
      }
      console.log(`✅ Sucursal actualizada: ${nombre_tienda}`);
    } else {
      // MODO NUEVO: INSERT
      const resultado = await db.execute({
        sql: `INSERT INTO sucursal
              (nombre_tienda, direccion, ciudad, telefono, horario, google_maps_url, imagen_url)
              VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id_sucursal`,
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

      const idNuevo = resultado.rows[0]?.id_sucursal ?? resultado.lastInsertRowid;
      const log = await registrarAuditoria({
        accion: "CREAR",
        modulo: "SUCURSALES",
        id_registro: idNuevo != null ? Number(idNuevo) : null,
        descripcion: `Se creó la sucursal: ${nombre_tienda}`,
      });
      if (!log.success) console.error("No se registró la auditoría de creación:", log.error);
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
 * Envía una sucursal a la papelera sin borrarla de Turso.
 * Preserva las referencias de empleados, stock, ventas e inventario.
 */
export async function deleteSucursal(id: number) {
  try {
    const idSucursal = Number(id);
    if (!Number.isSafeInteger(idSucursal) || idSucursal <= 0) {
      return { success: false, message: "El ID de la sucursal no es válido." };
    }

    const idAdmin = await obtenerIdAdministrador();
    if (idAdmin === null) {
      return { success: false, message: "No se pudo identificar al administrador." };
    }

    const resultado = await enviarAPapelera("sucursal", idSucursal, idAdmin);
    if (!resultado.success) {
      return {
        success: false,
        message: resultado.error || "No se pudo enviar la sucursal a la papelera."
      };
    }

    const log = await registrarAuditoria({
      accion: "ELIMINAR",
      modulo: "SUCURSALES",
      id_registro: idSucursal,
      descripcion: `Se envió la sucursal ID ${idSucursal} a la papelera.`,
    });
    if (!log.success) console.error("No se registró la auditoría de eliminación:", log.error);

    console.log(`🗑️ Sucursal enviada a papelera ID: ${idSucursal}`);

    revalidatePath("/tiendas");
    revalidatePath("/admin/tiendas");
    revalidatePath("/admin/papelera");
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("❌ Error al enviar sucursal a la papelera:", error);
    return { success: false, message: "No se pudo enviar la sucursal a la papelera." };
  }
}
