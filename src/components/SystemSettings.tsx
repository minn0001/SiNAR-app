/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
 
import React, { useState } from "react";
import {
  Settings, Binary, CalendarClock, Info, Pencil, Check, X,
  Timer, DatabaseBackup, ShieldCheck, Clock
} from "lucide-react";
import { SystemConfig, KategoriArsip } from "../types";
 
interface SystemSettingsProps {
  systemConfig: SystemConfig;
  onUpdateConfig: (updated: SystemConfig) => void;
}
 
const KATEGORI_LABELS: Record<KategoriArsip, string> = {
  [KategoriArsip.AKTA_JUAL_BELI]: "Akta Jual Beli (AJB)",
  [KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN]: "Akta Pendirian Perusahaan",
  [KategoriArsip.SURAT_KUASA]: "Surat Kuasa",
  [KategoriArsip.PERJANJIAN]: "Perjanjian",
  [KategoriArsip.SERTIFIKAT]: "Sertifikat Tanah (SHM/SHGB)",
  [KategoriArsip.DOKUMEN_PENDUKUNG]: "Dokumen Pendukung",
};
 
export default function SystemSettings({ systemConfig, onUpdateConfig }: SystemSettingsProps) {
  // --- Format Nomor Arsip ---
  const [editingFormat, setEditingFormat] = useState(false);
  const [draftFormat, setDraftFormat] = useState(systemConfig.nomorFormat);
 
  const saveFormat = () => {
    onUpdateConfig({ ...systemConfig, nomorFormat: draftFormat });
    setEditingFormat(false);
  };
  const cancelFormat = () => {
    setDraftFormat(systemConfig.nomorFormat);
    setEditingFormat(false);
  };
 
  // --- Retensi per Kategori ---
  const [editingRetensi, setEditingRetensi] = useState(false);
  const [draftRetensi, setDraftRetensi] = useState<Record<KategoriArsip, number | "Permanen">>(
    { ...systemConfig.defaultRetensi }
  );
 
  const saveRetensi = () => {
    onUpdateConfig({ ...systemConfig, defaultRetensi: draftRetensi });
    setEditingRetensi(false);
  };
  const cancelRetensi = () => {
    setDraftRetensi({ ...systemConfig.defaultRetensi });
    setEditingRetensi(false);
  };
 
  // --- Session Timeout ---
  const [editingSession, setEditingSession] = useState(false);
  const [draftSession, setDraftSession] = useState(systemConfig.sessionTimeout);
 
  const saveSession = () => {
    onUpdateConfig({ ...systemConfig, sessionTimeout: draftSession });
    setEditingSession(false);
  };
  const cancelSession = () => {
    setDraftSession(systemConfig.sessionTimeout);
    setEditingSession(false);
  };
 
  // --- Backup Mockup ---
  const [backupLoading, setBackupLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState(systemConfig.lastBackup);
 
  const handleBackupNow = () => {
    setBackupLoading(true);
    setTimeout(() => {
      const now = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
        hour12: false,
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
      });
      setLastBackup(now);
      setBackupLoading(false);
    }, 2000);
  };
 
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
        <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#C89B3C]" /> Pengaturan Parameter Sistem
        </h2>
        <p className="text-[#4A5568] text-xs font-sans mt-1">
          Konfigurasi format penomoran, masa retensi, batas sesi, dan pencadangan data
        </p>
      </div>
 
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-[#FDF8F0] border border-[#C89B3C]/30 rounded-xl text-xs text-[#A67C2D] font-sans">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C89B3C]" />
        <p className="leading-relaxed">
          Perubahan format nomor dan masa retensi hanya berlaku untuk arsip yang <strong>dibuat setelah penyimpanan</strong>.
          Arsip yang sudah terdaftar tidak terpengaruh secara retroaktif.
        </p>
      </div>
 
      {/* Row 1: Format + Retensi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
        {/* FORMAT NOMOR ARSIP */}
        <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
          <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
            <Binary className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">
              Format Registrasi Otomatis
            </h3>
            {!editingFormat ? (
              <button
                onClick={() => { setDraftFormat(systemConfig.nomorFormat); setEditingFormat(true); }}
                className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-[#FAFAF8] border border-[#E8DCC8] hover:border-[#C89B3C] hover:text-[#C89B3C] text-[#718096] px-2 py-0.5 rounded uppercase transition cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="ml-auto flex gap-1.5">
                <button
                  onClick={saveFormat}
                  className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded uppercase transition cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Simpan
                </button>
                <button
                  onClick={cancelFormat}
                  className="flex items-center gap-1 text-[10px] font-bold bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 px-2 py-0.5 rounded uppercase transition cursor-pointer"
                >
                  <X className="w-3 h-3" /> Batal
                </button>
              </div>
            )}
          </div>
 
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-[#0B1F3A]">Format String Struktur Nomor Arsip:</label>
            {editingFormat ? (
              <input
                value={draftFormat}
                onChange={(e) => setDraftFormat(e.target.value)}
                className="w-full bg-white border border-[#C89B3C] focus:border-[#A67C2D] focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A] uppercase font-mono tracking-widest focus:ring-1 focus:ring-[#C89B3C] transition"
              />
            ) : (
              <div className="w-full bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg p-3 text-xs text-[#718096] uppercase font-mono tracking-widest select-all">
                {systemConfig.nomorFormat}
              </div>
            )}
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
 
        {/* RETENSI PER KATEGORI */}
        <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
          <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">
              Preset Retensi Hukum
            </h3>
            {!editingRetensi ? (
              <button
                onClick={() => { setDraftRetensi({ ...systemConfig.defaultRetensi }); setEditingRetensi(true); }}
                className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-[#FAFAF8] border border-[#E8DCC8] hover:border-[#C89B3C] hover:text-[#C89B3C] text-[#718096] px-2 py-0.5 rounded uppercase transition cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="ml-auto flex gap-1.5">
                <button
                  onClick={saveRetensi}
                  className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded uppercase transition cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Simpan
                </button>
                <button
                  onClick={cancelRetensi}
                  className="flex items-center gap-1 text-[10px] font-bold bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 px-2 py-0.5 rounded uppercase transition cursor-pointer"
                >
                  <X className="w-3 h-3" /> Batal
                </button>
              </div>
            )}
          </div>
 
          {!editingRetensi && (
            <p className="text-xs text-[#4A5568]">Masa retensi default saat arsip baru dibuat, per kategori dokumen.</p>
          )}
 
          <div className="space-y-1 text-xs">
            {(Object.keys(KATEGORI_LABELS) as KategoriArsip[]).map((kategori) => {
              const val = editingRetensi ? draftRetensi[kategori] : systemConfig.defaultRetensi[kategori];
              const isPermanen = val === "Permanen" || val === 99;
 
              return (
                <div key={kategori} className="flex items-center justify-between py-2 border-b border-[#E8DCC8]/60 last:border-0 gap-3">
                  <span className="text-[#4A5568] flex-1">{KATEGORI_LABELS[kategori]}</span>
                  {editingRetensi ? (
                    isPermanen ? (
                      <span className="font-mono font-bold px-3 py-1 rounded text-[11px] bg-[#FDF8F0] text-[#A67C2D] border border-[#C89B3C]/30">
                        PERMANEN
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <input
                          type="number"
                          min={1}
                          max={99}
                          value={typeof draftRetensi[kategori] === "number" ? draftRetensi[kategori] as number : 0}
                          onChange={(e) =>
                            setDraftRetensi((prev) => ({
                              ...prev,
                              [kategori]: parseInt(e.target.value) || 1,
                            }))
                          }
                          className="w-14 text-center border border-[#C89B3C] focus:border-[#A67C2D] focus:outline-none rounded px-2 py-1 text-xs font-mono text-[#0B1F3A] bg-white focus:ring-1 focus:ring-[#C89B3C] transition"
                        />
                        <span className="text-[#718096] text-[11px]">Tahun</span>
                      </div>
                    )
                  ) : (
                    <span
                      className={`font-mono font-bold px-3 py-1 rounded text-[11px] shrink-0 ${
                        isPermanen
                          ? "bg-[#FDF8F0] text-[#A67C2D] border border-[#C89B3C]/30"
                          : "bg-[#F0F4F8] text-[#0B1F3A] border border-[#E8DCC8]"
                      }`}
                    >
                      {isPermanen ? "PERMANEN" : `${val} Tahun`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
 
      {/* Row 2: Session Timeout + Backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 
        {/* SESSION TIMEOUT */}
        <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
          <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
            <Timer className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">
              Batas Waktu Sesi
            </h3>
            {!editingSession ? (
              <button
                onClick={() => { setDraftSession(systemConfig.sessionTimeout); setEditingSession(true); }}
                className="ml-auto flex items-center gap-1 text-[10px] font-bold bg-[#FAFAF8] border border-[#E8DCC8] hover:border-[#C89B3C] hover:text-[#C89B3C] text-[#718096] px-2 py-0.5 rounded uppercase transition cursor-pointer"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="ml-auto flex gap-1.5">
                <button
                  onClick={saveSession}
                  className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 border border-emerald-300 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded uppercase transition cursor-pointer"
                >
                  <Check className="w-3 h-3" /> Simpan
                </button>
                <button
                  onClick={cancelSession}
                  className="flex items-center gap-1 text-[10px] font-bold bg-red-50 border border-red-200 text-red-500 hover:bg-red-100 px-2 py-0.5 rounded uppercase transition cursor-pointer"
                >
                  <X className="w-3 h-3" /> Batal
                </button>
              </div>
            )}
          </div>
 
          <p className="text-xs text-[#4A5568]">
            Pengguna akan otomatis keluar jika tidak ada aktivitas selama durasi berikut.
          </p>
 
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[#C89B3C] shrink-0" />
              {editingSession ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={draftSession}
                    onChange={(e) => setDraftSession(parseInt(e.target.value))}
                    className="flex-1 accent-[#C89B3C] cursor-pointer"
                  />
                  <span className="text-sm font-bold text-[#0B1F3A] font-mono w-20 text-right shrink-0">
                    {draftSession} menit
                  </span>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-[#4A5568]">Durasi timeout aktif</span>
                  <span className="font-mono font-bold text-sm text-[#0B1F3A] bg-[#F0F4F8] border border-[#E8DCC8] px-3 py-1 rounded">
                    {systemConfig.sessionTimeout} menit
                  </span>
                </div>
              )}
            </div>
 
            {editingSession && (
              <div className="flex justify-between text-[10px] text-[#A0AEC0] font-mono px-1">
                <span>5 mnt</span>
                <span>30 mnt</span>
                <span>60 mnt</span>
                <span>90 mnt</span>
                <span>120 mnt</span>
              </div>
            )}
 
            <div className="p-3 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg text-[10px] text-[#718096] leading-relaxed">
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-[#C89B3C]" />
              Peringatan akan muncul <strong>5 menit sebelum</strong> sesi berakhir. Pengguna dapat memperpanjang sesi saat peringatan aktif.
            </div>
          </div>
        </div>
 
        {/* BACKUP MOCKUP */}
        <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
          <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
            <DatabaseBackup className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">
              Pencadangan Data
            </h3>
            <span className="ml-auto text-[9px] font-bold bg-amber-50 border border-amber-200 text-amber-600 px-2 py-0.5 rounded uppercase">
              Simulasi
            </span>
          </div>
 
          <div className="flex items-start gap-3 p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-[10px] text-amber-700 leading-relaxed">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
            <span>
              Fitur ini bersifat simulasi antarmuka. Pada versi produksi, pencadangan akan terhubung ke layanan penyimpanan cloud yang dikonfigurasi secara terpisah.
            </span>
          </div>
 
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-[#E8DCC8]/60">
              <span className="text-[#4A5568]">Pencadangan terakhir</span>
              <span className="font-mono text-[11px] font-semibold text-[#0B1F3A]">{lastBackup}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-[#E8DCC8]/60">
              <span className="text-[#4A5568]">Frekuensi otomatis</span>
              <span className="font-mono text-[11px] font-semibold text-[#0B1F3A]">{systemConfig.backupSchedule}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#4A5568]">Status sistem</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aktif & Terlindungi
              </span>
            </div>
          </div>
 
          <button
            onClick={handleBackupNow}
            disabled={backupLoading}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold tracking-wider transition cursor-pointer border ${
              backupLoading
                ? "bg-[#F5F0E8] text-[#A0AEC0] border-[#E8DCC8] cursor-not-allowed"
                : "bg-gradient-to-r from-[#C89B3C] to-[#A67C2D] text-white border-transparent hover:-translate-y-[1px] shadow-md hover:shadow-lg"
            }`}
          >
            <DatabaseBackup className={`w-4 h-4 ${backupLoading ? "animate-spin" : ""}`} />
            {backupLoading ? "Mencadangkan..." : "Cadangkan Sekarang"}
          </button>
        </div>
 
      </div>
    </div>
  );
}
