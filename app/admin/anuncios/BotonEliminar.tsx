"use client";

import { eliminarAnuncio } from "./actions";

export default function BotonEliminar({ id }: { id: string | number }) {
  return (
    <form action={eliminarAnuncio} className="flex-1">
      <input type="hidden" name="id_anuncio" value={id} />
      <button 
        type="submit"
        onClick={(e) => {
          if (!confirm("¿Borrar este anuncio de Matt?")) {
            e.preventDefault();
          }
        }}
        className="w-full py-4 flex items-center justify-center bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm font-black uppercase italic text-xs"
      >
        Borrar 🗑️
      </button>
    </form>
  );
}