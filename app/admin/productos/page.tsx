/**
 * --- CONFIGURACIÓN DE RENDERIZADO ---
 * force-dynamic: Obliga a Next.js a renderizar la página en cada solicitud.
 * revalidate = 0: Asegura que los datos de Turso DB se consulten siempre en tiempo real.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import Link from "next/link";
import Image from "next/image";
import BotonImprimir from "./BotonImprimir"; 
import TablaProductosInteractiva from "./TablaProductosInteractiva"; // Importamos el nuevo contenedor interactivo
import { 
  Package, 
  Plus, 
  ArrowLeft, 
  Search
} from "lucide-react";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams;
  const searchTerm = params.q || "";

  // Realizamos la consulta con parámetros dinámicos
  const { rows } = await db.execute({
    sql: `
      SELECT p.*, c.nombre as cat_nombre, c.genero as cat_genero 
      FROM producto p 
      LEFT JOIN categoria c ON p.id_categoria = c.id_categoria 
      WHERE (p.nombre LIKE ? OR p.id_producto LIKE ?)
      ORDER BY p.id_producto DESC
      LIMIT 100
    `,
    args: [`%${searchTerm}%`, `%${searchTerm}%`]
  });

  // Limpiamos los datos para el componente de cliente
  const productosData = rows ? JSON.parse(JSON.stringify(rows)) : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-10 font-sans text-slate-900">
      
      {/* NAVEGACIÓN SUPERIOR - no-print para ocultar al imprimir */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 mb-8 md:mb-12 no-print">
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <Link href="/admin" className="group flex items-center gap-2 bg-white border border-slate-200 p-2 pr-4 rounded-2xl hover:border-black transition-all shadow-sm">
            <div className="bg-slate-100 p-2 rounded-xl group-hover:bg-black group-hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </Link>
          <Image src="/logo1.png" alt="Matt Logo" width={35} height={35} className="object-contain md:ml-4" />
        </div>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Botón de Impresión de Etiquetas */}
          <BotonImprimir />

          <Link 
            href="/admin/productos/nuevo" 
            className="bg-black text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
          >
            <Plus size={16} strokeWidth={3} />
            Registrar Producto
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 md:mb-10 text-center md:text-left no-print">
          <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 mb-3">
            <Package size={14} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Central Inventory Node</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none text-slate-950">
            Stock <br /> 
            <span className="text-slate-300 underline decoration-black decoration-4 underline-offset-8">Global</span>
          </h1>
        </header>

        {/* BUSCADOR - no-print */}
        <form method="GET" className="flex flex-col md:flex-row gap-2 mb-8 max-w-2xl no-print">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              name="q"
              type="text" 
              defaultValue={searchTerm}
              placeholder="NOMBRE DEL PRODUCTO..." 
              className="w-full bg-white border border-slate-200 py-4 px-12 rounded-2xl text-[10px] font-bold tracking-widest uppercase focus:border-black outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2 h-[52px] md:h-auto">
            <button 
              type="submit"
              className="flex-1 md:flex-none bg-black text-white px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-black"
            >
              Buscar
            </button>
          </div>
        </form>

        {/* CONTENEDOR DE RESULTADOS / GRILLA DE IMPRESIÓN */}
        <TablaProductosInteractiva productos={productosData} searchTerm={searchTerm} />
        
      </div>
    </div>
  );
}