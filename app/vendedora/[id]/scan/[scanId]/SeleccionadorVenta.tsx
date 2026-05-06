'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Variante {
  id_producto: number;
  id_modelo: number;
  talla: string;
  color: string;
  precio: number;
  stock: number;
  descuento: number; 
}

export default function SeleccionadorVenta({ variantes, sucursalId }: { variantes: Variante[], sucursalId: number }) {
  const router = useRouter();
  
  const [colorSeleccionado, setColorSeleccionado] = useState<string | null>(null);
  const [modeloSeleccionado, setModeloSeleccionado] = useState<Variante | null>(null);
  const [cantidad, setCantidad] = useState(1);
  
  const [precioFinal, setPrecioFinal] = useState<number | string>(0);
  const [metodoPago, setMetodoPago] = useState<'Efectivo' | 'QR'>('Efectivo');
  const [loading, setLoading] = useState(false);
  const [aplicarDescuento, setAplicarDescuento] = useState(true);

  const coloresUnicos = Array.from(new Set(variantes.map(v => v.color)));
  const tallasDisponibles = variantes.filter(v => v.color === colorSeleccionado);

  /**
   * 🛠️ CORRECCIÓN DE LÓGICA PORCENTUAL
   */
  useEffect(() => {
    if (modeloSeleccionado) {
      const precioBase = modeloSeleccionado.precio || 0;
      const porcentajeDescuento = aplicarDescuento ? (modeloSeleccionado.descuento || 0) : 0;
      
      // Cálculo: Precio - (Precio * (Porcentaje / 100))
      // Ejemplo: 200 - (200 * 0.30) = 140
      const montoADescontar = precioBase * (porcentajeDescuento / 100);
      const precioConPromo = precioBase - montoADescontar;
      
      // Redondeamos a 2 decimales para evitar números como 140.000000002
      setPrecioFinal(precioConPromo > 0 ? Math.round(precioConPromo) : 0);
    }
  }, [modeloSeleccionado, aplicarDescuento]);

  const registrarVenta = async () => {
    if (!modeloSeleccionado || loading) return;
    const precioNumerico = Number(precioFinal) || 0;

    setLoading(true);
    try {
      const res = await fetch('/api/ventas/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_producto: modeloSeleccionado.id_producto,
          id_modelo: modeloSeleccionado.id_modelo,
          id_sucursal: sucursalId,
          cantidad: cantidad,
          precio_final: precioNumerico,
          metodo_pago: metodoPago
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("¡VENTA REGISTRADA!");
        router.push(`/vendedora/${sucursalId}`);
        router.refresh();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      {/* 1. COLOR */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">1. Color</label>
        <div className="flex flex-wrap gap-2">
          {coloresUnicos.map(color => (
            <button
              key={color}
              onClick={() => {
                setColorSeleccionado(color);
                setModeloSeleccionado(null);
              }}
              className={`px-5 py-2 border-[3px] font-black uppercase text-xs transition-all ${
                colorSeleccionado === color ? "bg-black text-white border-black" : "bg-white text-black border-zinc-100"
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* 2. TALLA */}
      {colorSeleccionado && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">2. Talla y Stock</label>
          <div className="grid grid-cols-2 gap-3">
            {tallasDisponibles.map(v => (
              <button
                key={v.id_modelo}
                disabled={v.stock <= 0}
                onClick={() => setModeloSeleccionado(v)}
                className={`relative p-4 border-[3px] flex flex-col items-start transition-all ${
                  v.stock <= 0 ? "opacity-30 bg-zinc-50" : ""
                } ${
                  modeloSeleccionado?.id_modelo === v.id_modelo ? "bg-white border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]" : "bg-zinc-50 border-transparent"
                }`}
              >
                <div className="flex justify-between w-full items-start">
                  <span className="text-2xl font-black">{v.talla}</span>
                  {v.descuento > 0 && <Tag size={14} className="text-emerald-500 fill-emerald-500" />}
                </div>
                <div className={`mt-1 px-2 py-0.5 text-[9px] font-black uppercase ${v.stock < 3 ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-700"}`}>
                  Stock: {v.stock}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. FINALIZACIÓN */}
      {modeloSeleccionado && (
        <div className="pt-6 border-t-[4px] border-black space-y-6 animate-in zoom-in-95">
          
          {/* BOTÓN DE DESCUENTO PORCENTUAL */}
          {modeloSeleccionado.descuento > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-400">Oferta Disponible</label>
              <button 
                onClick={() => setAplicarDescuento(!aplicarDescuento)}
                className={`w-full p-3 border-[3px] border-black font-black uppercase text-xs flex items-center justify-between transition-all ${
                  aplicarDescuento 
                    ? "bg-emerald-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" 
                    : "bg-white text-black opacity-60"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag size={14} />
                  {aplicarDescuento ? "DESCUENTO APLICADO" : "APLICAR DESCUENTO"}
                </div>
                <span>-{modeloSeleccionado.descuento}%</span>
              </button>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase text-zinc-400">3. Pago</label>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => setMetodoPago('Efectivo')} className={`p-3 border-2 font-black text-xs transition-all ${metodoPago === 'Efectivo' ? 'bg-black text-white border-black' : 'border-zinc-200'}`}>
                Efectivo
              </button>
              <button onClick={() => setMetodoPago('QR')} className={`p-3 border-2 font-black text-xs transition-all ${metodoPago === 'QR' ? 'bg-emerald-500 text-white border-black' : 'border-zinc-200'}`}>
                QR
              </button>
            </div>
          </div>

          {/* INPUT DE PRECIO FINAL */}
          <div className="bg-zinc-100 p-4 border-2 border-dashed border-zinc-300">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[9px] font-black uppercase text-zinc-500 block">Precio Final Unitario (Bs.)</label>
              {modeloSeleccionado.descuento > 0 && aplicarDescuento && (
                <span className="text-[9px] font-black text-emerald-600 uppercase italic">
                  Promo {modeloSeleccionado.descuento}% Off
                </span>
              )}
            </div>
            <input 
              type="number" 
              value={precioFinal === 0 ? "" : precioFinal} 
              onChange={(e) => setPrecioFinal(Number(e.target.value))}
              placeholder="0"
              className="bg-transparent text-3xl font-black w-full focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="font-black uppercase italic text-lg">Cantidad</span>
            <div className="flex items-center border-[4px] border-black bg-white">
              <button onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="p-3 border-r-[4px] border-black hover:bg-zinc-50">
                <Minus size={20} strokeWidth={3} />
              </button>
              <span className="px-8 font-black text-2xl">{cantidad}</span>
              <button onClick={() => setCantidad(Math.min(modeloSeleccionado.stock, cantidad + 1))} className="p-3 border-l-[4px] border-black hover:bg-zinc-50">
                <Plus size={20} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-end border-b-2 border-zinc-100 pb-2">
               <span className="text-[10px] font-black text-zinc-400">Total a Cobrar</span>
               <span className="text-3xl font-black text-emerald-600">
                 Bs. {(Number(precioFinal) || 0) * cantidad}
               </span>
            </div>
            <button 
              onClick={registrarVenta} 
              disabled={loading} 
              className={`w-full p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black text-xl italic uppercase transition-all active:shadow-none active:translate-x-1 active:translate-y-1 ${
                loading ? "bg-zinc-400 cursor-not-allowed" : "bg-emerald-500 text-white border-4 border-black"
              }`}
            >
              {loading ? "Registrando..." : "Confirmar Venta"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}