// app/admin/pedidos/page.tsx

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import SelectorEstado from "./SelectorEstado";
import BotonEntregar from "./BotonEntregar"; 
import Link from "next/link";

/**
 * FUNCIÓN DE FORMATEO REAL (UTC -> BOLIVIA)
 * Toma el string ISO de la DB, lo marca como UTC y lo convierte 
 * a la zona horaria de Bolivia.
 */
const formatearFechaBolivia = (fechaStr: string) => {
  if (!fechaStr) return "S/F";
  
  try {
    // Forzamos a JS a entender que este string viene en UTC
    const fecha = new Date(fechaStr + " UTC");

    return fecha.toLocaleString("es-BO", {
      timeZone: "America/La_Paz",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).replace(",", " //");
    
  } catch (e) {
    console.error("Error en formateo:", e);
    return fechaStr;
  }
};

export default async function AdminPedidosPage() {
  // Encabezado con fecha actual local
  const fechaHoyHeader = new Date().toLocaleDateString("es-BO", {
    timeZone: "America/La_Paz",
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  // Consulta optimizada: Hemos añadido p.id_cliente para que el botón de entrega lo reconozca
  const res = await db.execute(`
    SELECT 
      p.id_pedido, 
      p.id_cliente, 
      p.fecha, 
      p.estado, 
      c.nombre as cliente_nombre, 
      c.apellido as cliente_apellido,
      prod.nombre as producto_nombre,
      prod.id_producto
    FROM pedido p
    JOIN cliente c ON p.id_cliente = c.id_cliente
    JOIN producto prod ON p.id_producto = prod.id_producto
    ORDER BY datetime(p.fecha) DESC
  `);

  // Usamos res.rows directamente para mayor performance
  const pedidos = res.rows as any[];

  const countPendientes = pedidos.filter((p: any) => p.estado === 'pendiente').length;
  const countConfirmados = pedidos.filter((p: any) => p.estado === 'confirmado').length;
  const countEntregados = pedidos.filter((p: any) => p.estado === 'entregado').length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-white min-h-screen font-sans">
      
      {/* CABECERA */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6 border-b-[4px] md:border-b-[6px] border-black pb-8">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-none italic">
            Lista de Pedidos
          </h1>
          <p className="text-zinc-400 font-bold text-[8px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mt-2">
            Gestión de Ventas // Sistema Matt Bolivia
          </p>
        </div>
        
        <div className="flex flex-col md:items-end gap-4">
          <Link 
            href="/admin" 
            className="w-full md:w-auto bg-black text-white px-6 md:px-8 py-4 font-black uppercase text-[10px] md:text-xs tracking-[0.2em] border-b-4 border-r-4 border-zinc-600 hover:bg-zinc-900 active:translate-x-1 active:translate-y-1 transition-all text-center"
          >
            ← Volver al Inicio
          </Link>
          <div className="text-left md:text-right">
            <p className="text-[9px] md:text-[10px] font-black text-black uppercase tracking-widest">Logística y Control</p>
            <p className="text-[11px] md:text-xs font-medium text-zinc-400 capitalize">
              {fechaHoyHeader}
            </p>
          </div>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-10 md:mb-16">
        <KPI className="border-amber-500 shadow-amber-500 text-amber-600" label="Por Atender" count={countPendientes} status="Pendientes" />
        <KPI className="border-blue-600 shadow-blue-600 text-blue-600" label="En Proceso" count={countConfirmados} status="Confirmados" />
        <KPI className="bg-black text-white border-black shadow-green-400" label="Ventas Exitosas" count={countEntregados} status="Entregados" isDark />
      </div>

      {/* TABLA / VISTA DE TARJETAS */}
      <div className="relative md:border-[4px] md:border-black md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden bg-white">
        <table className="hidden md:table w-full text-left border-collapse">
          <thead>
            <tr className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-6">Ref / Registro</th>
              <th className="p-6">Cliente</th>
              <th className="p-6">Producto / Artículo</th>
              <th className="p-6 text-center">Transacción</th>
              <th className="p-6 text-right">Gestión</th>
            </tr>
          </thead>
          <tbody className="divide-y-[2px] divide-black">
            {pedidos.map((pedido: any) => (
              <RowPedido key={pedido.id_pedido} pedido={pedido} />
            ))}
          </tbody>
        </table>

        {/* Vista Móvil */}
        <div className="flex flex-col gap-4 md:hidden">
          {pedidos.map((pedido: any) => (
            <CardPedidoMobile key={pedido.id_pedido} pedido={pedido} />
          ))}
        </div>
      </div>

      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] md:text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] md:tracking-[0.3em] text-center">
        <p>© 2026 Matt Bolivia // Sistema Central</p>
        <p className="hidden md:block">Estado del Sistema: Óptimo</p>
      </footer>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function RowPedido({ pedido }: { pedido: any }) {
  return (
    <tr className="group hover:bg-zinc-50 transition-colors">
      <td className="p-6">
        <div className="flex flex-col">
          <span className="font-black text-black text-lg italic">#{pedido.id_pedido}</span>
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
            {formatearFechaBolivia(pedido.fecha)}
          </span>
        </div>
      </td>
      <td className="p-6">
        <p className="font-black text-black text-sm uppercase tracking-tight">
          {pedido.cliente_nombre} {pedido.cliente_apellido}
        </p>
      </td>
      <td className="p-6">
        <span className="inline-block border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-tighter group-hover:bg-black group-hover:text-white transition-all">
          {pedido.producto_nombre}
        </span>
      </td>
      <td className="p-6 text-center">
        {pedido.estado === "confirmado" ? (
          <BotonEntregar 
            idPedido={pedido.id_pedido} 
            idProducto={pedido.id_producto} 
            idCliente={pedido.id_cliente} 
          />
        ) : (
          <span className="text-[9px] font-bold text-zinc-300 uppercase italic">Esperando confirmación</span>
        )}
      </td>
      <td className="p-6 text-right">
        <div className="flex items-center justify-end gap-4">
          <BadgeEstado estado={pedido.estado} />
          <div className="flex flex-col items-end gap-1">
            <SelectorEstado 
              idPedido={pedido.id_pedido} 
              idProducto={pedido.id_producto}
              estadoActual={pedido.estado} 
            />
          </div>
        </div>
      </td>
    </tr>
  );
}

function CardPedidoMobile({ pedido }: { pedido: any }) {
  return (
    <div className="border-[3px] border-black p-5 space-y-5 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="font-black text-2xl italic leading-none">#{pedido.id_pedido}</span>
          <span className="text-[9px] text-zinc-400 font-bold uppercase mt-1">
            {formatearFechaBolivia(pedido.fecha)}
          </span>
        </div>
        <BadgeEstado estado={pedido.estado} />
      </div>
      <div className="space-y-1">
        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Cliente</p>
        <p className="font-black text-black text-sm uppercase">{pedido.cliente_nombre} {pedido.cliente_apellido}</p>
      </div>
      <div className="space-y-2">
        <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest">Producto</p>
        <div className="bg-zinc-50 border-2 border-black p-3 text-[10px] font-black uppercase">
          {pedido.producto_nombre}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t-2 border-zinc-100 gap-4">
        {pedido.estado === "confirmado" ? (
           <BotonEntregar 
            idPedido={pedido.id_pedido} 
            idProducto={pedido.id_producto} 
            idCliente={pedido.id_cliente} 
          />
        ) : (
          <div className="h-10 flex items-center">
            <span className="text-[8px] font-bold text-zinc-300 uppercase italic">Requiere Confirmación</span>
          </div>
        )}
        <SelectorEstado 
          idPedido={pedido.id_pedido} 
          idProducto={pedido.id_producto}
          estadoActual={pedido.estado} 
        />
      </div>
    </div>
  );
}

function KPI({ className, label, count, status, isDark = false }: any) {
  return (
    <div className={`border-[3px] p-6 md:p-8 shadow-[6px_6px_0px_0px] ${className}`}>
      <p className={`font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-green-400' : ''}`}>{label}</p>
      <div className="flex items-end justify-between">
        <span className="text-5xl md:text-7xl font-black leading-none tracking-tighter">{count}</span>
        <div className="text-right">
          <span className={`block text-[9px] font-bold uppercase italic opacity-70`}>Estado:</span>
          <span className="text-[9px] font-black uppercase">{status}</span>
        </div>
      </div>
    </div>
  );
}

function BadgeEstado({ estado }: { estado: string }) {
  const styles: any = {
    pendiente: "bg-white text-amber-600 border-amber-500 shadow-[2px_2px_0px_0px_rgba(245,158,11,1)]",
    confirmado: "bg-white text-blue-600 border-blue-600 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]",
    entregado: "bg-black text-green-400 border-black shadow-[2px_2px_0px_0px_rgba(34,197,94,1)]",
    cancelado: "bg-white text-zinc-300 border-zinc-200 line-through opacity-50",
  };

  return (
    <span className={`${styles[estado] || "bg-zinc-100 text-zinc-400"} border-2 px-3 py-1 text-[9px] font-black uppercase tracking-widest`}>
      {estado}
    </span>
  );
}