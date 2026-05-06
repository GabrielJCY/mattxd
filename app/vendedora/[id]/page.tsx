/** * INTERFAZ DE VENDEDORA OPTIMIZADA - MATT BOLIVIA 2026 */
export const dynamic = 'force-dynamic';

import { db } from "@/src/lib/db";
import { 
  Store, 
  PackageSearch, 
  History,
  QrCode,
  MapPin,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VendedoraDashboard({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Obtener datos de la sucursal (Usando id_sucursal)
  const { rows: sucursalData } = await db.execute(
    "SELECT * FROM sucursal WHERE id_sucursal = ?", 
    [id]
  );
  
  if (sucursalData.length === 0) redirect("/404");
  
  const sede = {
    id: Number(sucursalData[0].id_sucursal),
    nombre_tienda: String(sucursalData[0].nombre_tienda),
    direccion: String(sucursalData[0].direccion),
    ciudad: String(sucursalData[0].ciudad)
  };

  // Estética Matt: Color dinámico por sede para evitar errores de personal
  const accentColor = sede.id === 2 ? 'bg-emerald-600' : 'bg-black';
  const shadowStyle = sede.id === 2 ? 'shadow-[8px_8px_0px_0px_rgba(5,150,105,1)]' : 'shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]';

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans pb-10">
      
      {/* HEADER LIMPIO */}
      <header className="bg-white border-b-[4px] border-black p-6 sticky top-0 z-40">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${sede.id === 2 ? 'bg-emerald-500' : 'bg-black'} animate-pulse`} />
            <h1 className="text-2xl font-black uppercase italic tracking-tighter">
              {sede.nombre_tienda}
            </h1>
          </div>
          <div className="px-3 py-1 bg-zinc-100 border-2 border-black text-[9px] font-black uppercase italic">
            STAFF_ID: {sede.id}
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-6">
        
        {/* ACCIÓN PRINCIPAL: VENTA QR (Única vía de venta) */}
        <section className="pt-2">
          <p className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-[0.2em]">Operación Principal</p>
          <Link 
            href={`/vendedora/${id}/scan`} 
            className={`group relative w-full flex flex-col items-center justify-center gap-6 bg-white border-[4px] border-black p-12 ${shadowStyle} hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all overflow-hidden`}
          >
            {/* Efecto de fondo sutil */}
            <div className={`absolute inset-0 ${accentColor} opacity-0 group-hover:opacity-[0.03] transition-opacity`}></div>
            
            <div className={`p-6 ${accentColor} text-white rounded-full shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform`}>
              <QrCode size={54} strokeWidth={2.5} />
            </div>
            
            <div className="text-center">
              <p className="text-4xl font-black uppercase italic leading-none tracking-tighter">Venta Rápida</p>
              <p className="text-[10px] font-bold uppercase opacity-50 mt-3 tracking-[0.15em] flex items-center justify-center gap-2">
                Escaneo de Terminal QR <ChevronRight size={10} />
              </p>
            </div>
          </Link>
        </section>

        {/* ACCIONES DE CONSULTA Y CONTROL */}
        <section className="space-y-4">
          <p className="text-[10px] font-black uppercase text-gray-400 mb-3 ml-1 tracking-[0.2em]">Gestión de Piso</p>
          
          {/* CONSULTA DE STOCK - NOMBRE PROFESIONAL */}
          <Link 
            href={`/vendedora/${id}/stock`} 
            className="group flex items-center justify-between bg-black text-white p-6 border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            <div className="flex items-center gap-4">
              <PackageSearch size={28} className="text-zinc-400" />
              <div>
                <p className="text-xl font-black uppercase italic leading-none">Disponibilidad</p>
                <p className="text-[9px] font-bold uppercase text-zinc-500 tracking-widest mt-1">Consulta de unidades en sede</p>
              </div>
            </div>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* HISTORIAL DIARIO */}
         
        </section>

        {/* DATOS DE CONTEXTO (UBICACIÓN) */}
        <div className="pt-6 border-t-2 border-zinc-200">
          <div className="bg-zinc-100 p-5 border-l-[6px] border-black flex items-start gap-4">
            <MapPin size={20} className="text-black shrink-0 mt-0.5" />
            <div>
              <p className="text-[9px] font-black uppercase text-gray-500 tracking-tighter">Punto de Venta Actual</p>
              <p className="text-sm font-bold uppercase leading-tight italic">{sede.direccion}</p>
              <p className="text-[10px] font-black text-zinc-400 mt-1 uppercase">{sede.ciudad} _ BO</p>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="text-center mt-8 px-6">
        <div className="max-w-md mx-auto py-6 border-t border-zinc-200">
            <p className="text-[8px] font-black uppercase text-zinc-300 tracking-[0.5em] italic">
              Matt Bolivia // Core System v2.1 // 2026
            </p>
        </div>
      </footer>
    </div>
  );
}