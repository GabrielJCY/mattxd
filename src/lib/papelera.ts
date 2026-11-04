import "server-only";
import { db } from "@/src/lib/db";

// Lista permitida: nunca construir nombres SQL a partir de entradas arbitrarias.
const MODULOS = {
  producto: "id_producto",
  categoria: "id_categoria",
  modelo: "id_modelo",
  imagen_producto: "id_imagen",
  sucursal: "id_sucursal",
  empleado: "id_empleado",
  cliente: "id_cliente",
  admin: "id_admin",
  anuncio: "id_anuncio",
} as const;

type TablaPapelera = keyof typeof MODULOS;
const TABLA_PRODUCTOS = "producto";

export interface ElementoPapelera {
  id_papelera: number;
  tabla_origen: string;
  id_registro: number;
  datos_json: string;
  fecha_eliminacion: string;
  fecha_expiracion: string;
  id_admin: number | null;
}

function idValido(id: number) {
  return Number.isSafeInteger(id) && id > 0;
}

function esTablaPermitida(tabla: string): tabla is TablaPapelera {
  return Object.prototype.hasOwnProperty.call(MODULOS, tabla);
}

/** Archiva un registro sin borrarlo de su tabla de origen. */
export async function enviarAPapelera(tabla: string, idRegistro: number, idAdmin: number) {
  if (!esTablaPermitida(tabla) || !idValido(idRegistro) || !idValido(idAdmin)) {
    return { success: false, error: "Módulo o identificadores no válidos." };
  }

  const clave = MODULOS[tabla];
  const tx = await db.transaction("write");
  try {
    const original = await tx.execute({
      sql: `SELECT * FROM ${tabla} WHERE ${clave} = ?`,
      args: [idRegistro],
    });
    if (!original.rows.length) {
      await tx.rollback();
      return { success: false, error: "El registro no existe." };
    }

    const existe = await tx.execute({
      sql: "SELECT id_papelera FROM papelera WHERE tabla_origen = ? AND id_registro = ? LIMIT 1",
      args: [tabla, idRegistro],
    });
    if (existe.rows.length) {
      await tx.rollback();
      return { success: false, error: "El registro ya está en la papelera." };
    }

    // Se guarda una instantánea para consulta, pero se conserva el registro original.
    await tx.execute({
      sql: `INSERT INTO papelera
        (tabla_origen, id_registro, datos_json, fecha_eliminacion, fecha_expiracion, id_admin)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, datetime('now', '+1 day'), ?)`,
      args: [tabla, idRegistro, JSON.stringify(original.rows[0]), idAdmin],
    });
    await tx.commit();
    return { success: true };
  } catch (error) {
    await tx.rollback().catch(() => {});
    console.error(`Error enviando ${tabla} a papelera:`, error);
    return { success: false, error: "No se pudo enviar a la papelera." };
  }
}

/** Restaura cualquier registro archivado: quita la marca de papelera. */
export async function restaurarDesdePapelera(idPapelera: number) {
  if (!idValido(idPapelera)) {
    return { success: false, error: "Identificador de papelera no válido." };
  }

  const tx = await db.transaction("write");
  try {
    const resultado = await tx.execute({
      sql: `SELECT id_registro, tabla_origen FROM papelera
            WHERE id_papelera = ? AND datetime(fecha_expiracion) > datetime('now')`,
      args: [idPapelera],
    });
    const registro = resultado.rows[0];
    if (!registro) {
      await tx.rollback();
      return { success: false, error: "El registro no existe o ya expiró." };
    }
    const tabla = String(registro.tabla_origen);
    const idRegistro = Number(registro.id_registro);
    if (!esTablaPermitida(tabla) || !idValido(idRegistro)) {
      await tx.rollback();
      return { success: false, error: "Tipo de registro no compatible." };
    }
    const clave = MODULOS[tabla];
    const original = await tx.execute({
      sql: `SELECT ${clave} FROM ${tabla} WHERE ${clave} = ?`,
      args: [idRegistro],
    });
    if (!original.rows.length) {
      await tx.rollback();
      return { success: false, error: "El registro original ya no existe." };
    }
    await tx.execute({
      sql: "DELETE FROM papelera WHERE id_papelera = ? AND tabla_origen = ?",
      args: [idPapelera, tabla],
    });
    await tx.commit();
    return { success: true, tabla_origen: tabla, id_registro: idRegistro };
  } catch (error) {
    await tx.rollback().catch(() => {});
    console.error("Error restaurando papelera:", error);
    return { success: false, error: "No se pudo restaurar el registro." };
  }
}

/** Devuelve la papelera entera o filtra por módulo, sin cambiar el esquema. */
export async function listarPapelera(tabla?: string): Promise<ElementoPapelera[]> {
  if (tabla !== undefined && !esTablaPermitida(tabla)) return [];
  const resultado = await db.execute({
    sql: `SELECT id_papelera, tabla_origen, id_registro, datos_json,
                 fecha_eliminacion, fecha_expiracion, id_admin
          FROM papelera ${tabla ? "WHERE tabla_origen = ?" : ""}
          ORDER BY fecha_eliminacion DESC, id_papelera DESC`,
    args: tabla ? [tabla] : [],
  });
  return resultado.rows as unknown as ElementoPapelera[];
}

/** IDs que se deben excluir de las consultas de un módulo. */
export async function obtenerIdsEnPapelera(tabla: string): Promise<number[]> {
  if (!esTablaPermitida(tabla)) return [];
  const resultado = await db.execute({
    sql: "SELECT id_registro FROM papelera WHERE tabla_origen = ?",
    args: [tabla],
  });
  return resultado.rows.map((fila) => Number(fila.id_registro));
}

// Compatibilidad con los módulos de productos que ya están funcionando.
export async function enviarProductoAPapelera(idProducto: number, idAdmin: number) {
  return enviarAPapelera(TABLA_PRODUCTOS, idProducto, idAdmin);
}

export async function restaurarProductoDePapelera(idPapelera: number) {
  if (!idValido(idPapelera)) return { success: false, error: "ID no válido." };
  const dato = await db.execute({
    sql: "SELECT tabla_origen FROM papelera WHERE id_papelera = ?",
    args: [idPapelera],
  });
  if (dato.rows[0]?.tabla_origen !== TABLA_PRODUCTOS) {
    return { success: false, error: "El registro no es un producto." };
  }
  const r = await restaurarDesdePapelera(idPapelera);
  if (!r.success) return { success: false, error: r.error };
  return { success: true, id_producto: r.id_registro };
}

export async function obtenerIdsProductosEnPapelera() {
  return obtenerIdsEnPapelera(TABLA_PRODUCTOS);
}

export async function listarPapeleraProductos() {
  return listarPapelera(TABLA_PRODUCTOS);
}

/**
 * Limpia productos expirados que no tienen relaciones históricas ni comerciales.
 * Los productos referenciados quedan archivados en la papelera para conservar
 * ventas, pedidos, modelos e inventario (no se restauran tras expirar).
 * Debe invocarse desde una tarea programada del servidor, no desde el cliente.
 */
export async function limpiarPapeleraProductosExpirados() {
  let eliminados = 0;
  let archivados = 0;

  const vencidos = await db.execute({
    sql: `
      SELECT id_papelera, id_registro
      FROM papelera
      WHERE tabla_origen = ? AND datetime(fecha_expiracion) <= datetime('now')
    `,
    args: [TABLA_PRODUCTOS],
  });

  for (const fila of vencidos.rows) {
    const idPapelera = Number(fila.id_papelera);
    const idProducto = Number(fila.id_registro);
    const tx = await db.transaction("write");

    try {
      // Puede haberse restaurado mientras se preparaba la limpieza.
      const vigente = await tx.execute({
        sql: `
          SELECT id_papelera FROM papelera
          WHERE id_papelera = ? AND id_registro = ? AND tabla_origen = ?
            AND datetime(fecha_expiracion) <= datetime('now')
        `,
        args: [idPapelera, idProducto, TABLA_PRODUCTOS],
      });

      if (vigente.rows.length === 0) {
        await tx.rollback();
        continue;
      }

      // Estas relaciones impiden un borrado seguro del producto.
      const relaciones = await tx.execute({
        sql: `
          SELECT
            EXISTS(SELECT 1 FROM modelo WHERE id_producto = ?) AS modelos,
            EXISTS(SELECT 1 FROM pedido WHERE id_producto = ?) AS pedidos,
            EXISTS(SELECT 1 FROM venta WHERE id_producto = ?) AS ventas,
            EXISTS(SELECT 1 FROM anuncio WHERE id_producto = ?) AS anuncios
        `,
        args: [idProducto, idProducto, idProducto, idProducto],
      });

      const r = relaciones.rows[0];
      const tieneReferencias = Boolean(
        Number(r.modelos) || Number(r.pedidos) ||
        Number(r.ventas) || Number(r.anuncios)
      );

      if (tieneReferencias) {
        archivados++;
        await tx.rollback();
        continue;
      }

      // Las imágenes solo dependen del producto y se retiran al purgarlo.
      await tx.execute({
        sql: "DELETE FROM imagen_producto WHERE id_producto = ?",
        args: [idProducto],
      });
      await tx.execute({
        sql: "DELETE FROM producto WHERE id_producto = ?",
        args: [idProducto],
      });
      await tx.execute({
        sql: "DELETE FROM papelera WHERE id_papelera = ? AND tabla_origen = ?",
        args: [idPapelera, TABLA_PRODUCTOS],
      });

      await tx.commit();
      eliminados++;
    } catch (error) {
      await tx.rollback().catch(() => {});
      console.error(`Error al limpiar producto ${idProducto}:`, error);
      archivados++;
    }
  }

  return { success: true, eliminados, archivados };
}
