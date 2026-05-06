"use client";
import { useState, useMemo } from "react";
import { registrarVentaFisica } from "../actions";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, CreditCard, Store, Warehouse, X, ArrowRight, Minus, Plus, Tag } from "lucide-react";

// --- COMPONENTES AUXILIARES ---
function SelectorSucursal({ valor, onChange }: any) {
  const sucursales = [
    { id: "3", nombre: "ILLAMPU", icono: <Store size={14} /> },
    { id: "2", nombre: "TUMUSLA", icono: <Store size={14} /> },
    { id: "4", nombre: "ALMACÉN CENTRAL", icono: <Warehouse size={14} /> },
  ];
  return (
    <div className="md:col-span-2 bg-yellow-400 p-4 border-2 border-black flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center gap-2 min-w-[180px]">
        <Warehouse size={20} />
        <label className="text-xs font-black uppercase tracking-widest">Punto de Entrega</label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
        {sucursales.map((s) => (
          <button 
            key={s.id} 
            type="button" 
            onClick={() => onChange(s.id)} 
            className={`p-3 border-2 border-black font-black text-[10px] flex items-center justify-center gap-2 transition-all ${String(valor) === String(s.id) ? "bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" : "bg-white text-black hover:bg-slate-50"}`}
          >
            {s.icono} {s.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}

function SelectorVariantes({ label, opciones, valor, onChange, mostrarStock = false }: any) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-2">
        {opciones.map((opt: any, i: number) => {
          const esActivo = String(opt.id) === String(valor);
          const stockNumerico = Number(opt.stock ?? 0);
          const sinStock = stockNumerico <= 0;
          
          return (
            <button 
              key={`${opt.id}-${i}`} 
              type="button" 
              disabled={sinStock} 
              onClick={() => onChange(String(opt.id))} 
              className={`min-w-[80px] px-4 py-3 border-2 font-black text-sm transition-all flex flex-col items-center justify-center gap-1 
                ${esActivo ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]" 
                : sinStock ? "opacity-30 bg-slate-100 cursor-not-allowed grayscale" 
                : "bg-white border-slate-200 hover:border-black"}`}
            >
              <span className="flex items-center gap-2 text-center">
                {String(opt.nombre).toUpperCase()} {esActivo && <CheckCircle2 size={14} />}
              </span>
              {mostrarStock && (
                <span className={`text-[9px] ${esActivo ? "text-yellow-400" : "text-slate-500"}`}>
                  STOCK: {stockNumerico}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function FormularioVentaDirecta({ productosBase = [], modelosTodos = [], clientes = [] }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const idPedidoURL = searchParams.get("id_pedido");
  const idProductoURL = Number(searchParams.get("id_producto"));
  const idClienteURL = Number(searchParams.get("id_cliente"));

  const [idSucursal, setIdSucursal] = useState("3"); 
  const [colorSeleccionado, setColorSeleccionado] = useState("");
  const [idModelo, setIdModelo] = useState("");
  const [metodo, setMetodo] = useState<string>("Efectivo");
  const [loading, setLoading] = useState(false);
  const [cantidad, setCantidad] = useState(1);

  // --- ESTADO DE PROMOCIÓN ---
  const [promoSeleccionada, setPromoSeleccionada] = useState(0); // 0 es Precio Estándar

  // --- 1. PROCESAMIENTO DE DATOS ---
  const modelosDelProducto = useMemo(() => {
    if (!Array.isArray(modelosTodos)) return [];
    return modelosTodos
      .filter((m: any) => Number(m.id_producto) === idProductoURL)
      .map((m: any) => ({
        ...m,
        id_modelo: Number(m.id_modelo),
        precio: Number(m.precio || 0),
        // Convertimos el string "10,20" de la DB en un array de números [10, 20]
        descuentos_db: m.lista_descuentos ? Array.from(new Set(m.lista_descuentos.split(',').map(Number))) : [],
        color: String(m.color || "").trim().toUpperCase()
      }));
  }, [modelosTodos, idProductoURL]);

  // Descuentos disponibles para el modelo seleccionado actualmente
  const descuentosDisponibles = useMemo(() => {
    const actual = modelosDelProducto.find(m => m.id_modelo === Number(idModelo));
    return (actual?.descuentos_db as number[]) || [];
  }, [idModelo, modelosDelProducto]);

  const clienteInfo = useMemo(() => {
    if (!Array.isArray(clientes) || !idClienteURL) return null;
    return clientes.find((c: any) => Number(c.id_cliente) === Number(idClienteURL));
  }, [clientes, idClienteURL]);

  const productoInfo = useMemo(() => {
    if (!Array.isArray(productosBase)) return null;
    return productosBase.find((p: any) => Number(p.id_producto) === idProductoURL);
  }, [productosBase, idProductoURL]);

  const modelosConStockCalculado = useMemo(() => {
    return modelosDelProducto.map((m: any) => {
      let stock_actual = 0;
      if (idSucursal === "3") stock_actual = Number(m.stock_illampu ?? 0);
      else if (idSucursal === "2") stock_actual = Number(m.stock_tumusla ?? 0);
      else if (idSucursal === "4") stock_actual = Number(m.stock_almacen ?? 0);
      return { ...m, stock_actual };
    });
  }, [idSucursal, modelosDelProducto]);

  const colores = useMemo(() => {
    const mapaColores = new Map();
    modelosConStockCalculado.forEach((m: any) => {
      const nombre = m.color;
      if (!nombre) return;
      if (mapaColores.has(nombre)) {
        mapaColores.get(nombre).stock += m.stock_actual;
      } else {
        mapaColores.set(nombre, { id: nombre, nombre: nombre, stock: m.stock_actual });
      }
    });
    return Array.from(mapaColores.values());
  }, [modelosConStockCalculado]);

  const tallas = useMemo(() => {
    if (!colorSeleccionado) return [];
    return modelosConStockCalculado
      .filter((m: any) => m.color === colorSeleccionado)
      .sort((a, b) => Number(a.talla) - Number(b.talla)) 
      .map((m: any) => ({ id: m.id_modelo, nombre: m.talla, stock: m.stock_actual }));
  }, [colorSeleccionado, modelosConStockCalculado]);

  // --- 2. CÁLCULO DE PRECIOS ---
  const calculoPrecios = useMemo(() => {
    const seleccion = modelosDelProducto.find((m: any) => m.id_modelo === Number(idModelo));
    const precioBase = seleccion?.precio || 0;
    
    const montoDescuento = precioBase * (promoSeleccionada / 100);
    const precioFinalUnitario = precioBase - montoDescuento;

    return {
      unitarioOriginal: precioBase,
      porcentaje: promoSeleccionada,
      total: precioFinalUnitario * cantidad
    };
  }, [idModelo, modelosDelProducto, cantidad, promoSeleccionada]);

  const handleFinalizarEntrega = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPedidoURL || !idModelo) return alert("Selecciona el modelo/talla");

    setLoading(true);
    try {
      const res = await registrarVentaFisica({
        id_modelo: Number(idModelo),
        id_cliente: idClienteURL,
        id_empleado: 1, 
        id_sucursal: Number(idSucursal),
        total: calculoPrecios.total,
        cantidad: cantidad,
        metodo_pago: metodo,
        id_pedido: Number(idPedidoURL)
      });

      if (res.success) {
        router.push("/admin/ventas");
        router.refresh();
      } else {
        alert("Error: " + res.error);
      }
    } catch (error) {
      alert("Error crítico");
    } finally {
      setLoading(false);
    }
  };

  if (!idPedidoURL) return (
    <div className="p-10 text-center font-black border-4 border-black bg-red-50">
      <X size={48} className="mx-auto mb-4" /> ERROR: SIN ID DE PEDIDO
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 p-2 md:p-4">
      {/* HEADER */}
      <div className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(254,240,138,1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-yellow-400 text-[10px] font-black tracking-widest uppercase">Confirmando Entrega #{idPedidoURL}</p>
          <h1 className="text-2xl font-black italic uppercase">
            {clienteInfo ? `${clienteInfo.nombre} ${clienteInfo.apellido}` : `ID: ${idClienteURL}`}
          </h1>
        </div>
        <div className="text-left md:text-right border-t md:border-t-0 border-zinc-800 pt-3 md:pt-0">
          <p className="text-[10px] text-zinc-400 font-bold uppercase">Producto solicitado:</p>
          <p className="font-black text-sm uppercase text-yellow-500">{productoInfo?.nombre || "Cargando..."}</p>
        </div>
      </div>

      <form onSubmit={handleFinalizarEntrega} className="bg-white border-[3px] border-black p-4 md:p-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] space-y-8">
        
        <SelectorSucursal valor={idSucursal} onChange={(v: string) => { setIdSucursal(v); setColorSeleccionado(""); setIdModelo(""); }} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <SelectorVariantes label="1. Color" opciones={colores} valor={colorSeleccionado} mostrarStock={true} onChange={(c: string) => { setColorSeleccionado(c); setIdModelo(""); }} />
          {colorSeleccionado && (
            <SelectorVariantes label="2. Talla" opciones={tallas} valor={idModelo} onChange={setIdModelo} mostrarStock={true} />
          )}
        </div>

        {/* --- SECCIÓN DE CANTIDAD Y PROMOCIONES DE LA DB --- */}
        <div className="pt-6 border-t-2 border-black border-dashed space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">3. Cantidad</p>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setCantidad(Math.max(1, cantidad - 1))} className="w-12 h-12 border-2 border-black flex items-center justify-center font-black hover:bg-black hover:text-white transition-all bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><Minus size={16}/></button>
                <div className="w-10 text-center text-xl font-black">{cantidad}</div>
                <button type="button" onClick={() => setCantidad(cantidad + 1)} className="w-12 h-12 border-2 border-black flex items-center justify-center font-black hover:bg-black hover:text-white transition-all bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"><Plus size={16}/></button>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">4. Descuento Aplicado</p>
              <div className="flex flex-col gap-2">
                {/* OPCIÓN PRECIO ESTÁNDAR */}
                <button 
                  type="button" 
                  onClick={() => setPromoSeleccionada(0)}
                  className={`p-3 border-2 font-black text-xs text-left flex justify-between items-center transition-all ${promoSeleccionada === 0 ? "bg-black text-white border-black" : "bg-white border-slate-200"}`}
                >
                  PRECIO ESTÁNDAR {promoSeleccionada === 0 && <CheckCircle2 size={14} />}
                </button>

                {/* LISTADO DINÁMICO DE PROMOCIONES DE LA DB */}
                {descuentosDisponibles.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[9px] font-bold text-green-600 uppercase flex items-center gap-1 mt-2">
                      <Tag size={10}/> Promociones Activas para este Producto:
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {descuentosDisponibles.map((desc: number) => (
                        <button 
                          key={desc}
                          type="button" 
                          onClick={() => setPromoSeleccionada(desc)}
                          className={`p-3 border-2 font-black text-xs text-left flex justify-between items-center transition-all ${promoSeleccionada === desc ? "bg-green-500 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : "bg-green-50 border-green-200 text-green-700 hover:border-green-400"}`}
                        >
                          PROMOCIÓN ACTIVA -{desc}% {promoSeleccionada === desc && <CheckCircle2 size={14} />}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border-2 border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase italic">
                    No hay promociones configuradas
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MÉTODO PAGO */}
        <div className="border-t-2 border-black pt-6">
          <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest">5. Método de Pago</p>
          <div className="grid grid-cols-2 gap-4">
            {['Efectivo', 'QR'].map((m) => (
              <button key={m} type="button" onClick={() => setMetodo(m)} className={`p-4 border-2 font-black transition-all flex items-center justify-center gap-2 ${metodo === m ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' : 'bg-white border-slate-200 hover:border-black'}`}>
                <CreditCard size={18} /> {m.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* TOTAL FINAL */}
        <div className="bg-zinc-900 text-white p-6 border-4 border-black flex flex-col md:flex-row justify-between items-center gap-6 mt-10 shadow-[8px_8px_0px_0px_rgba(34,197,94,0.4)]">
          <div className="text-center md:text-left">
            <p className="text-[10px] font-black uppercase text-yellow-400 tracking-widest mb-1">Monto Final a Cobrar</p>
            <div className="flex flex-col">
              {promoSeleccionada > 0 && (
                <span className="text-xs text-zinc-500 line-through font-bold">
                  {(calculoPrecios.unitarioOriginal * cantidad).toFixed(2)} BS
                </span>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black italic tracking-tighter">{calculoPrecios.total.toFixed(2)}</span>
                <span className="text-lg font-bold text-yellow-400">BS</span>
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading || !idModelo}
            className="w-full md:w-auto bg-green-500 text-black px-12 py-6 border-[4px] border-black font-black uppercase italic text-2xl shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:grayscale"
          >
            {loading ? "PROCESANDO..." : "FINALIZAR ENTREGA"}
            <ArrowRight size={28} />
          </button>
        </div>
      </form>
    </div>
  );
}