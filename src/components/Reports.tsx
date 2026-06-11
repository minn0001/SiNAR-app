/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
  AlertCircle
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
  Area
} from "recharts";
import { Archive, KategoriArsip, StatusArsip } from "../types";

interface ReportsProps {
  archives: Archive[];
}

export default function Reports({ archives }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<"Per Kategori" | "Per Periode" | "Rekapitulasi">("Per Kategori");
  const [periodFilter, setPeriodFilter] = useState<"3 Bulan" | "65 Bulan" | "1 Tahun" | "Custom">("1 Tahun");

  // Sum categories
  const getCategoryCount = (cat: KategoriArsip) => archives.filter(a => a.kategori === cat).length;
  
  // Data 1: Category counts for Chart & Table
  const categoryChartData = Object.values(KategoriArsip).map(cat => ({
    Kategori: cat.replace("Akta ", "Akta: "),
    Jumlah: getCategoryCount(cat)
  }));

  // Data 2: Period counts (Simulated monthly inputs matching filters)
  const getPeriodData = () => {
    switch (periodFilter) {
      case "3 Bulan":
        return [
          { Bulan: "Maret 2026", Volume: 14 },
          { Bulan: "April 2026", Volume: 22 },
          { Bulan: "Mei 2026", Volume: 19 },
          { Bulan: "Juni 2026 (berjalan)", Volume: 15 }
        ];
      case "65 Bulan": // corresponds to 6 Bulan in prompt
        return [
          { Bulan: "Januari 2026", Volume: 9 },
          { Bulan: "Februari 2026", Volume: 12 },
          { Bulan: "Maret 2026", Volume: 14 },
          { Bulan: "April 2026", Volume: 22 },
          { Bulan: "Mei 2026", Volume: 19 },
          { Bulan: "Juni 2026", Volume: 15 }
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
          { Bulan: "Jun '26", Volume: 15 }
        ];
      case "Custom":
        return [
          { Bulan: "Tahun 2022", Volume: 120 },
          { Bulan: "Tahun 2023", Volume: 165 },
          { Bulan: "Tahun 2024", Volume: 198 },
          { Bulan: "Tahun 2025", Volume: 230 },
          { Bulan: "Tahun 2026 (berjalan)", Volume: 91 }
        ];
    }
  };

  // Data 3: Status counts
  const statusSummary = Object.values(StatusArsip).map(st => ({
    Status: st,
    Jumlah: archives.filter(a => a.statusArsip === st).length
  }));

  // Data 4: Unit pengolah counts
  const unitSummary = ["Divisi PPAT", "Divisi Korporasi", "Divisi Pertanahan", "Divisi Umum"].map(unit => ({
    Unit: unit,
    Jumlah: archives.filter(a => a.unitPengolah === unit).length
  }));

  // Export handlers
  const triggerExport = (format: "PDF" | "Excel") => {
    alert(`[Virtual Export] Laporan ${activeTab} berhasil dibungkus ke format ${format === "PDF" ? "Dokumen PDF Bersegel (.pdf)" : "Lembar Kerja Excel (.xlsx)"}. Berkas berhasil diunduh secara lokal!`);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH EXPORTS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] select-none">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide">
            Pusat Pelaporan Kearsipan
          </h2>
          <p className="text-[#4A5568] text-xs font-sans">Konsolidasi statistika kategorisasi, rincian bulanan, dan audit status arsip notarisan</p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerExport("PDF")}
            className="px-3 py-1.5 text-xs font-bold bg-[#FAFAF8] hover:bg-[#FDF8F0] hover:text-[#C89B3C] border border-[#D4B896] hover:border-[#C89B3C] text-[#0B1F3A] rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" /> Cetak PDF
          </button>
          <button
            onClick={() => triggerExport("Excel")}
            className="px-3 py-1.5 text-xs font-bold bg-[#C89B3C] text-white hover:bg-[#A67C2D] rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
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
          {/* Chart Wrapper Card */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
            <h3 className="text-sm font-semibold uppercase font-display text-[#0B1F3A] tracking-widest border-b border-[#E8DCC8]/65 pb-2 mb-4">
              Grafik Kearsipan: Dokumen per Kategori
            </h3>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                  <XAxis dataKey="Kategori" stroke="#718096" fontSize={9} />
                  <YAxis stroke="#718096" fontSize={10} precision={0} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#C89B3C", color: "#0B1F3A" }}
                    itemStyle={{ color: "#A67C2D" }}
                  />
                  <Bar dataKey="Jumlah" fill="#C89B3C" radius={[4, 4, 0, 0]}>
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#C89B3C" : "#A67C2D"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Audit Detail Table below chart */}
          <div className="bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden">
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] flex justify-between items-center select-none font-sans">
              <span className="text-xs font-semibold text-[#0B1F3A] uppercase">Tabel Rincian Volume per Kategori</span>
              <span className="text-[10px] bg-[#FDF8F0] text-[#C89B3C] px-2 py-0.5 rounded border border-[#C89B3C]/20">TOTAL ARCHIVE: {archives.length}</span>
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
                  if (cat === KategoriArsip.AKTA_JUAL_BELI) { code = "AKTA-AJB"; retention = "30 Tahun"; }
                  else if (cat === KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN) { code = "AKTA-APP"; retention = "30 Tahun"; }
                  else if (cat === KategoriArsip.SURAT_KUASA) { code = "SK"; retention = "10 Tahun"; }
                  else if (cat === KategoriArsip.PERJANJIAN) { code = "PERJ"; retention = "10 Tahun"; }
                  else if (cat === KategoriArsip.SERTIFIKAT) { code = "SHM/SHGB"; retention = "Permanen"; }

                  return (
                    <tr key={idx} className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150">
                      <td className="p-3 pl-5 font-semibold text-[#0B1F3A]">{cat}</td>
                      <td className="p-3 font-mono text-[#718096]">{code}</td>
                      <td className="p-3 text-center font-medium italic text-[#718096]">{retention}</td>
                      <td className="p-3 text-right font-bold text-[#A67C2D] pr-5 font-mono">{getCategoryCount(cat)}</td>
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
          
          {/* Area Chart Card wrapper */}
          <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DCC8]/65 pb-3 mb-4 select-none">
              <h3 className="text-sm font-semibold uppercase font-display text-[#0B1F3A] tracking-widest flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#C89B3C]" /> Grafik Laju Pertumbuhan Arsip
              </h3>

              {/* Period Selectors */}
              <div className="flex items-center gap-1 bg-[#FAFAF8] p-1 rounded-lg border border-[#E8DCC8]">
                {(["3 Bulan", "65 Bulan", "1 Tahun", "Custom"] as const).map((pf) => (
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
                ))}
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getPeriodData()} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C89B3C" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#C89B3C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                  <XAxis dataKey="Bulan" stroke="#718096" fontSize={9} />
                  <YAxis stroke="#718096" fontSize={10} precision={0} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#C89B3C", color: "#0B1F3A" }}
                    itemStyle={{ color: "#A67C2D" }}
                  />
                  <Area type="monotone" dataKey="Volume" stroke="#C89B3C" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Period Table representation */}
          <div className="bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden">
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] text-xs font-semibold text-[#0B1F3A] uppercase select-none font-sans">
              Tabel Laju Pertumbuhan Bulanan ({periodFilter === "65 Bulan" ? "6 Bulan" : periodFilter})
            </div>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5E6C8] text-[#0B1F3A] border-b border-[#E8DCC8] uppercase font-mono">
                  <th className="p-3 pl-5">Periode Pengunggahan</th>
                  <th className="p-3 text-center">Status Audit Berkas</th>
                  <th className="p-3 text-right pr-5">Jumlah Berkas Terunggah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]/65 text-[#4A5568] font-mono">
                {getPeriodData().map((row, idx) => (
                  <tr key={idx} className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150">
                    <td className="p-3 pl-5 font-bold font-sans text-[#0B1F3A]">{row.Bulan}</td>
                    <td className="p-3 text-center font-sans">
                      <span className="px-2 py-0.5 bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25 rounded text-[9px] font-semibold text-center truncate">TERKUALIFIKASI CERTIFIED</span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#A67C2D] pr-5">{row.Volume} berkas</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: REKAPITULASI (Multi-metrics Summaries) --- */}
      {activeTab === "Rekapitulasi" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
          
          {/* Breakdown Per Status */}
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
                  if (row.Status === StatusArsip.INAKTIF) { desc = "Retensi usai, berkas pasif"; bgCode = "text-slate-400"; }
                  else if (row.Status === StatusArsip.PERMANEN) { desc = "Asal selamanya disimpan"; bgCode = "text-[#C89B3C]"; }
                  else if (row.Status === StatusArsip.MENUNGGU_PEMUSNAHAN) { desc = "Berkas kedaluwarsa siap dilebur"; bgCode = "text-[#EF4444]"; }

                  return (
                    <tr key={idx} className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150">
                      <td className="p-3 pl-5 font-bold text-[#0B1F3A] font-sans">{row.Status}</td>
                      <td className="p-3 text-slate-550 italic font-sans">{desc}</td>
                      <td className={`p-3 text-right pr-5 font-mono font-bold text-base ${bgCode}`}>{row.Jumlah}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Breakdown Per Unit Pengolah */}
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
                  if (row.Unit === "Divisi PPAT") chief = "Ibu Hj. Ratna, S.H.";
                  else if (row.Unit === "Divisi Korporasi") chief = "Sdr. Prasetyo, S.H., M.Kn.";
                  else if (row.Unit === "Divisi Pertanahan") chief = "Sdr. Hermawan, S.H.";

                  return (
                    <tr key={idx} className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150">
                      <td className="p-3 pl-5 font-bold text-[#0B1F3A] font-sans">{row.Unit}</td>
                      <td className="p-3 text-slate-550 italic font-sans">{chief}</td>
                      <td className="p-3 text-right pr-5 font-mono font-bold text-base text-[#A67C2D]">{row.Jumlah}</td>
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
