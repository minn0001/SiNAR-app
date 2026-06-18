/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
 
import React, { useState, useRef } from "react";
import {
  FileText,
  BarChart4,
  CalendarClock,
  Layers3,
  FileSpreadsheet,
  FileCode,
  FileDown,
  Grid3X3,
  TrendingUp,
  Download,
  AlertCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { Archive, KategoriArsip, StatusArsip } from "../types";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";
 
interface ReportsProps {
  archives: Archive[];
}
 
export default function Reports({ archives }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<
    "Per Kategori" | "Per Periode" | "Rekapitulasi"
  >("Per Kategori");
  const [periodFilter, setPeriodFilter] = useState<
    "3 Bulan" | "65 Bulan" | "1 Tahun" | "Custom"
  >("1 Tahun");
  const [isExporting, setIsExporting] = useState(false);
 
  // Sum categories
  const getCategoryCount = (cat: KategoriArsip) =>
    archives.filter((a) => a.kategori === cat).length;
 
  // Data 1: Category counts for Chart & Table
  const categoryChartData = Object.values(KategoriArsip).map((cat) => ({
    Kategori: cat.replace("Akta ", "Akta: "),
    Jumlah: getCategoryCount(cat),
  }));
 
  // Data 2: Period counts
  const getPeriodData = () => {
    switch (periodFilter) {
      case "3 Bulan":
        return [
          { Bulan: "Maret 2026", Volume: 14 },
          { Bulan: "April 2026", Volume: 22 },
          { Bulan: "Mei 2026", Volume: 19 },
          { Bulan: "Juni 2026 (berjalan)", Volume: 15 },
        ];
      case "65 Bulan":
        return [
          { Bulan: "Januari 2026", Volume: 9 },
          { Bulan: "Februari 2026", Volume: 12 },
          { Bulan: "Maret 2026", Volume: 14 },
          { Bulan: "April 2026", Volume: 22 },
          { Bulan: "Mei 2026", Volume: 19 },
          { Bulan: "Juni 2026", Volume: 15 },
        ];
      case "1 Tahun":
        return [
          { Bulan: "Jul '25", Volume: 11 },
          { Bulan: "Ags '25", Volume: 18 },
          { Bulan: "Sep '25", Volume: 25 },
          { Bulan: "Okt '25", Volume: 30 },
          { Bulan: "Nov '25", Volume: 20 },
          { Bulan: "Des '25", Volume: 15 },
          { Bulan: "Jan '26", Volume: 9 },
          { Bulan: "Feb '26", Volume: 12 },
          { Bulan: "Mar '26", Volume: 14 },
          { Bulan: "Apr '26", Volume: 22 },
          { Bulan: "Mei '26", Volume: 19 },
          { Bulan: "Jun '26", Volume: 15 },
        ];
      case "Custom":
        return [
          { Bulan: "Tahun 2022", Volume: 120 },
          { Bulan: "Tahun 2023", Volume: 165 },
          { Bulan: "Tahun 2024", Volume: 198 },
          { Bulan: "Tahun 2025", Volume: 230 },
          { Bulan: "Tahun 2026 (berjalan)", Volume: 91 },
        ];
    }
  };
 
  // Data 3: Status counts
  const statusSummary = Object.values(StatusArsip).map((st) => ({
    Status: st,
    Jumlah: archives.filter((a) => a.statusArsip === st).length,
  }));
 
  // Data 4: Unit pengolah counts
  const unitSummary = Array.from(
    new Set(archives.map((a) => a.unitPengolah).filter(Boolean))
  ).map((unit) => ({
    Unit: unit,
    Jumlah: archives.filter((a) => a.unitPengolah === unit).length,
  }));

// Helper: gambar tabel di PDF
  const drawTable = (
  pdf: jsPDF,
  headers: string[],
  rows: string[][],
  colWidths: number[],
  startY: number,
  margin: number,
  _contentW: number,
  centerCols: number[] = []
) => {
  const rowH = 8;

  // Header row background
  pdf.setFillColor(245, 230, 200);
  pdf.rect(margin, startY, colWidths.reduce((a, b) => a + b, 0), rowH, "F");
  pdf.setTextColor(11, 31, 58);
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "bold");

  let x = margin;
  headers.forEach((h, i) => {
    if (centerCols.includes(i)) {
      pdf.text(h, x + colWidths[i] / 2, startY + 5.5, { align: "center" });
    } else {
      pdf.text(h, x + 3, startY + 5.5);
    }
    x += colWidths[i];
  });

  // Data rows
  rows.forEach((row, rIdx) => {
    const y = startY + rowH * (rIdx + 1);
    pdf.setFillColor(
      rIdx % 2 === 0 ? 250 : 255,
      rIdx % 2 === 0 ? 250 : 255,
      rIdx % 2 === 0 ? 248 : 255
    );
    pdf.rect(margin, y, colWidths.reduce((a, b) => a + b, 0), rowH, "F");
    pdf.setDrawColor(232, 220, 200);
    pdf.setLineWidth(0.2);
    pdf.line(
      margin,
      y + rowH,
      margin + colWidths.reduce((a, b) => a + b, 0),
      y + rowH
    );

    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(74, 85, 104);
    pdf.setFontSize(7.5);

    let cx = margin;
    row.forEach((cell, i) => {
      if (centerCols.includes(i)) {
        pdf.text(String(cell), cx + colWidths[i] / 2, y + 5.5, { align: "center" });
      } else {
        pdf.text(String(cell), cx + 3, y + 5.5);
      }
      cx += colWidths[i];
    });
  });

  // Border luar
  pdf.setDrawColor(200, 155, 60);
  pdf.setLineWidth(0.4);
  pdf.rect(
    margin,
    startY,
    colWidths.reduce((a, b) => a + b, 0),
    rowH * (rows.length + 1),
    "S"
  );
};
 
  // ─── CETAK PDF ─────────────────────────────────────────────────────────────
  const handleCetakPDF = async () => {
    setIsExporting(true);
 
    try {
      const isLandscape = activeTab === "Per Periode";
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4",
      });
 
      const pageW = isLandscape ? 297 : 210;
      const pageH = isLandscape ? 210 : 297;
      const margin = 14;
      const contentW = pageW - margin * 2;
 
      // ── Header ──
      pdf.setFillColor(11, 31, 58); // #0B1F3A
      pdf.rect(0, 0, pageW, 28, "F");
 
      pdf.setTextColor(200, 155, 60); // #C89B3C gold
      pdf.setFontSize(13);
      pdf.setFont("helvetica", "bold");
      pdf.text("KANTOR NOTARIS & PPAT RINA MAHARANI, S.H., M.Kn.", margin, 11);
 
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Jl. Sudirman No. 45, Jakarta Selatan  |  Telp. (021) 5551234  |  notaris.rinamaharani@gmail.com",
        margin,
        17
      );
 
      pdf.setDrawColor(200, 155, 60);
      pdf.setLineWidth(0.5);
      pdf.line(margin, 22, pageW - margin, 22);
 
      pdf.setTextColor(200, 155, 60);
      pdf.setFontSize(7);
      pdf.text(`SiNAR – Sistem Arsip Digital`, margin, 26);
 
      // ── Judul Laporan ──
      let judulLaporan = "";
      let subjudulLaporan = "";
      if (activeTab === "Per Kategori") {
        judulLaporan = "LAPORAN KEARSIPAN PER KATEGORI";
        subjudulLaporan = "Rincian volume dokumen berdasarkan klasifikasi kategori arsip notarisan";
      } else if (activeTab === "Per Periode") {
        const filterLabel =
          periodFilter === "65 Bulan" ? "6 Bulan" : periodFilter;
        judulLaporan = `LAPORAN LAJU PERTUMBUHAN ARSIP – ${filterLabel.toUpperCase()}`;
        subjudulLaporan = "Rincian volume dokumen terunggah per periode waktu";
      } else {
        judulLaporan = "LAPORAN REKAPITULASI ARSIP";
        subjudulLaporan =
          "Ringkasan status arsip dan breakdown per unit pengolah";
      }
 
      pdf.setTextColor(11, 31, 58);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text(judulLaporan, pageW / 2, 38, { align: "center" });
 
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(subjudulLaporan, pageW / 2, 44, { align: "center" });
 
      const tanggalCetak = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      pdf.setFontSize(7);
      pdf.text(`Dicetak pada: ${tanggalCetak}`, pageW / 2, 49, {
        align: "center",
      });
 
      pdf.setDrawColor(232, 220, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, 52, pageW - margin, 52);
 
      // ── Konten Tabel ──
      let startY = 58;
 
      if (activeTab === "Per Kategori") {
        // Tabel Per Kategori
        const headers = [
          "No.",
          "Nama Kategori",
          "Kode Internal",
          "Masa Retensi",
          "Jumlah Berkas",
        ];
        const colWidths = [10, 65, 35, 35, 35];
        const rows = Object.values(KategoriArsip).map((cat, idx) => {
          let code = "DOK";
          let retention = "5 Tahun";
          if (cat === KategoriArsip.AKTA_JUAL_BELI) {
            code = "AKTA-AJB";
            retention = "30 Tahun";
          } else if (cat === KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN) {
            code = "AKTA-APP";
            retention = "30 Tahun";
          } else if (cat === KategoriArsip.SURAT_KUASA) {
            code = "SK";
            retention = "10 Tahun";
          } else if (cat === KategoriArsip.PERJANJIAN) {
            code = "PERJ";
            retention = "10 Tahun";
          } else if (cat === KategoriArsip.SERTIFIKAT) {
            code = "SHM/SHGB";
            retention = "Permanen";
          }
          return [
            String(idx + 1),
            cat,
            code,
            retention,
            String(getCategoryCount(cat)),
          ];
        });
 
        drawTable(pdf, headers, rows, colWidths, startY, margin, contentW, [0, 4]);
        startY += (rows.length + 1) * 8 + 6;
 
        // Summary box
        pdf.setFillColor(253, 248, 240);
        pdf.setDrawColor(200, 155, 60);
        pdf.roundedRect(margin, startY, contentW, 12, 2, 2, "FD");
        pdf.setTextColor(11, 31, 58);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `TOTAL KESELURUHAN ARSIP: ${archives.length} berkas`,
          margin + 5,
          startY + 8
        );
      } else if (activeTab === "Per Periode") {
        // Tabel Per Periode
        const periodData = getPeriodData();
        const filterLabel =
          periodFilter === "65 Bulan" ? "6 Bulan" : periodFilter;
        const headers = [
          "No.",
          "Periode",
          "Status Audit",
          "Jumlah Berkas Terunggah",
        ];
        const colWidths = [15, 100, 80, 74];
        const rows = periodData.map((row, idx) => [
          String(idx + 1),
          row.Bulan,
          "TERKUALIFIKASI CERTIFIED",
          `${row.Volume} berkas`,
        ]);
        const total = periodData.reduce((s, r) => s + r.Volume, 0);
 
        drawTable(pdf, headers, rows, colWidths, startY, margin, contentW, [0, 2, 3]);
        startY += (rows.length + 1) * 8 + 6;
 
        pdf.setFillColor(253, 248, 240);
        pdf.setDrawColor(200, 155, 60);
        pdf.roundedRect(margin, startY, contentW, 12, 2, 2, "FD");
        pdf.setTextColor(11, 31, 58);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `TOTAL BERKAS PERIODE ${filterLabel.toUpperCase()}: ${total} berkas`,
          margin + 5,
          startY + 8
        );
      } else {
        // Rekapitulasi — 2 tabel
        // Tabel 1: Status
        pdf.setTextColor(11, 31, 58);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text("A. Rekapitulasi Berdasarkan Status Arsip", margin, startY);
        startY += 5;
 
        const statusHeaders = ["No.", "Status Prosedur", "Definisi", "Jumlah"];
        const statusColWidths = [10, 50, 100, 26];
        const statusRows = statusSummary.map((row, idx) => {
          let desc = "Berkas aktif, berlanjut masa retensi";
          if (row.Status === StatusArsip.INAKTIF)
            desc = "Retensi usai, berkas pasif";
          else if (row.Status === StatusArsip.PERMANEN)
            desc = "Asal selamanya disimpan";
          else if (row.Status === StatusArsip.MENUNGGU_PEMUSNAHAN)
            desc = "Berkas kedaluwarsa siap dilebur";
          return [String(idx + 1), row.Status, desc, String(row.Jumlah)];
        });
 
        drawTable(
          pdf,
          statusHeaders,
          statusRows,
          statusColWidths,
          startY,
          margin,
          contentW,
          [0, 3]
        );
        startY += (statusRows.length + 1) * 8 + 12;
 
        // Tabel 2: Unit Pengolah
        pdf.setTextColor(11, 31, 58);
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          "B. Rekapitulasi Berdasarkan Unit Pengolah",
          margin,
          startY
        );
        startY += 5;
 
        const unitHeaders = [
          "No.",
          "Unit Pengolah",
          "Supervisor Lapangan",
          "Jumlah",
        ];
        const unitColWidths = [10, 55, 95, 26];
        const unitRows = unitSummary.map((row, idx) => {
          let chief = "Bp. Robertus, S.H.";
          if (row.Unit === "Divisi PPAT") chief = "Ibu Hj. Ratna, S.H.";
          else if (row.Unit === "Divisi Korporasi")
            chief = "Sdr. Prasetyo, S.H., M.Kn.";
          else if (row.Unit === "Divisi Pertanahan")
            chief = "Sdr. Hermawan, S.H.";
          return [String(idx + 1), row.Unit, chief, String(row.Jumlah)];
        });
 
        drawTable(
          pdf,
          unitHeaders,
          unitRows,
          unitColWidths,
          startY,
          margin,
          contentW,
          [0, 3]
        );
        startY += (unitRows.length + 1) * 8 + 6;
 
        pdf.setFillColor(253, 248, 240);
        pdf.setDrawColor(200, 155, 60);
        pdf.roundedRect(margin, startY, contentW, 12, 2, 2, "FD");
        pdf.setTextColor(11, 31, 58);
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "bold");
        pdf.text(
          `TOTAL KESELURUHAN ARSIP: ${archives.length} berkas`,
          margin + 5,
          startY + 8
        );
      }
 
      // ── Footer ──
      const footerY = pageH - 14;
      pdf.setDrawColor(232, 220, 200);
      pdf.setLineWidth(0.3);
      pdf.line(margin, footerY - 3, pageW - margin, footerY - 3);
      pdf.setFontSize(7);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont("helvetica", "normal");
      pdf.text(
        "Dicetak otomatis oleh SiNAR – Sistem Arsip Digital Kantor Notaris & PPAT Rina Maharani, S.H., M.Kn.",
        margin,
        footerY
      );
      pdf.text(`Hal. 1`, pageW - margin, footerY, { align: "right" });
 
      // ── Simpan ──
      const fileName = `Laporan_${activeTab.replace(" ", "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error("Gagal ekspor PDF:", err);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };
 
  // ─── EXPORT EXCEL ──────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    setIsExporting(true);
 
    try {
      const wb = XLSX.utils.book_new();
      const tanggal = new Date().toLocaleDateString("id-ID");
 
      if (activeTab === "Per Kategori") {
        // Sheet 1: Data Kategori
        const data = Object.values(KategoriArsip).map((cat) => {
          let code = "DOK";
          let retention = "5 Tahun";
          if (cat === KategoriArsip.AKTA_JUAL_BELI) {
            code = "AKTA-AJB";
            retention = "30 Tahun";
          } else if (cat === KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN) {
            code = "AKTA-APP";
            retention = "30 Tahun";
          } else if (cat === KategoriArsip.SURAT_KUASA) {
            code = "SK";
            retention = "10 Tahun";
          } else if (cat === KategoriArsip.PERJANJIAN) {
            code = "PERJ";
            retention = "10 Tahun";
          } else if (cat === KategoriArsip.SERTIFIKAT) {
            code = "SHM/SHGB";
            retention = "Permanen";
          }
          return {
            "Nama Kategori": cat,
            "Kode Internal": code,
            "Masa Retensi": retention,
            "Jumlah Berkas": getCategoryCount(cat),
          };
        });
 
        // Tambah baris header info
        const ws = XLSX.utils.aoa_to_sheet([
          ["KANTOR NOTARIS & PPAT RINA MAHARANI, S.H., M.Kn."],
          ["Laporan Kearsipan Per Kategori"],
          [`Tanggal Cetak: ${tanggal}`],
          [],
        ]);
        XLSX.utils.sheet_add_json(ws, data, { origin: "A5" });
        XLSX.utils.book_append_sheet(wb, ws, "Per Kategori");
      } else if (activeTab === "Per Periode") {
        const periodData = getPeriodData();
        const filterLabel =
          periodFilter === "65 Bulan" ? "6 Bulan" : periodFilter;
        const data = periodData.map((row) => ({
          Periode: row.Bulan,
          "Status Audit": "TERKUALIFIKASI CERTIFIED",
          "Jumlah Berkas": row.Volume,
        }));
 
        const ws = XLSX.utils.aoa_to_sheet([
          ["KANTOR NOTARIS & PPAT RINA MAHARANI, S.H., M.Kn."],
          [`Laporan Laju Pertumbuhan Arsip – ${filterLabel}`],
          [`Tanggal Cetak: ${tanggal}`],
          [],
        ]);
        XLSX.utils.sheet_add_json(ws, data, { origin: "A5" });
 
        // Baris total
        const totalRow = periodData.reduce((s, r) => s + r.Volume, 0);
        const lastRow = 5 + data.length + 1;
        XLSX.utils.sheet_add_aoa(
          ws,
          [["", "TOTAL", totalRow]],
          { origin: `A${lastRow}` }
        );
 
        XLSX.utils.book_append_sheet(wb, ws, "Per Periode");
      } else {
      // Rekapitulasi — 1 sheet, 2 tabel (sama seperti PDF)
      const statusData = statusSummary.map((row) => {
        let desc = "Berkas aktif, berlanjut masa retensi";
        if (row.Status === StatusArsip.INAKTIF)
          desc = "Retensi usai, berkas pasif";
        else if (row.Status === StatusArsip.PERMANEN)
          desc = "Asal selamanya disimpan";
        else if (row.Status === StatusArsip.MENUNGGU_PEMUSNAHAN)
          desc = "Berkas kedaluwarsa siap dilebur";
        return {
          "Status Prosedur": row.Status,
          Definisi: desc,
          Jumlah: row.Jumlah,
        };
      });
    
      const unitData = unitSummary.map((row) => {
        return {
          "Unit Pengolah": row.Unit,
          Jumlah: row.Jumlah,
        };
      });
    
      // Buat 1 sheet gabungan
      const ws = XLSX.utils.aoa_to_sheet([
        ["KANTOR NOTARIS & PPAT RINA MAHARANI, S.H., M.Kn."],
        ["Laporan Rekapitulasi Arsip"],
        [`Tanggal Cetak: ${tanggal}`],
        [],
        ["A. Rekapitulasi Berdasarkan Status Arsip"],
      ]);
    
      // Tabel 1: Status (mulai baris 6)
      XLSX.utils.sheet_add_json(ws, statusData, { origin: "A6" });
    
      // Baris kosong pemisah + judul tabel 2
      const tabel2StartRow = 6 + statusData.length + 2;
      XLSX.utils.sheet_add_aoa(
        ws,
        [["B. Rekapitulasi Berdasarkan Unit Pengolah"]],
        { origin: `A${tabel2StartRow}` }
      );
    
      // Tabel 2: Unit Pengolah
      XLSX.utils.sheet_add_json(ws, unitData, {
        origin: `A${tabel2StartRow + 1}`,
      });
    
      // Total di bawah
      const totalRow = tabel2StartRow + 1 + unitData.length + 1;
      XLSX.utils.sheet_add_aoa(
        ws,
        [[`TOTAL KESELURUHAN ARSIP: ${archives.length} berkas`]],
        { origin: `A${totalRow}` }
      );
    
      XLSX.utils.book_append_sheet(wb, ws, "Rekapitulasi");
    }
       
      const fileName = `Laporan_${activeTab.replace(" ", "_")}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      alert("Gagal membuat file Excel. Silakan coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };
 
  return (
    <div className="space-y-6">
      {/* HEADER SECTION WITH EXPORTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] select-none">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide">
            Pusat Pelaporan Kearsipan
          </h2>
          <p className="text-[#4A5568] text-xs font-sans">
            Konsolidasi statistika kategorisasi, rincian bulanan, dan audit
            status arsip notarisan
          </p>
        </div>
 
        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCetakPDF}
            disabled={isExporting}
            className="px-3 py-1.5 text-xs font-bold bg-[#FAFAF8] hover:bg-[#FDF8F0] hover:text-[#C89B3C] border border-[#D4B896] hover:border-[#C89B3C] text-[#0B1F3A] rounded transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileDown className="w-3.5 h-3.5" />
            {isExporting ? "Memproses..." : "Cetak PDF"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="px-3 py-1.5 text-xs font-bold bg-[#C89B3C] text-white hover:bg-[#A67C2D] rounded transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            {isExporting ? "Memproses..." : "Export Excel"}
          </button>
        </div>
      </div>
 
      {/* THREE TABS NAVIGATOR */}
      <div className="flex border-b border-[#E8DCC8] select-none font-sans">
        <button
          onClick={() => setActiveTab("Per Kategori")}
          className={`flex-1 sm:flex-initial px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "Per Kategori"
              ? "border-[#C89B3C] text-[#C89B3C] font-bold bg-[#FDF8F0]"
              : "border-transparent text-[#718096] hover:text-[#0B1F3A]"
          }`}
        >
          <Layers3 className="w-4 h-4" /> Per Kategori
        </button>
 
        <button
          onClick={() => setActiveTab("Per Periode")}
          className={`flex-1 sm:flex-initial px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "Per Periode"
              ? "border-[#C89B3C] text-[#C89B3C] font-bold bg-[#FDF8F0]"
              : "border-transparent text-[#718096] hover:text-[#0B1F3A]"
          }`}
        >
          <CalendarClock className="w-4 h-4" /> Per Periode
        </button>
 
        <button
          onClick={() => setActiveTab("Rekapitulasi")}
          className={`flex-1 sm:flex-initial px-5 py-3 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
            activeTab === "Rekapitulasi"
              ? "border-[#C89B3C] text-[#C89B3C] font-bold bg-[#FDF8F0]"
              : "border-transparent text-[#718096] hover:text-[#0B1F3A]"
          }`}
        >
          <Grid3X3 className="w-4 h-4" /> Rekapitulasi
        </button>
      </div>
 
      {/* --- TAB CONTENT: PER KATEGORI --- */}
      {activeTab === "Per Kategori" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
            <h3 className="text-sm font-semibold uppercase font-display text-[#0B1F3A] tracking-widest border-b border-[#E8DCC8]/65 pb-2 mb-4">
              Grafik Kearsipan: Dokumen per Kategori
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryChartData}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                  <XAxis dataKey="Kategori" stroke="#718096" fontSize={9} />
                  <YAxis stroke="#718096" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#C89B3C",
                      color: "#0B1F3A",
                    }}
                    itemStyle={{ color: "#A67C2D" }}
                  />
                  <Bar dataKey="Jumlah" fill="#C89B3C" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index % 2 === 0 ? "#C89B3C" : "#A67C2D"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
 
          <div className="bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden">
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] flex justify-between items-center select-none font-sans">
              <span className="text-xs font-semibold text-[#0B1F3A] uppercase">
                Tabel Rincian Volume per Kategori
              </span>
              <span className="text-[10px] bg-[#FDF8F0] text-[#C89B3C] px-2 py-0.5 rounded border border-[#C89B3C]/20">
                TOTAL ARCHIVE: {archives.length}
              </span>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5E6C8] text-[#0B1F3A] border-b border-[#E8DCC8] uppercase font-mono">
                  <th className="p-3 pl-5">Nama Kategori Kearsipan</th>
                  <th className="p-3">Kode Internal</th>
                  <th className="p-3 text-center">Masa Retensi Standar</th>
                  <th className="p-3 text-right pr-5">Jumlah Berkas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]/65 text-[#4A5568]">
                {Object.values(KategoriArsip).map((cat, idx) => {
                  let code = "DOK";
                  let retention = "5 Tahun";
                  if (cat === KategoriArsip.AKTA_JUAL_BELI) {
                    code = "AKTA-AJB";
                    retention = "30 Tahun";
                  } else if (cat === KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN) {
                    code = "AKTA-APP";
                    retention = "30 Tahun";
                  } else if (cat === KategoriArsip.SURAT_KUASA) {
                    code = "SK";
                    retention = "10 Tahun";
                  } else if (cat === KategoriArsip.PERJANJIAN) {
                    code = "PERJ";
                    retention = "10 Tahun";
                  } else if (cat === KategoriArsip.SERTIFIKAT) {
                    code = "SHM/SHGB";
                    retention = "Permanen";
                  }
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150"
                    >
                      <td className="p-3 pl-5 font-semibold text-[#0B1F3A]">
                        {cat}
                      </td>
                      <td className="p-3 font-mono text-[#718096]">{code}</td>
                      <td className="p-3 text-center font-medium italic text-[#718096]">
                        {retention}
                      </td>
                      <td className="p-3 text-right font-bold text-[#A67C2D] pr-5 font-mono">
                        {getCategoryCount(cat)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
 
      {/* --- TAB CONTENT: PER PERIODE --- */}
      {activeTab === "Per Periode" && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DCC8]/65 pb-3 mb-4 select-none">
              <h3 className="text-sm font-semibold uppercase font-display text-[#0B1F3A] tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#C89B3C]" /> Grafik Laju
                Pertumbuhan Arsip
              </h3>
              <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-lg border border-[#E8DCC8]">
                {(["3 Bulan", "65 Bulan", "1 Tahun", "Custom"] as const).map(
                  (pf) => (
                    <button
                      key={pf}
                      onClick={() => setPeriodFilter(pf)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                        periodFilter === pf
                          ? "bg-[#C89B3C] text-white"
                          : "text-[#718096] hover:text-[#0B1F3A]"
                      }`}
                    >
                      {pf === "65 Bulan" ? "6 Bulan" : pf}
                    </button>
                  )
                )}
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getPeriodData()}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorVolume"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#C89B3C"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#C89B3C"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                  <XAxis dataKey="Bulan" stroke="#718096" fontSize={9} />
                  <YAxis stroke="#718096" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderColor: "#C89B3C",
                      color: "#0B1F3A",
                    }}
                    itemStyle={{ color: "#A67C2D" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Volume"
                    stroke="#C89B3C"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
 
          <div className="bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden">
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] text-xs font-semibold text-[#0B1F3A] uppercase select-none font-sans">
              Tabel Laju Pertumbuhan Bulanan (
              {periodFilter === "65 Bulan" ? "6 Bulan" : periodFilter})
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5E6C8] text-[#0B1F3A] border-b border-[#E8DCC8] uppercase font-mono">
                  <th className="p-3 pl-5">Periode Pengunggahan</th>
                  <th className="p-3 text-center">Status Audit Berkas</th>
                  <th className="p-3 text-right pr-5">
                    Jumlah Berkas Terunggah
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]/65 text-[#4A5568] font-mono">
                {getPeriodData().map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150"
                  >
                    <td className="p-3 pl-5 font-bold font-sans text-[#0B1F3A]">
                      {row.Bulan}
                    </td>
                    <td className="p-3 text-center font-sans">
                      <span className="px-2 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 rounded text-[9px] font-semibold">
                        TERKUALIFIKASI CERTIFIED
                      </span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#A67C2D] pr-5">
                      {row.Volume} berkas
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
 
      {/* --- TAB CONTENT: REKAPITULASI --- */}
      {activeTab === "Rekapitulasi" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden">
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] text-xs font-bold text-[#0B1F3A] uppercase tracking-wider select-none font-sans">
              Breakdown Arsip Berdasarkan Status
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5E6C8] text-[#0B1F3A] border-b border-[#E8DCC8] font-mono uppercase">
                  <th className="p-3 pl-5">Status Prosedur</th>
                  <th className="p-3">Definisi Retensi</th>
                  <th className="p-3 text-right pr-5">Kuantitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]/65 text-[#4A5568]">
                {statusSummary.map((row, idx) => {
                  let desc = "Berkas aktif, berlanjut masa retensi";
                  let bgCode = "text-[#10B981]";
                  if (row.Status === StatusArsip.INAKTIF) {
                    desc = "Retensi usai, berkas pasif";
                    bgCode = "text-slate-400";
                  } else if (row.Status === StatusArsip.PERMANEN) {
                    desc = "Asal selamanya disimpan";
                    bgCode = "text-[#C89B3C]";
                  } else if (row.Status === StatusArsip.MENUNGGU_PEMUSNAHAN) {
                    desc = "Berkas kedaluwarsa siap dilebur";
                    bgCode = "text-[#EF4444]";
                  }
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150"
                    >
                      <td className="p-3 pl-5 font-bold text-[#0B1F3A] font-sans">
                        {row.Status}
                      </td>
                      <td className="p-3 italic font-sans">{desc}</td>
                      <td
                        className={`p-3 text-right pr-5 font-mono font-bold text-base ${bgCode}`}
                      >
                        {row.Jumlah}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
 
          <div className="bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden">
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] text-xs font-bold text-[#0B1F3A] uppercase tracking-wider select-none font-sans">
              Breakdown Arsip Berdasarkan Unit Pengolah
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5E6C8] text-[#0B1F3A] border-b border-[#E8DCC8] font-mono uppercase">
                  <th className="p-3 pl-5">Nama Pembagian / Unit</th>
                  <th className="p-3">Supervisor Lapangan</th>
                  <th className="p-3 text-right pr-5">Kuantitas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]/65 text-[#4A5568]">
                {unitSummary.map((row, idx) => {
                  let chief = "Bp. Robertus, S.H.";
                  if (row.Unit === "Divisi PPAT")
                    chief = "Ibu Hj. Ratna, S.H.";
                  else if (row.Unit === "Divisi Korporasi")
                    chief = "Sdr. Prasetyo, S.H., M.Kn.";
                  else if (row.Unit === "Divisi Pertanahan")
                    chief = "Sdr. Hermawan, S.H.";
                  return (
                    <tr
                      key={idx}
                      className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150"
                    >
                      <td className="p-3 pl-5 font-bold text-[#0B1F3A] font-sans">
                        {row.Unit}
                      </td>
                      <td className="p-3 italic font-sans">{chief}</td>
                      <td className="p-3 text-right pr-5 font-mono font-bold text-base text-[#A67C2D]">
                        {row.Jumlah}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
