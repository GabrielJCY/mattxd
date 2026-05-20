import { db } from "@/src/lib/db";
import Link from "next/link";
import { ArrowLeft, Terminal, Trophy, PackageOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TopProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  
  // Si no hay fechas en la URL, tomamos el día de hoy
  const obtenerHoyBolivia = () => {
    const ahora = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit' });
    const [d, m, y] = formatter.format(ahora).split('/');
    return `${y}-${m}-${d}`; 
  };

  const hoyBolivia = obtenerHoyBolivia();
  const fechaDesde = params.desde || hoyBolivia;
  const fechaHasta = params.hasta || hoyBolivia;

  // CONSULTA DETALLADA: Incluye talla, color y el dinero generado por ese modelo
  const resTopProductos = await db.execute({
    sql: `
      SELECT 
        p.nombre AS producto, 
        m.talla,
        m.color,
        SUM(dv.cantidad) AS total_unidades,
        SUM(dv.cantidad * dv.precio) AS ingresos_generados
      FROM detalle_venta dv
      JOIN modelo m ON dv.id_modelo = m.id_modelo
      JOIN producto p ON m.id_producto = p.id_producto
      JOIN venta v ON dv.id_venta = v.id_venta
      WHERE date(v.fecha) BETWEEN ? AND ? AND v.total > 0
      GROUP BY m.id_modelo
      ORDER BY total_unidades DESC
    `,
    args: [fechaDesde, fechaHasta],
  });

  const topProductos = JSON.parse(JSON.stringify(resTopProductos.rows));

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-12 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* NAV */}
      <nav className="max-w-7xl mx-auto mb-8 md:mb-10 flex justify-between items-center">
        <Link 
          href={`/admin/ventas?desde=${fechaDesde}&hasta=${fechaHasta}`} 
          className="group flex items-center gap-2 md:gap-3 border-[2px] md:border-[3px] border-black px-4 py-2 md:px-6 md:py-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <ArrowLeft size={14} className="md:w-4 md:h-4" strokeWidth={3} />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Volver a Ventas</span>
        </Link>
        <div className="flex items-center gap-2 text-gray-400 italic">
          <Terminal size={12} />
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">Matt_Bolivia_v2</span>
        </div>
      </nav>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-10 md:mb-16 border-b-[6px] md:border-b-[8px] border-black pb-8 md:pb-12">
        <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] break-words flex items-center gap-4">
          TOP <span className="text-gray-200 not-italic">RANKING</span>
        </h1>
        <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 mt-4 md:mt-6 italic leading-relaxed">
          Productos más vendidos // Periodo: {fechaDesde} _ {fechaHasta}
        </p>
      </header>

      {/* TABLA DETALLADA DESKTOP & MOBILE */}
      <div className="max-w-7xl mx-auto mb-20 border-[3px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-black text-white uppercase text-[10px] font-black tracking-[0.3em]">
                <th className="p-6 text-center w-20">Rank</th>
                <th className="p-6">Producto</th>
                <th className="p-6 text-center">Variante (T/C)</th>
                <th className="p-6 text-center">Unidades</th>
                <th className="p-6 text-right">Ingreso Bruto</th>
              </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-black">
              {topProductos.map((prod: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-6 border-r-[3px] border-black text-center">
                    <span className={`text-2xl font-black italic ${index < 3 ? 'text-black' : 'text-gray-400'}`}>
                      #{index + 1}
                    </span>
                    {index === 0 && <Trophy size={16} className="mx-auto mt-1 text-yellow-500" />}
                  </td>
                  
                  <td className="p-6 border-r-[3px] border-black">
                    <p className="font-black uppercase italic text-xl leading-tight">
                      {prod.producto}
                    </p>
                  </td>
                  
                  <td className="p-6 border-r-[3px] border-black text-center">
                    <div className="inline-flex gap-2 items-center">
                      <span className="text-[10px] font-black uppercase border-2 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        T: {prod.talla}
                      </span>
                      <span className="text-[10px] font-black uppercase border-2 border-black px-2 py-1 bg-gray-100">
                        C: {prod.color}
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-6 border-r-[3px] border-black text-center">
                    <span className="text-3xl font-black italic tracking-tighter">
                      {prod.total_unidades}
                    </span>
                    <span className="block text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      Vendidos
                    </span>
                  </td>
                  
                  <td className="p-6 text-right bg-white group-hover:bg-gray-50">
                    <span className="text-3xl font-black italic tracking-tighter text-green-600">
                      {Number(prod.ingresos_generados).toFixed(2)}
                    </span>
                    <span className="block text-[10px] font-black text-gray-400 mt-1">BS</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {topProductos.length === 0 && (
          <div className="p-16 md:p-32 text-center bg-gray-50">
            <PackageOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="font-black text-gray-300 uppercase text-3xl md:text-5xl italic tracking-tighter">
              INVENTARIO_INACTIVO
            </p>
            <p className="text-[9px] md:text-[11px] font-black uppercase text-gray-400 mt-4 tracking-[0.3em]">
              Sin ventas registradas en este periodo
            </p>
          </div>
        )}
      </div>

      <footer className="max-w-7xl mx-auto pt-10 border-t-2 border-gray-100 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-gray-300 italic flex justify-between pb-8">
        <span>Matt Bolivia Core</span>
        <span className="hidden sm:inline">2026 // TOP_METRICS</span>
        <span>v2.1</span>
      </footer>
    </div>
  );
}