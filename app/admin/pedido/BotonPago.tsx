"use client";
import { useState } from "react";
import { registrarPagoPedido } from "./actions";

export default function BotonPago({ idPedido }: { idPedido: number }) {
  const [loading, setLoading] = useState(false);

  const ejecutarPago = async (metodo: 'QR' | 'Efectivo') => {
    const monto = prompt("Introduce el monto recibido (Bs.):", "150");
    if (!monto || isNaN(Number(monto))) return;

    setLoading(true);
    const res = await registrarPagoPedido(idPedido, Number(monto), metodo);
    setLoading(false);

    if (res.success) {
      alert(`¡Pago de ${monto} Bs por ${metodo} registrado!`);
    }
  };

  return (
    <div className="flex gap-1">
      <button
        disabled={loading}
        onClick={() => ejecutarPago('QR')}
        className="bg-purple-50 text-purple-600 px-2 py-1 rounded-md text-[8px] font-black uppercase border border-purple-100 hover:bg-purple-600 hover:text-white transition-all"
      >
        + QR
      </button>
      <button
        disabled={loading}
        onClick={() => ejecutarPago('Efectivo')}
        className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-[8px] font-black uppercase border border-green-100 hover:bg-green-600 hover:text-white transition-all"
      >
        + EFECTIVO
      </button>
    </div>
  );
}