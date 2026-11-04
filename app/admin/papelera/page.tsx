import { listarPapelera, restaurarDesdePapelera } from "@/src/lib/papelera";
import { registrarAuditoria } from "@/src/lib/auditoria";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import {
  ArrowLeft, Archive, Clock3, Package, RotateCcw, ShieldAlert, Trash2,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Compatibilidad con los dos inicios de sesión existentes del prototipo.
// IMPORTANTE: matt_session no está firmada; no usar esta verificación como
// mecanismo de autorización en producción sin proteger la cookie.
async function esAdministrador() {
  const sesion = await getServerSession(authOptions);
  if ((sesion?.user as { role?: string } | undefined)?.role === "admin") {
    return true;
  }

  const cookie = (await cookies()).get("matt_session")?.value;
  if (!cookie) return false;

  try {
    const manual = JSON.parse(cookie) as { role?: string; id?: unknown };
    const id = Number(manual.id);
    return manual.role === "admin" && Number.isSafeInteger(id) && id > 0;
  } catch {
    return false;
  }
}

async function restaurarAccion(formData: FormData) {
  "use server";

  if (!(await esAdministrador())) return;

  const id = Number(formData.get("id_papelera"));
  if (!Number.isSafeInteger(id) || id <= 0) return;

  const resultado = await restaurarDesdePapelera(id);
  if (resultado.success) {
    await registrarAuditoria({
      accion: "RESTAURAR",
      modulo: String(resultado.tabla_origen).toUpperCase(),
      id_registro: resultado.id_registro,
      descripcion: `Se restauró ${resultado.tabla_origen} con ID ${resultado.id_registro} desde la papelera`,
    });
    revalidatePath("/admin/papelera");
    revalidatePath("/admin/productos");
    revalidatePath("/admin/categorias");
    revalidatePath("/", "layout");
  }
}

function formatearFecha(valor: string) {
  const iso = valor.includes("T") ? valor : `${valor.replace(" ", "T")}Z`;
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return valor;
  return fecha.toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
}

function nombreRegistro(datosJson: string, id: number) {
  try {
    const datos = JSON.parse(datosJson) as { nombre?: unknown };
    if (typeof datos.nombre === "string" && datos.nombre.trim()) return datos.nombre;
  } catch {
    // Si el JSON histórico es inválido, se muestra el ID.
  }
  return `Registro #${id}`;
}

export default async function PapeleraPage() {
  const permitido = await esAdministrador();
  if (!permitido) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 md:p-12">
        <div className="mx-auto max-w-xl border-4 border-black bg-white p-8">
          <ShieldAlert size={32} className="mb-4" />
          <h1 className="text-2xl font-black uppercase">Acceso no autorizado</h1>
          <p className="mt-3 text-sm text-slate-600">Solo los administradores pueden consultar la papelera.</p>
          <Link href="/admin" className="mt-6 inline-block font-black underline">Volver al panel</Link>
        </div>
      </main>
    );
  }

  const registros = await listarPapelera();
  const ahora = Date.now();
  const activos = registros.filter((registro) => {
    const fecha = new Date(registro.fecha_expiracion.replace(" ", "T") + "Z");
    return fecha.getTime() > ahora;
  });
  const expirados = registros.length - activos.length;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-emerald-600">
              <Trash2 size={18} strokeWidth={3} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Recovery Center</span>
            </div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl">
              Papelera<span className="text-emerald-500">.</span>
            </h1>
            <p className="mt-3 text-sm font-medium text-slate-500">Registros ocultos, restauraciones y elementos expirados.</p>
          </div>
          <Link href="/admin" className="inline-flex items-center justify-center gap-2 border-[3px] border-black bg-white px-5 py-3 text-xs font-black uppercase shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:shadow-none">
            <ArrowLeft size={16} strokeWidth={3} /> Volver al panel
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="border-4 border-black bg-white p-6">
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-500"><span>En papelera</span><Trash2 size={22} /></div>
            <p className="mt-4 text-4xl font-black">{registros.length}</p>
          </div>
          <div className="border-4 border-black bg-white p-6">
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-500"><span>Restaurables</span><RotateCcw size={22} /></div>
            <p className="mt-4 text-4xl font-black">{activos.length}</p>
          </div>
          <div className="border-4 border-black bg-black p-6 text-white">
            <div className="flex items-center justify-between text-xs font-black uppercase text-slate-300"><span>Expirados / archivados</span><Archive size={22} /></div>
            <p className="mt-4 text-4xl font-black">{expirados}</p>
          </div>
        </div>

        <div className="overflow-hidden border-4 border-black bg-white">
          <div className="flex items-center gap-3 bg-black px-5 py-4 text-white">
            <Package size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest">Elementos en papelera</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="border-b-4 border-black bg-slate-100 text-[10px] font-black uppercase tracking-wider">
                <tr><th className="p-4">Registro</th><th className="p-4">Módulo</th><th className="p-4">ID</th><th className="p-4">Eliminado</th><th className="p-4">Expira</th><th className="p-4">Estado</th><th className="p-4">Acción</th></tr>
              </thead>
              <tbody>
                {registros.length === 0 ? (
                  <tr><td colSpan={7} className="p-12 text-center">
                    <Trash2 size={34} className="mx-auto mb-4 text-slate-300" />
                    <p className="text-sm font-black uppercase">La papelera está vacía</p>
                    <p className="mt-2 text-xs text-slate-500">Los registros aparecerán al enviarlos a la papelera.</p>
                  </td></tr>
                ) : registros.map((registro) => {
                  const expiracion = new Date(registro.fecha_expiracion.replace(" ", "T") + "Z").getTime();
                  const expirado = !Number.isFinite(expiracion) || expiracion <= ahora;
                  return (
                    <tr key={registro.id_papelera} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-4 text-xs font-black uppercase">{nombreRegistro(registro.datos_json, registro.id_registro)}</td>
                      <td className="p-4 text-xs font-black uppercase">{registro.tabla_origen}</td>
                      <td className="p-4 text-xs font-bold">#{registro.id_registro}</td>
                      <td className="p-4 text-xs font-bold whitespace-nowrap">{formatearFecha(registro.fecha_eliminacion)}</td>
                      <td className="p-4 text-xs font-bold whitespace-nowrap">{formatearFecha(registro.fecha_expiracion)}</td>
                      <td className="p-4">
                        <span className={`inline-block border-2 px-2 py-1 text-[10px] font-black uppercase ${expirado ? "border-slate-400 text-slate-500" : "border-black text-emerald-700"}`}>
                          {expirado ? "Expirado" : "Restaurable"}
                        </span>
                      </td>
                      <td className="p-4">
                        {expirado ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-slate-400"><Clock3 size={14} /> Plazo vencido</span>
                        ) : (
                          <form action={restaurarAccion}>
                            <input type="hidden" name="id_papelera" value={registro.id_papelera} />
                            <button type="submit" className="inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-2 text-xs font-black uppercase transition-colors hover:bg-black hover:text-white">
                              <RotateCcw size={14} /> Restaurar
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Los elementos expirados quedan archivados hasta que una limpieza programada los procese.
          La limpieza actual solo purga productos sin referencias; los demás módulos conservan sus registros.
        </p>
      </div>
    </main>
  );
}
