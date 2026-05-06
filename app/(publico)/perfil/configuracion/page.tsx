import { getServerSession } from "next-auth/next";
import { executeQuery } from "@/src/lib/db";
import { redirect } from "next/navigation";
import { PerfilForm } from "@/components/perfil-form";
import { ArrowLeft, ShieldCheck, Cog, User, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
}

export const dynamic = 'force-dynamic';

export default async function ConfiguracionPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const userRes = (await executeQuery(
    "SELECT id_cliente, nombre, correo FROM cliente WHERE correo = ? LIMIT 1",
    [session.user.email]
  )) as unknown as Cliente[];

  const usuario = userRes[0];

  if (!usuario) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2E2E2E] pt-24 md:pt-40 pb-12 md:pb-20 px-4 md:px-8 font-sans">
      
      {/* LÍNEA DE SEGURIDAD SUPERIOR (Amarillo Seguridad #FDD835) */}
      <div className="fixed top-0 left-0 w-full h-1.5 bg-[#FDD835] z-50 shadow-sm" />

      <div className="max-w-5xl mx-auto">
        
        {/* NAVEGACIÓN TÉCNICA */}
        <nav className="flex items-center gap-2 mb-12 text-[#2E2E2E]">
          <Link href="/" className="text-[10px] font-bold uppercase hover:text-[#F57C00] transition-colors">Inicio</Link>
          <ChevronRight size={12} className="text-zinc-300" />
          <Link href="/perfil" className="text-[10px] font-bold uppercase hover:text-[#F57C00] transition-colors">Mi Perfil</Link>
          <ChevronRight size={12} className="text-zinc-300" />
          <span className="text-[10px] font-black uppercase text-[#F57C00]">Configuración de Cuenta</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* BLOQUE IZQUIERDO: Título e Identidad */}
          <div className="lg:col-span-4">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5F5F5] border-l-4 border-[#F57C00]">
                <Cog className="w-4 h-4 text-[#2E2E2E]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2E2E2E]">User Settings</span>
              </div>
              
              <h1 className="text-5xl font-black uppercase tracking-tighter leading-none text-[#2E2E2E]">
                Gestión de <br />
                <span className="text-[#F57C00]">Privacidad</span>
              </h1>
              
              <div className="pt-6 border-t border-zinc-100">
                <p className="text-sm font-bold text-[#2E2E2E] leading-snug">
                  Actualice su información personal para garantizar la integridad en sus pedidos y facturación industrial.
                </p>
              </div>
            </header>
          </div>

          {/* BLOQUE DERECHO: Tarjeta de Formulario Estilo Acero/Limpio */}
          <div className="lg:col-span-8">
            <div className="bg-[#FFFFFF] border border-zinc-200 shadow-[8px_8px_0px_0px_rgba(46,46,46,0.05)] overflow-hidden">
              
              {/* Header de la tarjeta */}
              <div className="bg-[#2E2E2E] p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-[#FDD835]" />
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Ficha de Cliente</span>
                </div>
                <span className="text-[9px] font-bold text-zinc-400 uppercase">ID: {usuario.id_cliente}</span>
              </div>

              <div className="p-8 md:p-12">
                {/* FORMULARIO: Aquí el texto es Negro/Gris Oscuro (#2E2E2E) */}
                <div className="text-[#2E2E2E]">
                  <PerfilForm 
                    idCliente={usuario.id_cliente} 
                    nombreInicial={usuario.nombre} 
                  />
                </div>
                
                {/* SECCIÓN DE CORREO - Fondo Gris Claro #F5F5F5 */}
                <div className="mt-12 pt-10 border-t-2 border-zinc-50">
                  <div className="bg-[#F5F5F5] p-6 border border-zinc-200 relative group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-100 transition-opacity">
                       <ShieldCheck size={40} className="text-[#2E2E2E]" />
                    </div>

                    <label className="text-[10px] font-black uppercase tracking-widest text-[#F57C00] block mb-2">
                      Correo Electrónico Registrado
                    </label>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#2E2E2E] font-mono">
                        {usuario.correo}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center gap-2 bg-[#FDD835]/10 p-2 border border-[#FDD835]/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F57C00] animate-pulse" />
                      <p className="text-[9px] font-black uppercase text-[#2E2E2E]">
                        Campo protegido por protocolo de seguridad Google Auth.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalle inferior decorativo */}
              <div className="flex w-full h-1">
                <div className="bg-[#F57C00] w-1/3" />
                <div className="bg-[#2E2E2E] w-2/3" />
              </div>
            </div>

            {/* BOTÓN VOLVER (Alternativo) */}
            <div className="mt-8 flex justify-center">
              <Link 
                href="/perfil" 
                className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2E2E2E] hover:text-[#F57C00] transition-all flex items-center gap-2"
              >
                <ArrowLeft size={14} /> Volver al panel anterior
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* FOOTER DE MARCA */}
      <footer className="mt-20 py-8 border-t border-zinc-100 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-zinc-300">
          Matt Bolivia &bull; Industrial Strength E-commerce
        </p>
      </footer>
    </div>
  );
}