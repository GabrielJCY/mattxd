import { db } from "@/src/lib/db";
import { 
  MessageSquareQuote, 
  Star, 
  Calendar, 
  User, 
  Tag,
  LayoutDashboard,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default async function ResenasPage() {
  const res = await db.execute({
    sql: `
      SELECT 
        r.id_resena,
        r.comentario,
        r.calificacion,
        r.fecha,
        c.nombre as cliente_nombre,
        c.apellido as cliente_apellido,
        p.nombre as producto_nombre,
        m.talla,
        m.color
      FROM resena r
      JOIN cliente c ON r.id_cliente = c.id_cliente
      JOIN modelo m ON r.id_modelo = m.id_modelo
      JOIN producto p ON m.id_producto = p.id_producto
      ORDER BY r.fecha DESC
    `
  });

  const resenas = JSON.parse(JSON.stringify(res.rows));

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* NAVEGACIÓN */}
        <nav className="flex justify-between items-center mb-12">
          <Link 
            href="/admin" 
            className="group flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
          >
            <LayoutDashboard size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[10px] font-black uppercase tracking-widest">Social</span>
            <ChevronRight size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest text-black">Feedback</span>
          </div>
        </nav>

        {/* ENCABEZADO EDITORIAL */}
        <header className="mb-16 border-b-[6px] border-black pb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-black text-white p-2">
              <MessageSquareQuote size={24} strokeWidth={2.5} />
            </div>
            <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
              Voz del Consumidor
            </h1>
          </div>
          <p className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            Customer <span className="text-slate-200 not-italic">Feedback</span>
          </p>
        </header>

        {/* CONTENEDOR DE TABLA BRUTALISTA */}
        <div className="border-4 border-black bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="p-6 border-r border-white/10 w-40 italic">Fecha</th>
                <th className="p-6 border-r border-white/10 w-64">Cliente</th>
                <th className="p-6 border-r border-white/10">Producto / Variante</th>
                <th className="p-6 border-r border-white/10">Comentario</th>
                <th className="p-6 text-center w-40">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {resenas.map((r: any) => (
                <tr key={r.id_resena} className="hover:bg-slate-50 transition-colors group">
                  {/* FECHA */}
                  <td className="p-6 border-r-4 border-black">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-black">
                        {new Date(r.fecha).toLocaleDateString('es-BO', { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </td>

                  {/* CLIENTE */}
                  <td className="p-6 border-r-4 border-black">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 border-2 border-black flex items-center justify-center">
                        <User size={14} />
                      </div>
                      <p className="font-black text-xs uppercase leading-tight">
                        {r.cliente_nombre} <br />
                        <span className="text-slate-400">{r.cliente_apellido}</span>
                      </p>
                    </div>
                  </td>

                  {/* PRODUCTO */}
                  <td className="p-6 border-r-4 border-black">
                    <div className="space-y-2">
                      <p className="inline-block bg-black text-white text-[9px] font-black px-2 py-1 uppercase italic tracking-tighter">
                        {r.producto_nombre}
                      </p>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        <Tag size={10} />
                        <span>{r.talla} / {r.color}</span>
                      </div>
                    </div>
                  </td>

                  {/* COMENTARIO */}
                  <td className="p-6 border-r-4 border-black max-w-xs">
                    <p className="text-sm font-medium leading-snug text-slate-600 italic group-hover:text-black transition-colors">
                      "{r.comentario}"
                    </p>
                  </td>

                  {/* CALIFICACIÓN */}
                  <td className="p-6 bg-slate-50/50">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-3xl font-black italic leading-none">{r.calificacion}.0</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={10} 
                            fill={i < r.calificacion ? "black" : "none"} 
                            className={i < r.calificacion ? "text-black" : "text-slate-200"}
                          />
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* EMPTY STATE */}
          {resenas.length === 0 && (
            <div className="py-40 text-center flex flex-col items-center gap-6">
              <div className="border-4 border-dashed border-slate-200 p-8 rounded-full">
                <MessageSquareQuote size={48} className="text-slate-200" />
              </div>
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">
                Sin testimonios registrados
              </p>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <footer className="mt-20 pt-8 border-t-2 border-slate-100 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 italic">
          <span>Matt Bolivia // Voice of Customer</span>
          <span>Sincronización: Real-Time</span>
        </footer>
      </div>
    </div>
  );
}