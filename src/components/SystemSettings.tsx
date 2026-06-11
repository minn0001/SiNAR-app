/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Settings, 
  Binary, 
  CalendarClock, 
  Database, 
  BellRing, 
  Save, 
  ShieldCheck, 
  RotateCcw,
  CloudLightning,
  AlertTriangle,
  Info
} from "lucide-react";
import { SystemConfig, KategoriArsip } from "../types";

interface SystemSettingsProps {
  systemConfig: SystemConfig;
}

export default function SystemSettings({ systemConfig }: SystemSettingsProps) {
  
  // Format state
  const [numberFormat, setNumberFormat] = useState(systemConfig.nomorFormat);
  
  // Retention states
  const [retentionAkta, setRetentionAkta] = useState(30);
  const [retentionKuasa, setRetentionKuasa] = useState(10);
  const [retentionPerjanjian, setRetentionPerjanjian] = useState(10);
  const [retentionSertifikat, setRetentionSertifikat] = useState(999); // 999 stands for Permanen
  const [retentionPendukung, setRetentionPendukung] = useState(5);

  // Storage and Backup
  const [storageCap, setStorageCap] = useState("50 GB");
  const [backupFrequency, setBackupFrequency] = useState("Mingguan");
  const [isBackupActive, setIsBackupActive] = useState(true);

  // Email notifications flags
  const [notifyOnRetention, setNotifyOnRetention] = useState(true);
  const [notifyOnUpload, setNotifyOnUpload] = useState(true);
  const [notifyOnAuditDelete, setNotifyOnAuditDelete] = useState(true);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Parameter konfigurasi keprotokolan SiNAR berhasil dipelihara dan disimpan ke server.");
  };

  const handleTriggerBackupNow = () => {
    alert("Proses pencadangan pangkalan data (Database Snapshot Dump) berhasil dipicu secara manual. Status berkas cadangan: AKTIF (Aman di server cloud backup).");
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] select-none">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-gold-royal" /> Pengaturan Parameter Sistem
          </h2>
          <p className="text-[#4A5568] text-xs font-sans">Konfigurasi format penomoran otomatis, masa simpan peraturan pemerintah, batasan hosting, dan notifikasi sekuriti</p>
        </div>

        <button
          onClick={handleTriggerBackupNow}
          className="px-3.5 py-1.5 text-xs font-bold bg-[#FAFAF8] hover:bg-[#C89B3C] text-[#0B1F3A] hover:text-white border border-[#D4B896] hover:border-transparent rounded transition cursor-pointer flex items-center gap-1"
        >
          <Database className="w-4 h-4 text-inherit" /> Cadangkan Sekarang
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6 text-left">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE SETTINGS */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* PANEL 1: FORMAT PENOMORAN */}
            <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
              <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
                <Binary className="w-4.5 h-4.5 text-[#C89B3C]" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">Format Registrasi Otomatis</h3>
              </div>

              <div className="space-y-2 text-xs">
                <label className="font-semibold text-[#0B1F3A]">Format String Struktur Nomor Arsip :</label>
                <input
                  type="text"
                  required
                  value={numberFormat}
                  onChange={(e) => setNumberFormat(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A] uppercase font-mono tracking-widest"
                />
                
                <div className="p-3 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg space-y-2 text-[#4A5568] select-none">
                  <span className="text-[10px] text-[#718096] font-bold uppercase tracking-wider block">LEGENDA DAN TAG VARIABEL :</span>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] leading-relaxed">
                    <span>• <strong className="text-[#0B1F3A]">{`{urut}`}</strong> : Nomor urutan berkas</span>
                    <span>• <strong className="text-[#0B1F3A]">{`{KATEGORI}`}</strong> : Singkatan internal</span>
                    <span>• <strong className="text-[#0B1F3A]">{`{BULAN_ROMAWI}`}</strong> : Bulan berjalan (I-XII)</span>
                    <span>• <strong className="text-[#0B1F3A]">{`{TAHUN}`}</strong> : Tahun kearsipan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL 2: DEFAULT RETENTION YEARS */}
            <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4">
              <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
                <CalendarClock className="w-4.5 h-4.5 text-[#C89B3C]" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">Preset Retensi Hukum Kearsipan</h3>
              </div>

              <p className="text-xs text-[#4A5568] leading-snug">
                Definisikan masa retensi (dalam satuan Tahun) setelah masa pembuatan akta sirkulasi di hadapan Notaris, merujuk perundang-undangan nasional.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                
                {/* AJB */}
                <div className="space-y-1">
                  <label className="text-[#4A5568] font-medium">1. Akta Jual Beli (AJB) :</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={retentionAkta}
                      onChange={(e) => setRetentionAkta(parseInt(e.target.value) || 30)}
                      className="w-20 bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs font-bold text-center text-[#0B1F3A]"
                    />
                    <span className="text-[#718096] font-medium">Tahun</span>
                  </div>
                </div>

                {/* Pendirian Perusahaan */}
                <div className="space-y-1">
                  <label className="text-[#4A5568] font-medium">2. Akta Pendirian Usaha :</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={retentionKuasa}
                      onChange={(e) => setRetentionKuasa(parseInt(e.target.value) || 10)}
                      className="w-20 bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs font-bold text-center text-[#0B1F3A]"
                    />
                    <span className="text-[#718096] font-medium">Tahun</span>
                  </div>
                </div>

                {/* Perjanjian */}
                <div className="space-y-1">
                  <label className="text-[#4A5568] font-medium">3. Surat Kuasa khusus :</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={retentionPerjanjian}
                      onChange={(e) => setRetentionPerjanjian(parseInt(e.target.value) || 10)}
                      className="w-20 bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs font-bold text-center text-[#0B1F3A]"
                    />
                    <span className="text-[#718096] font-medium">Tahun</span>
                  </div>
                </div>

                {/* Sertifikat */}
                <div className="space-y-1">
                  <label className="text-[#4A5568] font-medium">4. Sertifikat Tanah (SHM/SHGB) :</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      disabled
                      value="PERMANEN"
                      className="w-24 bg-[#FDF8F0] border border-[#C89B3C]/30 text-[#A67C2D] rounded-lg p-2 text-[10px] font-mono font-bold text-center"
                    />
                  </div>
                </div>

                {/* Dokumen Pendukung */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[#4A5568] font-medium">5. Dokumen Warkah Pendukung / Keterangan Lain :</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      value={retentionPendukung}
                      onChange={(e) => setRetentionPendukung(parseInt(e.target.value) || 5)}
                      className="w-20 bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs font-bold text-center text-[#0B1F3A]"
                    />
                    <span className="text-[#718096] font-medium">Tahun Masa Simpan</span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT SIDE SETTINGS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* STORAGE LIMITS AND BACKUPS */}
            <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 select-none">
              <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
                <Database className="w-4.5 h-4.5 text-[#C89B3C]" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">Alokasi Penyimpanan</h3>
              </div>

              <div className="space-y-4 text-xs font-sans">
                {/* Quota limit select */}
                <div className="space-y-1">
                  <label className="text-[#4A5568] block font-medium">Atur Batas Kapasitas (Quota Cap) :</label>
                  <select
                    value={storageCap}
                    onChange={(e) => setStorageCap(e.target.value)}
                    className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] cursor-pointer"
                  >
                    <option value="10 GB">10 Gigabyte (Standar Notariat)</option>
                    <option value="50 GB">50 Gigabyte (Menengah)</option>
                    <option value="100 GB">100 Gigabyte (Korporat Besar)</option>
                    <option value="500 GB">500 Gigabyte (Super Utama)</option>
                  </select>
                </div>

                {/* Backups frequency */}
                <div className="space-y-2 border-t border-[#E8DCC8]/60 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[#4A5568] font-medium">Pencadangan Pangkalan Data Otomatis</span>
                    <input
                      type="checkbox"
                      checked={isBackupActive}
                      onChange={() => setIsBackupActive(!isBackupActive)}
                      className="w-4.5 h-4.5 accent-[#C89B3C] cursor-pointer bg-white"
                    />
                  </div>

                  {isBackupActive && (
                    <div className="space-y-1 animate-fadeIn">
                      <label className="text-[10px] text-[#718096] block uppercase font-mono font-bold">Frekuensi Pencadangan :</label>
                      <select
                        value={backupFrequency}
                        onChange={(e) => setBackupFrequency(e.target.value)}
                        className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A] cursor-pointer"
                      >
                        <option value="Harian">Setiap Hari (Rekomendasi Aman)</option>
                        <option value="Mingguan">Setiap Minggu</option>
                        <option value="Bulanan">Setiap Bulan</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* EMAIL ALERTS CONFIG */}
            <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 select-none">
              <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
                <BellRing className="w-4.5 h-4.5 text-[#C89B3C]" />
                <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">Notifikasi Kearsipan</h3>
              </div>

              <div className="space-y-3.5 text-xs font-sans">
                {/* alert 1 */}
                <div className="flex items-start gap-2.5 justify-between">
                  <div className="space-y-0.5 text-left">
                    <span className="font-semibold text-[#0B1F3A] block">Notifikasi Batas Retensi</span>
                    <p className="text-[10px] text-[#718096] leading-tight">Surat kabar/email dikirim jika ada akta mendekati 180 hari retensi.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnRetention}
                    onChange={() => setNotifyOnRetention(!notifyOnRetention)}
                    className="w-4.5 h-4.5 accent-[#C89B3C] cursor-pointer bg-white mt-0.5 shrink-0"
                  />
                </div>

                {/* alert 2 */}
                <div className="flex items-start gap-2.5 justify-between border-t border-[#E8DCC8]/60 pt-3">
                  <div className="space-y-0.5 text-left">
                    <span className="font-semibold text-[#0B1F3A] block">Notifikasi Unggah Dokumen Baru</span>
                    <p className="text-[10px] text-[#718096] leading-tight">Beritahu Notaris penanggung jawab pasca staf berhasil meregis berkas baru.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnUpload}
                    onChange={() => setNotifyOnUpload(!notifyOnUpload)}
                    className="w-4.5 h-4.5 accent-[#C89B3C] cursor-pointer bg-white mt-0.5 shrink-0"
                  />
                </div>

                {/* alert 3 */}
                <div className="flex items-start gap-2.5 justify-between border-t border-[#E8DCC8]/60 pt-3">
                  <div className="space-y-0.5 text-left">
                    <span className="font-semibold text-[#0B1F3A] block">Notifikasi Penghapusan (Audit)</span>
                    <p className="text-[10px] text-[#718096] leading-tight">Kanal pengamanan tinggi jika terjadi tindakan penghapusan permanen dari Admin.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifyOnAuditDelete}
                    onChange={() => setNotifyOnAuditDelete(!notifyOnAuditDelete)}
                    className="w-4.5 h-4.5 accent-[#C89B3C] cursor-pointer bg-white mt-0.5 shrink-0"
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* SAVE TRIGGER BUTTON */}
        <div className="flex items-center justify-end border-t border-[#E8DCC8] pt-5 mt-4 select-none">
          <button
            id="btn-save-system-settings"
            type="submit"
            className="px-6 py-3 bg-[#C89B3C] hover:bg-[#A67C2D] font-bold text-white rounded-lg text-xs tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Save className="w-4.5 h-4.5" /> SIMPAN PARAMETER SISTEM
          </button>
        </div>

      </form>

    </div>
  );
}
