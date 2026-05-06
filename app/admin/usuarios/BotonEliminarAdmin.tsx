"use client";
import { eliminarAdmin } from "./actions";

export default function BotonEliminarAdmin({ id }: { id: number }) {
  return (
    <button 
      onClick={async () => {
        if(confirm("¿Eliminar este administrador? Perderá acceso inmediato.")) {
          await eliminarAdmin(id);
        }
      }}
      className="p-4 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white transition-colors"
    >
      🗑️
    </button>
  );
}