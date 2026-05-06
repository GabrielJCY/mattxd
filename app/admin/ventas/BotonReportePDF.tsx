"use client";

import jsPDF from "jspdf";
import autoTable, { RowInput, CellDef } from "jspdf-autotable";

interface Venta {
  id_venta: number;
  fecha?: string;
  fecha_raw?: string;
  producto_nombre: string | null;
  modelos_detalle: string | null;
  cliente_full: string | null;
  total: number;
  metodo_pago: string | null;
  sucursal_nombre?: string | null; // Añadido sucursal
  cantidad?: number;
}

export default function BotonReportePDF({ ventas }: { ventas: Venta[] }) {
  const generarPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const ahora = new Date();
    const fechaEmision = ahora.toLocaleDateString("es-BO");
    const horaEmision = ahora.toLocaleTimeString("es-BO", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // --- ESTILO DE MARCA (NEGRO Y GRIS) ---
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 45, "F");

    // Logo / Nombre
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.text("MATT", 15, 25);
    doc.setFont("helvetica", "normal");
    doc.text("BOLIVIA", 62, 25);

    // Subtítulo
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("SALES AUDIT & TRANSACTION LOG", 15, 35);

    // Metadatos derecha
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`REPORTE GENERADO: ${fechaEmision}`, 155, 20);
    doc.text(`HORA: ${horaEmision}`, 155, 25);
    doc.text(`TOTAL REGISTROS: ${ventas.length}`, 155, 30);

    // --- PROCESAMIENTO DE DATOS ---
    const tablaData: any[][] = ventas.map((v) => {
      const esAnulada = Number(v.total) === 0;

      const stringFechaOriginal = v.fecha_raw || v.fecha || "";
      let soloFecha = "S/F";
      let soloHora = "--:--";

      if (stringFechaOriginal.includes(" ")) {
        const partes = stringFechaOriginal.split(" ");
        soloFecha = partes[0].split("-").reverse().join("/");
        soloHora = partes[1].substring(0, 5);
      }

      let cantFinal = 1;
      if (v.cantidad && v.cantidad > 0) {
        cantFinal = Number(v.cantidad);
      } else if (v.modelos_detalle) {
        const match = v.modelos_detalle.match(/\(x(\d+)\)/);
        if (match) cantFinal = parseInt(match[1]);
      }

      return [
        { content: v.id_venta.toString(), styles: { fontStyle: "bold" } },
        `${soloFecha}\n${soloHora}`,
        {
          content: `${(v.sucursal_nombre || "TIENDA").toUpperCase()}\n${(v.cliente_full || "GENERICO").toUpperCase()}`,
          styles: { fontSize: 7 },
        },
        {
          content: `${(v.producto_nombre || "VARIO").toUpperCase()}\n${(v.modelos_detalle || "-").toUpperCase()}`,
          styles: { fontSize: 7, textColor: esAnulada ? [150, 150, 150] : [0, 0, 0] },
        },
        cantFinal,
        {
          content: esAnulada ? "VOID" : (v.metodo_pago || "S/M").toUpperCase(),
          styles: { textColor: esAnulada ? [200, 0, 0] : [0, 0, 0], fontStyle: "bold" },
        },
        {
          content: `${Number(v.total).toFixed(2)}`,
          styles: { halign: "right", fontStyle: "bold" },
        },
      ];
    });

    // --- TABLA ---
    autoTable(doc, {
      startY: 50,
      head: [["ID", "FECHA", "ORIGEN / CLIENTE", "DETALLE PRODUCTO", "CANT", "PAGO", "TOTAL BS"]],
      body: tablaData as RowInput[],
      theme: "grid",
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontSize: 8,
        halign: "center",
        fontStyle: "bold",
      },
      styles: {
        fontSize: 7,
        cellPadding: 3,
        lineColor: [220, 220, 220],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 20, halign: "center" },
        4: { cellWidth: 12, halign: "center" },
        5: { cellWidth: 18, halign: "center" },
        6: { cellWidth: 25 },
      },
    });

    // --- RESUMEN FINAL ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalEfectivo = ventas.filter(v => v.metodo_pago === 'Efectivo').reduce((acc, v) => acc + Number(v.total), 0);
    const totalQR = ventas.filter(v => v.metodo_pago === 'QR').reduce((acc, v) => acc + Number(v.total), 0);
    const totalGlobal = totalEfectivo + totalQR;

    // Caja de Resumen
    doc.setFillColor(245, 245, 245);
    doc.rect(130, finalY, 65, 35, "F");
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(130, finalY, 195, finalY);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("RESUMEN DE CAJA", 135, finalY + 8);
    
    doc.setFont("helvetica", "normal");
    doc.text("TOTAL EFECTIVO:", 135, finalY + 16);
    doc.text(`${totalEfectivo.toFixed(2)} BS`, 190, finalY + 16, { align: "right" });
    
    doc.text("TOTAL QR:", 135, finalY + 22);
    doc.text(`${totalQR.toFixed(2)} BS`, 190, finalY + 22, { align: "right" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL GENERAL:", 135, finalY + 30);
    doc.text(`${totalGlobal.toFixed(2)} BS`, 190, finalY + 30, { align: "right" });

    // Pie de página
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text("Este documento es un registro oficial generado por el sistema Matt Bolivia Core v2.1", 15, 285);
    doc.text(`Página 1 de 1`, 195, 285, { align: "right" });

    doc.save(`MATT_REPORT_${fechaEmision.replace(/\//g, "-")}.pdf`);
  };

  return (
    <button
      onClick={generarPDF}
      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white border-[3px] border-black text-black px-8 py-5 font-black uppercase text-[11px] tracking-[0.2em] hover:bg-black hover:text-white transition-all shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Reporte Audit PDF
    </button>
  );
}