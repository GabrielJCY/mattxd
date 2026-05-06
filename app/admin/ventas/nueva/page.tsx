import { getDatosFormularioVenta } from "../actions";
import { db } from "@/src/lib/db"; // Importamos la DB para la consulta directa
import FormularioVentaDirecta from "./FormularioVentaDirecta";
import Link from "next/link";

/**
 * 1. CONFIGURACIÓN DE RENDERIZADO
 * 'force-dynamic' asegura que los datos se lean en tiempo real.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: Promise<{ 
    id_pedido?: string; 
    id_producto?: string; 
    id_cliente?: string 
  }>;
}

export default async function NuevaVentaPage({ searchParams }: PageProps) {
  
  // 2. DESENVOLVER PARÁMETROS (Requerido en Next.js 15)
  const sParams = await searchParams;
  const id_pedido = sParams.id_pedido;
  const id_producto = sParams.id_producto;
  const id_cliente_url = sParams.id_cliente;

  // 3. OBTENER DATOS DESDE EL SERVER ACTION
  const res = await getDatosFormularioVenta(id_producto ? Number(id_producto) : undefined);

  // 4. LÓGICA DE CLIENTE: Priorizamos el cliente que viene por URL
  let listaClientesFinal = res.clientes || [];

  if (id_cliente_url) {
    try {
      // Consultamos directamente para asegurar que tenemos nombre y apellido
      const resCliente = await db.execute({
        sql: "SELECT id_cliente, nombre, apellido FROM cliente WHERE id_cliente = ? LIMIT 1",
        args: [Number(id_cliente_url)]
      });

      if (resCliente.rows.length > 0) {
        // Insertamos o reemplazamos el cliente específico al principio de la lista
        const clienteEncontrado = JSON.parse(JSON.stringify(resCliente.rows[0]));
        listaClientesFinal = [clienteEncontrado, ...listaClientesFinal];
      }
    } catch (error) {
      console.error("Error obteniendo cliente específico:", error);
    }
  }

  // Manejo de error si la conexión con la base de datos falla
  if (!res.success) {
    return (
      <div className="p-10 text-center border-4 border-black bg-red-100 m-8">
        <h1 className="text-2xl font-black uppercase italic">Error de Conexión</h1>
        <p className="font-bold text-red-600 mt-2">{res.error}</p>
        <Link 
          href="/admin/ventas" 
          className="mt-6 inline-block bg-black text-white px-6 py-3 font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors"
        >
          ← Volver al panel
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-white min-h-screen font-sans">
      
      {/* CABECERA ESTILO BRUTALISTA - MATT BOLIVIA */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6 border-b-[6px] border-black pb-8">
        <div className="text-left">
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
            {id_pedido ? `Pedido #${id_pedido}` : "Venta Directa"}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 font-black uppercase">Admin</span>
            <p className="text-zinc-500 font-bold text-[10px] tracking-[0.4em] uppercase">
              Terminal de Salida // Logística de Calzado
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Link 
            href="/admin/pedido" 
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 border-b-4 border-r-4 border-zinc-600 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-zinc-900 active:translate-x-1 active:translate-y-1 transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,0.1)]"
          >
            ← Volver
          </Link>
        </div>
      </header>

      {/* AVISO DE CONTEXTO */}
      {id_pedido && (
        <div className="mb-8 border-[3px] border-blue-600 bg-blue-50 p-6 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)]">
          <h3 className="text-blue-900 font-black text-sm uppercase mb-1">Confirmación de Despacho</h3>
          <p className="text-[11px] font-bold text-blue-800 uppercase tracking-widest italic leading-relaxed">
            Estás procesando la entrega física del Pedido #{id_pedido}. 
            El sistema descontará automáticamente el stock de la sucursal o almacén que selecciones a continuación.
          </p>
        </div>
      )}

      {/* CONTENEDOR DEL FORMULARIO PRINCIPAL */}
      <main className="border-[4px] border-black p-2 md:p-6 bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,0.05)]">
        <FormularioVentaDirecta 
          productosBase={res.productos}
          modelosTodos={res.modelos} 
          clientes={listaClientesFinal} // Pasamos la lista que incluye al cliente del pedido
          empleados={res.empleados}
          anuncios={[]} 
        />
      </main>

      {/* FOOTER TÉCNICO */}
      <footer className="mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold text-zinc-400 uppercase tracking-[0.3em] pb-10">
        <p>© 2026 Matt Bolivia // Hecho a mano con excelencia</p>
        <div className="flex gap-4">
          <span>Sistema: v2.5.0</span>
          <span className="text-zinc-300">|</span>
          <span>Región: La Paz, Bolivia</span>
        </div>
      </footer>
    </div>
  );
}