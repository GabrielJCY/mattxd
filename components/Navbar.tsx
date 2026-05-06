"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { User, Search, Menu, X, ArrowRight, Heart, HardHat } from "lucide-react";
import { MattLogo } from "@/components/matt-logo";
import { useSession } from "next-auth/react";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: "INICIO", href: "/" },
    { name: "TIENDAS", href: "/tiendas" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-[100] transition-all duration-300 px-4 md:px-12 py-3 md:py-4 ${
          isScrolled || isSearchOpen 
            ? "bg-white/95 backdrop-blur-md border-b-2 border-[#2E2E2E] shadow-sm" 
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between relative">
          
          {/* IZQUIERDA: Menu Mobile & Search Desktop */}
          <div className="flex items-center md:flex-1">
            <button 
              className="md:hidden text-[#2E2E2E] p-2 -ml-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <button 
              className={`hidden md:flex items-center gap-2 text-[#2E2E2E] hover:text-[#F57C00] transition-colors font-black text-[10px] tracking-widest`}
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={18} /> BUSCAR
            </button>
          </div>

          {/* CENTRO: Logo */}
          <div className="md:relative md:left-0 md:translate-x-0 absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="group">
              <MattLogo className="w-20 md:w-32 h-auto fill-[#2E2E2E] group-hover:fill-[#F57C00] transition-colors" />
            </Link>
          </div>

          {/* DERECHA: Desktop Icons */}
          <div className="hidden md:flex items-center justify-end gap-8 flex-1">
            <div className="flex gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className="text-[11px] font-black tracking-[0.2em] text-[#2E2E2E] hover:text-[#F57C00] transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-[#F57C00] hover:after:w-full after:transition-all"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-6 ml-4 border-l-2 border-zinc-200 pl-6">
              {session && (
                <Link href="/perfil/favoritos" className="relative group">
                  <Heart size={18} className="text-[#2E2E2E] group-hover:text-[#F57C00] group-hover:fill-[#F57C00] transition-all" />
                </Link>
              )}
              <Link href={session ? "/perfil" : "/login"} className="group">
                <User size={18} className="text-[#2E2E2E] group-hover:text-[#F57C00] transition-colors" />
              </Link>
              {/* Indicador Industrial */}
              <div className="text-[#FDD835] bg-[#2E2E2E] p-1.5 hidden lg:block">
                <HardHat size={14} />
              </div>
            </div>
          </div>

          {/* ICONOS MOBILE */}
          <div className="md:hidden flex items-center gap-1">
              <button onClick={() => setIsSearchOpen(true)} className="p-2 text-[#2E2E2E]">
                <Search size={20} />
              </button>
              <Link href={session ? "/perfil" : "/login"} className="p-2 text-[#2E2E2E]">
                <User size={20} />
              </Link>
          </div>
        </div>

        {/* BUSCADOR MODAL - ESTILO TÉCNICO */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-screen bg-[#F5F5F5]/98 backdrop-blur-xl z-[120] px-6 flex flex-col items-center justify-start pt-24 md:pt-32"
            >
              <button 
                onClick={() => setIsSearchOpen(false)}
                className="absolute top-6 right-6 text-[#2E2E2E] hover:text-[#F57C00] p-2 border-2 border-[#2E2E2E] rounded-none"
              >
                <X size={24} strokeWidth={2} />
              </button>

              <div className="w-full max-w-4xl text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="w-12 h-0.5 bg-[#F57C00]"></span>
                    <p className="text-[10px] font-black tracking-[0.4em] text-[#2E2E2E] uppercase">
                        INSPECCIÓN DE INVENTARIO
                    </p>
                    <span className="w-12 h-0.5 bg-[#F57C00]"></span>
                </div>
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input 
                    ref={inputRef}
                    type="text" 
                    placeholder="INGRESAR TÉRMINO..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b-4 border-[#2E2E2E] py-6 text-2xl md:text-6xl font-black uppercase tracking-tighter text-[#2E2E2E] placeholder:text-zinc-200 focus:outline-none focus:border-[#F57C00] transition-colors text-center"
                  />
                  <button type="submit" className="absolute right-0 bottom-6 text-[#F57C00] hover:scale-110 transition-transform">
                    <ArrowRight size={40} />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* MENU MOBILE OVERLAY - ESTILO INDUSTRIAL */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#2E2E2E]/60 backdrop-blur-sm z-[125] md:hidden"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white z-[130] p-8 flex flex-col border-r-8 border-[#F57C00] shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <MattLogo className="w-24 fill-[#2E2E2E]" />
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-[#2E2E2E] text-white">
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex flex-col gap-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name} 
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-5xl font-black uppercase tracking-tighter text-[#2E2E2E] hover:text-[#F57C00] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                
                {session && (
                  <Link 
                    href="/perfil/favoritos" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-5xl font-black uppercase tracking-tighter text-[#F57C00] flex items-center gap-4 border-t-2 border-zinc-100 pt-4"
                  >
                    LIKE <Heart size={32} className="fill-[#F57C00]" />
                  </Link>
                )}
              </div>

              <div className="mt-auto pt-8 flex flex-col gap-6">
                 <div className="bg-[#FDD835] p-4 border-2 border-[#2E2E2E] flex items-center justify-between">
                    <Link 
                        href={session ? "/perfil" : "/login"} 
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-[11px] font-black tracking-widest uppercase text-[#2E2E2E]"
                    >
                        {session ? "Panel de Usuario" : "Acceso Clientes"}
                    </Link>
                    <User size={18} className="text-[#2E2E2E]" />
                 </div>
                 <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                    Matt Bolivia &bull; División Industrial
                 </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}