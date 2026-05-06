import { executeQuery } from "@/src/lib/db";
import { MapPin, Phone, Clock, Navigation, ArrowRight, HardHat, Construction } from "lucide-react";

// 1. INTERFAZ DEFINIDA
interface Sucursal {
  id_sucursal: number;
  nombre_tienda: string;
  ciudad: string;
  direccion: string;
  telefono: string;
  horario: string;
  imagen_url: string;
  google_maps_url: string;
}

export default async function TiendasPublicPage() {
  /**
   * 2. CONSULTA FILTRADA
   */
  const tiendas = (await executeQuery(
    `SELECT 
        id_sucursal, nombre_tienda, ciudad, direccion, 
        telefono, horario, imagen_url, google_maps_url 
     FROM sucursal 
     WHERE id_sucursal != 4
     ORDER BY ciudad ASC`
  )) as unknown as Sucursal[];

  return (
    <div className="bg-[#F5F5F5] text-[#2E2E2E] min-h-screen selection:bg-[#F57C00] selection:text-white">
      
      {/* HERO SECTION - Estilo Panel de Control */}
      <section className="pt-32 md:pt-44 pb-20 md:pb-32 px-4 md:px-6 border-b-[8px] border-[#2E2E2E] bg-white">
        <div className="max-w-7xl mx-auto relative">
          <div className="relative z-10 space-y-4 md:space-y-6">
             <div className="flex items-center gap-3 md:gap-4 mb-2 md:mb-4">
                <Construction className="text-[#F57C00]" size={24} />
                <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.5em] text-[#F57C00]">
                    Puntos de Distribución Oficial
                </span>
             </div>

             <h1 className="text-5xl md:text-[9rem] font-black uppercase tracking-tighter leading-[0.85] md:leading-[0.8] mb-8 md:mb-12 text-[#2E2E2E]">
               NUESTRAS <br />
               <span className="text-[#F57C00]">SEDES</span>
             </h1>

             <p className="max-w-2xl text-sm md:text-base font-bold uppercase tracking-tight text-zinc-500 leading-tight border-l-4 border-[#FDD835] pl-6">
               Localiza nuestras estaciones de servicio y retail. Espacios técnicos optimizados para la entrega de equipo y asesoramiento profesional en toda Bolivia.
             </p>
          </div>
        </div>
      </section>

      {/* GRID DE TIENDAS */}
      <section className="py-16 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16 md:gap-y-24">
          {tiendas.map((tienda) => (
            <div key={tienda.id_sucursal} className="group flex flex-col gap-6 md:gap-8">
              
              {/* CARD DE IMAGEN - Estilo Ficha Técnica */}
              <div className="relative aspect-[4/5] overflow-hidden border-[4px] border-[#2E2E2E] bg-white shadow-[10px_10px_0px_0px_rgba(46,46,46,1)] transition-all duration-500 group-hover:shadow-[15px_15px_0px_0px_#F57C00]">
                {tienda.imagen_url ? (
                  <img 
                    src={tienda.imagen_url} 
                    alt={`Sede ${tienda.nombre_tienda}`}
                    className="w-full h-full object-cover grayscale-[50%] group-hover:grayscale-0 transition-all duration-700"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-200 flex flex-col items-center justify-center p-10 text-center">
                    <HardHat size={48} className="text-zinc-400 mb-4" />
                    <span className="font-black text-zinc-400 text-[10px] uppercase tracking-widest">Vista de Planta no Disponible</span>
                  </div>
                )}
                
                {/* Badge de Ciudad */}
                <div className="absolute top-0 right-0 bg-[#FDD835] text-[#2E2E2E] px-6 py-2 text-[11px] font-black uppercase tracking-widest border-b-4 border-l-4 border-[#2E2E2E]">
                  {tienda.ciudad}
                </div>
              </div>

              {/* INFORMACIÓN - Estilo Reporte */}
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b-2 border-[#2E2E2E] pb-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-[#2E2E2E]">
                    {tienda.nombre_tienda}
                  </h2>
                  <a 
                    href={tienda.google_maps_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-[#2E2E2E] text-white p-3 hover:bg-[#F57C00] transition-colors"
                  >
                    <Navigation size={20} strokeWidth={3} />
                  </a>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <MapPin size={18} className="text-[#F57C00] shrink-0" strokeWidth={3} />
                    <p className="text-[12px] font-black uppercase text-[#2E2E2E] leading-tight">
                      {tienda.direccion}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-zinc-200/50 p-3 border-l-4 border-[#FDD835]">
                    <Clock size={16} className="text-[#2E2E2E] shrink-0" strokeWidth={3} />
                    <p className="text-[11px] font-bold uppercase text-zinc-600 tracking-wider">
                      {tienda.horario || "10:00 - 20:00"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Phone size={16} className="text-[#F57C00] shrink-0" strokeWidth={3} />
                    <p className="text-[12px] font-black tracking-widest uppercase">
                      {tienda.telefono || "LÍNEA DIRECTA"}
                    </p>
                  </div>
                </div>

                <a 
                  href={tienda.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-4 bg-[#2E2E2E] text-white py-4 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-[#F57C00] transition-all shadow-lg active:scale-[0.98]"
                >
                  GENERAR RUTA GPS 
                  <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - Estilo Bloque de Concreto */}
      <footer className="bg-[#2E2E2E] text-white py-20 px-6 border-t-[12px] border-[#FDD835]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 border-b border-zinc-700 pb-16">
          <div className="text-center md:text-left space-y-2">
              <div className="text-5xl md:text-7xl font-black tracking-tighter leading-none">MATT.</div>
              <p className="text-[10px] font-black uppercase tracking-[0.6em] text-[#F57C00]">
                DIVISIÓN DE INFRAESTRUCTURA
              </p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                MATT BOLIVIA &bull; SEGURIDAD E IMAGEN &bull; 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}