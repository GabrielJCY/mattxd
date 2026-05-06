// app/admin/ranking/page.tsx

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import { 
  Trophy, 
  Heart, 
  Activity, 
  ArrowUpRight,
  LayoutGrid,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default async function RankingLikesPage() {
  const res = await db.execute({
    sql: `
      SELECT 
        p.nombre as producto,
        m.nombre as modelo,
        COUNT(lp.id_like) as total_likes
      FROM producto p
      JOIN modelo m ON p.id_producto = m.id_producto
      LEFT JOIN like_producto lp ON m.id_modelo = lp.id_modelo
      GROUP BY m.id_modelo
      HAVING total_likes > 0
      ORDER BY total_likes DESC
    `
  });

  const ranking = res.rows.map((row: any) => ({ ...row }));

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col items-center py-8 md:py-12 px-4 md:px-6">
      
      {/* NAVEGACIÓN */}
      <div className="w-full max-w-4xl mb-8 md:mb-12 flex justify-start">
        <Link 
          href="/admin" 
          className="group flex items-center gap-3 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-1"
        >
          <ChevronLeft size={16} strokeWidth={3} />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">Panel de Control</span>
        </Link>
      </div>

      {/* HEADER */}
      <div className="w-full max-w-4xl mb-12 md:mb-16 space-y-4 md:space-y-6">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="bg-black text-white p-2 border-2 border-black">
            {/* CORRECCIÓN: Usamos className para el responsive del icono */}
            <Trophy strokeWidth={2.5} className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400">
            Tendencias de Usuario // Matt Bolivia
          </p>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
          Más <span className="text-slate-200 not-italic">Gustado</span>
        </h1>
        <div className="h-1.5 md:h-2 w-full bg-black" />
      </div>

      {/* LISTADO */}
      <div className="w-full max-w-4xl grid gap-8 md:gap-10">
        {ranking.map((item: any, index: number) => (
          <div 
            key={`${item.producto}-${item.modelo}`} 
            className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border-2 border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all duration-200 gap-6 sm:gap-0"
          >
            <div className="absolute -left-3 md:-left-6 -top-3 md:-top-4 bg-black text-white px-3 md:px-4 py-1 md:py-2 italic font-black text-lg md:text-xl border-2 border-white shadow-lg z-10">
              #{index + 1 < 10 ? `0${index + 1}` : index + 1}
            </div>

            <div className="flex items-center gap-4 md:gap-8 pl-2 md:pl-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-slate-300" />
                  <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter group-hover:text-slate-500 transition-colors leading-tight">
                    {item.producto}
                  </h2>
                </div>
                <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] md:tracking-[0.3em] ml-5 md:ml-6">
                  Variante: {item.modelo}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
              <div className="text-left sm:text-right">
                <p className="text-3xl md:text-4xl font-black leading-none italic">{item.total_likes}</p>
                <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-300 mt-1">Interacciones</p>
              </div>
              <div className="w-12 h-12 md:w-16 md:h-16 border-[3px] md:border-4 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                {/* CORRECCIÓN: Tamaño controlado por clases h- y w- */}
                <Heart 
                  strokeWidth={3} 
                  fill={index === 0 ? "currentColor" : "none"} 
                  className={`
                    ${index === 0 ? "w-6 h-6 md:w-8 md:h-8" : "w-5 h-5 md:w-6 md:h-6"}
                  `}
                />
              </div>
            </div>

            <div className="hidden sm:block absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight size={20} />
            </div>
          </div>
        ))}

        {ranking.length === 0 && (
          <div className="border-4 border-dashed border-slate-200 py-20 md:py-24 px-6 text-center">
            <LayoutGrid size={40} className="mx-auto text-slate-200 mb-4 md:mb-6" />
            <p className="font-black text-slate-200 uppercase text-xl md:text-3xl italic tracking-tighter">
              Sin datos de interacción
            </p>
          </div>
        )}
      </div>

      <footer className="mt-16 md:mt-24 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-300 flex flex-col md:flex-row items-center gap-2 md:gap-4 italic text-center">
        <span>Public Data Analytics</span>
        <div className="hidden md:block w-8 h-[2px] bg-slate-200" />
        <span>Matt Bolivia // Update 2026</span>
      </footer>
    </div>
  );
}