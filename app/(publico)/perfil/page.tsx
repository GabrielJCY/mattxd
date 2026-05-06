import { getServerSession } from "next-auth/next";
import { executeQuery } from "@/src/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Settings, ChevronRight } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";

// Estructura del cliente
interface Cliente {
  id_cliente: number;
  nombre: string;
  correo: string;
}

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const session = await getServerSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const userRes = (await executeQuery(
    "SELECT * FROM cliente WHERE correo = ? LIMIT 1",
    [session.user.email]
  )) as unknown as Cliente[];

  const usuario = userRes[0];

  const menuItems = [
    {
      title: "Mis Favoritos",
      desc: "Piezas que has guardado",
      icon: <Heart className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />,
      href: "/perfil/favoritos",
    },
    {
      title: "Configuración",
      desc: "Gestionar tus datos",
      icon: <Settings className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]" />,
      href: "/perfil/configuracion",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#2E2E2E] pt-24 md:pt-40 pb-10 md:pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER PERFIL */}
        <header className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-8">
          <div className="space-y-2 md:space-y-4">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-[#F57C00] block">
              Member Profile
            </span>
            <h1 className="text-4xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] md:leading-[0.8]">
              {String(usuario?.nombre || session.user.name || "Usuario").split(' ')[0]} <br />
              <span className="text-[#2E2E2E] md:text-[#2E2E2E] not-italic opacity-20">Matt</span>
            </h1>
          </div>
          
          <div className="bg-white border border-zinc-200 p-4 md:p-6 rounded-2xl shadow-sm self-start md:self-auto w-full md:w-auto">
            <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Email vinculado</p>
            <p className="text-xs md:text-sm font-medium text-[#2E2E2E] truncate">{session.user.email}</p>
          </div>
        </header>

        {/* MENÚ DE OPCIONES */}
        <div className="grid gap-3 md:gap-4 mb-8 md:mb-12">
          {menuItems.map((item) => (
            <Link 
              key={item.title} 
              href={item.href}
              className="group flex items-center justify-between p-5 md:p-8 bg-white border border-zinc-200 rounded-[1.5rem] md:rounded-[2rem] hover:bg-[#2E2E2E] transition-all duration-500 active:scale-[0.98] shadow-sm hover:shadow-xl"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="text-[#F57C00] group-hover:text-[#FDD835] transition-colors shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="font-black uppercase tracking-widest text-[11px] md:text-sm text-[#2E2E2E] group-hover:text-white transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[9px] md:text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-[#2E2E2E] group-hover:text-[#FDD835] group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>

        {/* BOTÓN CERRAR SESIÓN */}
        <div className="flex justify-center mt-12 md:mt-20 px-4">
           <LogoutButton />
        </div>

      </div>
    </div>
  );
}