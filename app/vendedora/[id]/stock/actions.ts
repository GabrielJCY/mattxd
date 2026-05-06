"use server";
import { db } from "@/src/lib/db";

export async function getStockVendedora(vendedoraId: string, genero: string) {
  try {
    // 1. Mapear el ID con limpieza de strings
    const idLimpio = vendedoraId.trim().toLowerCase();

    let sedeId: number;
    if (idLimpio === "tumusla") {
      sedeId = 2;
    } else if (idLimpio === "illampu") {
      sedeId = 3;
    } else {
      // Si llega el número directamente
      sedeId = isNaN(Number(vendedoraId)) ? 2 : Number(vendedoraId);
    }

    // 2. Obtener la información de la sede (CORRECCIÓN: id -> id_sucursal)
    const resSede = await db.execute({
      sql: "SELECT nombre_tienda FROM sucursal WHERE id_sucursal = ?",
      args: [sedeId]
    });
    
    // Si la base de datos no responde, asignamos el nombre manualmente según el ID
    const sedeNombre = resSede.rows[0]?.nombre_tienda || (sedeId === 3 ? "ILLAMPU" : "TUMUSLA");

    // 3. Obtener Productos con su IMAGEN correspondiente
    const resProd = await db.execute({
      sql: `
        SELECT 
          p.*, 
          (SELECT url_imagen FROM imagen_producto WHERE id_producto = p.id_producto LIMIT 1) as imagen_url
        FROM producto p
        INNER JOIN categoria c ON p.id_categoria = c.id_categoria
        WHERE LOWER(c.genero) = ? 
        ORDER BY p.nombre ASC
      `,
      args: [genero.toLowerCase()]
    });

    // 4. Obtener Modelos con stock filtrado por sedeId
    const resMod = await db.execute({
      sql: `
        SELECT 
          m.*, 
          IFNULL(s.cantidad, 0) as cantidad 
        FROM modelo m 
        INNER JOIN producto p ON m.id_producto = p.id_producto
        INNER JOIN categoria c ON p.id_categoria = c.id_categoria
        LEFT JOIN stock s ON m.id_modelo = s.id_modelo AND s.id_sucursal = ?
        WHERE LOWER(c.genero) = ?
        ORDER BY m.talla ASC, m.color ASC
      `,
      args: [sedeId, genero.toLowerCase()]
    });

    // 5. Retorno estructurado y tipado
    return {
      success: true,
      productos: JSON.parse(JSON.stringify(resProd.rows)).map((p: any) => ({
        ...p,
        imagen_url: p.imagen_url ? String(p.imagen_url) : null 
      })),
      modelos: JSON.parse(JSON.stringify(resMod.rows)),
      sedeNombre: String(sedeNombre),
      sedeId: Number(sedeId)
    };

  } catch (error) {
    console.error("Error en getStockVendedora:", error);
    return { 
      success: false, 
      error: "Error al cargar inventario",
      productos: [],
      modelos: [],
      sedeNombre: "Error",
      sedeId: 0
    };
  }
}