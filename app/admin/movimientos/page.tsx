/** * PROTOCOLO DE RENDERIZADO DINÁMICO */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import { 
  LayoutDashboard,
  Filter,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { FiltroFecha } from "@/components/FiltroFecha"; 

interface PageProps {
  searchParams: Promise<{ tipo?: string; sucursal?: string; fecha?: string }>;
}

export default async function MovimientosPage({ searchParams }: PageProps) {
  const { tipo, sucursal, fecha } = await searchParams;

  // Obtener sucursales para los filtros
  const { rows: sucursalesRaw } = await db.execute("SELECT id_sucursal, nombre_tienda FROM sucursal ORDER BY id_sucursal ASC");
  const listaSucursales = JSON.parse(JSON.stringify(sucursalesRaw));

  // ✅ 1. QUERY BASE (CORREGIDA: Eliminamos los desfases de -4h en SQL)
  // Ahora leemos la fecha tal cual está en la base de datos porque ya viene bien desde el Action.
  let query = `
    SELECT 
      mov.tipo, 
      mov.cantidad, 
      mov.motivo, 
      mov.fecha as fecha_local,
      date(mov.fecha) as solo_fecha,
      mov.id_sucursal_origen,
      mov.id_sucursal_destino,
      p.nombre as producto,
      m.talla,
      m.color,
      s_dest.nombre_tienda as sede_destino_nombre,
      s_orig.nombre_tienda as sede_origen_nombre
    FROM movimiento_inventario mov
    JOIN modelo m ON mov.id_modelo = m.id_modelo
    JOIN producto p ON m.id_producto = p.id_producto
    LEFT JOIN sucursal s_dest ON mov.id_sucursal_destino = s_dest.id_sucursal
    LEFT JOIN sucursal s_orig ON mov.id_sucursal_origen = s_orig.id_sucursal
    WHERE 1=1
  `;

  const args: any[] = [];

  // --- FILTRO POR FECHA ---
  if (fecha) {
    query += ` AND date(mov.fecha) = ?`;
    args.push(fecha);
  }

  // --- FILTRO POR TIPO (ENTRADA/SALIDA) ---
  if (tipo === 'ENTRADA' || tipo === 'SALIDA') {
    query += ` AND mov.tipo = ?`;
    args.push(tipo);
  }

  // --- LÓGICA DE FILTRADO DE SEDES ---
  if (sucursal && sucursal !== "") {
    const idSede = Number(sucursal);
    
    if (idSede === 4) {
      query += ` AND (
        (mov.id_sucursal_destino = 4 AND mov.tipo = 'ENTRADA') 
        OR 
        (mov.id_sucursal_origen = 4 AND mov.tipo = 'SALIDA')
      )`;
    } else {
      query += ` AND (
        (mov.id_sucursal_destino = ${idSede} AND mov.tipo = 'ENTRADA') 
        OR 
        (mov.id_sucursal_origen = ${idSede} AND mov.tipo = 'SALIDA' AND mov.motivo NOT LIKE 'Traspaso%')
      )`;
    }
  } else {
    query += ` AND (
      mov.tipo = 'ENTRADA' 
      OR 
      (mov.tipo = 'SALIDA' AND mov.motivo = 'VENTA')
      OR
      (mov.tipo = 'SALIDA' AND mov.motivo = 'AJUSTE')
    )`;
  }

  query += ` ORDER BY mov.fecha DESC LIMIT 150`;

  const { rows: movs } = await db.execute({ sql: query, args });
  const movimientos = JSON.parse(JSON.stringify(movs));

  // --- AGRUPACIÓN POR FECHA ---
  const movimientosAgrupados = movimientos.reduce((acc: any, curr: any) => {
    const fechaClave = curr.solo_fecha;
    if (!acc[fechaClave]) acc[fechaClave] = [];
    acc[fechaClave].push(curr);
    return acc;
  }, {});

  const fechasOrdenadas = Object.keys(movimientosAgrupados).sort((a, b) => b.localeCompare(a));

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* NAVEGACIÓN */}
        <nav className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <Link href="/admin" className="group flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all">
            <LayoutDashboard size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Dashboard</span>
          </Link>
          <FiltroFecha />
        </nav>

        {/* ENCABEZADO */}
        <header className="mb-12 border-b-[6px] border-black pb-10">
          <div className="flex flex-col gap-8">
            <p className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
              Flujo de <span className="text-slate-200 not-italic">Mercadería</span>
            </p>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Link 
                  href="/admin/movimientos"
                  className={`px-4 py-2 text-[9px] font-black uppercase border-2 border-black transition-all ${!sucursal ? 'bg-black text-white' : 'hover:bg-slate-100'}`}
                >
                  Todas las Sedes
                </Link>

                {listaSucursales.map((s: any) => (
                  <Link 
                    key={s.id_sucursal} 
                    href={`/admin/movimientos?sucursal=${s.id_sucursal}${tipo ? `&tipo=${tipo}` : ''}${fecha ? `&fecha=${fecha}` : ''}`}
                    className={`px-4 py-2 text-[9px] font-black uppercase border-2 border-black transition-all ${Number(sucursal) === s.id_sucursal ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-slate-100'}`}
                  >
                    {s.nombre_tienda}
                  </Link>
                ))}
              </div>

              <div className="grid grid-cols-3 w-full lg:w-max border-2 border-black font-black text-[10px] uppercase tracking-widest">
                <Link 
                  href={`/admin/movimientos?${new URLSearchParams({ ...(sucursal && { sucursal }), ...(fecha && { fecha }) })}`}
                  className={`px-6 py-3 text-center border-r-2 border-black transition-colors ${!tipo ? 'bg-black text-white' : 'hover:bg-slate-50'}`}
                >
                  Todos
                </Link>
                <Link 
                  href={`/admin/movimientos?tipo=ENTRADA${sucursal ? `&sucursal=${sucursal}` : ''}${fecha ? `&fecha=${fecha}` : ''}`}
                  className={`px-6 py-3 text-center border-r-2 border-black transition-colors ${tipo === 'ENTRADA' ? 'bg-emerald-500 text-white' : 'hover:bg-slate-50'}`}
                >
                  Entradas
                </Link>
                <Link 
                  href={`/admin/movimientos?tipo=SALIDA${sucursal ? `&sucursal=${sucursal}` : ''}${fecha ? `&fecha=${fecha}` : ''}`}
                  className={`px-6 py-3 text-center transition-colors ${tipo === 'SALIDA' ? 'bg-red-500 text-white' : 'hover:bg-slate-50'}`}
                >
                  Salidas
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* LISTADO AGRUPADO */}
        <div className="space-y-12">
          {fechasOrdenadas.map((fechaGrupo) => (
            <section key={fechaGrupo} className="space-y-4">
              <div className="sticky top-4 z-10">
                <span className="bg-black text-white px-4 py-1 text-[10px] font-black uppercase tracking-[0.3em] shadow-[4px_4px_0px_0px_rgba(226,232,240,1)]">
                  {fechaGrupo === new Date().toISOString().split('T')[0] ? "HOY" : fechaGrupo.split('-').reverse().join('/')}
                </span>
              </div>

              {movimientosAgrupados[fechaGrupo].map((m: any, i: number) => {
                const nombreSedeCorrecta = m.tipo === 'ENTRADA' ? m.sede_destino_nombre : m.sede_origen_nombre;
                // ✅ Extraemos la hora directamente del string guardado
                const hora = m.fecha_local ? m.fecha_local.split(' ')[1]?.substring(0, 5) : "--:--";

                return (
                  <div 
                    key={i} 
                    className={`group border-2 md:border-4 border-black p-4 md:p-6 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      m.tipo === 'ENTRADA' ? 'border-l-[10px] md:border-l-[16px] border-l-emerald-500' : 'border-l-[10px] md:border-l-[16px] border-l-red-500'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="space-y-1">
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {hora} HRS
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">{m.producto}</h3>
                        <div className="flex flex-wrap gap-2 items-center">
                          <span className="flex items-center gap-1 text-[8px] md:text-[9px] font-black bg-white border-2 border-black px-2 py-0.5 uppercase">
                            <MapPin size={10} /> 
                            {m.tipo === 'ENTRADA' ? 'Destino' : 'Origen'}: {nombreSedeCorrecta || 'N/A'}
                          </span>
                          <span className={`text-[8px] md:text-[9px] font-black px-2 py-0.5 uppercase ${m.motivo === 'VENTA' ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                            {m.motivo}
                          </span>
                          <span className="text-[8px] md:text-[9px] font-black border-2 border-slate-100 text-slate-400 px-2 py-0.5 uppercase italic">
                            {m.talla} / {m.color}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end md:gap-12 pt-3 md:pt-0 border-t-2 md:border-t-0 border-slate-100">
                      <div className="text-right">
                        <p className={`text-3xl md:text-4xl font-black italic leading-none ${m.tipo === 'ENTRADA' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {m.tipo === 'ENTRADA' ? '↑' : '↓'} {m.cantidad}
                        </p>
                        <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mt-1 text-slate-300">Unidades</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>
          ))}

          {fechasOrdenadas.length === 0 && (
            <div className="py-20 text-center border-4 border-dashed border-slate-100 flex flex-col items-center gap-4">
              <Filter className="w-10 h-10 text-slate-200" />
              <p className="text-[10px] font-black uppercase text-slate-300 tracking-[0.5em]">Sin registros para esta selección</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}