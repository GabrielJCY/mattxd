import FormularioAdmin from "../FormularioAdmin";
import { crearAdmin } from "../actions";

export default function NuevoUsuarioPage() {
  return (
    <div className="min-h-screen bg-white p-4 md:p-8 overflow-x-hidden">
      <div className="max-w-2xl mx-auto">
        {/* CABECERA - Tipografía fluida */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none text-gray-900">
            Nuevo <br className="md:hidden" /> <span className="text-gray-200">Admin</span>
          </h1>
          <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-gray-400 mt-3 md:mt-2 ml-1 md:ml-2">
            Registrar nuevo acceso al panel
          </p>
        </header>

        {/* CONTENEDOR - Ajuste de radio y padding móvil */}
        <div className="bg-white border border-gray-100 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-sm">
          <FormularioAdmin action={crearAdmin} />
        </div>
      </div>
    </div>
  );
}