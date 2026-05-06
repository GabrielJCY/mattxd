"use client";

import { useState } from "react";
import { saveCliente } from "./actions";

interface FormularioClienteProps {
  cliente?: {
    id_cliente: number;
    nombre: string;
    apellido: string;
    correo: string;
    telefono: string;
  };
}

export default function FormularioCliente({ cliente }: FormularioClienteProps) {
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setMensaje("");
    
    const res = await saveCliente(formData);
    
    setLoading(false);
    if (res.success) {
      setMensaje(cliente ? "¡DATOS ACTUALIZADOS CORRECTAMENTE!" : "¡CLIENTE REGISTRADO EXITOSAMENTE!");
      
      // Si estamos creando (no hay cliente previo), limpiamos el formulario
      if (!cliente) {
        (document.getElementById("cliente-form") as HTMLFormElement).reset();
      }
    } else {
      setMensaje(res.message || "HUBO UN ERROR EN EL PROCESO.");
    }
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm max-w-2xl mx-auto">
      <form id="cliente-form" action={handleSubmit} className="space-y-6">
        
        {/* ID oculto para la edición */}
        {cliente && <input type="hidden" name="id_cliente" value={cliente.id_cliente} />}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NOMBRE */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2 text-italic">Nombre</label>
            <input 
              name="nombre" 
              required 
              type="text" 
              defaultValue={cliente?.nombre || ""}
              placeholder="EJ: JUAN"
              className="w-full bg-gray-50 border-none py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs uppercase transition-all"
            />
          </div>

          {/* APELLIDO */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Apellido</label>
            <input 
              name="apellido" 
              type="text" 
              defaultValue={cliente?.apellido || ""}
              placeholder="EJ: PEREZ"
              className="w-full bg-gray-50 border-none py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs uppercase transition-all"
            />
          </div>
        </div>

        {/* CORREO */}
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2">Correo Electrónico</label>
          <input 
            name="correo" 
            required 
            type="email" 
            defaultValue={cliente?.correo || ""}
            placeholder="JUAN@MATT.BO"
            className="w-full bg-gray-50 border-none py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs lowercase transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TELÉFONO */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2 text-italic">Teléfono / WhatsApp</label>
            <input 
              name="telefono" 
              type="text" 
              defaultValue={cliente?.telefono || ""}
              placeholder="+591 ..."
              className="w-full bg-gray-50 border-none py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs transition-all"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 ml-2 text-italic">
               {cliente ? "Nueva Contraseña" : "Contraseña Temporal"}
            </label>
            <input 
              name="password" 
              required={!cliente} // Obligatorio solo al crear
              type="password" 
              placeholder={cliente ? "DEJAR EN BLANCO PARA MANTENER" : "******"}
              className="w-full bg-gray-50 border-none py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-xs transition-all"
            />
          </div>
        </div>

        {mensaje && (
          <p className={`text-[10px] font-black text-center uppercase tracking-widest italic ${mensaje.includes("EXITOSAMENTE") || mensaje.includes("ACTUALIZADOS") ? 'text-green-500' : 'text-red-500'}`}>
            {mensaje}
          </p>
        )}

        <button 
          disabled={loading}
          type="submit"
          className="w-full bg-black text-white py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-gray-100"
        >
          {loading ? "PROCESANDO..." : (cliente ? "GUARDAR CAMBIOS" : "CONFIRMAR REGISTRO")}
        </button>
      </form>
    </div>
  );
}