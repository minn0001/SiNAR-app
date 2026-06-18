/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Settings, 
  Binary, 
  CalendarClock,
  Info
} from "lucide-react";
import { SystemConfig } from "../types";

interface SystemSettingsProps {
  systemConfig: SystemConfig;
}

export default function SystemSettings({ systemConfig }: SystemSettingsProps) {
  
  const [retentionAktaJualBeli] = useState(30);
  const [retentionPendirianPerusahaan] = useState(30);
  const [retentionSuratKuasa] = useState(10);
  const [retentionPerjanjian] = useState(10);
  const [retentionPendukung] = useState(5);

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] select-none">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#C89B3C]" /> Pengaturan Parameter Sistem
          </h2>
          <p className="text-[#4A5568] text-xs font-sans">
            Konfigurasi format penomoran otomatis dan referensi masa retensi hukum kearsipan notarisan
          </p>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="flex items-start gap-3 p-4 bg-[#FDF8F0] border border-[#C89B3C]/30 rounded-xl text-xs text-[#A67C2D] font-sans">
        <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C89B3C]" />
        <p className="leading-relaxed">
          Parameter di bawah bersifat <strong>referensi sistem</strong> dan mengacu pada ketentuan hukum kearsipan notarisan yang berlaku. 
          Perubahan nilai retensi akan berlaku pada arsip yang baru didaftarkan. 
          Hubungi pengembang sistem untuk modifikasi format penomoran.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* PANEL 1: FORMAT PENOMORAN - READ ONLY */}
        <div className="bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
          <div className="border-b border-[#E8DCC8] pb-2.5 flex items-center gap-2">
            <Binary className="w-4 h-4 text-[#C89B3C]" />
            <h3 className="text-sm font-semibold uppercase tracking-widest font-display text-[#0B1F3A]">
              Format Registrasi Otomatis
            </h3>
            <span className="ml-auto text-[9px] font-bold bg-[#FAFAF8] border border-[#E8DCC8] text-[#718096] px-2 py-0.5 rounded uppercase tracking-wider">
              Read Only
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <label className="font-semibold text-[#0B1F3A]">Format String Struktur Nomor Arsip:</label>
            <div className="w-full bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg p-3 text-xs text-[#718096] uppercase font-mono tracking-widest select-all">
              {systemConfig.nomorFormat}
            </div>
            
            <div className="p-3 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg space-y-2 text-[#4A5568] select-none">
              <span className="text-[10px] text-[#718096] font-bold uppercase tracking-wider
