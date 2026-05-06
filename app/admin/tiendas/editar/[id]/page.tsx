/**
 * --- CONFIGURACIÓN DE RENDERIZADO DINÁMICO ---
 * force-dynamic: Obliga a Next.js a renderizar esta página en cada solicitud (Request Time).
 * revalidate = 0: Asegura que no se guarde ninguna versión en el caché del servidor.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { executeQuery } from "@/src/lib/db";
import { TiendaForm } from "../../tienda-form";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// CORRECCIÓN: La interfaz ahora refleja id_sucursal
interface Sucursal {
  id_sucursal: number;
  nombre_tienda: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  horario: string;
  google_maps_url: string;
  imagen_url: string;
}

export default async function EditarTiendaPage({ params }: { params: Promise<{ id: string }> }) {
  
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const idNumerico = parseInt(id, 10);

  if (isNaN(idNumerico)) {
    redirect("/admin/tiendas");
  }

  try {
    /**
     * CORRECCIÓN CRÍTICA: 
     * Se cambió 'id = ?' por 'id_sucursal = ?' para coincidir con el esquema de Turso/SQLite.
     */
    const res = (await executeQuery(
      "SELECT * FROM sucursal WHERE id_sucursal = ? LIMIT 1",
      [idNumerico]
    )) as unknown as Sucursal[];

    if (!res || res.length === 0) {
      redirect("/admin/tiendas");
    }

    // Serialización para evitar errores de objetos no planos entre Server y Client components
    const tienda = JSON.parse(JSON.stringify(res[0]));

    return (
      <div className="p-4 md:p-10 max-w-5xl mx-auto min-h-screen">
        {/* BOTÓN VOLVER */}
        <Link 
          href="/admin/tiendas" 
          className="flex items-center gap-2 text-zinc-500 hover:text-black transition-colors mb-8 md:mb-10 group w-fit"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Volver al Panel</span>
        </Link>

        {/* HEADER */}
        <header className="mb-8 md:mb-12">
          <div className="flex items-center gap-3 mb-4">
             <div className="h-px w-6 md:w-8 bg-zinc-800"></div>
             <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-600">Editor de Sede</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic text-black leading-none">
            Editar <br />
            <span className="text-zinc-400 not-italic">Sucursal</span>
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-6">
            <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em]">
              {/* CORRECCIÓN: tienda.id_sucursal */}
              ID de Registro: <span className="text-black">#{tienda.id_sucursal}</span>
            </p>
            <span className="hidden sm:inline text-zinc-200">—</span>
            <p className="text-zinc-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] truncate">
              {tienda.nombre_tienda}
            </p>
          </div>
        </header>

        {/* CONTENEDOR DEL FORMULARIO */}
        <div className="bg-[#F8F9FA] border border-zinc-100 p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl">
          <TiendaForm tienda={tienda} />
        </div>

        {/* FOOTER */}
        <footer className="mt-12 mb-8 text-center opacity-20">
            <p className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em]">Matt Bolivia Terminal</p>
        </footer>
      </div>
    );
  } catch (error) {
    console.error("ERROR EN DB:", error);
    redirect("/admin/tiendas");
  }
}