"use server";

import { db } from "@/src/lib/db";
import { revalidatePath } from "next/cache";

/**
 * 1. REGISTRAR INTENCIÓN (Público)
 * Eliminamos el envío manual de fecha para que SQLite use su 
 * DEFAULT CURRENT_TIMESTAMP (UTC) de forma natural.
 */
export async function registrarIntencionPedido(id_cliente: number, id_producto: number) {
  try {
    await db.execute({
      sql: "INSERT INTO pedido (id_cliente, id_producto, estado) VALUES (?, ?, 'pendiente')",
      args: [id_cliente, id_producto]
    });
    
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al registrar intención de pedido:", error);
    return { success: false };
  }
}

/**
 * 2. ACTUALIZAR ESTADO Y SELECCIONAR MODELO (Admin)
 */
export async function actualizarEstadoPedido(
  id_pedido: number, 
  nuevoEstado: string, 
  id_modelo_seleccionado?: number 
) {
  try {
    const estadoLimpio = nuevoEstado.toLowerCase();

    if (estadoLimpio === 'entregado' && id_modelo_seleccionado) {
      // A. Restamos del stock
      await db.execute({
        sql: "UPDATE stock SET cantidad = cantidad - 1 WHERE id_modelo = ? AND cantidad > 0",
        args: [id_modelo_seleccionado]
      });

      // B. Obtenemos el precio
      const modeloRes = await db.execute({
        sql: "SELECT precio FROM modelo WHERE id_modelo = ? LIMIT 1",
        args: [id_modelo_seleccionado]
      });
      const precioVenta = (modeloRes.rows[0] as any)?.precio || 0;

      // C. Insertamos detalle
      await db.execute({
        sql: "INSERT INTO detalle_pedido (id_pedido, id_modelo, cantidad, precio) VALUES (?, ?, 1, ?)",
        args: [id_pedido, id_modelo_seleccionado, precioVenta]
      });

      // D. Vinculamos modelo al pedido
      try {
        await db.execute({
          sql: "UPDATE pedido SET id_modelo = ? WHERE id_pedido = ?",
          args: [id_modelo_seleccionado, id_pedido]
        });
      } catch (e) {
        console.log("Nota: Columna id_modelo no existe o ya vinculada.");
      }
    }

    // E. Actualizamos estado final
    await db.execute({
      sql: "UPDATE pedido SET estado = ? WHERE id_pedido = ?",
      args: [estadoLimpio, id_pedido]
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/ventas"); 
    
    return { success: true };
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    return { success: false };
  }
}

/**
 * 3. REGISTRAR PAGO (Admin)
 * Usamos la fecha por defecto de SQLite para consistencia.
 */
export async function registrarPagoPedido(
  id_pedido: number, 
  monto: number, 
  metodo: 'QR' | 'Efectivo'
) {
  try {
    // Insertamos pago dejando que la DB ponga la fecha UTC
    await db.execute({
      sql: "INSERT INTO pago (id_pedido, monto, metodo_pago, estado) VALUES (?, ?, ?, 'completado')",
      args: [id_pedido, monto, metodo]
    });

    // Confirmamos el pedido
    await db.execute({
      sql: "UPDATE pedido SET estado = 'confirmado' WHERE id_pedido = ? AND estado = 'pendiente'",
      args: [id_pedido]
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error al registrar pago:", error);
    return { success: false };
  }
}