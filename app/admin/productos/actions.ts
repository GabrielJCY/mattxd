
"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarAuditoria } from "@/src/lib/auditoria";
import { enviarProductoAPapelera } from "@/src/lib/papelera";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";

/**
 * --- OBTENER ID DEL ADMINISTRADOR ---
 * Compatible con Google y login manual del prototipo.
 */
async function obtenerIdAdministrador(): Promise<number | null> {
  const session = await getServerSession(authOptions);

  if (
    session?.user &&
    (session.user as any).role === "admin"
  ) {
    const id = Number((session.user as any).id);

    if (Number.isSafeInteger(id) && id > 0) {
      return id;
    }
  }

  const cookieStore = await cookies();
  const cookie = cookieStore.get("matt_session")?.value;

  if (!cookie) {
    return null;
  }

  try {
    const manualSession = JSON.parse(cookie);

    if (manualSession.role === "admin") {
      const id = Number(manualSession.id);

      if (Number.isSafeInteger(id) && id > 0) {
        return id;
      }
    }
  } catch {
    return null;
  }

  return null;
}

/**
 * --- CREAR PRODUCTO ---
 * Editado para obtener el ID y redirigir a la creación de modelos.
 */
export async function addProducto(formData: FormData) {
  console.log("--- REGISTRANDO PRODUCTO ---");

  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;
  const id_categoria = formData.get("id_categoria") as string;
  const tabla_medidas_url = formData.get("tabla_medidas_url") as string;

  if (!nombre || !id_categoria) {
    return { error: "Nombre y Categoría son requeridos." };
  }

  // VALIDACIÓN DE CAMPOS
  if (
    nombre.trim().length < 2 ||
    nombre.trim().length > 100 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ -]+$/.test(nombre.trim())
  ) {
    return {
      error: "El nombre solo permite letras, espacios y guiones (2 a 100 caracteres)."
    };
  }

  if (descripcion && descripcion.length > 1000) {
    return {
      error: "La descripción no puede superar los 1000 caracteres."
    };
  }

  if (!/^[1-9]\d*$/.test(id_categoria)) {
    return {
      error: "La categoría seleccionada no es válida."
    };
  }

  if (tabla_medidas_url) {
    try {
      const url = new URL(tabla_medidas_url);

      if (!["http:", "https:"].includes(url.protocol)) {
        return {
          error: "La URL de la tabla de medidas no es válida."
        };
      }
    } catch {
      return {
        error: "La URL de la tabla de medidas no es válida."
      };
    }
  }

  let newId;

  try {
    const result = await db.execute({
      sql: "INSERT INTO producto (nombre, descripcion, id_categoria, tabla_medidas_url) VALUES (?, ?, ?, ?) RETURNING id_producto",
      args: [
        nombre.toUpperCase(),
        descripcion || null,
        id_categoria,
        tabla_medidas_url || null
      ],
    });

    // Capturamos el ID recién creado
    newId = result.rows[0]?.id_producto || result.lastInsertRowid;

  } catch (error) {
    console.error("Error SQL al crear:", error);

    return {
      error: "Error de base de datos."
    };
  }

  // --- LOG DE AUDITORÍA: CREAR PRODUCTO ---
  await registrarAuditoria({
    accion: "CREAR",
    modulo: "PRODUCTOS",
    id_registro: newId != null ? Number(newId) : null,
    descripcion: `Se creó el producto: ${nombre.toUpperCase()}`,
  });

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");

  // REDIRECCIÓN ESTRATÉGICA
  redirect(`/admin/productos/modelos/${newId}`);
}

/**
 * --- EDITAR PRODUCTO ---
 */
export async function updateProducto(formData: FormData) {
  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const descripcion = formData.get("descripcion") as string;
  const id_categoria = formData.get("id_categoria") as string;
  const tabla_medidas_url = formData.get("tabla_medidas_url") as string;

  if (!id || !nombre || !id_categoria) {
    return {
      error: "Faltan parámetros críticos."
    };
  }

  // VALIDACIÓN DE CAMPOS
  if (
    nombre.trim().length < 2 ||
    nombre.trim().length > 100 ||
    !/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ -]+$/.test(nombre.trim())
  ) {
    return {
      error: "El nombre solo permite letras, espacios y guiones (2 a 100 caracteres)."
    };
  }

  if (descripcion && descripcion.length > 1000) {
    return {
      error: "La descripción no puede superar los 1000 caracteres."
    };
  }

  if (!/^[1-9]\d*$/.test(id_categoria)) {
    return {
      error: "La categoría seleccionada no es válida."
    };
  }

  if (tabla_medidas_url) {
    try {
      const url = new URL(tabla_medidas_url);

      if (!["http:", "https:"].includes(url.protocol)) {
        return {
          error: "La URL de la tabla de medidas no es válida."
        };
      }
    } catch {
      return {
        error: "La URL de la tabla de medidas no es válida."
      };
    }
  }

  let productoActualizado = false;

  try {
    const resultado = await db.execute({
      sql: "UPDATE producto SET nombre = ?, descripcion = ?, id_categoria = ?, tabla_medidas_url = ? WHERE id_producto = ?",
      args: [
        nombre.toUpperCase(),
        descripcion || null,
        id_categoria,
        tabla_medidas_url || null,
        id
      ],
    });

    productoActualizado = resultado.rowsAffected > 0;

  } catch (error) {
    console.error("Error SQL al editar:", error);

    return {
      error: "Error de base de datos al actualizar."
    };
  }

  // --- LOG DE AUDITORÍA: EDITAR PRODUCTO ---
  if (productoActualizado) {
    await registrarAuditoria({
      accion: "EDITAR",
      modulo: "PRODUCTOS",
      id_registro: Number(id),
      descripcion: `Se actualizó el producto: ${nombre.toUpperCase()}`,
    });
  }

  revalidatePath("/admin/productos");
  revalidatePath("/", "layout");

  redirect("/admin/productos");
}

/**
 * --- CONTAR MODELOS ---
 */
export async function countModelos(id: number) {
  const result = await db.execute({
    sql: "SELECT COUNT(*) as total FROM modelo WHERE id_producto = ?",
    args: [id],
  });

  return Number(result.rows[0].total);
}

/**
 * --- ENVIAR PRODUCTO A PAPELERA ---
 * No elimina físicamente el producto.
 * Conserva sus modelos, stock, imágenes e historial.
 */
export async function deleteProducto(id: number) {

  // Validar identificador
  if (!Number.isSafeInteger(id) || id <= 0) {
    return {
      error: "El identificador del producto no es válido."
    };
  }

  // Obtener administrador responsable
  const idAdmin = await obtenerIdAdministrador();

  if (idAdmin === null) {
    return {
      error: "No se pudo identificar al administrador."
    };
  }

  try {

    // --- ENVIAR PRODUCTO A PAPELERA ---
    const resultado = await enviarProductoAPapelera(
      id,
      idAdmin
    );

    if (!resultado.success) {
      return {
        error: resultado.error || "No se pudo enviar el producto a la papelera."
      };
    }

    // --- LOG DE AUDITORÍA: ENVIAR A PAPELERA ---
    await registrarAuditoria({
      accion: "ELIMINAR",
      modulo: "PRODUCTOS",
      id_registro: id,
      descripcion: `Se envió el producto con ID ${id} a la papelera.`,
    });

    // Actualizar vistas
    revalidatePath("/admin/productos");
    revalidatePath("/admin/papelera");
    revalidatePath("/", "layout");

    return {
      success: true
    };

  } catch (error) {
    console.error("Error al enviar producto a la papelera:", error);

    return {
      error: "Ocurrió un error inesperado."
    };
  }
}

/**
 * --- REGISTRAR VENTA QR ---
 */
export async function registrarVentaQR(
  idModelo: number,
  idSucursal: number
) {
  try {
    const res = await db.execute({
      sql: "SELECT cantidad FROM stock WHERE id_modelo = ? AND id_sucursal = ?",
      args: [idModelo, idSucursal]
    });

    const cantidad = Number(res.rows[0]?.cantidad || 0);

    if (cantidad <= 0) {
      return {
        success: false,
        error: "Sin stock en esta sucursal."
      };
    }

    await db.execute({
      sql: "UPDATE stock SET cantidad = cantidad - 1 WHERE id_modelo = ? AND id_sucursal = ?",
      args: [idModelo, idSucursal]
    });

    revalidatePath("/admin/productos");
    revalidatePath("/", "layout");

    return {
      success: true
    };

  } catch (error) {
    console.error("Error en registrarVentaQR:", error);

    return {
      success: false,
      error: "Error al procesar la venta."
    };
  }
}
