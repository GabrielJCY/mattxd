import "./globals.css";
import { Inter, Geist } from "next/font/google";
import { Toaster } from 'sonner';
import { cn } from "@/lib/utils";
import { Providers } from "./providers";
import { Metadata, Viewport } from "next"; // Importamos los tipos

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });
const inter = Inter({ subsets: ["latin"] });

// 1. CONFIGURACIÓN DE SITIO (Metadata)
export const metadata: Metadata = {
  title: "Matt-Bolivia | E-commerce & Sistema",
  description: "Gestión de ventas e inventario",
  manifest: "/manifest.json", // ✅ ENLACE AL MANIFEST PARA LA PWA Y EL APK
};

// 2. CONFIGURACIÓN DE DISPOSITIVO (Viewport) - ESTO ARREGLA EL ERROR
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000', // Opcional: pone la barra del navegador negra en móvil
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body className={cn(
        "antialiased min-h-screen bg-white text-black selection:bg-black selection:text-white",
        "overflow-x-hidden" 
      )}>
        <Providers>
          <main className="relative flex flex-col min-h-screen">
            {children}
          </main>
          
          <Toaster 
            position="top-center" 
            richColors 
            closeButton 
            expand={false}
          />
        </Providers>
      </body>
    </html>
  );
}