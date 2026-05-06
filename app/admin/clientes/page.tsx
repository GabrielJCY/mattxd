/**
 * --- CONFIGURACIÓN ANTI-CACHEO ---
 * force-dynamic: Evita que Next.js genere esta página como estática en el build.
 * revalidate = 0: Asegura que no se guarde en caché ni por un segundo.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import Link from "next/link";
import BotonEliminarCliente from "./BotonEliminarCliente";
import { 
  Users, 
  UserPlus, 
  Mail, 
  Phone, 
  Edit2, 
  LayoutDashboard, 
  ChevronRight,
  Search
} from "lucide-react";

export default async function AdminClientesPage() {
  // Traemos los clientes ordenados por nombre directamente de Turso/LibSQL
  const { rows } = await db.execute("SELECT id_cliente, nombre, apellido, correo, telefono FROM cliente ORDER BY nombre ASC");
  
  // Serialización segura de los datos para evitar errores de hidratación
  const clientes = JSON.parse(JSON.stringify(rows));

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        
        {/* NAVEGACIÓN - Adaptada para móvil */}
        <nav className="flex flex-wrap justify-between items-center gap-4 mb-8 md:mb-12">
          <Link 
            href="/admin" 
            className="group flex items-center gap-2 border-2 border-black px-4 py-2 hover:bg-black hover:text-white transition-all duration-300"
          >
            <LayoutDashboard size={14} />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:inline">Admin</span>
            <ChevronRight size={12} className="hidden sm:inline" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-black">Clientes</span>
          </div>
        </nav>

        {/* ENCABEZADO - Reorganizado en móvil */}
        <header className="relative mb-12 md:mb-16 border-b-[4px] md:border-b-[6px] border-black pb-8 md:pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-3 bg-black text-white px-3 py-1 md:px-4 md:py-1.5">
              <Users className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={3} />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Base de Datos Matt</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
              Gestión de <br />
              <span className="text-slate-200 not-italic">Clientes</span>
            </h1>
          </div>

          <Link 
            href="/admin/clientes/nuevo" 
            className="flex items-center justify-center gap-3 bg-black text-white px-6 py-4 md:px-8 md:py-4 border-4 border-black hover:bg-white hover:text-black transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            <UserPlus className="w-4 h-4 md:w-[18px] md:h-[18px]" strokeWidth={3} />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-center">Registrar Cliente</span>
          </Link>
        </header>

        {/* TABLA DE CLIENTES - Con scroll horizontal responsivo */}
        <div className="mb-4 md:hidden text-[9px] font-bold text-slate-400 italic">Desliza para ver más info →</div>
        <div className="border-4 border-black overflow-x-auto bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
          <table className="w-full text-left border-collapse min-w-[700px] md:min-w-full">
            <thead>
              <tr className="bg-black text-white text-[9px] font-black uppercase tracking-[0.3em]">
                <th className="p-4 md:p-6 border-r border-white/10 w-20 md:w-24 text-center italic">ID</th>
                <th className="p-4 md:p-6 border-r border-white/10">Información del Cliente</th>
                <th className="p-4 md:p-6 border-r border-white/10">Contacto Directo</th>
                <th className="p-4 md:p-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {clientes.map((c: any) => (
                <tr key={c.id_cliente} className="group hover:bg-slate-50 transition-colors">
                  {/* ID */}
                  <td className="p-4 md:p-6 border-r-4 border-black text-center">
                    <span className="text-[10px] md:text-xs font-black text-slate-300 group-hover:text-black transition-colors italic">
                      #{c.id_cliente}
                    </span>
                  </td>

                  {/* NOMBRE Y CORREO */}
                  <td className="p-4 md:p-6 border-r-4 border-black">
                    <div className="flex flex-col">
                      <span className="font-black text-base md:text-lg uppercase tracking-tight leading-none mb-2">
                        {c.nombre} {c.apellido}
                      </span>
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-blue-600 transition-colors">
                        <Mail size={12} />
                        <span className="text-[9px] md:text-[10px] font-bold lowercase tracking-tight break-all">
                          {c.correo}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* TELÉFONO */}
                  <td className="p-4 md:p-6 border-r-4 border-black">
                    <div className="inline-flex items-center gap-3 bg-slate-100 px-3 py-1.5 md:px-4 md:py-2 border-2 border-black group-hover:bg-black group-hover:text-white transition-all">
                      <Phone size={10} strokeWidth={3} className="md:w-3 md:h-3" />
                      <span className="text-[9px] md:text-[10px] font-black tracking-[0.1em]">
                        {c.telefono || "NO REGISTRADO"}
                      </span>
                    </div>
                  </td>

                  {/* ACCIONES */}
                  <td className="p-4 md:p-6 bg-slate-50/30">
                    <div className="flex justify-end items-center gap-4 md:gap-8">
                      <Link 
                        href={`/admin/clientes/editar/${c.id_cliente}`}
                        className="group/btn flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-black transition-all"
                      >
                        <Edit2 size={13} />
                        <span className="border-b-2 border-transparent group-hover/btn:border-black hidden sm:inline">Editar</span>
                      </Link>
                      <BotonEliminarCliente id={c.id_cliente} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ESTADO VACÍO */}
          {clientes.length === 0 && (
            <div className="p-20 md:p-32 text-center border-t-4 border-black flex flex-col items-center gap-4">
               <Search className="w-8 h-8 md:w-10 md:h-10 text-slate-200" />
               <p className="text-[9px] md:text-[10px] font-black uppercase text-slate-300 tracking-[0.4em] md:tracking-[0.5em] px-4">
                 Base de datos de clientes vacía
               </p>
            </div>
          )}
        </div>

        {/* FOOTER - Responsivo */}
        <footer className="mt-16 md:mt-20 pt-8 border-t-2 border-slate-100 flex flex-col md:flex-row justify-between gap-6 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-slate-300 italic text-center md:text-left">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 md:gap-4">
            <span>Matt Bolivia // CRM System</span>
            <div className="w-1 h-1 bg-slate-300 rounded-full hidden md:block" />
            <span className="w-full md:w-auto">Terminal 01</span>
          </div>
          <span>Registros Totales: {clientes.length}</span>
        </footer>
      </div>
    </div>
  );
}