import { db } from "@/src/lib/db";
import ListaStockCliente from "../ListaStockCliente";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ sede: string }>;
  searchParams: Promise<{ gender?: string }>;
}

export default async function SedePage(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  const sedeUrl = params.sede.toLowerCase();
  const genero = (searchParams.gender || "hombre").toLowerCase();

  const sedeIdMap: { [key: string]: number } = {
    "tumusla": 2,
    "illampu": 3,
    "almacen": 4
  };

  if (!(sedeUrl in sedeIdMap)) {
    notFound();
  }

  const currentSedeId = sedeIdMap[sedeUrl];

  // 1. Obtener Productos filtrados por género
  const resProd = await db.execute({
    sql: `
      SELECT p.* FROM producto p
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      WHERE LOWER(c.genero) = ? 
      ORDER BY p.nombre ASC
    `,
    args: [genero]
  });
  
  // 2. Lógica de Stock Híbrida 
  let sqlMod = "";
  let argsMod: any[] = [];

  if (sedeUrl === "almacen") {
    // MODO ALMACÉN: Muestra los que son ID 4 o NULL
    sqlMod = `
      SELECT 
        m.*, 
        IFNULL(s.cantidad, m.stock_admin) as cantidad 
      FROM modelo m
      INNER JOIN producto p ON m.id_producto = p.id_producto
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN stock s ON m.id_modelo = s.id_modelo AND (s.id_sucursal = 4 OR s.id_sucursal IS NULL)
      WHERE LOWER(c.genero) = ?
      ORDER BY m.talla ASC, m.color ASC
    `;
    argsMod = [genero];
  } else {
    // MODO SEDES (Illampu, Tumusla):
    // IMPORTANTE: Quitamos el LEFT JOIN y usamos uno que busque 
    // específicamente si el modelo está asignado a ESTA sede.
    sqlMod = `
      SELECT 
        m.*, 
        IFNULL(s.cantidad, 0) as cantidad 
      FROM modelo m 
      INNER JOIN producto p ON m.id_producto = p.id_producto
      INNER JOIN categoria c ON p.id_categoria = c.id_categoria
      LEFT JOIN stock s ON m.id_modelo = s.id_modelo 
      WHERE LOWER(c.genero) = ?
      AND s.id_sucursal = ?
      ORDER BY m.talla ASC, m.color ASC
    `;
    argsMod = [genero, currentSedeId];
  }

  const resMod = await db.execute({ sql: sqlMod, args: argsMod });

  const productos = JSON.parse(JSON.stringify(resProd.rows));
  const todosLosModelos = JSON.parse(JSON.stringify(resMod.rows));

  return (
    <div className="p-0 sm:p-6 md:p-8 max-w-7xl mx-auto bg-white min-h-screen font-sans">
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6 border-b-[6px] border-black pb-8 p-4 md:p-0">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-6xl font-black text-black uppercase tracking-tighter leading-none italic">
            {sedeUrl === "almacen" ? "Almacén Central" : `Sede ${sedeUrl}`}
          </h1>
          <div className="flex items-center gap-3 mt-2">
             <span className="bg-black text-white text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest">
               ID SUCURSAL: {currentSedeId}
             </span>
             <p className="text-zinc-400 font-bold text-[10px] tracking-[0.4em] uppercase">
               Sección: {genero}
             </p>
          </div>
        </div>
        
        <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
          <Link 
            href="/admin" 
            className="w-full md:w-auto bg-black text-white px-8 py-4 font-black uppercase text-xs tracking-widest border-b-4 border-r-4 border-zinc-700 hover:bg-zinc-900 active:translate-y-1 transition-all text-center"
          >
            ← Volver al Panel
          </Link>
        </div>
      </header>

      <main className="relative w-full">
        <div className="md:border-[4px] md:border-black bg-white md:p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-none">
           <ListaStockCliente 
            productos={productos} 
            todosLosModelos={todosLosModelos} 
            sedeId={currentSedeId} 
          />
        </div>

        {todosLosModelos.length === 0 && (
          <div className="mt-12 p-20 border-4 border-dashed border-zinc-200 text-center">
            <p className="text-zinc-400 font-black uppercase tracking-[0.2em] text-sm">
              No hay stock asignado a {sedeUrl} para "{genero}".
            </p>
          </div>
        )}
      </main>
    </div>
  );
}