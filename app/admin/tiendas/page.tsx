/**
 * --- CONFIGURACIÓN DE RENDERIZADO DINÁMICO ---
 * force-dynamic: Asegura que Next.js no genere una versión estática de la lista de sedes.
 * revalidate = 0: Fuerza a que la consulta 'SELECT' se ejecute en cada visita a la página.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { executeQuery } from "@/src/lib/db";
import { Plus, Edit, Store, MapPin, Phone, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { BtnDeleteTienda } from "./btn-delete";

// CORRECCIÓN: La interfaz ahora usa id_sucursal
interface Sucursal {
  id_sucursal: number;
  nombre_tienda: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  horario: string;
}

export default async function AdminTiendasPage() {
  // CORRECCIÓN: Se cambió 'id' por 'id_sucursal' en el SELECT y el ORDER BY
  const tiendas = (await executeQuery(
    "SELECT id_sucursal, nombre_tienda, ciudad, direccion, telefono, horario FROM sucursal ORDER BY id_sucursal DESC"
  )) as unknown as Sucursal[];

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto min-h-screen bg-[#F8F9FA] text-black">
      
      {/* BOTÓN VOLVER AL DASHBOARD */}
      <Link 
        href="/admin" 
        className="inline-flex items-center gap-3 group mb-8 md:mb-10"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-zinc-200 flex items-center justify-center group-hover:bg-black group-hover:border-black group-hover:text-white transition-all duration-300">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        </div>
        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 group-hover:text-black transition-colors">
          Dashboard
        </span>
      </Link>

      {/* HEADER MONOCROMÁTICO */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 md:mb-16 border-b-4 border-black pb-8 md:pb-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-400">
            <Store size={14} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em]">Infrastructure</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic leading-none">
            Sedes <br /> <span className="text-zinc-300">Oficiales</span>
          </h1>
        </div>
        
        <Link 
          href="/admin/tiendas/nuevo" 
          className="w-full md:w-auto group relative flex items-center justify-center gap-4 bg-black text-white px-8 md:px-10 py-4 md:py-5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] hover:bg-zinc-800 transition-all overflow-hidden"
        >
          <Plus size={16} strokeWidth={3} /> 
          <span>Registrar Tienda</span>
          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </Link>
      </header>

      {/* LISTADO ESTILO MINIMALISTA */}
      <div className="space-y-6 md:space-y-4">
        <div className="hidden md:grid grid-cols-12 px-10 mb-4 text-[9px] font-black uppercase tracking-[0.5em] text-zinc-400">
          <div className="col-span-4">Establecimiento</div>
          <div className="col-span-3">Ubicación</div>
          <div className="col-span-3">Disponibilidad</div>
          <div className="col-span-2 text-right">Gestión</div>
        </div>

        {tiendas.map((tienda) => (
          <div 
            key={tienda.id_sucursal} 
            className="group flex flex-col md:grid md:grid-cols-12 md:items-center bg-white border border-zinc-200 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2rem] hover:border-black transition-all duration-500 md:hover:shadow-[20px_20px_60px_#bebebe,-20px_-20px_60px_#ffffff]"
          >
            {/* Información Principal */}
            <div className="md:col-span-4 mb-6 md:mb-0">
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black uppercase tracking-tighter italic leading-none mb-2 group-hover:text-zinc-500 transition-colors">
                  {tienda.nombre_tienda}
                </span>
                <span className="flex items-center gap-2 text-[8px] md:text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                  <div className="w-4 h-[1px] bg-zinc-200" /> Serial ID: {tienda.id_sucursal}
                </span>
              </div>
            </div>
            
            {/* Ubicación */}
            <div className="md:col-span-3 mb-6 md:mb-0">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] md:text-[11px] font-black uppercase text-black">{tienda.ciudad}</span>
                <span className="text-[9px] md:text-[10px] font-medium text-zinc-500 max-w-full md:max-w-[180px] leading-tight">
                  {tienda.direccion}
                </span>
              </div>
            </div>

            {/* Contacto y Horario */}
            <div className="md:col-span-3 mb-8 md:mb-0">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-tight text-zinc-600">
                  <Phone size={12} className="text-black" strokeWidth={3} />
                  <span>{tienda.telefono || "TBD"}</span>
                </div>
                <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-bold uppercase tracking-tight text-zinc-600">
                  <Clock size={12} className="text-black" strokeWidth={3} />
                  <span>{tienda.horario || "TBD"}</span>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="md:col-span-2 flex justify-between md:justify-end items-center gap-2 pt-6 md:pt-0 border-t md:border-t-0 border-zinc-100">
              <span className="md:hidden text-[8px] font-black uppercase tracking-widest text-zinc-300">Acciones de Sede</span>
              <div className="flex items-center gap-2">
                <Link 
                  href={`/admin/tiendas/editar/${tienda.id_sucursal}`}
                  className="p-3 md:p-4 bg-zinc-100 text-black rounded-full hover:bg-black hover:text-white transition-all duration-300"
                  title="Editar"
                >
                  <Edit size={16} />
                </Link>
                
                <div className="h-8 md:h-10 w-[1px] bg-zinc-100 mx-1 md:mx-2" />
                
                <BtnDeleteTienda id={tienda.id_sucursal} nombre={tienda.nombre_tienda} />
              </div>
            </div>
          </div>
        ))}

        {/* EMPTY STATE */}
        {tiendas.length === 0 && (
          <div className="py-20 md:py-32 border-2 border-dashed border-zinc-200 rounded-[2rem] md:rounded-[3rem] text-center">
            <div className="inline-flex p-4 md:p-6 bg-zinc-50 rounded-full mb-6">
                <Store size={28} className="text-zinc-300" />
            </div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] md:tracking-[1em] text-zinc-400 px-4">
              Zero Data Found
            </p>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <footer className="mt-12 md:mt-20 flex flex-col md:flex-row justify-between items-center gap-4 opacity-20 py-8 md:py-10 border-t border-zinc-200 italic text-center">
        <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] md:tracking-[0.8em]">Matt Bolivia Headquarters</p>
        <p className="text-[7px] md:text-[8px] font-bold uppercase">v.2.0.26</p>
      </footer>
    </div>
  );
}