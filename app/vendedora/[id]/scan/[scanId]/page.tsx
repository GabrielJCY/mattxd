/** * DETALLE DE PRODUCTO INTERACTIVO - MATT BOLIVIA 2026 */
export const dynamic = 'force-dynamic';

import { db } from "@/src/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft, Tag, AlertCircle } from "lucide-react";
import Link from "next/link";
import SeleccionadorVenta from "./SeleccionadorVenta";

interface Props {
  params: Promise<{ id: string; scanId: string }>;
}

export default async function DetalleProductoVenta({ params }: Props) {
  const { id: sucursalId, scanId: productoId } = await params;

  /**
   * 1. CONSULTA DE DATOS CON UNIONES ROBUSTAS
   * Usamos LEFT JOIN en stock y categoría para evitar que la página 
   * rompa si faltan registros dependientes.
   */
  const { rows } = await db.execute({
    sql: `
      SELECT 
        p.nombre as producto_nombre,
        p.id_producto,
        c.nombre as categoria,
        m.id_modelo,
        m.talla,
        m.color,
        m.precio,
        COALESCE(s.cantidad, 0) as stock_actual,
        (SELECT url_imagen FROM imagen_producto WHERE id_producto = p.id_producto LIMIT 1) as imagen_url,
        -- Obtenemos el descuento ignorando fechas, solo por 'activo'
        COALESCE((
          SELECT descuento FROM anuncio 
          WHERE id_producto = p.id_producto 
          AND activo = 1 
          LIMIT 1
        ), 0) as descuento_promo
      FROM producto p
      JOIN modelo m ON p.id_producto = m.id_producto
      LEFT JOIN stock s ON m.id_modelo = s.id_modelo AND s.id_sucursal = ?
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE p.id_producto = ?
    `,
    args: [sucursalId, productoId]
  });

  // Si no hay filas, el producto o sus variantes no existen en la base de datos
  if (rows.length === 0) notFound();

  const producto = {
    id: String(rows[0].id_producto),
    nombre: String(rows[0].producto_nombre),
    categoria: String(rows[0].categoria || 'General'),
    imagen: rows[0].imagen_url ? String(rows[0].imagen_url) : "/logo1.png"
  };

  /**
   * 2. MAPEADO DE VARIANTES
   * Calculamos el stock total para dar feedback visual inmediato
   */
  const variantes = rows.map((r: any) => ({
    id_producto: Number(r.id_producto),
    id_modelo: Number(r.id_modelo),
    talla: String(r.talla),
    color: String(r.color),
    precio: Number(r.precio || 0),
    stock: Number(r.stock_actual),
    descuento: Number(r.descuento_promo || 0)
  }));

  const tieneStockGlobal = variantes.some(v => v.stock > 0);

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      {/* NAVBAR */}
      <nav className="p-4 border-b-2 border-black flex items-center gap-4 bg-white sticky top-0 z-50">
        <Link href={`/vendedora/${sucursalId}/scan`} className="active:scale-90 transition-transform">
          <ArrowLeft size={24} strokeWidth={3} />
        </Link>
        <div className="flex flex-col">
          <span className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">
            Sucursal {sucursalId}
          </span>
          <span className="text-[10px] font-black uppercase tracking-tight">
            Terminal de Venta
          </span>
        </div>
      </nav>

      <main className="max-w-md mx-auto p-6 space-y-6">
        
        {/* FOTO DEL PRODUCTO */}
        <div className="relative aspect-square border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-zinc-50 flex items-center justify-center">
          <img 
            src={producto.imagen} 
            alt={producto.nombre}
            className={`w-full h-full object-cover ${!rows[0].imagen_url ? 'p-12 opacity-10' : ''}`}
          />
          <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-[10px] font-black uppercase italic">
            ID: {producto.id}
          </div>
          
          {!tieneStockGlobal && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
              <div className="bg-red-600 text-white px-4 py-2 font-black uppercase text-xl border-2 border-black -rotate-12 shadow-xl">
                Agotado
              </div>
            </div>
          )}
        </div>

        {/* INFO BÁSICA */}
        <section className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-400">
             <Tag size={12} className="text-black" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">{producto.categoria}</span>
          </div>
          <h1 className="text-4xl font-black uppercase italic leading-[0.9] tracking-tighter">
            {producto.nombre}
          </h1>
        </section>

        {!tieneStockGlobal && (
          <div className="bg-red-50 border-2 border-red-600 p-3 flex items-center gap-3 text-red-600">
            <AlertCircle size={18} />
            <p className="text-[10px] font-black uppercase">Unidades no disponibles en esta sucursal</p>
          </div>
        )}

        <hr className="border-t-[3px] border-black" />

        {/* COMPONENTE INTERACTIVO */}
        <SeleccionadorVenta 
          variantes={variantes} 
          sucursalId={Number(sucursalId)} 
        />
      </main>

      <footer className="px-6 py-4 text-center mt-10">
        <p className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.4em]">
          Matt Bolivia // Calzado de Autor // 2026
        </p>
      </footer>
    </div>
  );
}