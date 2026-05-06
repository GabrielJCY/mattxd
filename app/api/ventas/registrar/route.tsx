/** * REGISTRO DE VENTAS STAFF - MATT BOLIVIA 2026 */
import { db } from "@/src/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Transaction } from "@libsql/client";

// Forzamos que la ruta sea dinámica para evitar cacheo
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "Sesión expirada o no autorizada" }, 
        { status: 401 }
      );
    }

    const id_empleado = (session.user as any).id;

    const { 
      id_producto, 
      id_modelo, 
      id_sucursal, 
      id_cliente, // Recibimos el id si existe
      cantidad, 
      precio_final, 
      metodo_pago 
    } = await req.json();

    // ✅ 1. GENERAR FECHA LOCAL BOLIVIA (FORMA BLINDADA)
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
    const partes = formatter.formatToParts(ahora).reduce((acc: any, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

    const fechaBolivia = `${partes.year}-${partes.month}-${partes.day} ${partes.hour}:${partes.minute}:${partes.second}`;

    // 2. Verificación de stock previa
    const resStock = await db.execute({
      sql: `SELECT cantidad FROM stock WHERE id_modelo = ? AND id_sucursal = ?`,
      args: [id_modelo, id_sucursal]
    });

    const stockActual = resStock.rows.length > 0 ? Number(resStock.rows[0].cantidad) : 0;

    if (stockActual < cantidad) {
      return NextResponse.json(
        { success: false, error: `Stock insuficiente. Disponible: ${stockActual}` },
        { status: 400 }
      );
    }

    // 3. Transacción para LibSQL
    const result = await db.transaction("write").then(async (tx: Transaction) => {
      try {
        // A. Insertar cabecera de Venta
        // NOTA: Usamos id_cliente enviado o el ID 1 (Venta Rápida) para evitar el error de NOT NULL
        const clienteFinal = id_cliente || 1;

        const resVenta = await tx.execute({
          sql: `INSERT INTO venta (id_producto, total, metodo_pago, id_sucursal, id_cliente, id_empleado, fecha, cantidad) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_venta`,
          args: [
            id_producto, 
            (precio_final * cantidad), 
            metodo_pago, 
            id_sucursal, 
            clienteFinal, 
            id_empleado, 
            fechaBolivia, 
            cantidad
          ]
        });

        const idVenta = resVenta.rows[0]?.id_venta || resVenta.lastInsertRowid;

        // B. Insertar detalle
        await tx.execute({
          sql: `INSERT INTO detalle_venta (id_venta, id_modelo, cantidad, precio) 
                VALUES (?, ?, ?, ?)`,
          args: [idVenta, id_modelo, cantidad, precio_final]
        });

        // C. Descontar stock
        await tx.execute({
          sql: `UPDATE stock SET cantidad = cantidad - ? 
                WHERE id_modelo = ? AND id_sucursal = ?`,
          args: [cantidad, id_modelo, id_sucursal]
        });

        // D. Registrar movimiento de inventario
        await tx.execute({
          sql: `INSERT INTO movimiento_inventario 
                (id_modelo, id_sucursal_origen, tipo, cantidad, motivo, fecha) 
                VALUES (?, ?, 'SALIDA', ?, 'VENTA', ?)`,
          args: [id_modelo, id_sucursal, cantidad, fechaBolivia]
        });

        await tx.commit(); 
        return idVenta;
      } catch (e) {
        await tx.rollback(); 
        throw e;
      } finally {
        tx.close(); 
      }
    });

    return NextResponse.json({ 
      success: true, 
      id_venta: Number(result),
      message: "Venta registrada con éxito" 
    });

  } catch (error: any) {
    console.error("CRITICAL_DATABASE_ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Error al procesar la venta. Verifique los datos." }, 
      { status: 500 }
    );
  }
}