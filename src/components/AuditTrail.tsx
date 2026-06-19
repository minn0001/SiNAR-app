/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  History, 
  Search, 
  SlidersHorizontal, 
  FileDown,
  FileSpreadsheet, 
  Terminal, 
  Calendar,
  X,
  CheckCircle,
  Clock
} from "lucide-react";
import { AuditLog, User, UserRole } from "../types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface AuditTrailProps {
  currentUser: User;
  auditLogs: AuditLog[];
  mockUsers: User[];
}

export default function AuditTrail({
  currentUser,
  auditLogs,
  mockUsers
}: AuditTrailProps) {
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserFilter, setSelectedUserFilter] = useState("Semua");
  const [selectedActionFilter, setSelectedActionFilter] = useState("Semua");
  const [showFilters, setShowFilters] = useState(false);
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedUserFilter("Semua");
    setSelectedActionFilter("Semua");
    setDateStart("");
    setDateEnd("");
  };

  // Extract unique actions for dropdown filter
  const actionTypes = Array.from(new Set(auditLogs.map((l) => l.action)));

  // Filter logs
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.device.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = selectedUserFilter === "Semua" || log.userId === selectedUserFilter;
    const matchesAction = selectedActionFilter === "Semua" || log.action === selectedActionFilter;
    
    let matchesDate = true;
    const logDate = log.timestamp.split(" ")[0]; // YYYY-MM-DD
    if (dateStart && logDate < dateStart) matchesDate = false;
    if (dateEnd && logDate > dateEnd) matchesDate = false;

    return matchesSearch && matchesUser && matchesAction && matchesDate;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = 297;
    const pageH = 210;
    const margin = 14;
    const contentW = pageW - margin * 2;
    const colWidths = [32, 38, 28, 28, 68, 30, 45];
    const totalColW = colWidths.reduce((a, b) => a + b, 0);
    const rowH = 8;
  
    const drawHeader = () => {
      doc.setFillColor(11, 31, 58);
      doc.rect(0, 0, pageW, 28, "F");
  
      doc.setTextColor(200, 155, 60);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("KANTOR NOTARIS & PPAT RINA MAHARANI, S.H., M.Kn.", margin, 11);
  
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("Jl. Sudirman No. 45, Jakarta Selatan  |  Telp. (021) 5551234  |  notaris.rinamaharani@gmail.com", margin, 17);
  
      doc.setDrawColor(200, 155, 60);
      doc.setLineWidth(0.5);
      doc.line(margin, 22, pageW - margin, 22);
  
      doc.setTextColor(200, 155, 60);
      doc.setFontSize(7);
      doc.text("SiNAR – Sistem Arsip Digital", margin, 26);
    };
  
    const drawPageFooter = (pageNum: number, totalPages: number) => {
      doc.setDrawColor(232, 220, 200);
      doc.setLineWidth(0.3);
      doc.line(margin, pageH - 11, pageW - margin, pageH - 11);
      doc.setFontSize(7);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "normal");
      doc.text("Dicetak otomatis oleh SiNAR – Sistem Arsip Digital Kantor Notaris & PPAT Rina Maharani, S.H., M.Kn.", margin, pageH - 7);
      doc.text(`Hal. ${pageNum} / ${totalPages}`, pageW - margin, pageH - 7, { align: "right" });
    };
  
    const drawTableHeader = (startY: number) => {
      const headers = ["Waktu (WIB)", "Operator", "Peran", "Tindakan", "Target", "IP Address", "Perangkat"];
      doc.setFillColor(245, 230, 200);
      doc.rect(margin, startY, totalColW, rowH, "F");
      doc.setTextColor(11, 31, 58);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "bold");
      let x = margin;
      headers.forEach((h, i) => {
        doc.text(h, x + 3, startY + 5.5);
        x += colWidths[i];
      });
    };
  
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.userName.split(",")[0],
      log.userRole,
      log.action,
      log.target,
      log.ipAddress,
      log.device
    ]);
  
    // Hitung total halaman
    const firstPageRows = Math.floor((pageH - 75) / rowH); // halaman pertama lebih pendek (ada judul)
    const otherPageRows = Math.floor((pageH - 45) / rowH); // halaman berikutnya
    let totalPages = 1;
    if (rows.length > firstPageRows) {
      totalPages += Math.ceil((rows.length - firstPageRows) / otherPageRows);
    }
  
    // ── Halaman pertama ──
    drawHeader();
  
    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  
    doc.setTextColor(11, 31, 58);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("LOG RIWAYAT AUDIT TRAIL", pageW / 2, 38, { align: "center" });
  
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Perekaman menyeluruh kegiatan akses dokumen, login operator, dan sirkulasi draf notarisan", pageW / 2, 44, { align: "center" });
  
    doc.setFontSize(7);
    doc.text(`Dicetak pada: ${tanggalCetak}`, pageW / 2, 49, { align: "center" });
  
    doc.setDrawColor(232, 220, 200);
    doc.setLineWidth(0.3);
    doc.line(margin, 52, pageW - margin, 52);
  
    let currentY = 56;
    drawTableHeader(currentY);
    currentY += rowH;
  
    let pageNum = 1;
    let rowsOnThisPage = 0;
    const maxRowsFirstPage = firstPageRows;
    const maxRowsOtherPage = otherPageRows;
  
    rows.forEach((row, rIdx) => {
      const maxRows = pageNum === 1 ? maxRowsFirstPage : maxRowsOtherPage;
  
      if (rowsOnThisPage >= maxRows) {
        // Border luar tabel halaman ini
        doc.setDrawColor(200, 155, 60);
        doc.setLineWidth(0.4);
        doc.rect(margin, currentY - rowH * rowsOnThisPage - rowH, totalColW, rowH * (rowsOnThisPage + 1), "S");
  
        drawPageFooter(pageNum, totalPages);
        doc.addPage();
        pageNum++;
        rowsOnThisPage = 0;
  
        drawHeader();
        currentY = 36;
        drawTableHeader(currentY);
        currentY += rowH;
      }
  
      // Alternating row background
      doc.setFillColor(rIdx % 2 === 0 ? 250 : 255, rIdx % 2 === 0 ? 250 : 255, rIdx % 2 === 0 ? 248 : 255);
      doc.rect(margin, currentY, totalColW, rowH, "F");
  
      // Garis bawah row
      doc.setDrawColor(232, 220, 200);
      doc.setLineWidth(0.2);
      doc.line(margin, currentY + rowH, margin + totalColW, currentY + rowH);
  
      // Garis vertikal kolom
      let cx2 = margin;
      colWidths.forEach((w) => {
        doc.line(cx2, currentY, cx2, currentY + rowH);
        cx2 += w;
      });
      doc.line(cx2, currentY, cx2, currentY + rowH);
  
      // Teks
      doc.setFont("helvetica", "normal");
      doc.setTextColor(74, 85, 104);
      doc.setFontSize(7.5);
      let cx = margin;
      row.forEach((cell, i) => {
        doc.text(String(cell), cx + 3, currentY + 5.5);
        cx += colWidths[i];
      });
  
      currentY += rowH;
      rowsOnThisPage++;
    });
  
    // Border luar tabel halaman terakhir
    doc.setDrawColor(200, 155, 60);
    doc.setLineWidth(0.4);
    const tableStartY = currentY - rowH * rowsOnThisPage - rowH;
    doc.rect(margin, tableStartY, totalColW, rowH * (rowsOnThisPage + 1), "S");
  
    // Total box
    const finalY = currentY + 5;
    doc.setFillColor(253, 248, 240);
    doc.setDrawColor(200, 155, 60);
    doc.roundedRect(margin, finalY, contentW, 12, 2, 2, "FD");
    doc.setTextColor(11, 31, 58);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL KESELURUHAN LOG: ${filteredLogs.length} entri`, margin + 5, finalY + 8);
  
    drawPageFooter(pageNum, totalPages);
  
    doc.save(`AuditTrail_SiNAR_${new Date().toISOString().split("T")[0]}.pdf`);
  };
  
  const handleExportExcel = () => {
    // Buat CSV yang bisa dibuka Excel
    const headers = ["Waktu", "Nama Operator", "Peran", "Tindakan", "Target", "IP Address", "Perangkat"];
    const rows = filteredLogs.map((log) => [
      log.timestamp,
      log.userName.split(",")[0],
      log.userRole,
      log.action,
      log.target,
      log.ipAddress,
      log.device
    ]);
  
    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
  
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `AuditTrail_SiNAR_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Helper mock security badges for action types
  const getActionTheme = (action: string) => {
    switch (action) {
      case "Login":
        return "bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25";
      case "Logout":
        return "bg-slate-500/10 text-slate-600 border border-slate-350";
      case "Tambah Arsip":
        return "bg-indigo-500/10 text-indigo-650 border border-indigo-500/20";
      case "Edit Arsip":
        return "bg-[#F5E6C8] text-[#A67C2D] border border-[#C89B3C]/30";
      case "Hapus Arsip":
        return "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/25 font-bold";
      case "Download":
        return "bg-sky-500/10 text-sky-650 border border-sky-500/25";
      case "Export Laporan":
        return "bg-purple-500/10 text-purple-650 border border-purple-500/25";
      default:
        return "bg-slate-500/10 text-slate-600 border border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] select-none">
        <div className="space-y-1">
          <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide flex items-center gap-2">
            <History className="w-5 h-5 text-[#C89B3C]" /> Log Riwayat Audit Trail
          </h2>
          <p className="text-[#4A5568] text-xs font-sans">Perekaman menyeluruh kegiatan akses dokumen, login operator, dan sirkulasi draf notarisan</p>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-1.5 text-xs font-bold bg-[#FAFAF8] hover:bg-[#FDF8F0] hover:text-[#C89B3C] border border-[#D4B896] hover:border-[#C89B3C] text-[#0B1F3A] rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" /> Cetak Audit PDF
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-1.5 text-xs font-bold bg-[#C89B3C] text-white hover:bg-[#A67C2D] rounded transition cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
          </button>
        </div>
      </div>

      {/* FILTER SEARCH PANEL */}
      <div className="p-4 bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 font-sans">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450">
              <Search className="w-4 h-4 text-slate-405" />
            </span>
            <input
              type="text"
              placeholder="Cari kata kunci target, nama pengguna, detail alamat IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg py-2.5 pl-9 pr-4 text-sm text-[#0B1F3A] placeholder-[#718096]"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0 select-none">
            {/* User Dropdown Filter */}
            <select
              value={selectedUserFilter}
              onChange={(e) => setSelectedUserFilter(e.target.value)}
              className="bg-white border border-[#D4B896] font-medium text-xs text-[#0B1F3A] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 cursor-pointer"
            >
              <option value="Semua">Semua Petugas</option>
              {mockUsers.map((u) => (
                <option key={u.id} value={u.id}>{u.nama.split(",")[0]}</option>
              ))}
            </select>

            {/* Actions types filter */}
            <select
              value={selectedActionFilter}
              onChange={(e) => setSelectedActionFilter(e.target.value)}
              className="bg-white border border-[#D4B896] font-medium text-xs text-[#0B1F3A] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 cursor-pointer"
            >
              <option value="Semua">Semua Aksi</option>
              {actionTypes.map((action) => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-1 p-2.5 text-xs font-semibold rounded-lg border cursor-pointer transition ${
                showFilters 
                  ? "bg-[#FDF8F0] border-[#C89B3C] text-[#C89B3C]" 
                  : "bg-white border-[#D4B896] text-[#718096] hover:text-[#0B1F3A]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Penyaringan Tanggal
            </button>

            {(searchTerm || selectedUserFilter !== "Semua" || selectedActionFilter !== "Semua" || dateStart || dateEnd) && (
              <button
                onClick={resetFilters}
                className="px-2 py-2 text-xs font-semibold text-[#EF4444] hover:text-[#EF4444]/85 flex items-center justify-center gap-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters block for Dates */}
        {showFilters && (
          <div className="p-4 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg flex flex-col sm:flex-row gap-4 animate-fadeIn">
            <div className="space-y-1 flex-1">
              <label className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider block">Waktu Sesi Dari :</label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A]"
              />
            </div>
            <div className="space-y-1 flex-1">
              <label className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider block">Waktu Sesi Sampai :</label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A]"
              />
            </div>
          </div>
        )}
      </div>

      {/* AUDIT LOGS SECURITY LIST */}
      <div className="bg-white rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden select-none">
        
        <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] flex justify-between items-center text-xs">
          <span className="font-semibold text-[#0B1F3A] uppercase tracking-wider flex items-center gap-1.5 font-sans">
            <Terminal className="w-4.5 h-4.5 text-gold-royal" /> Berita Acara Konsol Sistem Sekuriti
          </span>
          <span className="font-bold text-[#718096] font-mono">STATUS: SYNC SECURE ENCRYPTED</span>
        </div>

        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F5E6C8] text-[#0B1F3A] border-b border-[#E8DCC8] uppercase font-mono">
                  <th className="p-4 pl-6">Waktu Kejadian (WIB)</th>
                  <th className="p-4">Operator Sistem &amp; Peran</th>
                  <th className="p-4 text-center">Tindakan Aktivitas</th>
                  <th className="p-4 w-72">Target Dokumen Berkas</th>
                  <th className="p-4 text-right pr-6">IP / Perangkat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]/65 text-[#4A5568]">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FDF8F0] odd:bg-[#FAFAF8] even:bg-white transition-colors duration-150">
                    {/* Timestamp */}
                    <td className="p-4 pl-6 font-mono text-[#718096] font-semibold">{log.timestamp}</td>

                    {/* Operator */}
                    <td className="p-4">
                      <div className="flex flex-col font-sans">
                        <span className="font-semibold text-[#0B1F3A] truncate max-w-[170px]">{log.userName.split(",")[0]}</span>
                        <span className="text-[10px] text-[#A67C2D] font-mono tracking-wide uppercase leading-tight">{log.userRole}</span>
                      </div>
                    </td>

                    {/* Activity */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase leading-none font-sans ${getActionTheme(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    {/* Target */}
                    <td className="p-4 font-sans font-medium text-[#0B1F3A] max-w-xs truncate" title={log.target}>
                      {log.target}
                    </td>

                    {/* Connection */}
                    <td className="p-4 text-right pr-6 font-mono text-[10px] text-[#718096] leading-tight">
                      <span>{log.ipAddress}</span>
                      <span className="block text-[9px] text-[#718096] truncate max-w-[140px] italic leading-tight">{log.device}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#718096]">
            <p className="font-semibold font-display text-[#0B1F3A]">Nihil data historis sekuriti ditemukan</p>
            <p className="text-xs text-[#718096] mt-1 font-sans">Harap sesuaikan rentang tanggal, filter pengguna, atau parameter tindakan sirkulasi untuk memuat draf log terkait.</p>
          </div>
        )}

      </div>

    </div>
  );
}
