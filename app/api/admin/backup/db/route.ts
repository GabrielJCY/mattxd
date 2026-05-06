import { db } from "@/src/lib/db";
import { NextResponse } from "next/server";

/**
 * BACKUP INTEGRAL PARA TURSO (LibSQL) - MATT BOLIVIA 2026
 * Genera un archivo .sql con todos los INSERT de todas las tablas memorizadas.
 */

export async function GET() {
  try {
    // 1. LISTA COMPLETA DE TABLAS SEGÚN TU ESQUEMA MEMORIZADO
    const tablas = [
      "categoria",
      "producto",
      "modelo",
      "imagen_producto",
      "sucursal",
      "stock",
      "empleado",
      "cliente",
      "admin",
      "pedido",
      "detalle_pedido",
      "pago",
      "venta",
      "detalle_venta",
      "movimiento_inventario",
      "anuncio",
      "resena",
      "like_producto"
    ];

    let sqlDump = `-- ===============================================\n`;
    sqlDump += `-- BACKUP INTEGRAL MATT BOLIVIA 2026\n`;
    sqlDump += `-- Fecha: ${new Date().toLocaleString('es-BO')}\n`;
    sqlDump += `-- Tipo: Volcado de datos (DUMP SQL)\n`;
    sqlDump += `-- ===============================================\n\n`;
    sqlDump += `PRAGMA foreign_keys = OFF;\n\n`; // Desactivar llaves foráneas para evitar errores al importar

    for (const tabla of tablas) {
      const result = await db.execute(`SELECT * FROM ${tabla}`);
      const filas = result.rows;

      if (filas.length > 0) {
        sqlDump += `-- -----------------------------------------------\n`;
        sqlDump += `-- TABLA: ${tabla.toUpperCase()}\n`;
        sqlDump += `-- -----------------------------------------------\n`;
        
        filas.forEach((fila: any) => {
          const columnas = Object.keys(fila).join(", ");
          const valores = Object.values(fila).map(v => {
            if (v === null) return "NULL";
            if (typeof v === "number") return v;
            // Escapar comillas simples para evitar errores en SQL
            return `'${String(v).replace(/'/g, "''")}'`;
          }).join(", ");

          sqlDump += `INSERT INTO ${tabla} (${columnas}) VALUES (${valores});\n`;
        });
        sqlDump += "\n";
      }
    }

    sqlDump += `PRAGMA foreign_keys = ON;`;

    // 2. RETORNO DEL ARCHIVO .SQL
    const hoy = new Date().toISOString().split('T')[0];
    
    return new NextResponse(sqlDump, {
      headers: {
        "Content-Disposition": `attachment; filename="FULL_BACKUP_MATT_${hoy}.sql"`,
        "Content-Type": "application/sql",
        "Cache-Control": "no-store",
      },
    });

  } catch (error: any) {
    console.error("ERROR_TURSO_BACKUP_CRITICO:", error);
    return NextResponse.json({ 
      error: "Error al generar el volcado SQL", 
      detalles: error.message 
    }, { status: 500 });
  }
}