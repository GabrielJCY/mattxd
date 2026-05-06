/**
 * --- CONFIGURACIÓN ANTI-CACHEO ---
 * force-dynamic: Evita que Next.js genere esta página como estática durante el build.
 * revalidate = 0: Garantiza que la consulta a la base de datos se realice en cada visita.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import FormularioCliente from "../../FormularioCliente";
import Link from "next/link";
import { notFound } from "next/navigation";
import { 
  ArrowLeft, 
  UserCog, 
  Fingerprint, 
  ShieldCheck,
  Database
} from "lucide-react";

// Definimos params como una Promesa para compatibilidad con Next.js 15+
export default async function EditarClientePage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  
  // 1. Resolvemos los parámetros de la URL
  const resolvedParams = await params;
  const id_numero = parseInt(resolvedParams.id);

  // Validación de seguridad inicial
  if (isNaN(id_numero)) {
    notFound();
  }

  try {
    // 2. Buscamos los datos actuales del cliente en Turso (LibSQL)
    const res = await db.execute({
      sql: "SELECT id_cliente, nombre, apellido, correo, telefono FROM cliente WHERE id_cliente = ?",
      args: [id_numero]
    });

    const clienteRaw = res.rows[0];

    // Si el ID no existe en la DB, disparamos el error 404 de Next.js
    if (!clienteRaw) {
      notFound();
    }

    // 3. Serialización profunda para evitar errores de hidratación entre Server/Client
    const cliente = JSON.parse(JSON.stringify(clienteRaw));

    return (
      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
          
          {/* NAVEGACIÓN SUPERIOR */}
          <Link 
            href="/admin/clientes" 
            className="group inline-flex items-center gap-3 mb-12"
          >
            <div className="border-2 border-black p-1.5 group-hover:bg-black group-hover:text-white transition-all">
              <ArrowLeft size={16} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Cancelar y volver al listado</span>
          </Link>

          {/* ENCABEZADO DE EDICIÓN */}
          <header className="relative mb-16 border-b-[6px] border-black pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-3 bg-black text-white px-4 py-1.5">
                  <UserCog size={18} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Panel de Modificación</span>
                </div>
                <h1 className="text-5xl font-black uppercase tracking-tighter leading-none italic">
                  Editar <span className="text-slate-200 not-italic">Perfil</span>
                </h1>
              </div>

              {/* BADGE DE ID */}
              <div className="flex items-center gap-3 border-l-4 border-black pl-6 italic">
                <Fingerprint size={24} className="text-slate-300" />
                <div>
                  <p className="text-[24px] font-black leading-none mb-1">#{id_numero}</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">ID de Cliente</p>
                </div>
              </div>
            </div>
          </header>

          {/* CONTENEDOR DEL FORMULARIO */}
          <div className="relative">
            {/* Elemento Decorativo: "Sello de Seguridad" */}
            <div className="absolute -top-6 -right-6 hidden lg:flex flex-col items-center gap-2 opacity-10">
               <ShieldCheck size={80} strokeWidth={1} />
               <span className="text-[8px] font-black uppercase tracking-[1em] rotate-90 mt-12">VERIFIED</span>
            </div>

            <div className="bg-white border-4 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-1 md:p-2">
               <div className="border-2 border-slate-100 p-8 md:p-12">
                  <FormularioCliente cliente={cliente} />
               </div>
            </div>
          </div>

          {/* FOOTER DE ESTADO */}
          <footer className="mt-20 flex flex-col md:flex-row items-center justify-between border-t-2 border-slate-100 pt-8 gap-6">
            <div className="flex items-center gap-4 text-slate-300">
              <Database size={14} />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] italic">
                Sincronizado con Turso DB // Matt Bolivia Audit v2.0
              </p>
            </div>
            
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terminal Activa</span>
            </div>
          </footer>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error crítico en la carga de cliente:", error);
    notFound();
  }
}