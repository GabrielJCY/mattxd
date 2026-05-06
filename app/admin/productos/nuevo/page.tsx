/**
 * --- CONFIGURACIÓN DE RENDERIZADO DINÁMICO ---
 * force-dynamic: Evita que Next.js guarde esta página como un archivo HTML estático 
 * durante el build, obligando a consultar la base de datos en cada visita.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { db } from "@/src/lib/db";
import FormularioProducto from "./FormularioProducto";

export default async function Page() {
  // 1. Obtenemos los datos de la DB en tiempo real
  const result = await db.execute("SELECT id_categoria, nombre, genero FROM categoria ORDER BY nombre ASC");
  
  // 2. ✅ EL TRUCO: Convertimos a JSON y de vuelta a Objeto 
  // Esto elimina cualquier método o clase oculta, dejando solo "plain objects"
  const categorias = JSON.parse(JSON.stringify(result.rows));

  // 3. Enviamos los datos frescos al Formulario (Client Component)
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <FormularioProducto categorias={categorias} />
    </div>
  );
}