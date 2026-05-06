"use client";

import { useEffect, useState, useMemo, useRef, Suspense } from "react";
import { logout } from "../login/actions";
import Link from "next/link";
import Image from "next/image"; 
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, Tags, RefreshCcw, Users, Star, Heart, 
  Megaphone, ShieldCheck, LogOut, Menu, X, 
  LayoutDashboard, TrendingUp, Contact2, Store,
  Warehouse, ArrowRightLeft, ChevronRight, FileSpreadsheet, Database, ChevronDown
} from "lucide-react";

const MattLogo = ({ isOpen }: { isOpen: boolean }) => (
  <motion.div layout className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-8">
    <div className="relative w-10 h-10 flex-shrink-0">
      <Image src="/logo1.png" alt="Matt Bolivia Logo" fill className="object-contain" priority />
    </div>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: -10 }} 
          className="flex flex-col overflow-hidden whitespace-nowrap"
        >
          <h1 className="text-xl font-black tracking-tighter uppercase italic leading-none text-slate-950">
            Matt <span className="text-slate-300">Admin</span>
          </h1>
          <p className="text-[7px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-1">Bolivia</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function DashboardClient({ data }: { data: any }) {
  const [isOpen, setIsOpen] = useState(true);
  const [view, setView] = useState<"dashboard" | "sedes" | "genero">("dashboard");
  const [selectedSede, setSelectedSede] = useState<string | null>(null);
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
      else setIsOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // --- NUEVO ORDEN DE MÓDULOS ---
  const modulos = [
    { name: "Categorías", path: "/admin/categorias", label: "Clasificación", icon: <Tags size={20} /> },
    { name: "Productos", path: "/admin/productos", label: "Catálogo General", icon: <Package size={20} /> },
    { name: "Movimientos", path: "/admin/movimientos", label: "Log de Inventario", icon: <RefreshCcw size={20} /> },
    { name: "Tiendas", path: "/admin/tiendas", label: "Retail & Sedes", icon: <Store size={20} /> },
    { name: "Empleados", path: "/admin/empleados", label: "Staff & Ventas", icon: <Contact2 size={20} /> },
    { name: "Clientes", path: "/admin/clientes", label: "Base de Datos", icon: <Users size={20} /> },
    { name: "Anuncios", path: "/admin/anuncios", label: "Promociones", icon: <Megaphone size={20} /> },
    { name: "Favoritos", path: "/admin/likes", label: "Intereses", icon: <Heart size={20} /> },
    { name: "Usuarios", path: "/admin/usuarios", label: "Administradores", icon: <ShieldCheck size={20} /> },
  ];

  const sedesConfig = [
    { id: "almacen", label: "Almacén Central", icon: <Warehouse size={32} />, desc: "Stock Maestro" },
    { id: "illampu", label: "Sede Illampu", icon: <Store size={32} />, desc: "Vendedor 1" },
    { id: "tumusla", label: "Sede Tumusla", icon: <Store size={32} />, desc: "Vendedor 2" },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] font-sans text-slate-900 selection:bg-black selection:text-white overflow-x-hidden">
      
      {isMobile && !isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[60] bg-black text-white p-3 rounded-2xl shadow-2xl active:scale-90 transition-all"
        >
          <Menu size={20} />
        </button>
      )}

      {/* --- SIDEBAR --- */}
      <motion.aside 
        initial={false}
        animate={{ 
          width: isOpen ? (isMobile ? "85%" : 280) : (isMobile ? 0 : 90),
          x: isOpen ? 0 : (isMobile ? -280 : 0)
        }}
        className={`bg-white border-r border-slate-200 flex flex-col p-6 fixed h-full z-50 shadow-xl md:shadow-sm overflow-hidden transition-all`}
      >
        <div className="relative">
          <MattLogo isOpen={isOpen || !isMobile} />
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="absolute -right-3 top-1 p-1.5 bg-white border border-slate-100 rounded-full shadow-sm hover:scale-110 transition-transform text-slate-400 z-10"
          >
            {isOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar pr-2">
          {isOpen && <p className="px-3 text-[9px] font-black text-slate-300 uppercase tracking-widest mb-4 italic">Módulos de Sistema</p>}
          {modulos.map((m) => (
            <Link 
              key={m.name} 
              href={m.path} 
              className="flex items-center group p-3 rounded-xl hover:bg-black hover:text-white transition-all duration-300"
            >
              <span className="min-w-[40px] flex justify-center text-slate-400 group-hover:text-white transition-colors">
                {m.icon}
              </span>
              {(isOpen) && (
                <div className="ml-1">
                  <p className="text-xs font-bold leading-none uppercase tracking-tight">{m.name}</p>
                  <p className="text-[9px] opacity-40 font-medium uppercase">{m.label}</p>
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-50">
          <form action={logout}>
            <button className="w-full flex items-center gap-3 p-3 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all group italic font-bold text-[10px] uppercase tracking-widest">
              <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
              {isOpen && <span>Cerrar Sesión</span>}
            </button>
          </form>
        </div>
      </motion.aside>

      {/* --- ÁREA DE CONTENIDO --- */}
      <main className="flex-1 transition-all duration-300 w-full" 
        style={{ marginLeft: isMobile ? 0 : (isOpen ? 280 : 90) }}
      >
        <div className="p-5 md:p-10 max-w-7xl mx-auto">
          
          <header className="mb-10 md:mb-12 flex flex-col md:flex-row justify-between items-start gap-6 pt-12 md:pt-0">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <LayoutDashboard size={14} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  {view === "dashboard" ? "Operational Dashboard" : `Gestión > ${selectedSede || ""}`}
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.85] text-slate-950">
                {view === "dashboard" && <>Estado <br /> <span className="text-slate-300 underline decoration-black decoration-4 underline-offset-8">General</span></>}
                {view === "sedes" && <>Control de <br /> <span className="text-slate-300 underline decoration-black decoration-4 underline-offset-8">Inventario</span></>}
                {view === "genero" && <>{selectedSede} <br /> <span className="text-slate-300 underline decoration-black decoration-4 underline-offset-8">Catálogo</span></>}
              </h2>
            </motion.div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto relative">
               {view !== "dashboard" && (
                 <button 
                   onClick={() => setView(view === "genero" ? "sedes" : "dashboard")}
                   className="bg-black text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all w-full sm:w-auto"
                 >
                   ← Volver
                 </button>
               )}

               <div className="relative w-full sm:w-auto">
                 <button 
                   onClick={() => setShowBackupMenu(!showBackupMenu)}
                   className={`bg-white px-6 py-4 rounded-2xl shadow-sm border-2 transition-all flex items-center justify-between sm:justify-start gap-4 hover:border-black w-full ${showBackupMenu ? 'border-black' : 'border-slate-100'}`}
                 >
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.4)]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-800">Respaldo Matt</span>
                    </div>
                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${showBackupMenu ? 'rotate-180' : ''}`} />
                 </button>

                 <AnimatePresence>
                   {showBackupMenu && (
                     <motion.div 
                       initial={{ opacity: 0, y: 10, scale: 0.95 }}
                       animate={{ opacity: 1, y: 0, scale: 1 }}
                       exit={{ opacity: 0, y: 10, scale: 0.95 }}
                       className="absolute right-0 mt-3 w-full sm:w-64 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] z-[100] overflow-hidden"
                     >
                        <div className="bg-black text-white px-4 py-2 text-[9px] font-black uppercase tracking-widest italic">Acciones</div>
                        <a href="/api/admin/backup/excel" className="flex items-center gap-3 w-full px-5 py-4 text-left font-black uppercase text-[10px] tracking-tighter hover:bg-emerald-400 border-b-2 border-black transition-colors">
                          <FileSpreadsheet size={18} className="text-emerald-600" /> Exportar Excel
                        </a>
                        <a href="/api/admin/backup/db" className="flex items-center gap-3 w-full px-5 py-4 text-left font-black uppercase text-[10px] tracking-tighter hover:bg-blue-400 transition-colors">
                          <Database size={18} className="text-blue-600" /> Backup Turso
                        </a>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {view === "dashboard" && (
              <motion.div key="dash" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Link href="/admin/ventas" className="bg-white border border-slate-200 p-8 rounded-[2.5rem] flex flex-col justify-between group hover:border-black transition-all min-h-[220px] relative overflow-hidden shadow-sm">
                    <TrendingUp className="absolute -right-4 -top-4 text-slate-50 opacity-100" size={150} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 relative z-10 italic">Ingresos Totales</p>
                    <h3 className="text-3xl md:text-4xl font-black italic tracking-tighter relative z-10">Bs. {data.ingresos?.toLocaleString()}</h3>
                  </Link>

                  <Link href="/admin/pedido" className="bg-black text-white p-8 rounded-[2.5rem] flex flex-col justify-between min-h-[220px] shadow-xl hover:scale-[1.02] transition-all">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Órdenes Pendientes</p>
                    <h3 className="text-7xl font-black italic tracking-tighter leading-none">{data.pedidos}</h3>
                  </Link>

                  <button onClick={() => setView("sedes")} className={`p-8 rounded-[2.5rem] border-2 flex flex-col justify-between min-h-[220px] transition-all text-left sm:col-span-2 lg:col-span-1 ${data.alertasStock > 0 ? 'border-red-600 bg-red-50' : 'border-slate-200 bg-white hover:border-black shadow-sm'}`}>
                    <p className={`text-[10px] font-black uppercase tracking-widest italic ${data.alertasStock > 0 ? 'text-red-600 animate-pulse' : 'text-slate-400'}`}>Stock Crítico</p>
                    <div className="flex items-end justify-between">
                      <h3 className={`text-7xl font-black italic tracking-tighter leading-none ${data.alertasStock > 0 ? 'text-red-600' : 'text-slate-900'}`}>{data.alertasStock}</h3>
                      <div className="bg-black text-white p-3 rounded-full"><ArrowRightLeft size={20} /></div>
                    </div>
                  </button>
                </div>
              </motion.div>
            )}

            {view === "sedes" && (
              <motion.div key="sedes" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sedesConfig.map((sede) => (
                  <button key={sede.id} onClick={() => { setSelectedSede(sede.id); setView("genero"); }} className="group bg-white border-[3px] border-slate-100 p-8 rounded-[3rem] hover:border-black transition-all flex flex-col items-center text-center space-y-6 shadow-sm">
                    <div className="bg-slate-50 p-6 rounded-full group-hover:bg-black group-hover:text-white transition-all">{sede.icon}</div>
                    <div>
                      <h4 className="text-xl font-black uppercase italic tracking-tighter">{sede.label}</h4>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">{sede.desc}</p>
                    </div>
                    <ChevronRight className="text-slate-200 group-hover:text-black group-hover:translate-x-2 transition-all" />
                  </button>
                ))}
              </motion.div>
            )}

            {view === "genero" && (
              <motion.div key="genero" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                <Link href={`/admin/stock/${selectedSede}?gender=hombre`} className="group relative h-[300px] md:h-[400px] overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Image src="/hombre1.png" alt="Hombre" fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-6 left-8 text-4xl md:text-6xl font-black uppercase italic text-white z-10">Hombre</span>
                </Link>
                <Link href={`/admin/stock/${selectedSede}?gender=mujer`} className="group relative h-[300px] md:h-[400px] overflow-hidden rounded-[2.5rem] md:rounded-[3rem] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <Image src="/mujer2.png" alt="Mujer" fill className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute bottom-6 left-8 text-4xl md:text-6xl font-black uppercase italic text-white z-10">Mujer</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <footer className="mt-20 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 opacity-30 text-center">
            <p className="text-[8px] font-black uppercase tracking-[0.5em]">Matt Bolivia</p>
            <p className="text-[8px] font-bold uppercase">Terminal de Control 2.6</p>
          </footer>
        </div>
      </main>
      
      {/* OVERLAY PARA CERRAR MENÚ EN MÓVIL */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)} 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden" 
          />
        )}
      </AnimatePresence>
    </div>
  );
}