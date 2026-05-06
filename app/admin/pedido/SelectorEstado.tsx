"use client";

import { useState } from "react";
import { actualizarEstadoPedido } from "./actions";

interface Props {
  idPedido: number;
  idProducto: number;
  estadoActual: string;
}

export default function SelectorEstado({ idPedido, idProducto, estadoActual }: Props) {
  const [loading, setLoading] = useState(false);

  const cambiarEstado = async (nuevoEstado: string) => {
    // Si ya tiene ese estado, no hacemos nada
    if (nuevoEstado === estadoActual) return;

    // Confirmación para cambios importantes
    const mensaje = nuevoEstado === "cancelado" 
      ? "¿Estás seguro de cancelar este pedido?" 
      : `¿Cambiar estado a ${nuevoEstado.toUpperCase()}?`;

    if (!confirm(mensaje)) return;

    setLoading(true);
    // Nota: Pasamos 0 o null en el id_modelo porque aquí solo cambiamos estado,
    // el descuento real de stock se hará en la página de /ventas/nueva
    const res = await actualizarEstadoPedido(idPedido, nuevoEstado, 0); 
    setLoading(false);

    if (res.success) {
      window.location.reload(); // Refrescamos para ver el cambio en la tabla
    } else {
      alert("Hubo un error al actualizar el estado.");
    }
  };

  // Si ya está entregado, no mostramos acciones
  if (estadoActual === "entregado") return null;

  return (
    <div className="flex gap-2 justify-end items-center">
      
      {/* BOTÓN CONFIRMAR (Solo aparece si está pendiente) */}
      {estadoActual === "pendiente" && (
        <button
          disabled={loading}
          onClick={() => cambiarEstado("confirmado")}
          className="px-3 py-1 bg-blue-600 text-white border-b-2 border-blue-800 text-[9px] font-black uppercase hover:bg-blue-700 active:translate-y-[1px] transition-all disabled:opacity-50"
        >
          Confirmar
        </button>
      )}

      {/* BOTÓN CANCELAR (Aparece siempre que no esté cancelado) */}
      {estadoActual !== "cancelado" && (
        <button
          disabled={loading}
          onClick={() => cambiarEstado("cancelado")}
          title="Cancelar Pedido"
          className="px-2 py-1 bg-white text-zinc-400 border-2 border-zinc-200 text-[9px] font-black uppercase hover:border-red-500 hover:text-red-500 transition-all disabled:opacity-50"
        >
          ✕
        </button>
      )}

      {/* INDICADOR SI YA ESTÁ CANCELADO */}
      {estadoActual === "cancelado" && (
        <span className="text-[8px] font-black text-red-400 uppercase italic">
          Pedido Anulado
        </span>
      )}
    </div>
  );
}