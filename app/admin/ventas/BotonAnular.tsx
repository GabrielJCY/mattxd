"use client";

import { anularVenta } from "./actions";

export default function BotonAnular({ idVenta }: { idVenta: number }) {
  const handleAnular = async () => {
    const confirmar = confirm("¿ESTÁS SEGURO? Se devolverá el stock y la venta quedará en 0 Bs.");
    
    if (confirmar) {
      const res = await anularVenta(idVenta);
      if (!res.success) {
        alert("Error al anular: " + res.error);
      }
    }
  };

  return (
    <button 
      onClick={handleAnular}
      className="text-[10px] font-black uppercase text-red-500 border border-red-200 px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition-all italic hover:shadow-md active:scale-95"
    >
      Anular
    </button>
  );
}