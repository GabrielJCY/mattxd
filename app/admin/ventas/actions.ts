"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

/**
 * 🛠️ GENERADOR DE TIEMPO OFICIAL - MATT BOLIVIA
 */
const obtenerFechaBolivia = () => {
  const ahora = new Date();
  const opciones: Intl.DateTimeFormatOptions = {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };

  const formatter = new Intl.DateTimeFormat('en-GB', opciones);
  const partes = formatter.formatToParts(ahora);
  const d: { [key: string]: string } = {};
  partes.forEach(({ type, value }) => { d[type] = value; });

  return `${d.year}-${d.month}-${d.day} ${d.hour}:${d.minute}:${d.second}`;
};

/**
 * 📊 1. OBTENER DATOS (CON SOPORTE DE MÚLTIPLES DESCUENTOS)
 */
export async function getDatosFormularioVenta(idProductoFiltro?: number) {
  try {
    const resProductos = await db.execute("SELECT id_producto, nombre FROM producto ORDER BY nombre ASC");
    const resClientes = await db.execute("SELECT id_cliente, nombre, apellido FROM cliente ORDER BY nombre ASC");
    const resEmpleados = await db.execute("SELECT id_empleado, nombre FROM empleado");

    const resModelos = await db.execute({
      sql: `
        SELECT 
          m.id_modelo, 
          m.id_producto, 
          m.color, 
          m.talla, 
          m.precio,
          (
            SELECT GROUP_CONCAT(an.descuento) 
            FROM anuncio an 
            WHERE an.id_producto = m.id_producto AND an.activo = 1
          ) as lista_descuentos,
          CAST(COALESCE((SELECT cantidad FROM stock WHERE id_modelo = m.id_modelo AND id_sucursal = 3 LIMIT 1), 0) AS INTEGER) as stock_illampu,
          CAST(COALESCE((SELECT cantidad FROM stock WHERE id_modelo = m.id_modelo AND id_sucursal = 2 LIMIT 1), 0) AS INTEGER) as stock_tumusla,
          CAST(COALESCE(
            (SELECT cantidad FROM stock WHERE id_modelo = m.id_modelo AND id_sucursal = 4 LIMIT 1), 
            m.stock_admin, 
            0
          ) AS INTEGER) as stock_almacen
        FROM modelo m
        WHERE 1=1
        ${idProductoFiltro ? "AND m.id_producto = ?" : ""}
        ORDER BY m.talla ASC, m.color ASC
      `,
      args: idProductoFiltro ? [idProductoFiltro] : []
    });

    return {
      success: true,
      productos: JSON.parse(JSON.stringify(resProductos.rows)),
      modelos: JSON.parse(JSON.stringify(resModelos.rows)),
      clientes: JSON.parse(JSON.stringify(resClientes.rows)),
      empleados: JSON.parse(JSON.stringify(resEmpleados.rows))
    };
  } catch (error: any) {
    console.error("❌ ERROR AL OBTENER DATOS:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 💸 2. REGISTRAR VENTA FÍSICA (ATÓMICO)
 */
export async function registrarVentaFisica(data: {
  id_modelo: number;
  id_cliente: number;
  id_empleado: number;
  id_sucursal: number;
  total: number;
  cantidad: number;
  metodo_pago: string;
  id_pedido?: number | null; 
}) {
  const ahoraBolivia = obtenerFechaBolivia();

  try {
    const idCliente = Math.floor(Number(data.id_cliente));
    const idModelo = Math.floor(Number(data.id_modelo));
    const idSucursal = Math.floor(Number(data.id_sucursal));
    const cantidad = Math.floor(Number(data.cantidad));
    const totalPagado = Number(data.total);
    
    // VALIDACIÓN DE MÉTODO DE PAGO (Evita el error SQLITE_CONSTRAINT)
    // Forzamos que el valor coincida exactamente con lo que el CHECK espera
    const metodoNormalizado = data.metodo_pago === "QR" ? "QR" : "Efectivo";

    if (!idCliente || idCliente <= 0) throw new Error("Cliente no válido.");
    if (cantidad <= 0) throw new Error("La cantidad debe ser mayor a 0");

    const resModelo = await db.execute({
      sql: "SELECT id_producto FROM modelo WHERE id_modelo = ?",
      args: [idModelo]
    });

    if (resModelo.rows.length === 0) throw new Error("El modelo seleccionado no existe.");
    const idProductoReal = Number((resModelo.rows[0] as any).id_producto);

    const queries = [];

    // Inventario
    if (idSucursal === 2 || idSucursal === 3) {
      queries.push({
        sql: "UPDATE stock SET cantidad = cantidad - ? WHERE id_modelo = ? AND id_sucursal = ?",
        args: [cantidad, idModelo, idSucursal]
      });
    } else if (idSucursal === 4) {
      queries.push({
        sql: "UPDATE modelo SET stock_admin = stock_admin - ? WHERE id_modelo = ?",
        args: [cantidad, idModelo]
      });
    }

    // Kardex
    queries.push({
      sql: "INSERT INTO movimiento_inventario (id_modelo, id_sucursal_origen, tipo, cantidad, motivo, fecha) VALUES (?, ?, 'SALIDA', ?, 'VENTA DIRECTA', ?)",
      args: [idModelo, idSucursal, cantidad, ahoraBolivia]
    });

    // Venta Principal (Corregido metodo_pago)
    queries.push({
      sql: `INSERT INTO venta (id_pedido, id_producto, id_cliente, id_empleado, id_sucursal, total, metodo_pago, fecha, cantidad) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [data.id_pedido || null, idProductoReal, idCliente, data.id_empleado, idSucursal, totalPagado, metodoNormalizado, ahoraBolivia, cantidad]
    });

    if (data.id_pedido) {
      queries.push({
        sql: "UPDATE pedido SET estado = 'entregado' WHERE id_pedido = ?",
        args: [data.id_pedido]
      });
    }

    const batchRes = await db.batch(queries, "write");
    const idVenta = Number(batchRes[2].lastInsertRowid);
    const precioUnitarioFinal = totalPagado / cantidad;

    // Detalle
    await db.execute({
      sql: `INSERT INTO detalle_venta (id_venta, id_modelo, cantidad, precio) VALUES (?, ?, ?, ?)`,
      args: [idVenta, idModelo, cantidad, precioUnitarioFinal]
    });

    revalidatePath("/admin/ventas");
    revalidatePath("/admin/pedido");
    revalidatePath("/admin/inventario");
    
    return { success: true };

  } catch (error: any) {
    console.error("❌ ERROR EN PROCESO DE VENTA:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 3. ANULAR VENTA
 */
export async function anularVenta(id_venta: number) {
  const ahoraBolivia = obtenerFechaBolivia();

  try {
    const resVenta = await db.execute({
      sql: `SELECT v.id_sucursal, dv.id_modelo, dv.cantidad 
            FROM venta v 
            JOIN detalle_venta dv ON v.id_venta = dv.id_venta 
            WHERE v.id_venta = ?`,
      args: [id_venta]
    });

    if (resVenta.rows.length === 0) throw new Error("Venta no encontrada");
    const ventaInfo = resVenta.rows[0] as any;
    
    const queries = [];

    if (ventaInfo.id_sucursal === 4) {
      queries.push({
        sql: "UPDATE modelo SET stock_admin = stock_admin + ? WHERE id_modelo = ?",
        args: [ventaInfo.cantidad, ventaInfo.id_modelo]
      });
    } else {
      queries.push({
        sql: "UPDATE stock SET cantidad = cantidad + ? WHERE id_modelo = ? AND id_sucursal = ?",
        args: [ventaInfo.cantidad, ventaInfo.id_modelo, ventaInfo.id_sucursal]
      });
    }

    queries.push({
      sql: "INSERT INTO movimiento_inventario (id_modelo, id_sucursal_destino, tipo, cantidad, motivo, fecha) VALUES (?, ?, 'ENTRADA', ?, 'ANULACION', ?)",
      args: [ventaInfo.id_modelo, ventaInfo.id_sucursal, ventaInfo.cantidad, ahoraBolivia]
    });

    queries.push({
      sql: "UPDATE venta SET total = 0 WHERE id_venta = ?",
      args: [id_venta]
    });

    await db.batch(queries, "write");

    revalidatePath("/admin/ventas");
    revalidatePath("/admin/inventario");
    return { success: true };

  } catch (error: any) {
    console.error("❌ ERROR EN ANULACIÓN:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 👤 4. REGISTRAR CLIENTE RÁPIDO
 */
export async function registrarClienteRapido(data: { nombre: string, apellido: string, telefono: string }) {
  try {
    const res = await db.execute({
      sql: `INSERT INTO cliente (nombre, apellido, telefono, password) 
            VALUES (?, ?, ?, 'matt123') 
            RETURNING id_cliente, nombre, apellido`,
      args: [data.nombre, data.apellido, data.telefono]
    });

    const nuevoCliente = JSON.parse(JSON.stringify(res.rows[0]));
    revalidatePath("/admin/ventas/nueva");
    return { success: true, cliente: nuevoCliente };
  } catch (error: any) {
    console.error("Error al registrar cliente:", error.message);
    return { success: false, error: "No se pudo registrar el cliente" };
  }
}

/**
 * 🏆 5. OBTENER PRODUCTOS MÁS VENDIDOS (EXCLUYE ANULADOS)
 */
export async function obtenerProductosMasVendidos() {
  try {
    const res = await db.execute(`
      SELECT 
        p.nombre AS producto, 
        SUM(dv.cantidad) AS total_vendido
      FROM detalle_venta dv
      JOIN modelo m ON dv.id_modelo = m.id_modelo
      JOIN producto p ON m.id_producto = p.id_producto
      JOIN venta v ON dv.id_venta = v.id_venta
      WHERE v.total > 0
      GROUP BY p.id_producto
      ORDER BY total_vendido DESC
      LIMIT 10;
    `);
    
    return JSON.parse(JSON.stringify(res.rows));
  } catch (error: any) {
    console.error("❌ ERROR AL OBTENER TOP PRODUCTOS:", error.message);
    return [];
  }
}