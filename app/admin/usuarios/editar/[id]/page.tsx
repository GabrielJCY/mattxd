import { db } from "@/src/lib/db";
import { notFound } from "next/navigation";
import FormularioAdmin from "../../FormularioAdmin";
import { editarAdmin } from "../../actions";

export default async function EditarUsuarioPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  
  const { id } = await params;
  const idAdmin = parseInt(id);

  if (isNaN(idAdmin)) notFound();

  try {
    const res = await db.execute("SELECT id_admin, nombre, apellido, correo FROM admin WHERE id_admin = ?", [idAdmin]);
    const usuario = res.rows[0];

    if (!usuario) notFound();

    // Limpiamos el objeto para pasarlo al componente de cliente
    const userData = JSON.parse(JSON.stringify(usuario));

    return (
      <div className="min-h-screen bg-white p-4 md:p-8 overflow-x-hidden">
        <div className="max-w-2xl mx-auto">
          {/* CABECERA - Tipografía fluida */}
          <header className="mb-8 md:mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-gray-900">
              Edit <br className="md:hidden" /> <span className="text-gray-200">User</span>
            </h1>
            <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400 mt-3 md:mt-2 ml-1 md:ml-2">
              Modificando perfil de {userData.nombre}
            </p>
          </header>

          {/* CONTENEDOR - Ajuste de radio y padding móvil */}
          <div className="bg-white border border-gray-100 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm">
            <FormularioAdmin 
              action={editarAdmin} 
              initialData={userData} 
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return (
      <div className="min-h-screen flex items-center justify-center p-10 text-center font-black italic uppercase tracking-widest text-slate-300">
        Error al cargar usuario.
      </div>
    );
  }
}