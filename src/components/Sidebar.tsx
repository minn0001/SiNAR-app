/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  FolderLock, 
  PlusCircle, 
  Search, 
  FileText, 
  AlertTriangle, 
  History, 
  Users, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Menu,
  X
} from "lucide-react";
import { User, UserRole } from "../types";

// --- RBAC IMPORT: satu sumber kebenaran untuk semua aturan akses ---
import { canAccessPage, can } from "../lib/permissions";

interface NavigationProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentUser: User;
  onLogout: () => void;
  retentionWarningCount: number;
}

export default function Sidebar({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
  retentionWarningCount
}: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- RBAC: ganti hardcode role check dengan permissions.ts ---
  // "TAMBAH_ARSIP" bukan page-permission map biasa (lihat lib/permissions.ts),
  // jadi dicek terpisah pakai can("tambah_arsip").
  const canAccess = (page: string): boolean => {
    if (page === "TAMBAH_ARSIP") {
      return can(currentUser, "tambah_arsip");
    }
    return canAccessPage(currentUser, page);
  };

  const navItems = [
    { id: "DASHBOARD", label: "Dashboard", icon: LayoutDashboard },
    { id: "DAFTAR_ARSIP", label: "Daftar Arsip", icon: FolderLock },
    { id: "TAMBAH_ARSIP", label: "Tambah Arsip", icon: PlusCircle },
    { id: "PENCARIAN_ARSIP", label: "Pencarian", icon: Search },
    { id: "LAPORAN", label: "Laporan Laju", icon: FileText },
    { 
      id: "ARSIP_MENDEKATI_RETENSI", 
      label: "Batas Retensi", 
      icon: AlertTriangle,
      badge: retentionWarningCount > 0 ? retentionWarningCount : undefined,
      badgeColor: "bg-[#EF4444] text-white"
    },
    { id: "AUDIT_TRAIL", label: "Audit Sistem", icon: History },
    { id: "KELOLA_PENGGUNA", label: "Kelola User", icon: Users },
    { id: "PENGATURAN_SISTEM", label: "Pengaturan", icon: Settings },
  ];

  const allowedNavItems = navItems.filter(item => canAccess(item.id));

  return (
    <>
      {/* --- DESKTOP COLLAPSIBLE SIDEBAR --- */}
      <aside 
        className={`hidden md:flex flex-col bg-[#FFFFFF] border-r border-[#E8DCC8] h-screen sticky top-0 transition-all duration-300 select-none ${
          isCollapsed ? "w-[85px]" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className={`border-b border-[#E8DCC8] bg-[#FAFAF8] flex items-center justify-between h-20 overflow-hidden transition-all duration-300 ${
          isCollapsed ? "px-2 py-4" : "p-4"
        }`}>
          <div className={`flex items-center shrink-0 ${isCollapsed ? "gap-1" : "gap-3"}`}>
            <div 
              className="w-11 h-11 rounded-full flex items-center justify-center bg-[#F5E6C8] border border-[#C89B3C] text-[#C89B3C] shrink-0"
              style={{ boxShadow: "0 0 10px rgba(200,155,60,0.15)" }}
            >
              <svg 
                viewBox="20 10 110 110" 
                className="w-[88%] h-[88%]" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Rays of Light */}
                <line x1="75" y1="46" x2="75" y2="30" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="63" y1="49" x2="52" y2="38" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="87" y1="49" x2="98" y2="38" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="55" y1="56" x2="42" y2="50" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
                <line x1="95" y1="56" x2="108" y2="50" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />

                {/* Book Outline */}
                <path 
                  d="M 75,65 Q 60,58 43,62 L 43,96 Q 60,92 75,99 Q 90,92 107,96 L 107,62 Q 90,58 75,65 Z" 
                  stroke="#C89B3C" 
                  strokeWidth="4.5" 
                  strokeLinejoin="round" 
                  strokeLinecap="round" 
                  fill="none"
                />

                {/* Center Crease (Dashed Line) */}
                <line x1="75" y1="65" x2="75" y2="99" stroke="#C89B3C" strokeWidth="3" strokeDasharray="3,3" />

                {/* Left Page Lines */}
                <line x1="52" y1="73" x2="68" y2="73" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
                <line x1="49" y1="81" x2="68" y2="81" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
                <line x1="52" y1="89" x2="68" y2="89" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />

                {/* Right Page Lines */}
                <line x1="82" y1="73" x2="98" y2="73" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
                <line x1="82" y1="81" x2="101" y2="81" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
                <line x1="82" y1="89" x2="98" y2="89" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />

                {/* "N" Circle Hub */}
                <circle cx="75" cy="60" r="11" fill="#C89B3C" />
                <text 
                  x="75" 
                  y="65" 
                  fontFamily="Inter, system-ui, sans-serif" 
                  fontWeight="bold" 
                  fontSize="13.5" 
                  fill="#F5E6C8" 
                  textAnchor="middle"
                >N</text>
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-lg font-display text-[#0B1F3A] tracking-wide leading-none">SiNAR</span>
                <span className="text-[10px] text-[#A67C2D] font-medium tracking-widest mt-1 uppercase leading-none">Arsip Digital</span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`rounded bg-white border border-[#E8DCC8] text-[#A67C2D] hover:bg-[#F5F0E8] transition cursor-pointer flex items-center justify-center shrink-0 ${
              isCollapsed ? "p-1.5 px-1.5" : "p-1.5 px-2"
            }`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4 text-[#A67C2D]" /> : <ChevronLeft className="w-4 h-4 text-[#A67C2D]" />}
          </button>
        </div>

        {/* User context widget */}
        <div className="p-4 border-b border-[#E8DCC8] bg-[#FAFAF8]">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-[#C89B3C] flex items-center justify-center shrink-0 animate-fadeIn text-white">
              <span className="font-bold text-sm text-white uppercase">
                {currentUser.nama.charAt(0)}
              </span>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium truncate text-[#0B1F3A] leading-tight">{currentUser.nama}</span>
                <span className="text-[10px] text-[#A67C2D] font-mono font-bold uppercase mt-0.5 tracking-wider">{currentUser.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id || 
              (item.id === "DAFTAR_ARSIP" && (currentPage === "DETAIL_ARSIP" || currentPage === "EDIT_ARSIP"));

            return (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm font-medium transition cursor-pointer relative group border-l-[3px] ${
                  isActive
                    ? "bg-[#F5E6C8] text-[#A67C2D] font-medium border-[#C89B3C]"
                    : "bg-transparent text-[#4A5568] hover:bg-[#F5F0E8] hover:text-[#0B1F3A] border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? "text-[#C89B3C]" : "text-[#718096] group-hover:text-[#C89B3C]"}`} />
                {!isCollapsed && <span className="truncate text-xs">{item.label}</span>}

                {/* Badge alert */}
                {item.badge && (
                  <span className={`absolute ${isCollapsed ? "top-1 right-1" : "right-3"} text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                )}

                {/* Tooltip for collapsed sidebar */}
                {isCollapsed && (
                  <div className="absolute left-[85px] bg-white border border-[#E8DCC8] text-[#0B1F3A] text-xs py-1 px-2.5 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#E8DCC8] bg-[#FAFAF8]">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-red-500/10 transition cursor-pointer overflow-hidden`}
          >
            <LogOut className="w-5 h-5 text-[#EF4444] shrink-0" />
            {!isCollapsed && <span className="font-semibold text-xs text-[#EF4444]">Keluar Sistem</span>}
          </button>
        </div>
      </aside>

      {/* --- MOBILE VIEW: HEADER & BOTTOM NAVIGATION --- */}
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-[#0B1F3A] border-b border-gold-royal/15 h-16 px-4 shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center bg-[#F5E6C8] border border-[#C89B3C] text-[#C89B3C] shrink-0"
            style={{ boxShadow: "0 0 10px rgba(200,155,60,0.15)" }}
          >
            <svg 
              viewBox="20 10 110 110" 
              className="w-[88%] h-[88%]" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Rays of Light */}
              <line x1="75" y1="46" x2="75" y2="30" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="63" y1="49" x2="52" y2="38" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="87" y1="49" x2="98" y2="38" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="55" y1="56" x2="42" y2="50" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="95" y1="56" x2="108" y2="50" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />

              {/* Book Outline */}
              <path 
                d="M 75,65 Q 60,58 43,62 L 43,96 Q 60,92 75,99 Q 90,92 107,96 L 107,62 Q 90,58 75,65 Z" 
                stroke="#C89B3C" 
                strokeWidth="4.5" 
                strokeLinejoin="round" 
                strokeLinecap="round" 
                fill="none"
              />

              {/* Center Crease (Dashed Line) */}
              <line x1="75" y1="65" x2="75" y2="99" stroke="#C89B3C" strokeWidth="3" strokeDasharray="3,3" />

              {/* Left Page Lines */}
              <line x1="52" y1="73" x2="68" y2="73" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
              <line x1="49" y1="81" x2="68" y2="81" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
              <line x1="52" y1="89" x2="68" y2="89" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />

              {/* Right Page Lines */}
              <line x1="82" y1="73" x2="98" y2="73" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
              <line x1="82" y1="81" x2="101" y2="81" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />
              <line x1="82" y1="89" x2="98" y2="89" stroke="#C89B3C" strokeWidth="4" strokeLinecap="round" />

              {/* "N" Circle Hub */}
              <circle cx="75" cy="60" r="11" fill="#C89B3C" />
              <text 
                x="75" 
                y="65" 
                fontFamily="Inter, system-ui, sans-serif" 
                fontWeight="bold" 
                fontSize="13.5" 
                fill="#F5E6C8" 
                textAnchor="middle"
              >N</text>
            </svg>
          </div>
          <span className="font-display font-bold text-base text-white tracking-wider">SiNAR</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right flex flex-col justify-center">
            <span className="text-xs font-semibold text-slate-200 max-w-[120px] truncate leading-tight">{currentUser.nama}</span>
            <span className="text-[9px] text-gold-royal font-mono uppercase tracking-wider">{currentUser.role}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="p-1 px-1.5 rounded hover:bg-[#1E355A]/50 text-red-400 transition"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation (Always accessible, dynamic scrolling context) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0B1F3A]/95 backdrop-blur-md border-t border-gold-royal/15 h-16 z-40 flex items-center justify-around px-2 select-none shadow-[0_-4px_12px_rgba(0,0,0,0.5)]">
        {/* We present a curated short-list for mobile, with a "Lainnya" drawer if needed, OR 5 main paths */}
        {[
          { id: "DASHBOARD", label: "Dashboard", icon: LayoutDashboard },
          { id: "DAFTAR_ARSIP", label: "Arsip", icon: FolderLock },
          { id: "TAMBAH_ARSIP", label: "Tambah", icon: PlusCircle, disabled: !canAccess("TAMBAH_ARSIP") },
          { id: "PENCARIAN_ARSIP", label: "Cari", icon: Search },
          { id: "ARSIP_MENDEKATI_RETENSI", label: "Retensi", icon: AlertTriangle, disabled: !canAccess("ARSIP_MENDEKATI_RETENSI"), badge: retentionWarningCount > 0 ? retentionWarningCount : undefined }
        ]
        .filter(item => !item.disabled)
        .map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || 
            (item.id === "DAFTAR_ARSIP" && (currentPage === "DETAIL_ARSIP" || currentPage === "EDIT_ARSIP"));

          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] relative transition-colors cursor-pointer ${
                isActive ? "text-gold-royal font-semibold" : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-gold-royal" : "text-slate-400"}`} />
              <span className="scale-90 font-medium">{item.label}</span>

              {item.badge && (
                <span className="absolute top-2.5 right-4 text-[8px] font-bold px-1.5 py-0.5 bg-[#EF4444] text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Admin popup menu */}
        {can(currentUser, "kelola_pengguna") && (
          <div className="relative flex-1 h-full">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`flex flex-col items-center justify-center w-full h-full py-1 text-[10px] transition-colors cursor-pointer ${
                ["AUDIT_TRAIL", "KELOLA_PENGGUNA", "PENGATURAN_SISTEM"].includes(currentPage)
                  ? "text-gold-royal font-semibold"
                  : "text-slate-500 hover:text-white"
              }`}
            >
              <Settings className={`w-5 h-5 mb-0.5 transition-transform duration-200 ${mobileMenuOpen ? "rotate-45 text-gold-royal" : ""}`} />
              <span className="scale-90 text-[9px] font-medium leading-none">Admin</span>
            </button>
        
            {/* Popup menu */}
            {mobileMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMobileMenuOpen(false)}
                />
        
                {/* Menu popup */}
                <div className="absolute bottom-[68px] right-0 z-50 bg-[#0B1F3A] border border-gold-royal/30 rounded-xl shadow-2xl overflow-hidden w-44 animate-fadeIn">
                  <div className="px-3 py-2 border-b border-gold-royal/20">
                    <span className="text-[9px] text-gold-royal font-mono uppercase tracking-widest">Menu Admin</span>
                  </div>
        
                  {[
                    { id: "AUDIT_TRAIL", label: "Audit Sistem", icon: History },
                    { id: "KELOLA_PENGGUNA", label: "Kelola User", icon: Users },
                    { id: "PENGATURAN_SISTEM", label: "Pengaturan", icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentPage(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors cursor-pointer ${
                          isActive
                            ? "bg-gold-royal/20 text-gold-royal font-semibold"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-gold-royal" : "text-slate-400"}`} />
                        {item.label}
                        {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-royal" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
