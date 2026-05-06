"use client";

import { useState } from "react";
import { deleteCliente } from "./actions";
import { Trash2, Loader2 } from "lucide-react";

export default function BotonEliminarCliente({ id }: { id: number }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const manejarEliminar = async () => {
    // 1. Confirmación inicial de seguridad
    const confirmar = confirm(
      "ADVERTENCIA DE SISTEMA:\n\n¿ESTÁ SEGURO DE ELIMINAR ESTE REGISTRO? ESTA ACCIÓN ES IRREVERSIBLE."
    );

    if (confirmar) {
      setIsDeleting(true);
      
      try {
        const res = await deleteCliente(id);

        if (!res.success) {
          // 2. Aquí capturamos el mensaje de "BLOQUEADO POR VENTAS" que definimos en actions
          alert(`ERROR DE INTEGRIDAD:\n\n${res.message}`);
        }
      } catch (error) {
        alert("ERROR CRÍTICO: No se pudo conectar con la terminal de datos.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={manejarEliminar}
      disabled={isDeleting}
      className={`
        group flex items-center gap-2 font-black text-[9px] uppercase tracking-widest transition-all
        ${isDeleting 
          ? "text-slate-300 cursor-not-allowed" 
          : "text-red-500 hover:text-white hover:bg-red-500 border-2 border-transparent hover:border-red-600 px-2 py-1"
        }
      `}
    >
      {isDeleting ? (
        <>
          <Loader2 size={10} className="animate-spin" />
          Borrando...
        </>
      ) : (
        <>
          <Trash2 size={10} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
          Eliminar
        </>
      )}
    </button>
  );
}