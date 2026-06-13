/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Layers, 
  FileSignature, 
  FileKey, 
  AlertOctagon, 
  HardDrive, 
  Activity, 
  Clock, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Archive, KategoriArsip, StatusArsip, User } from "../types";

interface DashboardProps {
  archives: Archive[];
  currentUser: User;
  onNavigate: (page: string, activeId?: string | null) => void;
  retentionUrgentList: Archive[];
}

export default function Dashboard({
  archives,
  currentUser,
  onNavigate,
  retentionUrgentList
}: DashboardProps) {
  const [trendPeriod, setTrendPeriod] = useState<"Minggu Ini" | "Bulan Ini" | "3 Bulan" | "Custom">("Bulan Ini");

  // Sum categories
  const totalArsip = archives.length;
  const aktaAJB = archives.filter(a => a.kategori === KategoriArsip.AKTA_JUAL_BELI).length;
  const aktaAPP = archives.filter(a => a.kategori === KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN).length;
  const totalPerjanjian = archives.filter(a => a.kategori === KategoriArsip.PERJANJIAN).length;
  const totalSuratKuasa = archives.filter(a => a.kategori === KategoriArsip.SURAT_KUASA).length;
  const totalSertifikat = archives.filter(a => a.kategori === KategoriArsip.SERTIFIKAT).length;
  const totalDokumenPendukung = archives.filter(a => a.kategori === KategoriArsip.DOKUMEN_PENDUKUNG).length;
  
  // Calculate warning retention (under 180 days)
  const totalRetensiWarning = retentionUrgentList.length;

  // Pie chart data
  const categoryData = Object.values(KategoriArsip).map(cat => {
    const value = archives.filter(a => a.kategori === cat).length;
    return { name: cat, value };
  }).filter(item => item.value > 0);

  // Colors for donut chart - Luxury Gold, Navies, Accents
  const PIE_COLORS = [
    "#C89B3C", // Royal Gold
    "#1E355A", // Light Navy
    "#A67C2D", // Dark Gold
    "#10B981", // Emerald Success
    "#3B82F6", // Sky
    "#F59E0B"  // Yellow Amber
  ];

  // Bar Chart Data based on Filter
  const getTrendData = () => {
    switch (trendPeriod) {
      case "Minggu Ini":
        return [
          { name: "Sen", Volume: 2 },
          { name: "Sel", Volume: 4 },
          { name: "Rab", Volume: 1 },
          { name: "Kam", Volume: 5 },
          { name: "Jum", Volume: 3 },
          { name: "Sab", Volume: 1 },
          { name: "Min", Volume: 0 }
        ];
      case "Bulan Ini":
        return [
          { name: "Minggu 1", Volume: 12 },
          { name: "Minggu 2", Volume: 18 },
          { name: "Minggu 3", Volume: 15 },
          { name: "Minggu 4", Volume: 22 }
        ];
      case "3 Bulan":
        return [
          { name: "Maret", Volume: 38 },
          { name: "April", Volume: 45 },
          { name: "Mei", Volume: 52 }
        ];
      case "Custom":
        return [
          { name: "Q1-2025", Volume: 84 },
          { name: "Q2-2025", Volume: 98 },
          { name: "Q3-2025", Volume: 110 },
          { name: "Q4-2025", Volume: 130 },
          { name: "Q1-2026", Volume: 145 }
        ];
    }
  };

  // Recent activity: order archives by simulated updatedAt timestamp or createdAt descending
  const recentActivities = [...archives]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Calculate used storage: let's sum file size of all archives, plus base simulation
  const usedSizeBytes = archives.reduce((acc, a) => {
    const size = parseInt(String(a?.fileDokumen?.size ?? '0'), 10);
    return acc + (isNaN(size) ? 0 : size);
  }, 0);
  const totalGB = 0.5;
  const usedGB = (usedSizeBytes / (1024 * 1024 * 1024)).toFixed(1);
  const storagePercentage = Math.min(100, (parseFloat(usedGB) / totalGB) * 100);

  return (
    <div className="space-y-6">
      {/* Top Welcome Panel */}
      <div className="p-6 bg-white rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-display text-[#0B1F3A] tracking-wide">
            Selamat Datang di SiNAR
          </h2>
          <p className="text-[#4A5568] text-sm">
            Sistem Informasi Notaris &amp; Kearsipan Digital Kantor Notariat Utama. Anda masuk sebagai <span className="text-[#C89B3C] font-semibold capitalize font-mono text-xs px-2 py-0.5 rounded bg-[#F5E6C8] border border-[#C89B3C]/20">{currentUser.role}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#718096] font-mono bg-[#F5F0E8]/70 px-3.5 py-2 rounded-lg border border-[#E8DCC8] shrink-0">
          <Clock className="w-4 h-4 text-[#C89B3C] shrink-0" />
          <span>Login terakhir: {currentUser.lastLogin || "Hari ini, 08:30 WIB"}</span>
        </div>
      </div>

      {/* --- STATISTICS COUNTER CARDS --- */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Total Arsip */}
        <div className="bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-gold-royal/40 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">Total Arsip</span>
            <span className="p-2 rounded-lg bg-[#C89B3C]/10 text-[#C89B3C] border border-[#C89B3C]/20">
              <Layers className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-[#0B1F3A]">{totalArsip} <span className="text-xs text-[#718096]">berkas</span></div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gold-royal/5 rounded-full blur-xl pointer-events-none group-hover:bg-gold-royal/10 transition-all" />
        </div>

        {/* Akta Jual Beli */}
        <div className="bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-gold-royal/40 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">Akta Jual Beli</span>
            <span className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-[#0B1F3A]">{aktaAJB} <span className="text-xs text-[#718096]">berkas</span></div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Akta Pendirian Perusahaan */}
        <div className="bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-gold-royal/40 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">Akta Pendirian</span>
            <span className="p-2 rounded-lg bg-violet-50 text-violet-600 border border-violet-100">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-[#0B1F3A]">{aktaAPP} <span className="text-xs text-[#718096]">berkas</span></div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-violet-500/5 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Arsip Surat Kuasa */}
        <div className="bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-gold-royal/40 transition">
         <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">Surat Kuasa</span>
            <span className="p-2 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
              <FileKey className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-[#0B1F3A]">{totalSuratKuasa} <span className="text-xs text-[#718096]">berkas</span></div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
        
       </div>
        
      {/* Baris 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4">

         {/* Arsip Perjanjian */}
        <div className="bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-gold-royal/40 transition">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">Perjanjian</span>
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <FileSignature className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-[#0B1F3A]">{totalPerjanjian} <span className="text-xs text-[#718096]">berkas</span></div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
        </div>
        
        {/* Sertifikat */}
        <div className="bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-gold-royal/40 transition">
         <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">Sertifikat</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-[#0B1F3A]">{totalSertifikat} <span className="text-xs text-[#718096]">berkas</span></div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
          </div>

        {/* Dokumen Pendukung */}
        <div className="bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-gold-royal/40 transition">
         <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">Dok. Pendukung</span>
            <span className="p-2 rounded-lg bg-slate-50 text-slate-600 border border-slate-100">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <div className="text-3xl font-bold font-display text-[#0B1F3A]">{totalDokumenPendukung} <span className="text-xs text-[#718096]">berkas</span></div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-slate-500/5 rounded-full blur-xl pointer-events-none" />
          </div>
        
        {/* Clickable Retention Warning */}
        <button
          onClick={() => onNavigate("ARSIP_MENDEKATI_RETENSI")}
          className="bg-white p-5 rounded-xl border-2 border-amber-500/30 text-left shadow-[0_2px_12px_rgba(11,31,58,0.08)] relative overflow-hidden flex flex-col justify-between h-32 group hover:border-amber-500 hover:shadow-amber-500/5 transition cursor-pointer"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-widest block">Mendekati Retensi</span>
            <span className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 animate-bounce">
              <AlertOctagon className="w-5 h-5" />
            </span>
          </div>
          <div>
            <div className="text-3xl font-bold font-display text-[#0B1F3A]">{totalRetensiWarning}</div>
            <span className="text-[10px] text-amber-600 flex items-center gap-1 font-medium mt-1 uppercase tracking-wider">
              Tinjau Kritis <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </span>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
        </button>
      </div>

      {/* --- REPOSITORI STORAGE BAR --- */}
      <div className="p-5 bg-white rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="text-gold-royal w-5 h-5" />
            <div>
              <span className="text-sm font-semibold text-[#0B1F3A] block">Kapasitas Penyimpanan Digital</span>
              <span className="text-xs text-[#718096]">Fasilitas kuota cloud terenkripsi legalitas</span>
            </div>
          </div>
          <span className="text-xs font-bold font-mono text-gold-royal bg-[#F5E6C8] px-2.5 py-1 rounded border border-gold-royal/30">
            {usedGB} GB digunakan dari {totalGB} GB ({storagePercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full bg-[#E8DCC8]/40 h-3 rounded-full overflow-hidden p-[2px]">
          <div 
            className="bg-[#C89B3C] h-full rounded-full transition-all duration-1000"
            style={{ width: `${storagePercentage}%` }}
          />
        </div>
      </div>

      {/* --- CHARTS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Distribution */}
        <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold font-display text-[#0B1F3A] tracking-wide">
              Distribusi Dokumen per Kategori
            </h3>
            <p className="text-xs text-[#718096] mt-0.5">Proporsi pembagian jenis akta dan dokumen penunjang</p>
          </div>

          <div className="h-56 mt-4 relative flex items-center justify-center">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#C89B3C", color: "#0B1F3A", borderRadius: "8px", boxShadow: "0 2px 12px rgba(11,31,58,0.08)" }}
                    itemStyle={{ color: "#0B1F3A" }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "10px", color: "#4A5568" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <span className="text-xs text-[#718096]">Tidak ada data arsip</span>
            )}
          </div>
        </div>

        {/* Bar Chart: Input Trend with period filter */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DCC8]/65 pb-4">
            <div>
              <h3 className="text-base font-semibold font-display text-[#0B1F3A] tracking-wide flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-gold-royal" /> Tren Penginputan Arsip
              </h3>
              <p className="text-xs text-[#718096] mt-0.5">Frekuensi unggahan dokumen terregistrasi</p>
            </div>
            
            {/* Period Filters */}
            <div className="flex items-center gap-1 bg-[#F5F0E8] p-1 rounded-lg border border-[#E8DCC8]">
              {(["Minggu Ini", "Bulan Ini", "3 Bulan", "Custom"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setTrendPeriod(p)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                    trendPeriod === p
                      ? "bg-gold-royal text-white shadow-sm"
                      : "text-[#718096] hover:text-[#0B1F3A]"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTrendData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DCC8" />
                <XAxis dataKey="name" stroke="#718096" fontSize={10} tickLine={false} />
                <YAxis stroke="#718096" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#C89B3C", color: "#0B1F3A", borderRadius: "8px", boxShadow: "0 2px 12px rgba(11,31,58,0.08)" }}
                  itemStyle={{ color: "#C89B3C" }}
                />
                <Bar dataKey="Volume" fill="#C89B3C" radius={[4, 4, 0, 0]}>
                  {getTrendData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#C89B3C" : "#A67C2D"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- BOTTOM SECTION: RECENT ACTIVITY & INFORMATION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
          <div className="flex items-center justify-between border-b border-[#E8DCC8]/65 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-gold-royal" />
              <div>
                <h3 className="text-base font-semibold font-display text-[#0B1F3A] tracking-wide">
                  Aktivitas Pengarsipan Terbaru
                </h3>
                <p className="text-xs text-[#718096]">Lima draf dokumen yang terakhir didata oleh operator</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("DAFTAR_ARSIP")}
              className="text-xs text-gold-royal hover:text-gold-dark flex items-center gap-1 font-medium transition cursor-pointer"
            >
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#E8DCC8]/40">
            {recentActivities.map((act) => {
              const uploader = act.createdBy === "usr-01" ? "Hendrawan S." : (act.createdBy === "usr-03" ? "Prasetyo U." : "Dewi L.");
              return (
                <div 
                  key={act.id} 
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group hover:bg-[#FDF8F0] px-2 rounded-lg transition"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#C89B3C] font-mono bg-[#F5E6C8] px-2 py-0.5 rounded border border-[#C89B3C]/20">
                      {act.nomorArsip}
                    </span>
                    <button
                      onClick={() => onNavigate("DETAIL_ARSIP", act.id)}
                      className="text-sm font-semibold text-[#0B1F3A] hover:text-[#C89B3C] text-left block w-full truncate transition cursor-pointer"
                    >
                      {act.judulArsip}
                    </button>
                    <div className="flex items-center gap-4 text-xs text-[#718096]">
                      <span className="flex items-center gap-1">
                        Klien: <strong className="text-[#4A5568]">{act.namaKlien}</strong>
                      </span>
                      <span>•</span>
                      <span>Kategori: <strong className="text-[#4A5568]">{act.kategori}</strong></span>
                    </div>
                  </div>

                  <div className="sm:text-right text-xs text-[#718096] shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <span className="font-mono text-[10px] text-[#718096]">{act.createdAt} WIB</span>
                    <span className="text-[10px] bg-[#F5F0E8] border border-[#E8DCC8] text-[#4A5568] font-semibold px-2 py-0.5 rounded uppercase">
                      petugas: {uploader}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notary Legal Information Card */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gold-royal border-b border-[#E8DCC8]/65 pb-4">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-wider font-display text-[#0B1F3A]">Informasi Hukum &amp; Notariat</span>
            </div>
            
            <div className="space-y-3.5 text-xs text-[#4A5568]">
              <div className="p-3 rounded-lg bg-[#FDF8F0] border-l-2 border-gold-royal">
                <span className="font-semibold text-[#0B1F3A] block mb-0.5">UU Jabatan Notaris (UUJN) No. 2 Tahun 2014</span>
                <p className="leading-relaxed text-[#718096]">Pasal 58 mewajibkan Notaris untuk membuat, menyimpan, dan memelihara protokol Notaris secara aman dan rahasia.</p>
              </div>

              <div className="p-3 rounded-lg bg-red-50 border-l-2 border-red-500">
                <span className="font-semibold text-[#0B1F3A] block mb-0.5">Ketentuan Retensi Fisik</span>
                <p className="leading-relaxed text-[#718096]">Masa retensi berkas fotokopi dan warkah pendukung sah berdurasi 5-10 tahun sebelum dapat diajukan untuk proses pemusnahan resmi.</p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#E8DCC8]/65 text-center">
            <span className="text-[9px] text-[#718096] font-mono block">SiNAR ENCRYPTED SHA-256 DIGITAL VAULT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
