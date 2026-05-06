"use client";

import { Heart, Lock, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toggleLikeAction } from "@/src/lib/actions";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation"; // Importamos para la redirección limpia

// --- COMPONENTE INTERNO DEL MODAL (ESTILO MATT BOLIVIA) ---
function LoginRequiredModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white border-[4px] border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:rotate-90 transition-transform"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="flex flex-col items-center text-center space-y-6">
              <div className="bg-black p-4 rounded-full text-white">
                <Lock size={32} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black uppercase tracking-tighter italic leading-none text-black">
                  Acceso Restringido
                </h2>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-relaxed">
                  Debes autenticarte para interactuar con el catálogo de Matt.
                </p>
              </div>

              <div className="grid grid-cols-1 w-full gap-3">
                {/* BOTÓN EDITADO: Ahora redirige a tu propia página de /login */}
                <button
                  onClick={() => {
                    onClose();
                    router.push("/login");
                  }}
                  className="w-full py-4 bg-black text-white font-black uppercase text-[11px] tracking-[0.2em] hover:bg-zinc-800 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none"
                >
                  Ir a Iniciar Sesión
                </button>
                
                <button
                  onClick={onClose}
                  className="w-full py-2 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                >
                  Seguir explorando
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// --- COMPONENTE PRINCIPAL ---
interface LikeButtonProps {
  idModelo: number;
  initialLikes: number;
  initialIsLiked: boolean;
  idCliente: number;
  variant?: 'card' | 'detail'; 
}

export function LikeButtonDetail({ 
  idModelo, 
  initialLikes, 
  initialIsLiked, 
  idCliente,
  variant = 'detail' 
}: LikeButtonProps) {
  
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked);
  const [likes, setLikes] = useState<number>(initialLikes);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false); 

  useEffect(() => {
    setIsLiked(initialIsLiked);
    setLikes(initialLikes);
  }, [initialIsLiked, initialLikes, idCliente]); 

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!idCliente || idCliente === 0) {
      setShowLoginModal(true);
      return;
    }

    if (isLoading) return;

    const prevLiked = isLiked;
    const prevCount = likes;

    const willBeLiked = !isLiked;
    setIsLiked(willBeLiked);
    setLikes(prev => willBeLiked ? prev + 1 : prev - 1);
    setIsLoading(true);

    try {
      const res = await toggleLikeAction(idModelo, idCliente);
      
      if (res && res.success) {
        if (res.totalLikes !== undefined) {
          setLikes(res.totalLikes);
        }
      } else {
        throw new Error("Error en la operación");
      }
    } catch (error) {
      setIsLiked(prevLiked);
      setLikes(prevCount);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  const commonProps = {
    onClick: handleLike,
    disabled: isLoading,
    "aria-pressed": isLiked,
    "aria-label": isLiked ? "Quitar de favoritos" : "Añadir a favoritos",
    title: isLiked ? "Quitar de favoritos" : "Añadir a favoritos"
  };

  return (
    <>
      {variant === 'card' ? (
        <button 
          {...commonProps}
          className="absolute top-6 right-6 z-20 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 disabled:opacity-50 group hover:scale-110"
        >
          <Heart 
            size={22} 
            strokeWidth={2.5}
            fill={isLiked ? "#dc2626" : "none"}
            className={`transition-all duration-300 ${isLiked ? "text-red-600 scale-110" : "text-black"}`} 
          />
        </button>
      ) : (
        <button 
          {...commonProps}
          className="group flex flex-col items-center gap-3 transition-all active:scale-95 disabled:opacity-70"
        >
          <div className={`p-5 rounded-full border-2 transition-all duration-500 ${
            isLiked 
              ? 'bg-zinc-950 border-red-600/50 shadow-[0_0_30px_rgba(220,38,38,0.2)]' 
              : 'bg-zinc-900 border-white/5 hover:border-white/20'
          }`}>
            <Heart 
              size={28} 
              strokeWidth={isLiked ? 2.5 : 2}
              fill={isLiked ? "#dc2626" : "none"}
              className={`transition-all duration-300 ${isLiked ? 'text-red-600 scale-110' : 'text-zinc-500 group-hover:text-white'}`} 
            />
          </div>
          <span className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${isLiked ? "text-red-600" : "text-zinc-600"}`}>
            {likes} {likes === 1 ? 'Like' : 'Likes'}
          </span>
        </button>
      )}

      {/* MODAL DE INICIO DE SESIÓN REQUERIDO */}
      <LoginRequiredModal 
        open={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
}