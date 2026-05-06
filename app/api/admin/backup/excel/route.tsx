import { db } from "@/src/lib/db";
import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

/**
 * EXPORTADOR INTEGRAL MATT BOLIVIA 2026
 * Genera un reporte multilingüe con toda la estructura de la base de datos.
 */

export async function GET() {
  try {
    // 1. OBTENCIÓN DE DATOS (Queries optimizadas según tu esquema)

    // Hoja: Ventas (Cruza con productos y clientes)
    const { rows: ventas } = await db.execute(`
      SELECT 
        v.id_venta AS 'ID',
        v.fecha AS 'Fecha',
        p.nombre AS 'Producto',
        COALESCE(c.nombre || ' ' || c.apellido, 'VENTA RÁPIDA') AS 'Cliente',
        v.cantidad AS 'Cant.',
        v.total AS 'Total Bs.',
        v.metodo_pago AS 'Pago',
        suc.nombre_tienda AS 'Sucursal'
      FROM venta v
      JOIN producto p ON v.id_producto = p.id_producto
      JOIN sucursal suc ON v.id_sucursal = suc.id_sucursal
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      ORDER BY v.fecha DESC
    `);

    // Hoja: Inventario por Tienda (Stock en sucursales)
    const { rows: stock } = await db.execute(`
      SELECT 
        p.nombre AS 'Producto',
        m.talla AS 'Talla',
        m.color AS 'Color',
        s.cantidad AS 'Stock',
        suc.nombre_tienda AS 'Tienda'
      FROM stock s
      JOIN modelo m ON s.id_modelo = m.id_modelo
      JOIN producto p ON m.id_producto = p.id_producto
      JOIN sucursal suc ON s.id_sucursal = suc.id_sucursal
      ORDER BY suc.nombre_tienda ASC
    `);

    // Hoja: Almacén Admin (stock_admin en tabla modelo)
    const { rows: stockAdmin } = await db.execute(`
      SELECT 
        p.nombre AS 'Producto',
        m.talla AS 'Talla',
        m.color AS 'Color',
        m.precio AS 'Precio Base',
        m.stock_admin AS 'Stock en Almacén Admin'
      FROM modelo m
      JOIN producto p ON m.id_producto = p.id_producto
      WHERE m.stock_admin > 0
    `);

    // Hoja: Empleados
    const { rows: empleados } = await db.execute(`
      SELECT 
        e.nombre AS 'Nombre',
        e.apellido AS 'Apellido',
        e.correo AS 'Email',
        e.telefono AS 'Celular',
        s.nombre_tienda AS 'Sucursal Asignada'
      FROM empleado e
      LEFT JOIN sucursal s ON e.id_sucursal = s.id_sucursal
    `);

    // Hoja: Sucursales
    const { rows: sucursales } = await db.execute(`
      SELECT 
        nombre_tienda AS 'Tienda',
        direccion AS 'Dirección',
        ciudad AS 'Ciudad',
        telefono AS 'Teléfono',
        horario AS 'Horario'
      FROM sucursal
    `);

    // Hoja: Directorio de Clientes (Excluyendo Venta Rápida)
    const { rows: clientes } = await db.execute(`
      SELECT nombre, apellido, correo, telefono, direccion FROM cliente WHERE id_cliente != 1
    `);

    // 2. CONSTRUCCIÓN DEL EXCEL
    const wb = XLSX.utils.book_new();

    // Crear hojas a partir de los JSON
    const wsVentas = XLSX.utils.json_to_sheet(ventas);
    const wsStock = XLSX.utils.json_to_sheet(stock);
    const wsAdmin = XLSX.utils.json_to_sheet(stockAdmin);
    const wsEmp = XLSX.utils.json_to_sheet(empleados);
    const wsSuc = XLSX.utils.json_to_sheet(sucursales);
    const wsCli = XLSX.utils.json_to_sheet(clientes);

    // Ajuste de anchos (Column Widths)
    const autoWidth = [{ wch: 20 }, { wch: 25 }, { wch: 25 }, { wch: 20 }, { wch: 10 }];
    wsVentas['!cols'] = [{ wch: 8 }, { wch: 20 }, { wch: 30 }, { wch: 25 }, { wch: 8 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
    wsStock['!cols'] = autoWidth;
    wsAdmin['!cols'] = autoWidth;
    wsEmp['!cols'] = autoWidth;
    wsSuc['!cols'] = autoWidth;

    // Añadir hojas al libro
    XLSX.utils.book_append_sheet(wb, wsVentas, "Ventas");
    XLSX.utils.book_append_sheet(wb, wsStock, "Stock Tiendas");
    XLSX.utils.book_append_sheet(wb, wsAdmin, "Almacén Central");
    XLSX.utils.book_append_sheet(wb, wsEmp, "Personal");
    XLSX.utils.book_append_sheet(wb, wsSuc, "Sucursales");
    XLSX.utils.book_append_sheet(wb, wsCli, "Clientes");

    // 3. GENERACIÓN DEL ARCHIVO
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const fechaHoy = new Date().toISOString().split('T')[0];

    return new NextResponse(buf, {
      headers: {
        "Content-Disposition": `attachment; filename="BACKUP_TOTAL_MATT_${fechaHoy}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error: any) {
    console.error("Error crítico en Backup Excel:", error);
    return NextResponse.json({ 
      error: "Error al generar reporte", 
      detalles: error.message 
    }, { status: 500 });
  }
}