"use client";
import { useState } from "react";
import FilaProducto from "./FilaProducto";
import { Search } from "lucide-react";

interface ListaStockProps {
  productos: any[];
  todosLosModelos: any[];
  sedeId: number;
}

export default function ListaStockCliente({ productos, todosLosModelos, sedeId }: ListaStockProps) {
  const [busqueda, setBusqueda] = useState("");

  // Filtrado de productos por nombre
  const filtrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* BARRA DE BÚSQUEDA BRUTALISTA */}
      <div className="relative group px-4 md:px-0">
        <input
          type="text"
          placeholder="BUSCAR PRODUCTO POR NOMBRE..."
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-white border-[4px] border-black p-6 pl-16 font-black uppercase text-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:shadow-none focus:translate-x-1 focus:translate-y-1 transition-all outline-none placeholder:text-zinc-400"
        />
        <Search className="absolute left-10 md:left-6 top-1/2 -translate-y-1/2 text-black" size={24} strokeWidth={3} />
      </div>

      {/* VISTA DESKTOP (TABLA) */}
      <div className="hidden md:block border-[4px] border-black bg-white overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,0.1)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6 border-r-2 border-zinc-800">Producto / Descripción</th>
              <th className="p-6 text-center border-r-2 border-zinc-800 w-48">Stock Total</th>
              <th className="p-6 text-right w-64">Gestión de Inventario</th>
            </tr>
          </thead>
          <tbody className="divide-y-[3px] divide-black">
            {filtrados.length > 0 ? (
              filtrados.map(prod => (
                <FilaProducto 
                  key={prod.id_producto} 
                  producto={prod} 
                  // Filtramos modelos aquí para que FilaProducto reciba solo lo que le toca
                  modelos={todosLosModelos.filter(m => m.id_producto === prod.id_producto)} 
                  sedeId={sedeId} 
                />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-10 text-center font-black uppercase text-zinc-400 italic">
                  No se encontraron productos con ese nombre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VISTA MOBILE (CARDS) */}
      <div className="md:hidden space-y-6 px-4 pb-20">
        {filtrados.length > 0 ? (
          filtrados.map(prod => (
            <FilaProducto 
              key={prod.id_producto} 
              producto={prod} 
              modelos={todosLosModelos.filter(m => m.id_producto === prod.id_producto)} 
              isMobile={true} 
              sedeId={sedeId} 
            />
          ))
        ) : (
          <div className="p-10 text-center font-black uppercase text-zinc-400 border-4 border-dashed border-zinc-200">
            Sin resultados
          </div>
        )}
      </div>
    </div>
  );
}