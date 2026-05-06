/** * LECTOR QR REAL - MATT BOLIVIA 2026 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Camera, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function LectorQRPage() {
  const router = useRouter();
  const params = useParams();
  const idSucursal = params?.id; // Capturamos el ID de la sucursal de la URL
  
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    if (!idSucursal) return;

    // Configuración del scanner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { 
        fps: 15, // Un poco más rápido para mejor respuesta
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true, // Útil en tiendas con poca luz
      }, 
      /* verbose= */ false
    );

    const onScanSuccess = (decodedText: string) => {
      // 1. Limpieza de seguridad: extraemos solo el ID si el QR viene con URL completa
      // Si el QR fuera "https://matt.com/p/104", esto extrae "104"
      const cleanId = decodedText.split('/').pop(); 
      
      if (cleanId && isScanning) {
        setIsScanning(false); // Evitamos múltiples disparos
        scanner.clear().then(() => {
          // 2. RUTA ABSOLUTA FORZADA para evitar duplicados en la URL
          router.push(`/vendedora/${idSucursal}/scan/${cleanId}`);
        }).catch(err => console.error("Error al detener scanner", err));
      }
    };

    const onScanFailure = (error: any) => {
      // Errores de enfoque normales, no bloquean el flujo
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Limpiar al cerrar el componente para liberar la cámara
    return () => {
      scanner.clear().catch(err => {});
    };
  }, [idSucursal, router, isScanning]);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col">
      {/* HEADER NAVBAR */}
      <nav className="flex justify-between items-center mb-6">
        <Link 
          href={`/vendedora/${idSucursal}`} 
          className="p-2 border-2 border-white hover:bg-white hover:text-black transition-colors"
        >
          <ArrowLeft size={24} />
        </Link>
        <div className="text-right">
          <p className="text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500">Matt Staff System</p>
          <p className="text-[10px] font-black uppercase italic">Scanner v2.5</p>
        </div>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center space-y-6">
        
        {/* CONTENEDOR DE LA CÁMARA - ESTILO BRUTALISTA */}
        <div className="relative w-full max-w-sm overflow-hidden border-[6px] border-white shadow-[10px_10px_0px_0px_rgba(255,255,255,0.1)] bg-zinc-900">
          <div id="reader" className="w-full"></div>
          
          {/* MÁSCARA DE ESCANEO */}
          <div className="absolute inset-0 pointer-events-none border-[20px] border-black/20"></div>
          
          {/* OVERLAY ESTÉTICO MATT */}
          <div className="absolute top-0 left-0 w-full p-2 bg-white text-black text-center z-10">
             <p className="text-[9px] font-black uppercase tracking-widest italic animate-pulse">
               Enfoque el código del producto
             </p>
          </div>
        </div>

        <div className="text-center space-y-2">
           <h2 className="text-2xl font-black uppercase italic tracking-tighter">Cámara Activa</h2>
           <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
             Sede ID: {idSucursal}
           </p>
        </div>

        {/* CONTROLES DE EMERGENCIA */}
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center justify-center gap-2 bg-zinc-900 border-2 border-white/20 p-4 hover:bg-white hover:text-black transition-all group"
          >
            <RefreshCw size={16} className="group-active:rotate-180 transition-transform duration-500" />
            <span className="text-[10px] font-black uppercase tracking-widest">Reiniciar Cámara</span>
          </button>
          
          <p className="text-[8px] text-center text-zinc-600 uppercase font-bold tracking-[0.2em]">
            Asegúrese de dar permisos de video en el navegador
          </p>
        </div>
      </div>

      {/* INYECCIÓN DE CSS PARA SOBRESCRIBIR LA LIBRERÍA */}
      <style jsx global>{`
        #reader { 
          border: none !important; 
        }
        #reader__scan_region { 
          background: #000 !important; 
        }
        #reader__scan_region video {
          object-fit: cover !important;
        }
        /* Botón de la librería */
        #html5-qrcode-button-camera-permission, 
        #html5-qrcode-button-camera-start, 
        #html5-qrcode-button-camera-stop {
          background: white !important;
          color: black !important;
          border: 4px solid black !important;
          text-transform: uppercase !important;
          font-weight: 900 !important;
          font-size: 14px !important;
          padding: 12px 24px !important;
          margin: 10px auto !important;
          width: 100%;
          cursor: pointer;
          font-family: inherit;
        }
        #html5-qrcode-anchor-scan-type-change {
          display: none !important; /* Oculta link de subir imagen */
        }
        #reader__status_span { 
          display: none !important; 
        }
      `}</style>
    </div>
  );
}