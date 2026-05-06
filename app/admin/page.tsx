import { getDashboardData } from "./dashboard/actions";
import AdminGuard from "./AdminGuard";
import DashboardClient from "./DashboardClient";

/**
 * --- CONFIGURACIÓN DE DATOS EN VIVO ---
 * Obligamos al Dashboard a recalcular ventas e ingresos
 * cada vez que el administrador entra a la página.
 */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // 1. Obtenemos los datos en el servidor
  // Gracias a force-dynamic, getDashboardData() se ejecutará siempre
  const data = await getDashboardData();

  return (
    <AdminGuard>
      {/* 2. Le pasamos los datos al componente de cliente */}
      <DashboardClient data={data} />
    </AdminGuard>
  );
}