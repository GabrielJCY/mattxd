"use server";
import { db } from "@/src/lib/db";

export async function getDashboardData() {
  try {
    const [
      resVentas, resPedidos, resStock, 
      resProductos, resCategorias, resMovimientos,
      resClientes, resResenas, resLikes,
      resAnuncios, resUsuarios
    ] = await Promise.all([
      db.execute("SELECT SUM(total) as ingresos FROM venta"),
      // --- CAMBIO CLAVE AQUÍ ---
      // Usamos NOT IN para excluir todos los estados que ya no son "pendientes"
      // Añadimos TRIM y LOWER para que no falle por espacios o mayúsculas
      db.execute(`
        SELECT COUNT(*) as total 
        FROM pedido 
        WHERE TRIM(LOWER(estado)) NOT IN ('completado', 'entregado', 'cancelado')
      `),
      db.execute("SELECT COUNT(*) as total FROM stock WHERE cantidad < 5"), // Alertas
      db.execute("SELECT COUNT(*) as total FROM producto"),
      db.execute("SELECT COUNT(*) as total FROM categoria"),
      db.execute("SELECT COUNT(*) as total FROM movimiento_inventario"),
      db.execute("SELECT COUNT(*) as total FROM cliente"),
      db.execute("SELECT COUNT(*) as total FROM resena"),
      db.execute("SELECT COUNT(*) as total FROM like_producto"),
      db.execute("SELECT COUNT(*) as total FROM anuncio WHERE activo = 1"),
      db.execute("SELECT COUNT(*) as total FROM admin")
    ]);

    return {
      ingresos: Number(resVentas.rows[0]?.ingresos || 0),
      pedidos: Number(resPedidos.rows[0]?.total || 0),
      alertasStock: Number(resStock.rows[0]?.total || 0),
      productos: Number(resProductos.rows[0]?.total || 0),
      categorias: Number(resCategorias.rows[0]?.total || 0),
      movimientos: Number(resMovimientos.rows[0]?.total || 0),
      clientes: Number(resClientes.rows[0]?.total || 0),
      resenas: Number(resResenas.rows[0]?.total || 0),
      likes: Number(resLikes.rows[0]?.total || 0),
      anuncios: Number(resAnuncios.rows[0]?.total || 0),
      usuarios: Number(resUsuarios.rows[0]?.total || 0)
    };
  } catch (error) {
    console.error("Error en DB:", error);
    return { 
      ingresos: 0, pedidos: 0, alertasStock: 0, productos: 0, 
      categorias: 0, movimientos: 0, clientes: 0, resenas: 0, 
      likes: 0, anuncios: 0, usuarios: 0 
    };
  }
}