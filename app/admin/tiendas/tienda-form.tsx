"use client";
import { useState } from "react";
import { saveSucursal } from "./actions";
import { useRouter } from "next/navigation";
import { Loader2, Save, UploadCloud, X, Clock, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { CldUploadWidget } from "next-cloudinary";

/**
 * Formulario de Sede
 * Ajustado para usar 'id_sucursal' conforme al esquema de base de datos.
 */
export function TiendaForm({ tienda }: { tienda?: any }) {
  const [loading, setLoading] = useState(false);
  // Usamos tienda.imagen_url para el estado inicial
  const [imageUrl, setImageUrl] = useState(tienda?.imagen_url || "");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      // Aseguramos que la URL de Cloudinary se envíe correctamente
      formData.set("imagen_url", imageUrl);
      
      const res = await saveSucursal(formData);
      
      if (res.success) {
        router.push("/admin/tiendas");
      } else {
        alert(res.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      setLoading(false);
    }
  };

  // ESTILOS BRUTALISTAS
  const inputStyles = "w-full bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-5 text-sm font-bold text-white focus:outline-none focus:border-white transition-all placeholder:text-zinc-600 shadow-inner";
  const labelStyles = "text-[11px] font-black uppercase tracking-[0.3em] text-black ml-2 mb-2 block";

  return (
    <form onSubmit={handleSubmit} className="space-y-12">
      {/* CORRECCIÓN: Enviamos el ID usando el nombre 'id'. 
          La Server Action lo recibirá y lo convertirá a 'id_sucursal' en el SQL.
          Usamos tienda.id_sucursal porque ese es el nombre que viene de la DB.
      */}
      <input type="hidden" name="id" value={tienda?.id_sucursal || ""} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        
        {/* Nombre de la Tienda */}
        <div className="space-y-1">
          <label className={labelStyles}>Denominación Oficial (Nombre)</label>
          <input 
            name="nombre_tienda" 
            defaultValue={tienda?.nombre_tienda} 
            required 
            className={`${inputStyles} uppercase tracking-tighter italic text-lg`} 
            placeholder="EJ. MATT - CENTRAL AVENIDA"
          />
        </div>

        {/* Ciudad */}
        <div className="space-y-1">
          <label className={labelStyles}>Departamento / Ciudad</label>
          <input 
            name="ciudad" 
            defaultValue={tienda?.ciudad} 
            className={`${inputStyles} uppercase tracking-widest`} 
            placeholder="EJ. COCHABAMBA"
          />
        </div>

        {/* Dirección */}
        <div className="md:col-span-2 space-y-1">
          <label className={labelStyles}>Localización Técnica (Dirección Exacta)</label>
          <div className="relative">
             <MapPin size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600" />
             <input 
               name="direccion" 
               defaultValue={tienda?.direccion} 
               required 
               className={`${inputStyles} pl-14 font-medium`} 
               placeholder="Calle 12 de Calacoto, Edificio Titanium, Local 4"
             />
          </div>
        </div>

        {/* Teléfono */}
        <div className="space-y-1">
          <label className={`${labelStyles} flex items-center gap-2`}>
            <Phone size={12} className="text-black" /> Teléfono de Contacto
          </label>
          <input 
            name="telefono" 
            defaultValue={tienda?.telefono} 
            className={inputStyles} 
            placeholder="+591 700 000 00"
          />
        </div>

        {/* Horario */}
        <div className="space-y-1">
          <label className={`${labelStyles} flex items-center gap-2`}>
            <Clock size={12} className="text-black" /> Ventana Horaria de Atención
          </label>
          <input 
            name="horario" 
            defaultValue={tienda?.horario} 
            className={inputStyles} 
            placeholder="LUNES A SÁBADO: 09:00 - 21:00"
          />
        </div>

        {/* Google Maps URL */}
        <div className="md:col-span-2 space-y-1">
          <label className={labelStyles}>Enlace Geográfico (Google Maps URL)</label>
          <input 
            name="google_maps_url" 
            defaultValue={tienda?.google_maps_url} 
            className={`${inputStyles} font-mono text-xs text-zinc-400`} 
            placeholder="https://maps.google.com/..."
          />
        </div>

        {/* SECCIÓN DE IMAGEN */}
        <div className="md:col-span-2 pt-8 border-t-2 border-dashed border-zinc-100 mt-4">
          <label className="text-sm font-black uppercase tracking-[0.2em] text-black mb-8 block text-center">
            Registro Visual de Fachada (Obligatorio)
          </label>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            <CldUploadWidget 
              uploadPreset="ml_default" 
              onSuccess={(result: any) => setImageUrl(result.info.secure_url)}
            >
              {({ open }) => (
                <button
                  type="button"
                  onClick={() => open()}
                  className="flex flex-col items-center justify-center w-60 h-60 border-4 border-dashed border-zinc-950 rounded-[3rem] hover:border-black hover:bg-zinc-950 hover:text-white transition-all group overflow-hidden relative shadow-xl"
                >
                  <UploadCloud size={32} className="text-zinc-950 group-hover:text-white mb-3 transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black group-hover:text-white">Subir Imagen</span>
                </button>
              )}
            </CldUploadWidget>

            {imageUrl && (
              <div className="relative w-60 h-60 rounded-[3rem] overflow-hidden border-4 border-black group animate-in zoom-in duration-500 shadow-2xl">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                />
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="p-4 bg-white text-black rounded-full hover:bg-red-600 hover:text-white transition-all shadow-xl scale-90 group-hover:scale-100 duration-300"
                    >
                      <X size={20} strokeWidth={4} />
                    </button>
                </div>
              </div>
            )}
          </div>
          {/* Input oculto para asegurar que el valor viaje en el FormData */}
          <input type="hidden" name="imagen_url" value={imageUrl} />
        </div>
      </div>

      {/* BOTONES DE ACCIÓN */}
      <div className="flex flex-col md:flex-row gap-6 pt-16 border-t-4 border-black mt-16">
        <button 
          type="submit" 
          disabled={loading}
          className="flex-1 bg-black text-white font-black uppercase tracking-[0.3em] text-xs py-7 rounded-full hover:bg-zinc-800 transition-all flex items-center justify-center gap-4 disabled:opacity-50 shadow-2xl hover:scale-[1.01]"
        >
          {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          {tienda ? "Confirmar Cambios en Sede" : "Ejecutar Registro de Nueva Sede"}
        </button>
        
        <Link 
          href="/admin/tiendas" 
          className="px-16 bg-white border-4 border-black text-black font-black uppercase tracking-[0.3em] text-xs py-7 rounded-full hover:bg-black hover:text-white transition-all flex items-center justify-center text-center"
        >
          Descartar y Volver
        </Link>
      </div>
    </form>
  );
}