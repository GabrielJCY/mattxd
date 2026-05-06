"use client";
import { useState } from "react";
import { Search, PackageSearch } from "lucide-react";
import FilaProducto from "./FilaProducto"; // Asegúrate de que FilaProducto esté en la misma carpeta

interface ListaStockProps {
  productos: any[];
  todosLosModelos: any[];
  sedeId: number;
}

export default function ListaStockCliente({ productos, todosLosModelos, sedeId }: ListaStockProps) {
  const [busqueda, setBusqueda] = useState("");

  // Filtrado de productos por nombre (ignore case)
  const filtrados = productos.filter(p => 
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* BARRA DE BÚSQUEDA BRUTALISTA */}
      <div className="relative group">
        <div className="absolute inset-0 bg-black translate-x-2 translate-y-2 rounded-2xl -z-10 group-focus-within:translate-x-0 group-focus-within:translate-y-0 transition-all" />
        <input
          type="text"
          placeholder="BUSCAR PRODUCTO POR NOMBRE..."
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full bg-white border-[4px] border-black p-6 pl-16 font-black uppercase text-sm rounded-2xl outline-none placeholder:text-zinc-400 transition-all"
        />
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={24} strokeWidth={3} />
      </div>

      {/* VISTA DESKTOP (TABLA ESTILO ADMIN) */}
      <div className="hidden md:block border-[4px] border-black bg-white rounded-[2rem] overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="p-6 border-r-2 border-zinc-800">Producto / Modelos</th>
              <th className="p-6 text-center border-r-2 border-zinc-800 w-48">Stock Total</th>
              <th className="p-6 text-right w-64">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y-[3px] divide-black">
            {filtrados.length > 0 ? (
              filtrados.map(prod => (
                <FilaProducto 
                  key={prod.id_producto} 
                  producto={prod} 
                  // Filtramos los modelos que pertenecen a este producto
                  modelos={todosLosModelos.filter(m => m.id_producto === prod.id_producto)} 
                  sedeId={sedeId} 
                />
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-20 text-center">
                  <div className="flex flex-col items-center gap-4 opacity-20">
                    <PackageSearch size={64} />
                    <p className="font-black uppercase italic text-xl">Sin coincidencias</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* VISTA MOBILE (CARDS INDIVIDUALES) */}
      <div className="md:hidden space-y-4 pb-20">
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
          <div className="p-10 text-center font-black uppercase text-zinc-400 border-4 border-dashed border-zinc-200 rounded-3xl mt-10">
            No se encontraron productos
          </div>
        )}
      </div>
    </div>
  );
}