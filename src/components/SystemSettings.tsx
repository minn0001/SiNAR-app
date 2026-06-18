import React from "react";
import { Settings, Binary, CalendarClock, Info } from "lucide-react";
import { SystemConfig } from "../types";

interface SystemSettingsProps {
  systemConfig: SystemConfig;
}

export default function SystemSettings({ systemConfig }: SystemSettingsProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] select-none">
        <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#C89B3C]" /> Pengaturan Parameter Sistem
        </h2>
        <p className="text-[#4A5568] text-xs font-sans mt-1">
          Konfigurasi format penomoran otomatis dan referensi masa retensi hukum kearsipan notarisan
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-[#FDF8F0] border border-[#C89B3C]/30 rounded-xl text-xs text-[#A67C2D] font-sans">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C89B3C]" />
        <p className="leading-relaxed">
          Parameter di bawah bersifat <strong>referensi sistem</strong> dan mengacu pada ketentuan hukum kearsipan notarisan yang berlaku. Hubungi pengembang sistem untuk modifikasi format penomoran.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
          <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
            <Binary className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">Format Registrasi Otomatis</h3>
            <span className="ml-auto text-[9px] font-bold bg-[#FAFAF8] border border-[#E8DCC8] text-[#718096] px-2 py-0.5 rounded uppercase">Read Only</span>
          </div>
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-[#0B1F3A]">Format String Struktur Nomor Arsip:</label>
            <div className="w-full bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg p-3 text-xs text-[#718096] uppercase font-mono tracking-widest select-all">
              {systemConfig.nomorFormat}
            </div>
            <div className="p-3 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg space-y-2 select-none">
              <span className="text-[10px] text-[#718096] font-bold uppercase tracking-wider block">Legenda Tag Variabel:</span>
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] leading-relaxed text-[#4A5568]">
                <span>• <strong className="text-[#0B1F3A]">{"{urut}"}</strong> : Nomor urutan</span>
                <span>• <strong className="text-[#0B1F3A]">{"{KATEGORI}"}</strong> : Singkatan internal</span>
                <span>• <strong className="text-[#0B1F3A]">{"{BULAN_ROMAWI}"}</strong> : Bulan (I-XII)</span>
                <span>• <strong className="text-[#0B1F3A]">{"{TAHUN}"}</strong> : Tahun kearsipan</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
          <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">Referensi Retensi Hukum</h3>
            <span className="ml-auto text-[9px] font-bold bg-[#FAFAF8] border border-[#E8DCC8] text-[#718096] px-2 py-0.5 rounded uppercase">Read Only</span>
          </div>
          <p className="text-xs text-[#4A5568]">Masa retensi berdasarkan perundang-undangan kearsipan notarisan nasional.</p>
          <div className="space-y-1 text-xs">
            {[
              ["Akta Jual Beli (AJB)", "30 Tahun"],
              ["Akta Pendirian Perusahaan", "30 Tahun"],
              ["Surat Kuasa", "10 Tahun"],
              ["Perjanjian", "10 Tahun"],
              ["Sertifikat Tanah (SHM/SHGB)", "PERMANEN"],
              ["Dokumen Pendukung", "5 Tahun"],
            ].map(([label, val], idx) => (
              <div key={idx} className="flex items-center justify-between py-2.5 border-b border-[#E8DCC8]/60 last:border-0">
                <span className="text-[#4A5568]">{idx + 1}. {label}</span>
                <span className={`font-mono font-bold px-3 py-1 rounded text-[11px] ${val === "PERMANEN" ? "bg-[#FDF8F0] text-[#A67C2D] border border-[#C89B3C]/30" : "bg-[#F0F4F8] text-[#0B1F3A] border border-[#E8DCC8]"}`}>
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
