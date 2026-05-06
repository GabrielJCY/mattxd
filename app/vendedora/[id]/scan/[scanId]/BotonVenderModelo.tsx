"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BotonVenderModelo({ id_modelo, id_sucursal }: { id_modelo: number, id_sucursal: number }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleVenta = async () => {
    if (!confirm("¿CONFIRMAR VENTA DE ESTA UNIDAD?")) return;
    
    setLoading(true);
    try {
      // Aquí llamarías a tu API o Server Action para descontar 1 del stock
      const res = await fetch('/api/ventas/procesar', {
        method: 'POST',
        body: JSON.stringify({ id_modelo, id_sucursal, cantidad: 1 })
      });

      if (res.ok) {
        alert("VENTA REGISTRADA");
        router.refresh(); // Actualiza el stock en pantalla
      }
    } catch (e) {
      alert("ERROR EN LA VENTA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleVenta}
      disabled={loading}
      className="bg-black text-white px-6 py-4 font-black text-[10px] uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_rgba(0,255,100,0.5)] active:translate-y-1 active:shadow-none transition-all flex items-center gap-2"
    >
      {loading ? "PROCESANDO..." : (
        <>
          <Check size={14} strokeWidth={4} />
          Vender Modelo
        </>
      )}
    </button>
  );
}