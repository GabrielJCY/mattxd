"use client";

import { deleteCategoria } from "./actions";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export default function BotonEliminar({ id }: { id: number }) {
  const [cargando, setCargando] = useState(false);

  const handleEliminar = async () => {
    // 1. Confirmación de seguridad
    const confirmar = confirm("¿ESTÁS SEGURO DE ELIMINAR ESTA CATEGORÍA? ESTA ACCIÓN ES IRREVERSIBLE.");
    if (!confirmar) return;

    setCargando(true);

    try {
      // 2. Ejecutar la acción y capturar la respuesta
      const resultado = await deleteCategoria(id);

      // 3. Manejar el bloqueo si hay productos registrados
      if (resultado?.error) {
        alert(resultado.error);
      }
    } catch (err) {
      alert("ERROR CRÍTICO: NO SE PUDO CONECTAR CON EL SERVIDOR.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleEliminar}
      disabled={cargando}
      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
        cargando 
          ? "text-slate-200 cursor-not-allowed" 
          : "text-slate-400 hover:text-black"
      }`}
    >
      {cargando ? (
        <span className="animate-pulse">PROCESANDO...</span>
      ) : (
        <>
          <Trash2 size={14} strokeWidth={2.5} />
          <span>Eliminar</span>
        </>
      )}
    </button>
  );
}