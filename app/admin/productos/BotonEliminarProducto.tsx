"use client";

import { useState } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { deleteProducto } from "./actions";

interface Props {
  id: number;
  nombre: string;
}

export default function BotonEliminarProducto({ id, nombre }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEliminar = async () => {
    // 1. Confirmación inicial estética
    const confirmar = window.confirm(
      `SISTEMA DE CONTROL DE INVENTARIO\n\n` +
      `¿Desea proceder con la eliminación de:\n"${nombre.toUpperCase()}"?\n\n` +
      `Esta acción es irreversible.`
    );

    if (!confirmar) return;

    setIsDeleting(true);

    try {
      // 2. Llamamos a la acción (que internamente cuenta los modelos)
      const res = await deleteProducto(id);

      if (res?.error) {
        // 📢 SI TIENE MODELOS: El servidor nos devuelve el mensaje de error
        // y nosotros lo mostramos en un alert profesional.
        alert(`❌ ACCIÓN DENEGADA\n\n${res.error}`);
      } else {
        // ÉXITO: El revalidatePath de la acción actualizará la tabla sola.
        console.log("Producto eliminado correctamente.");
      }
    } catch (err) {
      alert("Error crítico: No se pudo conectar con el servidor de base de datos.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleEliminar}
      disabled={isDeleting}
      className={`
        flex items-center justify-center p-2.5 rounded-xl transition-all duration-200
        ${isDeleting 
          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
          : "text-slate-400 hover:text-red-500 hover:bg-red-50 active:scale-90"
        }
      `}
      title="Eliminar del sistema"
    >
      {isDeleting ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Trash2 size={18} />
      )}
    </button>
  );
}