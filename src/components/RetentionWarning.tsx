/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  AlertTriangle, 
  Trash2, 
  Printer, 
  CheckCircle,
  FileDown, 
  ChevronRight, 
  Clock,
  ShieldAlert,
  Download,
  X
} from "lucide-react";
import { Archive, StatusArsip, User, UserRole } from "../types";

interface RetentionWarningProps {
  archives: Archive[];
  currentUser: User;
  onUpdateArchives: (updatedList: Archive[]) => void;
  onNavigate: (page: string, activeId?: string | null) => void;
}

export default function RetentionWarning({
  archives,
  currentUser,
  onUpdateArchives,
  onNavigate
}: RetentionWarningProps) {
  
  const [showPrintBerita, setShowPrintBerita] = useState(false);
  const [selectedForDestruction, setSelectedForDestruction] = useState<string[]>([]);

  // Base date of June 8, 2026
  const todayMs = new Date("2026-06-08").getTime();

  // Helper to calculate days remaining
  const calculateDaysLeft = (expiryDateStr: string): number => {
    try {
      const expiryMs = new Date(expiryDateStr).getTime();
      return Math.round((expiryMs - todayMs) / (1000 * 60 * 60 * 24));
    } catch {
      return 100;
    }
  };

  // Find archives reaching retention within 180 days (or even overdue ones)
  const retentionCriticalList = archives
    .map(a => {
      const daysLeft = calculateDaysLeft(a.tanggalRetensi);
      return { ...a, daysLeft };
    })
    .filter(a => {
      // Show if days left is <= 180, excluding already completed/Permanen if they are healthy.
      // But include all active or simple inaktif that have < 180 days left
      if (a.statusArsip === StatusArsip.PERMANEN && a.masaRetensi > 90) return false;
      return a.daysLeft <= 180;
    })
    // Sort by days left ascending (most urgent/expired first)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const getUrgencyCardStyle = (daysLeft: number) => {
    if (daysLeft < 35) {
      return {
        badgeBg: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25",
        cardBorder: "border-l-4 border-l-[#EF4444] border-[#E8DCC8]",
        daysColor: "text-[#EF4444]",
        alertText: "KRITIS: Segera Ambil Keputusan"
      };
    } else if (daysLeft <= 90) {
      return {
        badgeBg: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25",
        cardBorder: "border-l-4 border-l-[#F59E0B] border-[#E8DCC8]",
        daysColor: "text-[#F59E0B]",
        alertText: "PERINGATAN: Retensi 30-90 Hari"
      };
    } else {
      return {
        badgeBg: "bg-[#F5E6C8] text-[#A67C2D] border border-[#C89B3C]/20",
        cardBorder: "border-l-4 border-l-[#C89B3C] border-[#E8DCC8]",
        daysColor: "text-[#A67C2D]",
        alertText: "PERPANJANGAN: Retensi 90-180 Hari"
      };
    }
  };

  // Interactive: Mark for destruction
  const markAsWaitingDestruction = (id: string) => {
    const updated = archives.map(a => {
      if (a.id === id) {
        return {
          ...a,
          statusArsip: StatusArsip.MENUNGGU_PEMUSNAHAN,
          updatedAt: "2026-06-08 10:00",
          updatedBy: currentUser.id
        };
      }
      return a;
    });
    onUpdateArchives(updated);
    alert("Kategori status arsip berhasil diubah ke 'Menunggu Pemusnahan'. Dokumen akan dimasukkan ke rancangan Berita Acara Pemusnahan.");
  };

  const handleSelectArchiveForDestruction = (id: string) => {
    if (selectedForDestruction.includes(id)) {
      setSelectedForDestruction(selectedForDestruction.filter(x => x !== id));
    } else {
      setSelectedForDestruction([...selectedForDestruction, id]);
    }
  };

  // Run bulk export for Selected Destruction list
  const handleBulkExportDestruction = () => {
    if (selectedForDestruction.length === 0) {
      alert("Pilih setidaknya satu arsip lewat checkbox di sebelah kiri.");
      return;
    }
    alert(`Mengekspor daftar pemusnahan ${selectedForDestruction.length} arsip ke manifest-pemusnahan.xlsx.`);
    setSelectedForDestruction([]);
  };

  // Get active selected documents list for printing mock News Report
  const selectedDocsForReport = archives.filter(a => selectedForDestruction.includes(a.id));

  return (
    <div className="space-y-6">
      
      {/* 1. TOP WARNING HEADER BANNER */}
      <div className="p-6 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5 select-none text-left">
        <div className="flex items-start gap-3">
          <div className="p-3 bg-[#EF4444]/20 text-[#EF4444] rounded-lg animate-pulse shrink-0 mt-0.5 border border-[#EF4444]/25">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#0B1F3A] font-display tracking-wide">
              Pemberitahuan Batas Retensi Dokumen
            </h2>
            <p className="text-[#4A5568] text-xs leading-relaxed max-w-xl font-sans">
              Arsip di bawah akan segera mencapai batas masa simpan retensi resmi dalam 180 hari ke depan. Mohon lakukan pengecekan, konfirmasi dengan saksi klien, atau tandai untuk dihancurkan secara hukum.
            </p>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex flex-wrap items-center gap-2 select-none">
          {selectedForDestruction.length > 0 && (
            <button
              onClick={() => setShowPrintBerita(true)}
              className="px-3.5 py-2 text-xs font-bold bg-[#C89B3C] text-white hover:bg-[#A67C2D] rounded-lg transition shrink-0 flex items-center gap-1 cursor-pointer shadow-md"
            >
              <Printer className="w-4 h-4 text-inherit" /> Berita Acara ({selectedForDestruction.length})
            </button>
          )}
          
          <button
            onClick={handleBulkExportDestruction}
            disabled={selectedForDestruction.length === 0}
            className="px-3.5 py-2 text-xs font-bold bg-[#FAFAF8] text-[#0B1F3A] disabled:opacity-35 hover:bg-[#C89B3C] hover:text-white rounded-lg border border-[#D4B896] hover:border-transparent transition shrink-0 flex items-center gap-1 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-inherit" /> Export Daftar
          </button>
        </div>
      </div>

      {/* 2. SUMMARY GRID INFO CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 select-none font-sans">
        
        {/* Red block count */}
        <div className="p-4 bg-white rounded-lg border border-[#E8DCC8] border-l-4 border-l-[#EF4444] shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#718096] font-bold block uppercase tracking-wider">Mendesak ({`<`} 30 hari)</span>
            <span className="text-xl font-bold font-mono text-[#0B1F3A]">
              {retentionCriticalList.filter(a => a.daysLeft < 30).length} berkas
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
        </div>

        {/* Amber block count */}
        <div className="p-4 bg-white rounded-lg border border-[#E8DCC8] border-l-4 border-l-[#F59E0B] shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#718096] font-bold block uppercase tracking-wider">Siaga (30 - 90 hari)</span>
            <span className="text-xl font-bold font-mono text-[#0B1F3A]">
              {retentionCriticalList.filter(a => a.daysLeft >= 30 && a.daysLeft <= 90).length} berkas
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
        </div>

        {/* Yellow block count */}
        <div className="p-4 bg-white rounded-lg border border-[#E8DCC8] border-l-4 border-l-[#C89B3C] shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex items-center justify-between">
          <div>
            <span className="text-[10px] text-[#718096] font-bold block uppercase tracking-wider">Pemberitahuan (90 - 180 hari)</span>
            <span className="text-xl font-bold font-mono text-[#0B1F3A]">
              {retentionCriticalList.filter(a => a.daysLeft > 90).length} berkas
            </span>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C] shrink-0" />
        </div>

      </div>

      {/* 3. DYNAMIC ARSIP CARDS CAROUSEL/COLUMN */}
      <div className="space-y-4">
        {retentionCriticalList.length > 0 ? (
          retentionCriticalList.map((item) => {
            const urgency = getUrgencyCardStyle(item.daysLeft);
            const isCheckedForDestruction = selectedForDestruction.includes(item.id);
            const isWaitingDestruction = item.statusArsip === StatusArsip.MENUNGGU_PEMUSNAHAN;

            return (
              <div 
                key={item.id}
                className={`bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] transition ${urgency.cardBorder}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start md:items-center justify-between gap-4">
                  {/* Left: Input Selection + Meta block */}
                  <div className="flex items-start gap-3.5 font-sans">
                    
                    {/* Tick select box */}
                    <div className="pt-1.5 shrink-0 select-none">
                      <input
                        type="checkbox"
                        checked={isCheckedForDestruction}
                        onChange={() => handleSelectArchiveForDestruction(item.id)}
                        className="w-4.5 h-4.5 rounded text-[#C89B3C] accent-[#C89B3C] cursor-pointer border-[#D4B896] bg-white"
                        title="Pilih untuk Berita Acara Pemusnahan"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-[#718096] bg-[#FAFAF8] px-2 py-0.5 rounded border border-[#E8DCC8]">
                          {item.nomorArsip}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${urgency.badgeBg}`}>
                          {urgency.alertText}
                        </span>
                      </div>

                      <button
                        onClick={() => onNavigate("DETAIL_ARSIP", item.id)}
                        className="text-base font-bold text-[#0B1F3A] hover:text-[#C89B3C] font-display transition text-left block"
                      >
                        {item.judulArsip}
                      </button>

                      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[#718096]">
                        <span>Pihak Klien: <strong className="text-[#0B1F3A] font-semibold">{item.namaKlien}</strong></span>
                        <span>•</span>
                        <span>Masa Pengesahan: <strong className="text-[#0B1F3A] font-mono text-[11px] font-semibold">{item.tanggalArsip}</strong></span>
                      </div>
                    </div>

                  </div>

                  {/* Right: Days remaining + Tandai untuk Dimusnahkan btn */}
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-3 shrink-0 sm:border-l sm:border-[#E8DCC8] sm:pl-6">
                    <div className="text-left sm:text-right font-sans">
                      <span className="text-[10px] text-[#718096] font-bold tracking-wider block uppercase">WAKTU TERSISA</span>
                      <strong className={`text-lg font-mono font-extrabold ${urgency.daysColor}`}>
                        {item.daysLeft < 0 
                          ? `${Math.abs(item.daysLeft)} HARI MELEBIHI` 
                          : `${item.daysLeft} Hari Kalender`
                        }
                      </strong>
                    </div>

                    {isWaitingDestruction ? (
                      <span className="text-[10px] font-bold bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] px-3 py-1.5 rounded uppercase flex items-center gap-1 font-sans">
                        <Trash2 className="w-3.5 h-3.5 text-inherit" /> Menunggu Pemusnahan
                      </span>
                    ) : (
                      currentUser.role !== UserRole.KEPALA_KANTOR && (
                        <button
                          onClick={() => markAsWaitingDestruction(item.id)}
                          className="px-3 py-1.5 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white font-bold text-xs rounded transition cursor-pointer flex items-center gap-1 font-sans shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-inherit" /> Tandai Pemusnahan
                        </button>
                      )
                    )}
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] p-16 text-center text-slate-500 rounded-xl font-sans">
            <span className="w-12 h-12 rounded-full border border-[#E8DCC8] flex items-center justify-center text-slate-600 mx-auto mb-4 bg-[#FAFAF8]">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </span>
            <p className="font-semibold text-[#0B1F3A] text-sm">Semua Berkas Sehat WalAfiat</p>
            <p className="text-xs text-[#718096] mt-1">Tidak ada dokumen keprotokolan notarisan yang terdeteksi mendekati kadaluwarsa retensi hukum (180 hari).</p>
          </div>
        )}
      </div>

      {/* --- BERITA ACARA PEMUSNAHAN PRINTING MODAL --- */}
      {showPrintBerita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/85 backdrop-blur-md no-print">
          <div className="bg-white text-navy-bg w-full max-w-2xl rounded-xl p-8 border-2 border-red-600 relative overflow-y-auto max-h-[90vh]">
            
            <button
              onClick={() => setShowPrintBerita(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Official Berita Acara Header */}
            <div id="berita-acara-printable" className="font-serif p-5 border-2 border-slate-800 bg-white text-slate-900 rounded space-y-5">
              
              <div className="text-center font-serif border-b-2 border-slate-900 pb-4">
                <h3 className="font-serif font-extrabold text-lg uppercase tracking-wider">notariat utama jakarta pusat</h3>
                <h4 className="font-serif text-[11px] uppercase tracking-widest mt-0.5">SINO LABS LEGAL PROTOCOL DESTRUCTION DEPUTY</h4>
                <div className="w-32 h-[1px] bg-slate-900 mt-2 mx-auto" />
              </div>

              <div className="text-center font-serif space-y-1">
                <h2 className="font-serif font-bold text-base uppercase leading-none tracking-wide">berita acara pemusnahan arsip</h2>
                <span className="font-serif text-[11px] font-mono tracking-widest">NOMOR: BA.03/LAN-NOT/VI/2026</span>
              </div>

              <p className="font-serif text-xs leading-relaxed text-justify indent-8">
                Pada hari ini, <strong className="font-serif">Senin, tanggal Delapan, bulan Juni, tahun Dua Ribu Dua Puluh Enam (08-06-2026)</strong>, bertempat di Kantor Notariat Utama SiNAR, kami yang menandatangani Berita Acara di bawah ini, telah melangsungkan pemusnahan <strong className="font-serif">{selectedDocsForReport.length} berkas arsip</strong> digital beserta salinan fisik fotokopi protokol, yang didasarkan atas ketentuan jatuh tempo retensi hukum kearsipan notarisan.
              </p>

              {/* Grid table inside of Berita Acara print */}
              <div className="pt-2">
                <table className="w-full text-left border-collapse border border-slate-400 text-[10px]">
                  <thead>
                    <tr className="bg-slate-100 font-serif border-b border-slate-400">
                      <th className="p-1.5 border-r border-slate-400">Nomor Arsip</th>
                      <th className="p-1.5 border-r border-slate-400">Judul Akta / Pengarah</th>
                      <th className="p-1.5 border-r border-slate-400 text-center">Tgl Registrasi</th>
                      <th className="p-1.5 text-right">Retensi Kadaluwarsa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDocsForReport.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-300 font-serif">
                        <td className="p-1.5 border-r border-slate-400 font-mono text-[9px] font-bold">{row.nomorArsip}</td>
                        <td className="p-1.5 border-r border-slate-400 font-semibold">{row.judulArsip}</td>
                        <td className="p-1.5 border-r border-slate-400 font-mono text-center">{row.tanggalArsip}</td>
                        <td className="p-1.5 text-right font-mono text-red-500 font-bold">{row.tanggalRetensi}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="font-serif text-xs leading-relaxed text-justify indent-8">
                Peleburan dilaksanakan menggunakan metode penghancuran mekanis terpusat guna menghapuskan sifat keterbacaan data rahasia klien selaras ketentuan Pasal 58 UU Jabatan Notaris RI secara tanggung jawab mutlak.
              </p>

              {/* Signature stamp fields */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs font-serif gap-6">
                <div className="space-y-12">
                  <span>Saksi Inspeksi Kantor</span>
                  <div className="h-6" />
                  <span className="font-semibold font-serif text-slate-800 underline block">Hj. Ratna Sari, S.H.</span>
                </div>
                <div className="space-y-12">
                  <span>Notaris Protokol Utama</span>
                  <div className="h-6" />
                  <span className="font-semibold font-serif text-slate-800 underline block">Hendrawan S., S.H., M.Kn.</span>
                </div>
              </div>

            </div>

            {/* Modal Controls */}
            <div className="flex gap-3 mt-6 justify-end select-none">
              <button
                onClick={() => setShowPrintBerita(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded-lg text-xs cursor-pointer"
              >
                Kembali
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4.5 py-2.5 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg text-xs shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Cetak Berita Acara
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
