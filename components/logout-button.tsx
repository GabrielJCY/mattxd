"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: "/" })}
      className="group flex items-center gap-4 px-10 py-4 rounded-full border border-red-900/30 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-500"
    >
      <LogOut size={16} />
      <span className="text-[10px] font-black uppercase tracking-[0.4em]">
        Cerrar Sesión
      </span>
    </button>
  );
}