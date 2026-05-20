import { db } from "@/src/lib/db";
import Link from "next/link";
import BotonAnular from "./BotonAnular";
import BotonReportePDF from "./BotonReportePDF";
import TopProductos from "./TopProductos";
import BtnDevoluciones from "@/components/BtnDevoluciones";
import BtnEmpleados from "./BtnEmpleados"; // ✅ IMPORTAMOS EL BOTÓN DE EMPLEADOS
import { Calendar, ArrowLeft, Terminal, BadgePercent, CreditCard, Banknote, Search, Clock, User, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HistorialVentasPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const params = await searchParams;
  
  const obtenerHoyBolivia = () => {
    const ahora = new Date();
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const [d, m, y] = formatter.format(ahora).split('/');
    return `${y}-${m}-${d}`; 
  };

  const hoyBolivia = obtenerHoyBolivia();
  const fechaDesde = params.desde || hoyBolivia;
  const fechaHasta = params.hasta || hoyBolivia;

  const res = await db.execute({
    sql: `
      SELECT 
        v.id_venta,
        v.fecha as fecha_raw,
        v.total,
        v.metodo_pago,
        COALESCE(s.nombre_tienda, 'TIENDA') as sucursal_nombre, -- ✅ Corregido a nombre_tienda
        COALESCE(p.nombre, 'PRODUCTO VARIO') as producto_nombre,
        COALESCE(c.nombre, 'CLIENTE') || ' ' || COALESCE(c.apellido, 'GENÉRICO') as cliente_full,
        COALESCE(e.nombre, 'MOSTRADOR') as empleado_nombre,
        GROUP_CONCAT(COALESCE(m.color, 'MOD') || ' T' || COALESCE(m.talla, '-') || ' (x' || dv.cantidad || ')', ' | ') as modelos_detalle
      FROM venta v
      LEFT JOIN producto p ON v.id_producto = p.id_producto
      LEFT JOIN cliente c ON v.id_cliente = c.id_cliente
      LEFT JOIN detalle_venta dv ON v.id_venta = dv.id_venta
      LEFT JOIN modelo m ON dv.id_modelo = m.id_modelo
      LEFT JOIN empleado e ON v.id_empleado = e.id_empleado
      LEFT JOIN sucursal s ON v.id_sucursal = s.id_sucursal 
      WHERE date(v.fecha) BETWEEN ? AND ?
      GROUP BY v.id_venta
      ORDER BY v.fecha DESC
    `,
    args: [fechaDesde, fechaHasta],
  });

  const ventas = JSON.parse(JSON.stringify(res.rows));

  const totalGeneral = ventas.reduce((acc: number, v: any) => acc + (Number(v.total) || 0), 0);
  const totalQR = ventas.filter((v: any) => v.metodo_pago === 'QR').reduce((acc: number, v: any) => acc + (Number(v.total) || 0), 0);
  const totalEfectivo = ventas.filter((v: any) => v.metodo_pago === 'Efectivo').reduce((acc: number, v: any) => acc + (Number(v.total) || 0), 0);

  const formatearHoraBolivia = (fechaStr: string) => {
    if (!fechaStr) return "--:--";
    const partes = fechaStr.split(" ");
    if (partes.length < 2) return "--:--";
    const [h, m] = partes[1].split(":");
    return `${h}:${m}`;
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-12 font-sans selection:bg-black selection:text-white overflow-x-hidden">
      
      {/* NAV */}
      <nav className="max-w-7xl mx-auto mb-8 md:mb-10 flex justify-between items-center">
        <Link 
          href="/admin" 
          className="group flex items-center gap-2 md:gap-3 border-[2px] md:border-[3px] border-black px-4 py-2 md:px-6 md:py-2 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
        >
          <ArrowLeft size={14} className="md:w-4 md:h-4" strokeWidth={3} />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Volver</span>
        </Link>
        <div className="flex items-center gap-2 text-gray-400 italic">
          <Terminal size={12} />
          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em]">Matt_Bolivia_v2</span>
        </div>
      </nav>

      {/* HEADER */}
      <header className="max-w-7xl mx-auto mb-10 md:mb-16 border-b-[6px] md:border-b-[8px] border-black pb-8 md:pb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
        <div className="w-full">
          <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-[0.8] break-words">
            SALES <span className="text-gray-200 not-italic block md:inline">LOG</span>
          </h1>
          <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-500 mt-4 md:mt-6 italic leading-relaxed">
            Auditoría de Transacciones <br className="md:hidden" /> // Periodo: {fechaDesde} _ {fechaHasta}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <BotonReportePDF ventas={ventas} />
        
        </div>
      </header>

      {/* FILTROS */}
      <div className="max-w-7xl mx-auto mb-10">
        <form method="GET" className="bg-white border-[3px] border-black p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-stretch md:items-end gap-4 md:gap-6 relative">
          <div className="absolute -top-3 left-4 md:left-6 bg-black text-white px-3 py-0.5 text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em]">
            FILTRAR_DATA
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Desde</label>
            <input 
              type="date" name="desde" defaultValue={fechaDesde}
              className="w-full p-3 md:p-4 border-2 border-black font-black uppercase italic text-xs md:text-sm outline-none focus:bg-black focus:text-white transition-all rounded-none"
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-[9px] font-black uppercase text-gray-400 ml-1">Hasta</label>
            <input 
              type="date" name="hasta" defaultValue={fechaHasta}
              className="w-full p-3 md:p-4 border-2 border-black font-black uppercase italic text-xs md:text-sm outline-none focus:bg-black focus:text-white transition-all rounded-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="flex-1 bg-black text-white px-6 py-4 font-black uppercase italic text-[10px] tracking-widest border-2 border-black active:bg-white active:text-black flex items-center justify-center gap-2">
              <Search size={14} /> Aplicar
            </button>
            <Link href="/admin/ventas" className="bg-gray-100 px-4 py-4 border-2 border-black font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-white flex items-center">
              Hoy
            </Link>
          </div>
        </form>
      </div>

      {/* TOTALES Y ACCESOS RÁPIDOS */}
      <div className="max-w-7xl mx-auto mb-12 space-y-6 md:space-y-8">
        
        {/* Fila 1: Totales (3 columnas) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          <div className="border-[3px] border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[9px] md:text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <BadgePercent size={14} /> Total Bruto
            </p>
            <p className="text-4xl md:text-6xl font-black italic tracking-tighter mt-2">{totalGeneral.toFixed(2)} <span className="text-xs not-italic">BS.</span></p>
          </div>
          <div className="bg-black text-white p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)]">
            <p className="text-[9px] md:text-[11px] font-black uppercase text-gray-500 tracking-widest flex items-center gap-2">
              <CreditCard size={14} /> Ingresos QR
            </p>
            <p className="text-4xl md:text-6xl font-black italic tracking-tighter mt-2 text-white">{totalQR.toFixed(2)} <span className="text-xs opacity-50">BS.</span></p>
          </div>
          <div className="border-[3px] border-black p-6 md:p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-[9px] md:text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
              <Banknote size={14} /> Efectivo Cash
            </p>
            <p className="text-4xl md:text-6xl font-black italic tracking-tighter mt-2">{totalEfectivo.toFixed(2)} <span className="text-xs not-italic">BS.</span></p>
          </div>
        </div>

        {/* Fila 2: Botones de Rankings (3 columnas) ✅ MODIFICADO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8">
          <TopProductos fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
          <BtnDevoluciones fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
          <BtnEmpleados fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
        </div>

      </div>

      {/* TABLA DESKTOP */}
      <div className="max-w-7xl mx-auto mb-20 hidden md:block border-[3px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white uppercase text-[10px] font-black tracking-[0.3em]">
              <th className="p-6 text-center">Time (BO)</th>
              <th className="p-6">Transacción / Detalles</th>
              <th className="p-6">Sucursal & Cliente</th>
              <th className="p-6 text-right">Monto</th>
              <th className="p-6 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y-[3px] divide-black">
            {ventas.map((v: any) => {
              const esAnulada = Number(v.total) === 0;
              return (
                <tr key={v.id_venta} className={`hover:bg-gray-50 transition-colors ${esAnulada ? 'bg-gray-100' : ''}`}>
                  <td className="p-6 border-r-[3px] border-black text-center font-black italic">
                    <span className="block text-2xl leading-none">
                      {formatearHoraBolivia(v.fecha_raw)}
                    </span>
                    <span className={`text-[9px] uppercase tracking-widest font-black ${esAnulada ? 'text-red-600' : 'text-gray-400'}`}>
                      {esAnulada ? 'VOID' : v.metodo_pago}
                    </span>
                  </td>
                  <td className="p-6 border-r-[3px] border-black">
                    <p className={`font-black uppercase italic text-xl leading-tight ${esAnulada ? 'line-through text-gray-400' : ''}`}>
                      {v.producto_nombre}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                      {v.modelos_detalle}
                    </p>
                  </td>
                  <td className="p-6 border-r-[3px] border-black">
                    <div className="mb-2">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-yellow-400 text-black border border-black italic">
                            {v.sucursal_nombre}
                        </span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-tighter">{v.cliente_full}</p>
                    <p className="text-[9px] text-gray-400 font-black uppercase mt-1 italic flex items-center gap-1">
                      <Terminal size={10} /> OP: {v.empleado_nombre}
                    </p>
                  </td>
                  <td className={`p-6 border-r-[3px] border-black text-right font-black text-4xl italic tracking-tighter ${esAnulada ? 'text-gray-300' : ''}`}>
                    {Number(v.total).toFixed(2)} <span className="text-xs">BS</span>
                  </td>
                  <td className="p-6 text-center bg-white">
                    {!esAnulada ? <BotonAnular idVenta={v.id_venta} /> : (
                      <span className="text-[10px] font-black uppercase text-white bg-red-600 px-4 py-2 italic border-2 border-black inline-block">Anulada</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MÓVIL */}
      <div className="md:hidden space-y-6 max-w-7xl mx-auto mb-20">
        {ventas.map((v: any) => {
          const esAnulada = Number(v.total) === 0;
          return (
            <div key={v.id_venta} className={`border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-5 relative overflow-hidden ${esAnulada ? 'bg-gray-50 opacity-75' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-3">
                <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <Clock size={14} strokeWidth={3} />
                        <span className="text-xl font-black italic tracking-tighter">
                            {formatearHoraBolivia(v.fecha_raw)}
                        </span>
                    </div>
                    <span className="text-[8px] font-black uppercase text-yellow-600 italic">
                        📍 {v.sucursal_nombre}
                    </span>
                </div>
                <span className="text-[9px] font-black uppercase bg-black text-white px-3 py-1 italic">
                  {v.metodo_pago}
                </span>
              </div>

              <div className="mb-4">
                <h3 className={`font-black uppercase italic text-2xl leading-none mb-1 ${esAnulada ? 'line-through' : ''}`}>
                  {v.producto_nombre}
                </h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                  {v.modelos_detalle}
                </p>
              </div>

              <div className="flex flex-col gap-2 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                  <User size={12} className="text-gray-400" />
                  <span>{v.cliente_full}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] font-black uppercase text-gray-400 italic">
                  <Terminal size={10} />
                  <span>OP: {v.empleado_nombre}</span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 -mx-5 -mb-5 p-4 border-t-[3px] border-black">
                <div className="font-black italic tracking-tighter text-3xl">
                  {Number(v.total).toFixed(2)} <span className="text-[10px] not-italic">BS</span>
                </div>
                {!esAnulada && <BotonAnular idVenta={v.id_venta} />}
              </div>
            </div>
          );
        })}
      </div>

      {ventas.length === 0 && (
        <div className="max-w-7xl mx-auto p-16 md:p-32 text-center border-[3px] border-black bg-gray-50 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-20">
          <p className="font-black text-gray-200 uppercase text-3xl md:text-6xl italic tracking-tighter">NO_RECORDS</p>
          <p className="text-[9px] md:text-[11px] font-black uppercase text-gray-300 mt-4 tracking-[0.3em]">Sin movimientos en este rango</p>
        </div>
      )}

      <footer className="max-w-7xl mx-auto pt-10 border-t-2 border-gray-100 text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-gray-300 italic flex justify-between pb-8">
        <span>Matt Bolivia Core</span>
        <span className="hidden sm:inline">2026 // AUDIT_MODE</span>
        <span>v2.1</span>
      </footer>
    </div>
  );
}