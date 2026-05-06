"use client";

import { useState, useEffect } from "react";
// Se asume que estas acciones ya incluyen 'revalidatePath' en su lógica interna
import { getEmpleados, crearEmpleado, eliminarEmpleado, editarEmpleado } from "./actions";
import { 
  UserPlus, 
  UserCog, 
  Mail, 
  Phone, 
  Trash2, 
  Edit3, 
  X, 
  Contact2, 
  Shield, 
  ArrowLeft, 
  Loader2 
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [editando, setEditando] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * CARGA DE DATOS SIN CACHÉ
   * Al ser llamada en useEffect y tras cada mutación, asegura frescura de datos.
   */
  const cargarDatos = async () => {
    try {
      const data = await getEmpleados();
      setEmpleados(data || []);
    } catch (error) {
      console.error("Error al sincronizar staff:", error);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleEliminar = async (id: number, nombre: string) => {
    if (confirm(`¿ELIMINAR ACCESO A ${nombre.toUpperCase()}?`)) {
      setLoading(true);
      const res = await eliminarEmpleado(id);
      
      if (res && !res.success) {
        alert(res.message);
      } else {
        // La acción del servidor ya debió invalidar el caché, ahora refrescamos UI
        await cargarDatos();
      }
      setLoading(false);
    }
  };

  const handleFormAction = async (formData: FormData) => {
    setLoading(true);
    try {
      if (editando) {
        await editarEmpleado(formData);
      } else {
        await crearEmpleado(formData);
      }
      
      setEditando(null);
      // Forzamos la actualización de la lista para evitar datos fantasma
      await cargarDatos();
      
      // Reseteo manual del formulario para mayor seguridad
      const form = document.getElementById("staff-form") as HTMLFormElement;
      if (form) form.reset();
      
    } catch (error) {
      console.error("Error en la operación:", error);
      alert("Error al procesar la solicitud en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-10 bg-[#f4f4f4] min-h-screen font-sans selection:bg-black selection:text-white text-black">
      
      {/* HEADER TIPO REVISTA */}
      <header className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <button 
            onClick={() => router.back()} 
            className="group flex items-center gap-2 px-4 py-2 border-2 border-black rounded-full hover:bg-black hover:text-white transition-all active:scale-95 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none bg-white"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
          </button>

          <div className="space-y-2">
            <div className="flex items-center gap-3 text-black/40 mb-2">
              <Shield size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Administrative Security Node</span>
            </div>
            <h1 className="text-8xl font-black uppercase italic tracking-tighter leading-[0.8] text-black">
              Staff <br /> <span className="text-white drop-shadow-[2px_2px_0_black] [-webkit-text-stroke:1px_black]">Matt</span>
            </h1>
          </div>
        </div>
        
        <div className="bg-black text-white p-6 rounded-2xl flex items-center gap-6 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)]">
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase opacity-50">Personal Activo</p>
            <p className="text-4xl font-black italic">{empleados.length}</p>
          </div>
          <Contact2 size={40} className="opacity-20" />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* FORMULARIO DE CONTROL */}
        <div className="lg:col-span-4">
          <div className="bg-white border-4 border-black p-8 rounded-[2rem] sticky top-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {editando ? <UserCog className="text-black" /> : <UserPlus className="text-black" />}
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                  {editando ? "Modificar Ficha" : "Alta de Staff"}
                </h2>
              </div>
              {loading && <Loader2 size={18} className="animate-spin text-black/20" />}
            </div>
            
            <form id="staff-form" action={handleFormAction} className="space-y-4">
              {editando && <input type="hidden" name="id_empleado" value={editando.id_empleado} />}

              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase ml-2 tracking-widest text-black/40">Identidad</label>
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" name="nombre" placeholder="NOMBRE" required 
                    defaultValue={editando?.nombre || ""} key={editando ? `e-n-${editando.id_empleado}` : "n-n"}
                    className="w-full p-4 bg-gray-50 rounded-xl font-bold uppercase text-[11px] border-2 border-transparent focus:border-black transition-all outline-none" />
                  <input type="text" name="apellido" placeholder="APELLIDO" required 
                    defaultValue={editando?.apellido || ""} key={editando ? `e-a-${editando.id_empleado}` : "n-a"}
                    className="w-full p-4 bg-gray-50 rounded-xl font-bold uppercase text-[11px] border-2 border-transparent focus:border-black transition-all outline-none" />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase ml-2 tracking-widest text-black/40">Contacto</label>
                <div className="relative">
                  <Mail className="absolute right-4 top-4 text-black/20" size={16} />
                  <input type="email" name="correo" placeholder="EMAIL CORPORATIVO" required 
                    defaultValue={editando?.correo || ""} key={editando ? `e-c-${editando.id_empleado}` : "n-c"}
                    className="w-full p-4 bg-gray-50 rounded-xl font-bold uppercase text-[11px] border-2 border-transparent focus:border-black transition-all outline-none" />
                </div>
                <div className="relative mt-2">
                  <Phone className="absolute right-4 top-4 text-black/20" size={16} />
                  <input type="text" name="telefono" placeholder="WHATSAPP / CEL" required 
                    defaultValue={editando?.telefono || ""} key={editando ? `e-t-${editando.id_empleado}` : "n-t"}
                    className="w-full p-4 bg-gray-50 rounded-xl font-bold uppercase text-[11px] border-2 border-transparent focus:border-black transition-all outline-none" />
                </div>
              </div>
              
              <div className="space-y-1 pt-2">
                <label className="text-[9px] font-black uppercase ml-2 tracking-widest text-black/40">Seguridad</label>
                <input type="password" name="password" 
                  placeholder={editando ? "DEJAR VACÍO PARA MANTENER" : "ASIGNAR CONTRASEÑA"} 
                  required={!editando}
                  className="w-full p-4 bg-gray-100 rounded-xl font-bold uppercase text-[11px] border-2 border-dashed border-gray-300 focus:border-black focus:border-solid transition-all outline-none text-black" />
              </div>
              
              <div className="flex gap-2 pt-4">
                <button 
                  disabled={loading}
                  type="submit" 
                  className="flex-1 py-5 bg-black text-white rounded-2xl font-black uppercase italic hover:bg-zinc-800 transition-all text-sm tracking-widest shadow-lg active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : editando ? <><Edit3 size={18} /> Actualizar</> : <><UserPlus size={18} /> Registrar</>}
                </button>
                
                {editando && (
                  <button type="button" onClick={() => setEditando(null)}
                    className="px-6 bg-gray-100 text-black rounded-2xl font-black hover:bg-red-500 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* LISTADO DE STAFF */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-4 mb-10">
             <div className="h-[2px] flex-1 bg-black/10"></div>
             <p className="text-[10px] font-black uppercase tracking-[0.5em] text-black/30 italic">Staff Directory</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {empleados.map((emp) => (
              <motion.div 
                layout
                key={emp.id_empleado} 
                className="relative bg-white border-2 border-black rounded-[2.5rem] overflow-hidden group hover:shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-black/5 group-hover:bg-black transition-colors" />
                
                <div className="p-8 pl-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">
                        ID: {String(emp.id_empleado).padStart(3, '0')}
                      </span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => { setEditando(emp); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="p-2 hover:bg-black hover:text-white rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          disabled={loading}
                          onClick={() => handleEliminar(emp.id_empleado, emp.nombre)}
                          className="p-2 hover:bg-red-600 hover:text-white rounded-lg transition-colors text-red-600 disabled:opacity-30"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-3xl font-black uppercase italic leading-[0.9] tracking-tighter mb-4">
                      {emp.nombre} <br />
                      <span className="text-black/20 group-hover:text-black transition-colors">{emp.apellido}</span>
                    </h3>
                  </div>

                  <div className="space-y-2 pt-6 border-t border-black/5">
                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Mail size={12} className="shrink-0" />
                      <p className="text-[10px] font-bold uppercase truncate">{emp.correo}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={12} className="shrink-0" />
                      <p className="text-[10px] font-black uppercase italic tracking-wider">{emp.telefono}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {empleados.length === 0 && (
              <div className="col-span-full py-32 text-center border-4 border-dashed border-black/10 rounded-[3rem]">
                <Contact2 size={60} className="mx-auto mb-4 opacity-10" />
                <p className="text-black/10 font-black italic uppercase text-4xl tracking-tighter underline decoration-double">No Staff Data</p>
              </div>
            )}
          </div>
        </div>

      </div>

      <footer className="mt-20 pt-10 border-t border-black/5 flex justify-between items-center opacity-20">
        <p className="text-[9px] font-black uppercase tracking-[0.6em]">Matt Bolivia Protocol</p>
        <p className="text-[9px] font-bold uppercase italic">V. 2.0 Core</p>
      </footer>
    </div>
  );
}