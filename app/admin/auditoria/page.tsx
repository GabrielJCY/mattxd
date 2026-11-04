
import { db } from "@/src/lib/db";
import { getServerSession } from "next-auth";
import {
  Activity,
  Search,
  ShieldCheck,
  Clock3,
  User,
  Database,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface LogAuditoria {
  id_log: number;
  id_admin: number | null;
  accion: string;
  modulo: string;
  id_registro: number | null;
  descripcion: string | null;
  fecha: string;
  nombre_admin: string | null;
  apellido_admin: string | null;
  correo_admin: string | null;
}

interface PageProps {
  searchParams: Promise<{
    q?: string;
    accion?: string;
    modulo?: string;
    page?: string;
  }>;
}

const LIMITE = 15;

function fechaLegible(fecha: string) {
  const fechaUTC = fecha.includes("T")
    ? fecha
    : fecha.replace(" ", "T") + "Z";

  const resultado = new Date(fechaUTC);

  if (Number.isNaN(resultado.getTime())) {
    return fecha;
  }

  return resultado.toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function construirURL(
  params: {
    q: string;
    accion: string;
    modulo: string;
  },
  pagina: number
) {
  const query = new URLSearchParams();

  if (params.q) query.set("q", params.q);
  if (params.accion) query.set("accion", params.accion);
  if (params.modulo) query.set("modulo", params.modulo);

  query.set("page", String(pagina));

  return `/admin/auditoria?${query.toString()}`;
}

export default async function AuditoriaPage({
  searchParams,
}: PageProps) {
  const session = await getServerSession();

  // La ruta debe estar protegida por tu sistema de autorización.
  // Obtener la sesión no sustituye la verificación del rol administrador.
  if (!session?.user?.email) {
    return (
      <main className="min-h-screen p-6 md:p-12 bg-slate-50">
        <div className="max-w-xl mx-auto bg-white border-4 border-black p-8">
          <ShieldCheck className="mb-4" size={30} />
          <h1 className="text-2xl font-black uppercase">
            Acceso no autorizado
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Es necesario iniciar sesión para consultar la auditoría.
          </p>
        </div>
      </main>
    );
  }

  const parametros = await searchParams;

  const q = (parametros.q || "").trim().slice(0, 100);
  const accion = (parametros.accion || "").trim().slice(0, 50);
  const modulo = (parametros.modulo || "").trim().slice(0, 50);

  const paginaSolicitada = Number(parametros.page);
  const pagina =
    Number.isSafeInteger(paginaSolicitada) && paginaSolicitada > 0
      ? paginaSolicitada
      : 1;

  const condiciones: string[] = [];
  const argumentos: string[] = [];

  if (q) {
    condiciones.push(
      `(l.descripcion LIKE ? OR
        a.nombre LIKE ? OR
        a.apellido LIKE ? OR
        a.correo LIKE ?)`
    );

    const busqueda = `%${q}%`;
    argumentos.push(busqueda, busqueda, busqueda, busqueda);
  }

  if (accion) {
    condiciones.push("l.accion = ?");
    argumentos.push(accion);
  }

  if (modulo) {
    condiciones.push("l.modulo = ?");
    argumentos.push(modulo);
  }

  const where =
    condiciones.length > 0
      ? `WHERE ${condiciones.join(" AND ")}`
      : "";

  const conteo = await db.execute({
    sql: `
      SELECT COUNT(*) AS total
      FROM log_auditoria l
      LEFT JOIN admin a ON a.id_admin = l.id_admin
      ${where}
    `,
    args: argumentos,
  });

  const total = Number(conteo.rows[0]?.total ?? 0);
  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));
  const paginaActual = Math.min(pagina, totalPaginas);
  const offset = (paginaActual - 1) * LIMITE;

  const resultado = await db.execute({
    sql: `
      SELECT
        l.id_log,
        l.id_admin,
        l.accion,
        l.modulo,
        l.id_registro,
        l.descripcion,
        l.fecha,
        a.nombre AS nombre_admin,
        a.apellido AS apellido_admin,
        a.correo AS correo_admin
      FROM log_auditoria l
      LEFT JOIN admin a ON a.id_admin = l.id_admin
      ${where}
      ORDER BY l.fecha DESC, l.id_log DESC
      LIMIT ? OFFSET ?
    `,
    args: [...argumentos, LIMITE, offset],
  });

  const logs = resultado.rows as unknown as LogAuditoria[];

  const acciones = await db.execute(
    "SELECT DISTINCT accion FROM log_auditoria ORDER BY accion"
  );

  const modulos = await db.execute(
    "SELECT DISTINCT modulo FROM log_auditoria ORDER BY modulo"
  );

  const filtros = { q, accion, modulo };

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-3">
              <Activity size={18} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                System Monitoring
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter">
              Auditoría
              <span className="text-emerald-500">.</span>
            </h1>

            <p className="mt-3 text-sm font-medium text-slate-500">
              Historial de operaciones y actividades administrativas.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 border-[3px] border-black bg-white px-5 py-3 font-black uppercase text-xs shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all"
          >
            <ChevronLeft size={16} strokeWidth={3} />
            Volver al panel
          </Link>
        </div>

        {/* RESUMEN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border-4 border-black bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">
                Registros encontrados
              </span>
              <Database size={22} />
            </div>
            <p className="mt-4 text-4xl font-black">{total}</p>
          </div>

          <div className="border-4 border-black bg-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-500">
                Página actual
              </span>
              <FileText size={22} />
            </div>
            <p className="mt-4 text-4xl font-black">
              {paginaActual} / {totalPaginas}
            </p>
          </div>

          <div className="border-4 border-black bg-black text-white p-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-300">
                Estado de auditoría
              </span>
              <ShieldCheck size={22} />
            </div>
            <p className="mt-4 text-xl font-black uppercase">
              Consulta disponible
            </p>
          </div>
        </div>

        {/* FILTROS */}
        <form
          action="/admin/auditoria"
          method="GET"
          className="border-4 border-black bg-white p-5 md:p-7"
        >
          <div className="flex items-center gap-2 mb-5">
            <Search size={18} strokeWidth={3} />
            <h2 className="text-sm font-black uppercase tracking-widest">
              Buscar actividad
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Buscar usuario o descripción"
              maxLength={100}
              className="border-[3px] border-black p-3 text-sm font-bold outline-none focus:bg-slate-50"
            />

            <select
              name="accion"
              defaultValue={accion}
              className="border-[3px] border-black p-3 text-sm font-bold outline-none"
            >
              <option value="">Todas las acciones</option>
              {acciones.rows.map((item) => (
                <option
                  key={String(item.accion)}
                  value={String(item.accion)}
                >
                  {String(item.accion)}
                </option>
              ))}
            </select>

            <select
              name="modulo"
              defaultValue={modulo}
              className="border-[3px] border-black p-3 text-sm font-bold outline-none"
            >
              <option value="">Todos los módulos</option>
              {modulos.rows.map((item) => (
                <option
                  key={String(item.modulo)}
                  value={String(item.modulo)}
                >
                  {String(item.modulo)}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-black text-white p-3 font-black uppercase text-sm hover:bg-emerald-600 transition-colors"
            >
              <Search size={16} />
              Filtrar
            </button>
          </div>

          <Link
            href="/admin/auditoria"
            className="inline-block mt-4 text-xs font-black uppercase underline"
          >
            Limpiar filtros
          </Link>
        </form>

        {/* TABLA DE LOGS */}
        <div className="border-4 border-black bg-white overflow-hidden">
          <div className="flex items-center gap-3 bg-black text-white px-5 py-4">
            <Clock3 size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest">
              Historial de eventos
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-100 border-b-4 border-black">
                <tr className="text-[10px] font-black uppercase tracking-wider">
                  <th className="p-4">Fecha</th>
                  <th className="p-4">Administrador</th>
                  <th className="p-4">Acción</th>
                  <th className="p-4">Módulo</th>
                  <th className="p-4">Registro</th>
                  <th className="p-4">Descripción</th>
                </tr>
              </thead>

              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center">
                      <Database
                        size={35}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <p className="text-sm font-black uppercase">
                        No se encontraron registros
                      </p>
                      <p className="text-xs text-slate-500 mt-2">
                        Los eventos aparecerán cuando se conecten las
                        acciones administrativas con la auditoría.
                      </p>
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id_log}
                      className="border-b border-slate-200 hover:bg-slate-50"
                    >
                      <td className="p-4 text-xs font-bold whitespace-nowrap">
                        {fechaLegible(log.fecha)}
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-slate-400" />
                          <div>
                            <p className="text-xs font-black">
                              {log.nombre_admin
                                ? `${log.nombre_admin} ${log.apellido_admin ?? ""}`
                                : "Administrador no disponible"}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {log.correo_admin ?? "Sin correo"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="inline-block border-2 border-black px-2 py-1 text-[10px] font-black uppercase">
                          {log.accion}
                        </span>
                      </td>

                      <td className="p-4 text-xs font-black uppercase">
                        {log.modulo}
                      </td>

                      <td className="p-4 text-xs font-bold">
                        {log.id_registro ?? "—"}
                      </td>

                      <td className="p-4 text-xs text-slate-600">
                        {log.descripcion || "Sin descripción"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINACIÓN */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-50 border-t-2 border-black">
            <span className="text-xs font-black uppercase">
              {total} registros · Página {paginaActual} de {totalPaginas}
            </span>

            <div className="flex gap-2">
              {paginaActual > 1 ? (
                <Link
                  href={construirURL(filtros, paginaActual - 1)}
                  className="flex items-center gap-1 border-2 border-black px-4 py-2 bg-white text-xs font-black uppercase hover:bg-black hover:text-white"
                >
                  <ChevronLeft size={14} />
                  Anterior
                </Link>
              ) : (
                <span className="flex items-center gap-1 border-2 border-slate-200 px-4 py-2 text-xs font-black uppercase text-slate-300">
                  <ChevronLeft size={14} />
                  Anterior
                </span>
              )}

              {paginaActual < totalPaginas ? (
                <Link
                  href={construirURL(filtros, paginaActual + 1)}
                  className="flex items-center gap-1 border-2 border-black px-4 py-2 bg-white text-xs font-black uppercase hover:bg-black hover:text-white"
                >
                  Siguiente
                  <ChevronRight size={14} />
                </Link>
              ) : (
                <span className="flex items-center gap-1 border-2 border-slate-200 px-4 py-2 text-xs font-black uppercase text-slate-300">
                  Siguiente
                  <ChevronRight size={14} />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
