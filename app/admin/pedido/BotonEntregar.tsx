"use client";

import { actualizarEstadoPedido } from "./actions"; // Ajusta la ruta a tu archivo de acciones
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  idPedido: number;
  idProducto: number;
  idCliente: number; // <--- AÑADIDO: Ahora el botón recibe al cliente
}

export default function BotonEntregar({ idPedido, idProducto, idCliente }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleEntrega = async () => {
    setLoading(true);
    try {
      // 1. Ejecutamos el UPDATE en la base de datos para cambiar a 'entregado'
      const res = await actualizarEstadoPedido(idPedido, "entregado");
      
      if (res.success) {
        // 2. REDIRECCIÓN CORREGIDA:
        // Ahora incluimos el id_cliente en la URL para que el formulario de venta 
        // pueda mostrar el nombre del cliente inmediatamente.
        router.push(`/admin/ventas/nueva?id_pedido=${idPedido}&id_producto=${idProducto}&id_cliente=${idCliente}`);
      } else {
        alert("Error al actualizar el estado del pedido");
      }
    } catch (error) {
      console.error("Error crítico en el botón de entrega:", error);
      alert("Ocurrió un error al procesar la entrega");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleEntrega}
      disabled={loading}
      className="bg-green-500 text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b-4 border-r-4 border-green-700 hover:bg-green-600 active:border-0 active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Procesando...
        </>
      ) : (
        "Entregado →"
      )}
    </button>
  );
}