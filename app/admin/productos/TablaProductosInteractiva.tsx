"use client";

import { useState } from "react";
import Link from "next/link";
import { Box, Plus, Minus } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import BotonEliminarProducto from "./BotonEliminarProducto";

export default function TablaProductosInteractiva({ productos = [], searchTerm = "" }: { productos: any[], searchTerm: string }) {
  const [cantidades, setCantidades] = useState<{ [key: number]: number }>({});

  const updateCant = (id: number, val: number) => {
    setCantidades(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + val)
    }));
  };

  return (
    <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
      {/* VISTA DESKTOP */}
      <table className="w-full text-left border-collapse hidden md:table no-print">
        <thead>
          <tr className="border-b border-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
            <th className="p-8 text-center">Cant.</th>
            <th className="p-8">Producto</th>
            <th className="p-8">Categoría</th>
            <th className="p-8 text-center">Código QR</th>
            <th className="p-8 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {productos.map((prod: any) => {
            const id = Number(prod.id_producto);
            const cant = cantidades[id] || 0;
            return (
              <tr key={id} className={`hover:bg-slate-50/50 transition-all group ${cant > 0 ? "bg-slate-50/50" : ""}`}>
                <td className="p-8">
                  <div className="flex items-center justify-center gap-3 bg-white border border-slate-200 p-1 rounded-xl shadow-sm w-fit mx-auto">
                    <button onClick={() => updateCant(id, -1)} className="p-1 hover:text-red-500"><Minus size={14}/></button>
                    <span className="w-8 text-center font-black text-xs">{cant}</span>
                    <button onClick={() => updateCant(id, 1)} className="p-1 hover:text-blue-500"><Plus size={14}/></button>
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all">
                      <Box size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-900 text-lg italic uppercase leading-none">{prod.nombre}</span>
                      <span className="text-slate-400 text-[10px] font-bold">ID: #{id}</span>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-50 px-3 py-1 rounded-lg">
                    {prod.cat_nombre || "General"}
                  </span>
                </td>
                <td className="p-8">
                  <div className="flex justify-center">
                    <div className="bg-white p-2 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <QRCodeSVG value={`/vendedora/scan/${id}`} size={60} level="H" />
                    </div>
                  </div>
                </td>
                <td className="p-8 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <Link href={`/admin/productos/modelos/${id}`} className="bg-slate-950 text-white px-5 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-blue-600 transition-all">Modelos</Link>
                    <Link href={`/admin/productos/editar/${id}`} className="bg-white border border-slate-200 text-slate-400 hover:text-black px-5 py-3 rounded-xl font-black text-[9px] uppercase transition-all">Editar</Link>
                    <BotonEliminarProducto id={id} nombre={prod.nombre} />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* VISTA MÓVIL Y GRILLA DE IMPRESIÓN DINÁMICA */}
      <div className="md:hidden divide-y divide-slate-50 print:grid print:grid-cols-3 print:divide-none">
        {productos.map((prod: any) => {
          const id = Number(prod.id_producto);
          const cant = cantidades[id] || 0;
          
          // Al imprimir, repetimos el bloque según la cantidad seleccionada
          // Si es vista móvil normal (no print), solo mostramos 1
          const itemsToRender = typeof window !== 'undefined' && window.matchMedia('print').matches ? cant : (cant > 0 ? cant : 1);
          
          // Lógica especial para la grilla de impresión:
          return Array.from({ length: cant > 0 ? cant : 0 }).map((_, index) => (
            <div key={`${id}-${index}`} className="p-6 space-y-4 label-card border-slate-100 print:border-dashed print:border-2 print:m-2">
               <div className="flex items-center gap-4 flex-col md:flex-row print:flex-col">
                  <div className="flex flex-col flex-1 text-center md:text-left print:text-center">
                    <span className="font-black text-slate-900 text-base italic uppercase leading-none">{prod.nombre}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">ID: #{id}</span>
                    <span className="hidden print:block text-[8px] font-black uppercase mt-1">Matt Bolivia</span>
                  </div>
                  <div className="bg-white p-2 border-2 border-black rounded-lg">
                    <QRCodeSVG value={`/vendedora/scan/${id}`} size={80} level="H" />
                  </div>
                </div>
            </div>
          ));
        })}

        {/* Vista móvil normal (interfaz de usuario) */}
        <div className="print:hidden">
          {productos.map((prod: any) => (
            <div key={`mob-${prod.id_producto}`} className="p-6 space-y-4 no-print border-b border-slate-50">
               <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-black text-slate-900 text-base italic uppercase">{prod.nombre}</span>
                    <span className="text-slate-400 text-[10px] font-bold uppercase">ID: #{prod.id_producto}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl">
                    <button onClick={() => updateCant(Number(prod.id_producto), -1)} className="p-1"><Minus size={14}/></button>
                    <span className="font-black text-xs">{(cantidades[Number(prod.id_producto)] || 0)}</span>
                    <button onClick={() => updateCant(Number(prod.id_producto), 1)} className="p-1"><Plus size={14}/></button>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-2">
                  <Link href={`/admin/productos/modelos/${prod.id_producto}`} className="bg-slate-950 text-white py-3 rounded-xl font-black text-[9px] uppercase text-center">Modelos</Link>
                  <BotonEliminarProducto id={Number(prod.id_producto)} nombre={prod.nombre} />
               </div>
            </div>
          ))}
        </div>
      </div>
      
      {productos.length === 0 && (
        <div className="p-20 text-center text-slate-300 font-black text-[10px] uppercase tracking-widest no-print">
          Sin resultados para: {searchTerm}
        </div>
      )}
    </div>
  );
}