import { db } from "@/src/lib/db";
import Link from "next/link";
import BotonEliminarAdmin from "./BotonEliminarAdmin";
import { 
  UserPlus, 
  ChevronLeft, 
  ShieldCheck, 
  Mail, 
  Edit3, 
  Terminal 
} from "lucide-react";

export default async function UsuariosPage() {
  const res = await db.execute("SELECT id_admin, nombre, apellido, correo FROM admin");
  const usuarios = JSON.parse(JSON.stringify(res.rows));

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white p-6 md:p-12">
      
      {/* NAVEGACIÓN SUPERIOR */}
      <nav className="max-w-5xl mx-auto mb-12 flex justify-between items-center">
        <Link 
          href="/admin" 
          className="group flex items-center gap-3 border-4 border-black px-6 py-2 hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-1"
        >
          <ChevronLeft size={18} strokeWidth={3} />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Dashboard</span>
        </Link>

        <div className="flex items-center gap-2 text-slate-300 italic">
          <Terminal size={14} />
          <span className="text-[9px] font-black uppercase tracking-[0.4em]">Auth_Root_Access</span>
        </div>
      </nav>

      {/* CABECERA EDITORIAL */}
      <header className="max-w-5xl mx-auto mb-16 border-b-[6px] border-black pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div>
          <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] text-black">
            Team <span className="text-slate-100 not-italic">Matt</span>
          </h1>
          <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-400 mt-4">
            Gestión de Privilegios de Administrador
          </p>
        </div>
        
        <Link 
          href="/admin/usuarios/nuevo" 
          className="group flex items-center gap-3 bg-black text-white px-10 py-5 border-4 border-black shadow-[8px_8px_0px_0px_rgba(226,232,240,1)] hover:shadow-none hover:bg-white hover:text-black transition-all"
        >
          <UserPlus size={20} strokeWidth={3} />
          <span className="font-black uppercase italic tracking-widest text-xs">Añadir Admin</span>
        </Link>
      </header>

      {/* LISTADO DE USUARIOS (FILAS INDUSTRIALES) */}
      <main className="max-w-5xl mx-auto space-y-4">
        {usuarios.map((user: any) => (
          <div 
            key={user.id_admin} 
            className="group relative bg-white border-4 border-black p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-50 transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none"
          >
            {/* INFO DEL USUARIO */}
            <div className="flex items-center gap-6">
              <div className="hidden md:flex bg-black text-white p-4 border-2 border-black">
                <ShieldCheck size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-black uppercase italic text-2xl tracking-tight leading-none group-hover:underline decoration-4">
                  {user.nombre} {user.apellido}
                </h3>
                <div className="flex items-center gap-2 mt-2 text-slate-400">
                  <Mail size={12} />
                  <p className="font-bold text-[11px] uppercase tracking-wider">{user.correo}</p>
                </div>
              </div>
            </div>

            {/* ACCIONES */}
            <div className="flex w-full md:w-auto gap-3 pt-4 md:pt-0 border-t-2 md:border-none border-slate-100">
              <Link 
                href={`/admin/usuarios/editar/${user.id_admin}`}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-black hover:bg-black hover:text-white transition-all font-black uppercase italic text-[10px] tracking-widest"
              >
                <Edit3 size={14} strokeWidth={3} /> EDITAR
              </Link>
              
              <BotonEliminarAdmin id={user.id_admin} />
            </div>

            {/* DECORACIÓN TÉCNICA */}
            <div className="absolute top-2 right-2 text-[8px] font-black text-slate-100 uppercase hidden group-hover:block">
              UID: {user.id_admin}
            </div>
          </div>
        ))}

        {usuarios.length === 0 && (
          <div className="border-4 border-dashed border-slate-200 p-20 text-center">
            <p className="font-black uppercase italic text-slate-300 text-2xl tracking-tighter">No hay administradores registrados</p>
          </div>
        )}
      </main>

      <footer className="max-w-5xl mx-auto mt-24 pt-8 border-t-2 border-slate-100 text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 italic flex justify-between">
        <span>Matt Bolivia Auth Module</span>
        <span>2026_CORE_SYSTEM</span>
      </footer>
    </div>
  );
}