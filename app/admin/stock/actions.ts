"use server";
import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

export async function asignarStock(
  id_modelo: number, 
  id_sucursal_destino: number, 
  cantidadAMover: number
) {
  try {
    // 0. Reglas de Negocio
    if (Number(id_sucursal_destino) === 4) {
      return { success: false, error: "Operación no permitida: El destino no puede ser el Almacén Central" };
    }

    // 1. Obtener stock del ALMACÉN (ID 4)
    const resStockAlmacen = await db.execute({
      sql: "SELECT id_stock, cantidad FROM stock WHERE id_modelo = ? AND id_sucursal = 4 LIMIT 1",
      args: [id_modelo]
    });

    const resModelo = await db.execute({
      sql: "SELECT stock_admin FROM modelo WHERE id_modelo = ?",
      args: [id_modelo]
    });

    const cantidadEnStock = resStockAlmacen.rows.length > 0 ? Number(resStockAlmacen.rows[0].cantidad) : 0;
    const cantidadEnModelo = resModelo.rows.length > 0 ? Number(resModelo.rows[0]?.stock_admin || 0) : 0;
    
    const stockDisponible = Math.max(cantidadEnStock, cantidadEnModelo);

    if (stockDisponible < cantidadAMover) {
      return { success: false, error: `Stock insuficiente. Solo hay ${stockDisponible} unidades en Almacén.` };
    }

    // --- INICIO DE ACTUALIZACIÓN DE STOCK ---

    // 2. Descontar del Almacén (ID 4)
    if (resStockAlmacen.rows.length > 0) {
      await db.execute({
        sql: "UPDATE stock SET cantidad = cantidad - ? WHERE id_modelo = ? AND id_sucursal = 4",
        args: [cantidadAMover, id_modelo]
      });
    } else {
      await db.execute({
        sql: "INSERT INTO stock (id_modelo, id_sucursal, cantidad) VALUES (?, 4, ?)",
        args: [id_modelo, Math.max(0, cantidadEnModelo - cantidadAMover)]
      });
    }

    // Sincronizar espejo en tabla modelo
    await db.execute({
      sql: "UPDATE modelo SET stock_admin = stock_admin - ? WHERE id_modelo = ?",
      args: [cantidadAMover, id_modelo]
    });

    // 3. Asignar a Sede Destino
    await db.execute({
      sql: `
        INSERT INTO stock (id_modelo, id_sucursal, cantidad) 
        VALUES (?, ?, ?)
        ON CONFLICT(id_modelo, id_sucursal) DO UPDATE SET 
        cantidad = stock.cantidad + excluded.cantidad
      `,
      args: [id_modelo, id_sucursal_destino, cantidadAMover]
    });

    // --- LOGICA DE AUDITORÍA DOBLE (PARA BITÁCORA) ---

    const resNombreSede = await db.execute({
      sql: "SELECT nombre_tienda FROM sucursal WHERE id_sucursal = ?",
      args: [id_sucursal_destino]
    });
    const nombreTienda = resNombreSede.rows[0]?.nombre_tienda || `Sucursal ${id_sucursal_destino}`;

    // A. Registro para el ALMACÉN (ID 4): Aquí sí es una SALIDA porque la prenda se va.
    await db.execute({
      sql: `INSERT INTO movimiento_inventario (id_modelo, tipo, cantidad, motivo, id_sucursal_origen, id_sucursal_destino) 
            VALUES (?, 'SALIDA', ?, ?, 4, ?)`,
      args: [id_modelo, cantidadAMover, `Traspaso: Envío a ${nombreTienda}`, id_sucursal_destino]
    });

    // B. Registro para la SUCURSAL DESTINO (Tumusla/Illampu): Aquí es una ENTRADA porque la prenda llega.
    // Esto garantiza que en la vista de la tienda se vea la flecha verde (↑)
    await db.execute({
      sql: `INSERT INTO movimiento_inventario (id_modelo, tipo, cantidad, motivo, id_sucursal_origen, id_sucursal_destino) 
            VALUES (?, 'ENTRADA', ?, ?, 4, ?)`,
      args: [id_modelo, cantidadAMover, `Traspaso: Recibido de Almacén`, id_sucursal_destino]
    });

    // --- REVALIDACIÓN DE CACHÉ ---
    revalidatePath("/admin/movimientos"); 
    revalidatePath("/admin/stock");
    revalidatePath("/admin/stock/almacen");
    revalidatePath("/admin/stock/tumusla");
    revalidatePath("/admin/stock/illampu");
    revalidatePath("/admin/stock/[sede]", "layout"); 
    revalidatePath("/admin/productos/modelos/[id]", "page"); 
    revalidatePath("/", "layout");
    
    return { success: true };
  } catch (error) {
    console.error("Error crítico en asignarStock:", error);
    return { success: false, error: "Error de base de datos al procesar el traspaso." };
  }
}