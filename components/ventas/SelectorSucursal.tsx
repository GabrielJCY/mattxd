// Línea 1 corregida
import { Store, Warehouse } from "lucide-react"; 

export function SelectorSucursal({ valor, onChange }: any) {
  const sucursales = [
    { id: "1", nombre: "ILLAMPU (TIENDA CENTRAL)", icono: <Store size={16} /> },
    { id: "2", nombre: "TUMUSLA", icono: <Store size={16} /> },
    { id: "3", nombre: "ALMACÉN CENTRAL", icono: <Warehouse size={16} /> }, // Ahora sí funcionará
  ];

  return (
    <div className="md:col-span-2 bg-yellow-400 p-4 border-2 border-black flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center gap-2 min-w-[200px]">
        <Warehouse size={20} />
        <label className="text-xs font-black uppercase tracking-widest">Sucursal de Despacho</label>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 w-full">
        {sucursales.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={`p-2 border-2 border-black font-black text-[10px] flex items-center justify-center gap-2 transition-all ${
              valor === s.id ? "bg-black text-white" : "bg-white text-black hover:bg-black/5"
            }`}
          >
            {s.id === "3" ? <Warehouse size={14} /> : <Store size={14} />}
            {s.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}