import { db } from "@/src/lib/db";
import { notFound } from "next/navigation";
import FormularioAnuncio from "../../nuevo/FormularioAnuncio";
import { editarAnuncio } from "../../actions";
import { ChevronLeft, Edit3, Database, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function EditarAnuncioPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  
  const resolvedParams = await params;
  const idAnuncio = parseInt(resolvedParams.id);

  if (isNaN(idAnuncio)) {
    notFound();
  }

  try {
    const [resAnuncio, resProductos] = await Promise.all([
      db.execute("SELECT * FROM anuncio WHERE id_anuncio = ?", [idAnuncio]),
      db.execute("SELECT id_producto, nombre FROM producto ORDER BY nombre ASC")
    ]);

    const anuncio = resAnuncio.rows[0];
    const productos = JSON.parse(JSON.stringify(resProductos.rows));

    if (!anuncio) {
      notFound();
    }

    const anuncioData = JSON.parse(JSON.stringify(anuncio));

    return (
      <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white p-6 md:p-12 flex flex-col items-center">
        
        {/* NAVEGACIÓN DE RETORNO */}
        <div className="w-full max-w-2xl mb-12 flex justify-start">
          <Link 
            href="/admin/anuncios" 
            className="group flex items-center gap-3 border-4 border-black px-6 py-2 hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none active:translate-y-1"
          >
            <ChevronLeft size={18} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Volver a Ads</span>
          </Link>
        </div>

        <div className="w-full max-w-2xl">
          {/* CABECERA BRUTALISTA */}
          <header className="mb-16 border-b-[6px] border-black pb-10 relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-black text-white p-2 border-2 border-black">
                <Edit3 size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">
                Data Modifier // Matt Bolivia
              </h2>
            </div>
            
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] text-black">
              Edit <span className="text-slate-100 not-italic">Ad</span>
            </h1>
            
            <div className="absolute -right-2 bottom-4 flex items-center gap-2 bg-slate-100 px-4 py-2 border-2 border-black rotate-2 shadow-md">
              <Database size={12} />
              <span className="text-[10px] font-black uppercase tracking-widest text-black">
                ID: {idAnuncio}
              </span>
            </div>
          </header>

          {/* CONTENEDOR DEL FORMULARIO */}
          <div className="bg-white border-4 border-black p-8 md:p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] mb-20 relative overflow-hidden">
            {/* Decoración lateral industrial */}
            <div className="absolute top-0 right-0 w-2 h-full bg-slate-100" />
            
            <FormularioAnuncio 
              productos={productos} 
              action={editarAnuncio} 
              initialData={anuncioData} 
            />
          </div>

          {/* FOOTER DE SEGURIDAD */}
          <footer className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 italic border-t-2 border-slate-100 pt-8">
            <span>Terminal: Edit_Mode_Active</span>
            <span>Update Ref: 2026_MB</span>
          </footer>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error cargando anuncio:", error);
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full border-8 border-black p-12 shadow-[20px_20px_0px_0px_rgba(239,68,68,1)] flex flex-col items-center text-center space-y-6">
          <AlertTriangle size={64} className="text-red-500" />
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
            System <span className="text-red-500">Error</span>
          </h2>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-relaxed">
            No se pudo establecer conexión con el registro de la base de datos de Matt Bolivia.
          </p>
          <Link 
            href="/admin/anuncios" 
            className="w-full bg-black text-white py-4 font-black uppercase italic text-xs tracking-widest hover:bg-red-500 transition-colors"
          >
            Reintentar Acceso
          </Link>
        </div>
      </div>
    );
  }
}