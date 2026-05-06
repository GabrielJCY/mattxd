import { Navbar } from "@/components/Navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Min-h-screen asegura que el fondo negro cubra toda la pantalla siempre
    <div className="relative min-h-screen bg-[#0a0a0a]">
      {/* Si tu Navbar es 'fixed', el contenido de <main> se meterá debajo.
         Lo ideal es controlar el espaciado aquí para no repetirlo en cada página.
      */}
      <Navbar />
      
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Footer irá aquí */}
    </div>
  );
}