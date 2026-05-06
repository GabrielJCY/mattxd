import { db } from "@/src/lib/db";
import Link from "next/link";
import BotonEliminar from "./BotonEliminar";
import { 
  Plus, 
  ChevronLeft, 
  ExternalLink, 
  Megaphone,
  Eye,
  EyeOff
} from "lucide-react";

export default async function AnunciosPage() {
  const res = await db.execute(`
    SELECT a.*, p.nombre as producto_nombre 
    FROM anuncio a 
    LEFT JOIN producto p ON a.id_producto = p.id_producto
    ORDER BY a.id_anuncio DESC
  `);
  
  const anuncios = JSON.parse(JSON.stringify(res.rows));

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white p-4 md:p-12 overflow-x-hidden">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="max-w-7xl mx-auto mb-8 md:mb-12 flex justify-between items-center">
        <Link 
          href="/admin" 
          className="group flex items-center gap-3 border-[3px] md:border-4 border-black px-4 md:px-6 py-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-1"
        >
          {/* CORRECCIÓN: Tamaño vía className para evitar error de Namespace */}
          <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={3} />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-4 text-slate-300 italic">
          <Megaphone className="w-3 h-3 md:w-4 md:h-4" />
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Marketing Terminal</span>
        </div>
      </nav>

      {/* CABECERA EDITORIAL */}
      <header className="max-w-7xl mx-auto mb-12 md:mb-20 border-b-[4px] md:border-b-[6px] border-black pb-8 md:pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-10">
        <div className="space-y-3 md:space-y-4 w-full md:w-auto">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] md:leading-[0.8] text-black">
            Ads <br className="md:hidden" /> <span className="text-slate-100 not-italic">Panel</span>
          </h1>
          <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 max-w-md">
            Control de Banners // Matt Bolivia
          </p>
        </div>
        
        <Link 
          href="/admin/anuncios/nuevo"
          className="w-full md:w-auto group relative bg-black text-white px-8 md:px-12 py-5 md:py-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(226,232,240,1)] md:shadow-[10px_10px_0px_0px_rgba(226,232,240,1)] hover:shadow-none hover:bg-white hover:text-black transition-all flex items-center justify-center gap-3"
        >
          {/* CORRECCIÓN: Se eliminó md:size para usar w/h de Tailwind */}
          <Plus className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
          <span className="font-black uppercase italic tracking-[0.1em] md:tracking-[0.2em] text-xs md:text-sm">Nuevo Anuncio</span>
        </Link>
      </header>

      {/* GRID DE ANUNCIOS */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
        {anuncios.map((ad: any) => (
          <article 
            key={ad.id_anuncio} 
            className="group border-[3px] md:border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:shadow-none transition-all duration-300 overflow-hidden"
          >
            <div className="relative h-56 md:h-72 border-b-[3px] md:border-b-4 border-black overflow-hidden">
              <img 
                src={ad.imagen_url} 
                alt={ad.titulo}
                className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
              />
              
              <div className={`absolute top-0 left-0 border-r-[3px] md:border-r-4 border-b-[3px] md:border-b-4 border-black px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-2 font-black text-[9px] md:text-[10px] uppercase tracking-widest ${
                ad.activo ? 'bg-[#00FF95] text-black' : 'bg-slate-200 text-slate-500'
              }`}>
                {ad.activo ? <Eye size={12} strokeWidth={3} /> : <EyeOff size={12} />}
                {ad.activo ? 'Live' : 'Draft'}
              </div>

              {ad.descuento > 0 && (
                <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 bg-black text-white px-3 md:px-4 py-0.5 md:py-1 italic font-black text-lg md:text-xl border-2 border-white shadow-lg">
                  -{ad.descuento}%
                </div>
              )}
            </div>

            <div className="p-6 md:p-8 flex-grow flex flex-col min-w-0">
              <span className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-4">
                {ad.producto_nombre || 'General Promo'}
              </span>
              
              <h3 className="text-2xl md:text-3xl font-black uppercase italic leading-[0.9] mb-4 break-words line-clamp-2 group-hover:underline decoration-4">
                {ad.titulo}
              </h3>
              
              <p className="text-[11px] md:text-xs text-slate-500 font-bold italic line-clamp-3 mb-6 md:mb-8 flex-grow leading-relaxed break-words">
                {ad.descripcion || "DATOS ADICIONALES NO DISPONIBLES."}
              </p>
              
              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-5 md:pt-6 border-t-2 border-slate-100">
                <Link 
                  href={`/admin/anuncios/editar/${ad.id_anuncio}`}
                  className="flex items-center justify-center gap-2 py-3 md:py-4 bg-white border-2 border-black hover:bg-black hover:text-white transition-all font-black uppercase italic text-[9px] md:text-[10px] tracking-widest active:scale-95"
                >
                  <ExternalLink size={12} strokeWidth={3} /> EDITAR
                </Link>
                <BotonEliminar id={ad.id_anuncio} />
              </div>
            </div>
          </article>
        ))}
      </main>

      <footer className="max-w-7xl mx-auto mt-20 md:mt-32 pt-8 border-t-2 border-slate-100 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-slate-300 italic text-center">
        Matt Bolivia // Ads Infrastructure Update 2026
      </footer>
    </div>
  );
}