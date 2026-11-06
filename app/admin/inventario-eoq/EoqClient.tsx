"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { guardarParametrosEoq, type EoqFila } from "./actions";
import {
  AlertTriangle, CheckCircle2, Save, Search, Package, Store,
  BarChart3, Truck, Wallet, Info, RotateCcw,
  SlidersHorizontal, Calculator, ChevronRight, CircleHelp,
  ShieldCheck, Boxes, X,
} from "lucide-react";

const FACTORES_Z: Record<number, number> = {
  0.9: 1.28155,
  0.95: 1.64485,
  0.975: 1.95996,
  0.99: 2.32635,
};

type EstadoFiltro = "todos" | "reponer" | "suficiente" | "configurar";
type CampoNumerico =
  | "demanda_diaria"
  | "desviacion_diaria"
  | "costo_pedido"
  | "costo_mantenimiento_anual"
  | "plazo_entrega_dias"
  | "dias_operativos";

type Borrador = Record<CampoNumerico, string> & { nivel_servicio: string };

type Resultado = {
  q: number;
  r: number;
  ss: number;
  reponer: boolean;
  costoAnual: number;
};

const clave = (fila: EoqFila) => `${fila.id_modelo}:${fila.id_sucursal}`;

function borradorDesdeFila(f: EoqFila): Borrador {
  return {
    demanda_diaria: f.demanda_diaria?.toString() ?? "",
    desviacion_diaria: f.desviacion_diaria?.toString() ?? "",
    costo_pedido: f.costo_pedido?.toString() ?? "",
    costo_mantenimiento_anual: f.costo_mantenimiento_anual?.toString() ?? "",
    plazo_entrega_dias: f.plazo_entrega_dias?.toString() ?? "",
    nivel_servicio: String(f.nivel_servicio ?? 0.95),
    dias_operativos: String(f.dias_operativos ?? 365),
  };
}

function calcular(f: EoqFila, p: Borrador): Resultado | null {
  const obligatorios: CampoNumerico[] = [
    "demanda_diaria", "desviacion_diaria", "costo_pedido",
    "costo_mantenimiento_anual", "plazo_entrega_dias", "dias_operativos",
  ];
  if (obligatorios.some(campo => p[campo].trim() === "")) return null;

  const d = Number(p.demanda_diaria);
  const sigma = Number(p.desviacion_diaria);
  const K = Number(p.costo_pedido);
  const h = Number(p.costo_mantenimiento_anual);
  const L = Number(p.plazo_entrega_dias);
  const dias = Number(p.dias_operativos);
  const z = FACTORES_Z[Number(p.nivel_servicio)];

  if (
    ![d, sigma, K, h, L, dias].every(Number.isFinite) ||
    d <= 0 || sigma < 0 || K <= 0 || h <= 0 || L <= 0 || L > 365 ||
    !Number.isInteger(dias) || dias < 1 || dias > 366 || !z
  ) return null;

  const demandaAnual = d * dias;
  const qSinRedondear = Math.sqrt((2 * demandaAnual * K) / h);
  const ssSinRedondear = z * sigma * Math.sqrt(L);
  const rSinRedondear = d * L + ssSinRedondear;
  if (![qSinRedondear, ssSinRedondear, rSinRedondear].every(Number.isFinite)) return null;

  return {
    q: Math.max(1, Math.ceil(qSinRedondear)),
    r: Math.ceil(rSinRedondear),
    ss: Math.ceil(ssSinRedondear),
    reponer: f.stock <= Math.ceil(rSinRedondear),
    costoAnual: (demandaAnual / qSinRedondear) * K + (qSinRedondear / 2) * h,
  };
}

function evaluar(f: EoqFila): Resultado | null {
  // Un resultado del listado siempre parte de parámetros guardados en la BD.
  const p = borradorDesdeFila(f);
  if (
    f.demanda_diaria === null || f.desviacion_diaria === null ||
    f.costo_pedido === null || f.costo_mantenimiento_anual === null ||
    f.plazo_entrega_dias === null || f.nivel_servicio === null ||
    f.dias_operativos === null
  ) return null;
  return calcular(f, p);
}

const formatoBs = (valor: number) =>
  new Intl.NumberFormat("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valor);

function Ayuda({ texto }: { texto: string }) {
  return (
    <span className="group/ayuda relative inline-flex align-middle" tabIndex={0} aria-label={texto}>
      <CircleHelp size={14} className="text-zinc-400 group-hover/ayuda:text-black" />
      <span className="pointer-events-none invisible absolute z-30 bottom-full left-0 mb-2 w-60 rounded-xl bg-zinc-900 px-3 py-2 text-[11px] font-medium leading-relaxed text-white shadow-xl group-hover/ayuda:visible group-focus/ayuda:visible">
        {texto}
      </span>
    </span>
  );
}

function Campo({
  nombre, titulo, descripcion, ejemplo, valor, cambiar, minimo = "0.01",
}: {
  nombre: CampoNumerico;
  titulo: string;
  descripcion: string;
  ejemplo: string;
  valor: string;
  cambiar: (campo: CampoNumerico, valor: string) => void;
  minimo?: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
        {titulo} <Ayuda texto={descripcion} />
      </span>
      <input
        name={nombre}
        type="number"
        inputMode="decimal"
        min={minimo}
        max={nombre === "dias_operativos" ? 366 : undefined}
        step={nombre === "dias_operativos" ? "1" : "any"}
        required
        value={valor}
        onChange={e => cambiar(nombre, e.target.value)}
        placeholder={ejemplo}
        className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition-colors placeholder:font-normal placeholder:text-zinc-400 focus:border-black focus:ring-2 focus:ring-black/5"
      />
      <span className="block text-[11px] leading-relaxed text-zinc-500">{descripcion}</span>
    </label>
  );
}

function PanelConfiguracion({
  fila,
}: {
  fila: EoqFila;
}) {
  const router = useRouter();
  const [valores, setValores] = useState<Borrador>(() => borradorDesdeFila(fila));
  const [pendiente, iniciar] = useTransition();
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [mostrarDetalles, setMostrarDetalles] = useState(false);
  const [mostrarAyudaVentas, setMostrarAyudaVentas] = useState(false);
  const [historialVentas, setHistorialVentas] = useState("");

  const calculoHistorial = useMemo(() => {
    const entradas = historialVentas.split(/[,;\n]+/).map(v => v.trim()).filter(Boolean);
    if (entradas.length < 2) return null;
    const ventas = entradas.map(Number);
    if (ventas.some(v => !Number.isSafeInteger(v) || v < 0)) return null;
    const media = ventas.reduce((a, b) => a + b, 0) / ventas.length;
    const desviacion = Math.sqrt(ventas.reduce((a, b) => a + (b - media) ** 2, 0) / ventas.length);
    return { dias: ventas.length, media, desviacion };
  }, [historialVentas]);

  const resultado = useMemo(() => calcular(fila, valores), [fila, valores]);
  const modificar = (campo: CampoNumerico, valor: string) => {
    setValores(actual => ({ ...actual, [campo]: valor }));
    setMensaje(null);
  };

  const restaurarCampos = () => {
    setValores(borradorDesdeFila(fila));
    setMensaje(null);
  };

  const guardar = (form: FormData) => {
    setMensaje(null);
    iniciar(async () => {
      try {
        const respuesta = await guardarParametrosEoq(form);
        setMensaje({ ok: respuesta.success, texto: respuesta.message });
        if (respuesta.success) {
          router.refresh();
        }
      } catch {
        setMensaje({ ok: false, texto: "No se pudo guardar. Comprueba la conexión e inténtalo otra vez." });
      }
    });
  };

  return (
    <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm xl:sticky xl:top-5">
      <div className="border-b border-zinc-100 bg-zinc-950 p-5 text-white sm:p-6">
        <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
          <SlidersHorizontal size={15} /> Paso 2 · Configurar y calcular
        </div>
        <h2 className="text-xl font-black tracking-tight">¿Cuándo y cuánto debo comprar?</h2>
        <p className="mt-2 text-xs leading-relaxed text-zinc-300">
          Responde estas tres preguntas sobre tus ventas y tu proveedor. Verás la recomendación al instante.
        </p>
      </div>

      <div className="space-y-1 border-b border-zinc-100 bg-zinc-50 p-5 sm:p-6">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prenda seleccionada</p>
        <p className="text-sm font-black uppercase leading-snug">{fila.producto}</p>
        <p className="text-xs text-zinc-600">Talla {fila.talla} · {fila.color}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold ring-1 ring-zinc-200"><Store size={12} />{fila.sucursal}</span>
          <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold ring-1 ring-zinc-200">Tienes {fila.stock} unidades</span>
        </div>
      </div>

      <form action={guardar} className="space-y-6 p-5 sm:p-6">
        <input type="hidden" name="id_modelo" value={fila.id_modelo} />
        <input type="hidden" name="id_sucursal" value={fila.id_sucursal} />

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <BarChart3 size={18} className="text-zinc-700" />
            <div>
              <h3 className="text-sm font-black">1. ¿Cuánto vendes de esta prenda?</h3>
              <p className="text-[11px] text-zinc-500">Considera únicamente esta talla, color y sucursal.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Campo nombre="demanda_diaria" titulo="¿Cuántas unidades vendes al día, en promedio?" descripcion="Si vendiste 30 unidades en 10 días, escribe 3. Puedes ingresar decimales." ejemplo="Ej.: 3" valor={valores.demanda_diaria} cambiar={modificar}/>
            <Campo nombre="desviacion_diaria" titulo="Variación habitual de ventas (unidades)" descripcion="Es la desviación estándar de las ventas diarias, no un porcentaje. Si no la conoces, usa la ayuda de abajo para calcularla." ejemplo="Ej.: 1.4" minimo="0" valor={valores.desviacion_diaria} cambiar={modificar}/>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <button type="button" onClick={() => setMostrarAyudaVentas(v => !v)} aria-expanded={mostrarAyudaVentas} className="flex w-full items-center justify-between gap-2 text-left text-xs font-bold text-zinc-900">
              <span className="flex items-center gap-2"><Calculator size={16}/> No sé mi variación: calcular con ventas de varios días</span>
              <ChevronRight size={16} className={mostrarAyudaVentas ? "rotate-90" : ""}/>
            </button>
            {mostrarAyudaVentas && <div className="mt-4 space-y-3">
              <p className="text-xs leading-relaxed text-zinc-600">Escribe cuántas unidades vendiste cada día, separadas por comas. Incluye los días con cero ventas si abriste la tienda.</p>
              <label className="block text-xs font-semibold text-zinc-800" htmlFor="historial-eoq">Ventas diarias</label>
              <textarea id="historial-eoq" rows={3} value={historialVentas} onChange={e => setHistorialVentas(e.target.value)} placeholder="Ej.: 2, 4, 3, 5, 1" className="w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm outline-none focus:border-black"/>
              {calculoHistorial ? <div className="space-y-2 rounded-xl bg-white p-3 text-xs text-zinc-700">
                <p>Con {calculoHistorial.dias} días: promedio <strong>{calculoHistorial.media.toFixed(2)}</strong> y variación <strong>{calculoHistorial.desviacion.toFixed(2)}</strong> unidades.</p>
                <button type="button" onClick={() => { setValores(v => ({ ...v, demanda_diaria: calculoHistorial.media.toFixed(4), desviacion_diaria: calculoHistorial.desviacion.toFixed(4) })); setMensaje(null); }} className="rounded-lg bg-zinc-900 px-3 py-2 font-bold text-white">Usar estos valores</button>
              </div> : <p className="text-[11px] text-zinc-500">Necesitas al menos dos días con cantidades enteras no negativas.</p>}
              <p className="text-[11px] text-zinc-500">Esta ayuda usa la desviación estándar poblacional de los días ingresados. Para mejores estimaciones, utiliza un historial representativo.</p>
            </div>}
          </div>
          <Campo nombre="dias_operativos" titulo="¿Cuántos días al año vende la tienda?" descripcion="Indica los días que abres y consideras para las ventas. Ejemplo: 300 si cierras algunos días." ejemplo="Ej.: 300" minimo="1" valor={valores.dias_operativos} cambiar={modificar}/>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Wallet size={18} className="text-zinc-700" />
            <div>
              <h3 className="text-sm font-black">2. ¿Cuánto cuesta pedir y guardar mercadería?</h3>
              <p className="text-[11px] text-zinc-500">Los dos importes se expresan en bolivianos (Bs).</p>
            </div>
          </div>
          <Campo nombre="costo_pedido" titulo="¿Cuánto gastas cada vez que haces un pedido? (Bs)" descripcion="Incluye transporte, trámites y otros gastos fijos. No incluyas el precio de compra de las prendas." ejemplo="Ej.: 50" valor={valores.costo_pedido} cambiar={modificar}/>
          <Campo nombre="costo_mantenimiento_anual" titulo="¿Cuánto cuesta guardar UNA unidad durante un año? (Bs)" descripcion="Considera almacenamiento, deterioro, seguro y costo del dinero inmovilizado, según corresponda." ejemplo="Ej.: 12" valor={valores.costo_mantenimiento_anual} cambiar={modificar}/>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
            <Truck size={18} className="text-zinc-700" />
            <div>
              <h3 className="text-sm font-black">3. ¿Cuánto tarda tu proveedor?</h3>
              <p className="text-[11px] text-zinc-500">Esto ayuda a calcular cuándo volver a comprar.</p>
            </div>
          </div>
          <Campo nombre="plazo_entrega_dias" titulo="¿En cuántos días llega el pedido?" descripcion="Cuenta desde que compras hasta que recibes las prendas. El modelo supone que este plazo es constante y no supera 365 días." ejemplo="Ej.: 7" valor={valores.plazo_entrega_dias} cambiar={modificar}/>
          <label className="block space-y-1.5">
            <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
              ¿Qué nivel de protección deseas frente a faltantes? <Ayuda texto="Es la probabilidad objetivo de no agotar el inventario durante un plazo de entrega, bajo los supuestos del modelo. Mayor protección implica una reserva mayor." />
            </span>
            <select name="nivel_servicio" value={valores.nivel_servicio} onChange={e => setValores(v => ({ ...v, nivel_servicio: e.target.value }))}
              className="block w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-black">
              <option value="0.9">90 % · Menor reserva</option>
              <option value="0.95">95 % · Equilibrado</option>
              <option value="0.975">97,5 % · Mayor protección</option>
              <option value="0.99">99 % · Máxima protección disponible</option>
            </select>
            <span className="block text-[11px] leading-relaxed text-zinc-500">El 95 % es un punto de partida para la prueba. Elige según cuánto te perjudicaría quedarte sin unidades.</span>
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2"><Calculator size={18}/><h3 className="text-sm font-black">Recomendación para esta prenda</h3></div>
            <span className="text-[10px] font-semibold text-zinc-500">Sin guardar</span>
          </div>
          {resultado ? (
            <>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-white p-3 text-center ring-1 ring-zinc-200"><p className="text-[10px] font-medium text-zinc-500">¿Cuánto pedir? (Q*)</p><p className="mt-1 text-2xl font-black">{resultado.q}</p><p className="text-[10px] text-zinc-500">unidades por pedido</p></div>
                <div className="rounded-xl bg-white p-3 text-center ring-1 ring-zinc-200"><p className="text-[10px] font-medium text-zinc-500">¿Cuándo pedir? (R)</p><p className="mt-1 text-2xl font-black">{resultado.r}</p><p className="text-[10px] text-zinc-500">unidades de umbral</p></div>
                <div className="rounded-xl bg-white p-3 text-center ring-1 ring-zinc-200"><p className="text-[10px] font-medium text-zinc-500">Reserva (SS)</p><p className="mt-1 text-2xl font-black">{resultado.ss}</p><p className="text-[10px] text-zinc-500">unidades de seguridad</p></div>
              </div>
              <div className={`flex gap-3 rounded-xl p-3 ${resultado.reponer ? "bg-amber-50 text-amber-900" : "bg-emerald-50 text-emerald-900"}`}>
                {resultado.reponer ? <AlertTriangle size={20} className="shrink-0" /> : <CheckCircle2 size={20} className="shrink-0" />}
                <div className="space-y-1">
                  <p className="text-sm font-black">{resultado.reponer ? "Conviene revisar la reposición" : "Stock por encima del punto de reorden"}</p>
                  <p className="text-xs leading-relaxed">{resultado.reponer
                    ? `Hay ${fila.stock} unidades y el punto de reorden es ${resultado.r}. Se sugiere evaluar un pedido de ${resultado.q} unidades.`
                    : `Hay ${fila.stock} unidades; el punto de reorden es ${resultado.r}. No se ha alcanzado el umbral de reposición.`}
                  </p>
                </div>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-600">Estas cifras son una orientación. La alerta se basa en el stock físico; no descuenta reservas ni suma pedidos que ya vienen en camino.</p>
              <button type="button" onClick={() => setMostrarDetalles(!mostrarDetalles)} className="flex items-center gap-1 text-xs font-semibold text-zinc-600 underline underline-offset-4">
                {mostrarDetalles ? "Ocultar detalles matemáticos" : "Ver detalles matemáticos"} <ChevronRight size={14} className={mostrarDetalles ? "rotate-90" : ""}/>
              </button>
              {mostrarDetalles && <div className="rounded-lg bg-white p-3 text-xs leading-relaxed text-zinc-600">
                <p>Q* = √(2 × D × K / h)</p>
                <p>SS = z × σ × √L</p>
                <p>R = demanda diaria × L + SS</p>
                <p className="mt-2">Costo anual estimado de pedidos y mantenimiento: <strong>Bs {formatoBs(resultado.costoAnual)}</strong>. No incluye compras ni faltantes.</p>
              </div>}
            </>
          ) : (
            <div className="flex items-start gap-2 rounded-xl bg-white p-4 text-xs leading-relaxed text-zinc-600">
              <Info size={18} className="shrink-0" /> Completa todos los campos con valores válidos para ver cuántas unidades conviene pedir y cuándo hacerlo.
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row xl:flex-col 2xl:flex-row">
          <button type="submit" disabled={pendiente || !resultado} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-black px-4 py-3.5 text-xs font-black uppercase tracking-wide text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40">
            <Save size={17}/>{pendiente ? "Guardando..." : "Guardar parámetros"}
          </button>
          <button type="button" onClick={restaurarCampos} disabled={pendiente} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 text-xs font-bold text-zinc-700 transition hover:border-black disabled:opacity-40">
            <RotateCcw size={15}/>Restablecer
          </button>
        </div>
        {mensaje && <p role="status" className={`rounded-xl p-3 text-xs font-semibold ${mensaje.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>{mensaje.texto}</p>}
      </form>
    </section>
  );
}

export default function EoqClient({ filas }: { filas: EoqFila[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoFiltro>("todos");
  const [sucursal, setSucursal] = useState("todas");
  const [seleccion, setSeleccion] = useState("");

  const seleccionada = filas.find(f => clave(f) === seleccion) ?? filas[0];
  const configurados = filas.filter(f => evaluar(f) !== null).length;
  const alertas = filas.filter(f => evaluar(f)?.reponer).length;
  const sinConfigurar = filas.length - configurados;
  const sucursales = useMemo(() => Array.from(new Set(filas.map(f => f.sucursal))).sort(), [filas]);

  const filtradas = useMemo(() => filas.filter(f => {
    const texto = `${f.producto} ${f.talla} ${f.color} ${f.sucursal}`.toLocaleLowerCase("es");
    if (!texto.includes(busqueda.trim().toLocaleLowerCase("es"))) return false;
    if (sucursal !== "todas" && f.sucursal !== sucursal) return false;
    const calculo = evaluar(f);
    if (estado === "configurar") return calculo === null;
    if (estado === "reponer") return Boolean(calculo?.reponer);
    if (estado === "suficiente") return Boolean(calculo && !calculo.reponer);
    return true;
  }), [filas, busqueda, estado, sucursal]);

  return (
    <div className="space-y-7 text-zinc-950">
      <div className="rounded-3xl border border-zinc-200 bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="rounded-2xl bg-black p-3 text-white"><Package size={21}/></span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Inventario inteligente · EOQ (Q, R)</p>
            <h2 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Decide cuánto comprar y cuándo reponer</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-zinc-600">Selecciona una prenda, completa sus costos y datos de demanda y obtén una recomendación calculada para esa sucursal.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs font-semibold"><Search size={15}/>1. Encuentra la prenda</div>
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs font-semibold"><SlidersHorizontal size={15}/>2. Completa los datos</div>
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-3 text-xs font-semibold"><CheckCircle2 size={15}/>3. Consulta y guarda</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="flex items-center gap-2 text-xs font-bold text-zinc-500"><Boxes size={16}/>Variantes en inventario</div><p className="mt-3 text-3xl font-black">{filas.length}</p></div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5"><div className="flex items-center gap-2 text-xs font-bold text-zinc-500"><ShieldCheck size={16}/>Con cálculo configurado</div><p className="mt-3 text-3xl font-black">{configurados}</p></div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><div className="flex items-center gap-2 text-xs font-bold text-amber-800"><AlertTriangle size={16}/>Revisar reposición</div><p className="mt-3 text-3xl font-black text-amber-900">{alertas}</p><p className="mt-1 text-[11px] text-amber-800">{sinConfigurar} pendiente(s) de configurar</p></div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <section className="min-w-0 overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
          <div className="space-y-4 border-b border-zinc-100 p-5 sm:p-6">
            <div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Paso 1 · Selección</p><h2 className="mt-1 text-lg font-black">Elige la prenda que deseas analizar</h2><p className="mt-1 text-xs text-zinc-500">Puedes buscar por nombre, talla, color o ubicación.</p></div>
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-4 top-3.5 text-zinc-400"/>
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Ej.: bota, 36, negro..." className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-11 pr-10 text-sm outline-none focus:border-black" aria-label="Buscar prendas" />
              {busqueda && <button type="button" onClick={() => setBusqueda("")} className="absolute right-3 top-3 rounded-lg p-1 text-zinc-500" aria-label="Limpiar búsqueda"><X size={17}/></button>}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3"><Store size={15} className="text-zinc-400"/><select aria-label="Filtrar por sucursal" value={sucursal} onChange={e => setSucursal(e.target.value)} className="w-full bg-transparent py-3 text-xs font-semibold outline-none"><option value="todas">Todas las sucursales</option>{sucursales.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
              <label className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3"><SlidersHorizontal size={15} className="text-zinc-400"/><select aria-label="Filtrar por estado" value={estado} onChange={e => setEstado(e.target.value as EstadoFiltro)} className="w-full bg-transparent py-3 text-xs font-semibold outline-none"><option value="todos">Todos los estados</option><option value="reponer">Requiere reposición</option><option value="suficiente">Stock suficiente</option><option value="configurar">Sin configurar</option></select></label>
            </div>
            <p className="text-[11px] font-medium text-zinc-500">Mostrando {filtradas.length} de {filas.length} variantes</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[680px] w-full text-left text-sm">
              <thead className="bg-zinc-950 text-[10px] font-black uppercase tracking-wider text-white"><tr><th className="p-4">Producto / variante</th><th className="p-4">Sucursal</th><th className="p-4">Stock</th><th className="p-4">Pedir (Q*)</th><th className="p-4">Reorden (R)</th><th className="p-4">Estado</th></tr></thead>
              <tbody>
                {filtradas.map(f => {
                  const resultado = evaluar(f);
                  const activa = seleccionada ? clave(seleccionada) === clave(f) : false;
                  return <tr key={clave(f)} onClick={() => setSeleccion(clave(f))} className={`cursor-pointer border-b border-zinc-100 transition hover:bg-zinc-50 ${activa ? "bg-blue-50/70" : ""}`} aria-selected={activa}>
                    <td className="p-4"><p className="font-bold uppercase leading-snug">{f.producto}</p><p className="mt-1 text-xs text-zinc-500">Talla {f.talla} · {f.color}</p>{activa && <span className="mt-1 inline-block text-[10px] font-bold text-blue-700">Seleccionado →</span>}</td>
                    <td className="p-4 text-xs font-medium">{f.sucursal}</td>
                    <td className="p-4 font-bold">{f.stock}</td>
                    <td className="p-4 font-bold">{resultado?.q ?? "—"}</td>
                    <td className="p-4 font-bold">{resultado?.r ?? "—"}</td>
                    <td className="p-4">{!resultado ? <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-600">Sin configurar</span> : resultado.reponer ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800"><AlertTriangle size={13}/>Reponer</span> : <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800"><CheckCircle2 size={13}/>Suficiente</span>}</td>
                  </tr>;
                })}
                {filtradas.length === 0 && <tr><td colSpan={6} className="p-12 text-center text-sm text-zinc-500">No hay productos que coincidan con los filtros. Prueba otra búsqueda.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-start gap-2 border-t border-zinc-100 bg-zinc-50 p-4 text-[11px] leading-relaxed text-zinc-500"><Info size={16} className="shrink-0"/>La alerta compara el stock físico con el punto de reorden. No considera pedidos pendientes de recepción ni faltantes comprometidos.</div>
        </section>

        {seleccionada ? <PanelConfiguracion key={clave(seleccionada)} fila={seleccionada} /> :
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 text-center"><Package className="mx-auto mb-3 text-zinc-300" size={32}/><p className="font-bold">Aún no hay inventario</p><p className="mt-2 text-sm text-zinc-500">Registra existencias por variante y sucursal para comenzar a calcular.</p></div>}
      </div>
      <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-white p-5 text-xs leading-relaxed text-zinc-600"><Info size={18} className="shrink-0"/><p><strong>Cómo interpretar el modelo:</strong> EOQ calcula cuánto pedir equilibrando costos de pedido y mantenimiento. El punto de reorden y el stock de seguridad usan una aproximación normal para demanda diaria independiente, con plazo de entrega constante. Las recomendaciones son orientativas; no generan pedidos automáticamente. Utiliza costos y demanda reales para decisiones comerciales.</p></div>
    </div>
  );
}
