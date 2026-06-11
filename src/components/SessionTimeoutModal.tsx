/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlertTriangle, Clock, RefreshCw, LogOut } from "lucide-react";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  onExtend: () => void;
  onLogout: () => void;
}

export default function SessionTimeoutModal({
  isOpen,
  secondsRemaining,
  onExtend,
  onLogout,
}: SessionTimeoutModalProps) {
  if (!isOpen) return null;

  const minutesStr = Math.floor(secondsRemaining / 60);
  const secondsStr = String(secondsRemaining % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/85 backdrop-blur-md">
      <div 
        id="session-timeout-modal"
        className="w-full max-w-md bg-white border border-[#E8DCC8] rounded-lg shadow-2xl p-6 relative overflow-hidden"
      >
        {/* Top Gold Bar accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#C89B3C]" />

        <div className="flex items-start gap-4 mt-2 font-sans text-left">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20">
            <AlertTriangle className="w-8 h-8 animate-pulse" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-[#0B1F3A] tracking-tight font-display mb-1">
              Peringatan Sesi Berakhir
            </h3>
            <p className="text-sm text-[#4A5568]">
              Anda telah tidak aktif selama beberapa waktu. Untuk menjaga kearsipan tetap aman, sistem akan mengeluarkan Anda secara otomatis.
            </p>
          </div>
        </div>

        {/* Countdown display */}
        <div className="my-6 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg p-4 flex flex-col items-center justify-center font-sans">
          <span className="text-xs text-[#718096] flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5" /> WAKTU TERSISA
          </span>
          <span className="text-3xl font-mono text-[#C89B3C] font-bold tracking-widest">
            {minutesStr}:{secondsStr}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 font-sans">
          <button
            id="btn-extend-session"
            onClick={onExtend}
            className="flex-1 px-4 py-2.5 bg-[#C89B3C] text-white font-semibold rounded-lg hover:bg-[#A67C2D] transition duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Lanjutkan Sesi
          </button>
          <button
            id="btn-force-logout"
            onClick={onLogout}
            className="flex-1 px-4 py-2.5 bg-transparent hover:bg-red-500 border border-red-500 text-red-500 hover:text-white transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Keluar Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
