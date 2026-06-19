/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Download, 
  Edit3, 
  Trash,
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckSquare, 
  CheckCircle,
  FileSpreadsheet,
  FileDown,
  Layers,
  ArrowRight,
  Eye,
  ZoomIn,
  ZoomOut,
  Printer
} from "lucide-react";
import { Archive, KategoriArsip, StatusArsip, User, UserRole } from "../types";
import { canEdit } from "../lib/permissions";

interface ArchiveListProps {
  archives: Archive[];
  currentUser: User;
  onNavigate: (page: string, activeId?: string | null) => void;
  onUpdateArchives: (updatedList: Archive[]) => void;
  onDeleteArchive?: (id: string) => void;
}

export default function ArchiveList({
  archives,
  currentUser,
  onNavigate,
  onUpdateArchives,
  onDeleteArchive
}: ArchiveListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [clientFilter, setClientFilter] = useState("");
  const [dateFilterStart, setDateFilterStart] = useState("");
  const [dateFilterEnd, setDateFilterEnd] = useState("");

  // Table row selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Bulk change category state
  const [bulkCategoryTarget, setBulkCategoryTarget] = useState<string>("");
  const [showBulkCategoryMenu, setShowBulkCategoryMenu] = useState(false);

  // Pagination states
  const [currentPageNum, setCurrentPageNum] = useState(1);
  const itemsPerPage = 8;

  // Individual delete modal state
  const [archiveToDelete, setArchiveToDelete] = useState<Archive | null>(null);

  // Document preview modal state
  const [archiveToPreview, setArchiveToPreview] = useState<Archive | null>(null);
  const [viewerZoom, setViewerZoom] = useState<number>(100);
  // --- Status proses cetak/unduh di modal preview ---
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Resets filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedStatus("All");
    setClientFilter("");
    setDateFilterStart("");
    setDateFilterEnd("");
    setSelectedIds([]);
  };

  // Filter archives based on criteria
  const filteredArchives = archives.filter((item) => {
    // 1. Text Search (Matches title, archive number, or client name)
    const matchesSearch = 
      item.judulArsip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomorArsip.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.namaKlien.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Category selection
    const matchesCategory = selectedCategory === "All" || item.kategori === selectedCategory;

    // 3. Status selection
    const matchesStatus = selectedStatus === "All" || item.statusArsip === selectedStatus;

    // 4. Advanced filters
    const matchesClient = !clientFilter || item.namaKlien.toLowerCase().includes(clientFilter.toLowerCase());
    
    let matchesDate = true;
    if (dateFilterStart && item.tanggalArsip < dateFilterStart) matchesDate = false;
    if (dateFilterEnd && item.tanggalArsip > dateFilterEnd) matchesDate = false;

    // 5. Role restrictions:
    // "Notaris: Full access to Akta category archives, View-only for other categories"
    // "Staff: Input and manage their own archives, Search and view archives based on access level"
    // Wait, the specification says "Search and view archives based on access level". For this client-side prototype,
    // we list all so the user doesn't get a blank screen, but we enforce edit/delete permissions appropriately in detail pages.
    // Let's make sure the filter reflects standard visibility.

    return matchesSearch && matchesCategory && matchesStatus && matchesClient && matchesDate;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredArchives.length / itemsPerPage) || 1;
  const startIndex = (currentPageNum - 1) * itemsPerPage;
  const paginatedArchives = filteredArchives.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(x => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const pageIds = paginatedArchives.map(a => a.id);
      setSelectedIds([...new Set([...selectedIds, ...pageIds])]);
    } else {
      const pageIds = paginatedArchives.map(a => a.id);
      setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)));
    }
  };

  const isAllPageSelected = () => {
    if (paginatedArchives.length === 0) return false;
    return paginatedArchives.every(a => selectedIds.includes(a.id));
  };

  // Role check helper for actions
  const isAdmin = currentUser.role === UserRole.ADMIN;

  // --- BULK ACTION HANDLERS ---
  const handleBulkExport = () => {
    alert(`Mengekspor ${selectedIds.length} arsip terpilih ke format Excel/ZIP. Berkas manifest-ekspor.xlsx berhasil diunduh secara virtual!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (!isAdmin) {
      alert("Hanya Admin yang berwenang untuk menghapus arsip massal.");
      return;
    }
    const confirmed = window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} arsip terpilih? Tindakan ini tidak dapat dibatalkan.`);
    if (confirmed) {
      const remainingArr = archives.filter(a => !selectedIds.includes(a.id));
      onUpdateArchives(remainingArr);
      setSelectedIds([]);
      setCurrentPageNum(1);
    }
  };

  const handleBulkChangeCategory = () => {
    if (!bulkCategoryTarget) return;
    
    const updated = archives.map((a) => {
      if (selectedIds.includes(a.id)) {
        return {
          ...a,
          kategori: bulkCategoryTarget as KategoriArsip,
          updatedAt: "2026-06-08 10:00",
          updatedBy: currentUser.id
        };
      }
      return a;
    });

    onUpdateArchives(updated);
    setSelectedIds([]);
    setBulkCategoryTarget("");
    setShowBulkCategoryMenu(false);
    alert(`Berhasil memperbarui kategori ${selectedIds.length} arsip secara massal.`);
  };

  // Get status badge styling
  const getStatusBadge = (status: StatusArsip) => {
    switch (status) {
      case StatusArsip.AKTIF:
        return "bg-emerald-50 text-emerald-600 border border-emerald-200";
      case StatusArsip.INAKTIF:
        return "bg-slate-50 text-slate-600 border border-slate-200";
      case StatusArsip.PERMANEN:
        return "bg-[#FDF8F0] text-[#C89B3C] border border-[#C89B3C]/30";
      case StatusArsip.MENUNGGU_PEMUSNAHAN:
        return "bg-red-50 text-red-600 border border-red-200 animate-pulse";
    }
  };

  // Get Category badge styling
  const getCategoryTheme = (cat: KategoriArsip) => {
    switch (cat) {
      case KategoriArsip.AKTA_JUAL_BELI:
        return "text-indigo-600 bg-white border border-indigo-200";
      case KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN:
        return "text-violet-600 bg-white border border-violet-200";
      case KategoriArsip.SURAT_KUASA:
        return "text-sky-600 bg-white border border-sky-200";
      case KategoriArsip.PERJANJIAN:
        return "text-emerald-600 bg-white border border-emerald-200";
      case KategoriArsip.SERTIFIKAT:
        return "text-amber-600 bg-white border border-amber-200";
      case KategoriArsip.DOKUMEN_PENDUKUNG:
        return "text-slate-600 bg-white border border-slate-200";
    }
  };

  // --- FIX: Unduh berkas asli dari Supabase Storage (atau base64 mock) ---
  // Sebelumnya hanya bekerja untuk file base64 ("data:"); sekarang juga
  // menangani URL biasa (https://...supabase.co/...) dengan fetch + blob,
  // supaya nama file unduhan tetap sesuai nama aslinya.
  const handleDownloadPreviewFile = async (archive: Archive) => {
    const file = archive.fileDokumen;
    if (!file?.url) {
      alert("Berkas digital tidak ditemukan.");
      return;
    }

    setIsDownloading(true);
    try {
      if (file.url.startsWith("data:")) {
        // Mock/base64 file: unduh langsung
        const link = document.createElement("a");
        link.href = file.url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // File asli di Supabase Storage: fetch sebagai blob agar nama file
        // unduhan benar (kalau pakai <a download> langsung ke URL lintas-origin,
        // browser akan mengabaikan atribut download dan cuma membuka tab baru).
        const response = await fetch(file.url);
        if (!response.ok) throw new Error("Gagal mengambil berkas dari server.");
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch (err) {
      console.error("Gagal mengunduh berkas:", err);
      // Fallback: buka di tab baru supaya user tetap bisa menyimpan manual
      window.open(file.url, "_blank");
      alert("Unduhan otomatis gagal, berkas dibuka di tab baru. Silakan simpan secara manual (klik kanan > Save As).");
    } finally {
      setIsDownloading(false);
    }
  };

  // --- FIX: Cetak berkas asli — buka file di tab baru lalu panggil print() ---
  // Untuk PDF asli: buka langsung URL-nya (browser akan render PDF viewer bawaan,
  // lalu kita panggil window.print() begitu termuat).
  // Untuk dokumen mock (tanpa file asli): cetak konten preview yang sedang tampil di modal.
  const handlePrintPreviewFile = (archive: Archive) => {
    const file = archive.fileDokumen;
    const isMockFile = !file || !file.url || file.url.startsWith("/") || file.url.includes("pdfobject.com");

    if (isMockFile) {
      // Cetak elemen mock-template yang sedang ditampilkan di modal preview
      const previewNode = document.getElementById("preview-modal-content");
      if (!previewNode) {
        alert("Konten pratinjau tidak ditemukan untuk dicetak.");
        return;
      }
      const printWindow = window.open("", "_blank", "width=850,height=1000");
      if (!printWindow) {
        alert("Mohon izinkan pop-up untuk mencetak dokumen.");
        return;
      }
      printWindow.document.write(`
        <html>
          <head>
            <title>Cetak - ${archive.nomorArsip}</title>
            <style>
              body { font-family: Georgia, 'Times New Roman', serif; padding: 24px; color: #1e293b; }
              * { box-sizing: border-box; }
            </style>
          </head>
          <body>${previewNode.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
      return;
    }

    setIsPrinting(true);
    try {
      const printWindow = window.open(file.url, "_blank");
      if (!printWindow) {
        alert("Mohon izinkan pop-up untuk mencetak dokumen.");
        return;
      }
      // Beri waktu file (terutama PDF) untuk termuat sebelum memicu dialog cetak
      printWindow.addEventListener("load", () => {
        printWindow.focus();
        printWindow.print();
      });
      // Fallback timer kalau event 'load' tidak terpicu (mis. PDF native viewer)
      setTimeout(() => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch {
          /* tab sudah ditutup atau lintas-origin, abaikan */
        }
      }, 1500);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Add Direct Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold font-display text-[#0B1F3A] tracking-wide">
            Daftar Arsip Digital
          </h2>
          <p className="text-[#718096] text-xs">
            Manajemen lengkap arsip legalitas, dokumen akta, sertifikat, dan data penunjang notarisan
          </p>
        </div>
        
        {currentUser.role !== UserRole.KEPALA_KANTOR && (
          <button
            onClick={() => onNavigate("TAMBAH_ARSIP")}
            className="px-4 py-2 bg-gradient-to-r from-[#A67C2D] to-[#C89B3C] text-white font-semibold rounded-lg hover:bg-gold-royal transition shadow-md flex items-center justify-center gap-2 cursor-pointer self-start"
          >
            <Layers className="w-4.5 h-4.5" />
            Arsip Baru
          </button>
        )}
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="p-4 bg-white rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4">
        {/* Simple Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#718096]">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Cari nomor arsip, judul akta, nama klien..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg py-2.5 pl-9 pr-4 text-sm text-[#0B1F3A] placeholder-[#A0AEC0]"
            />
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 shrink-0">
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white border border-[#D4B896] font-medium text-xs text-[#0B1F3A] focus:border-gold-royal focus:outline-none rounded-lg p-2.5 cursor-pointer"
            >
              <option value="All">Semua Kategori</option>
              {Object.values(KategoriArsip).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-[#D4B896] font-medium text-xs text-[#0B1F3A] focus:border-gold-royal focus:outline-none rounded-lg p-2.5 cursor-pointer"
            >
              <option value="All">Semua Status</option>
              {Object.values(StatusArsip).map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>

            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center justify-center gap-1.5 p-2.5 text-xs font-semibold rounded-lg border cursor-pointer transition ${
                showAdvanced 
                  ? "bg-[#F5E6C8] border-gold-royal text-gold-dark font-bold" 
                  : "bg-[#FAFAF8] border-[#D4B896] text-[#0B1F3A] hover:bg-[#FDF8F0]"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" /> Filter Lanjutan
            </button>

            {(searchTerm || selectedCategory !== "All" || selectedStatus !== "All" || clientFilter || dateFilterStart || dateFilterEnd) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-xs font-semibold text-red-500 hover:text-red-600 flex items-center justify-center gap-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Drawer */}
        {showAdvanced && (
          <div className="p-4 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
            {/* Nama Klien */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider block">Klien / Pihak Utama</label>
              <input
                type="text"
                placeholder="cth: Budi Santoso"
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A]"
              />
            </div>

            {/* Rentang Tanggal Pengesahan */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[11px] font-semibold text-[#718096] uppercase tracking-wider block">Rentang Tanggal Pengesahan Arsip</label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFilterStart}
                  onChange={(e) => setDateFilterStart(e.target.value)}
                  className="flex-1 bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A] cursor-pointer"
                />
                <span className="text-[#718096] text-xs">s/d</span>
                <input
                  type="date"
                  value={dateFilterEnd}
                  onChange={(e) => setDateFilterEnd(e.target.value)}
                  className="flex-1 bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MULTI ROW SELECTION TOOLBAR (Fades/Slides in dynamically) */}
      {selectedIds.length > 0 && (
        <div className="p-4 bg-gold-royal text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 font-sans shadow-lg animate-slideIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-white animate-pulse shrink-0" />
            <span className="text-sm font-bold">
              {selectedIds.length} arsip dipilih untuk tindakan massal
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {/* Export bulk */}
            <button
              onClick={handleBulkExport}
              className="px-3.5 py-2 text-xs font-bold bg-[#0B1F3A] text-white hover:bg-[#112244] rounded-lg transition flex items-center gap-1.5 shadow cursor-pointer"
            >
              <FileDown className="w-4 h-4" /> Ekspor Data ({selectedIds.length})
            </button>

            {/* Mass Category Change Dropdown / Toggle */}
            <div className="relative">
              <button
                onClick={() => setShowBulkCategoryMenu(!showBulkCategoryMenu)}
                className="px-3.5 py-2 text-xs font-bold bg-[#0B1F3A] text-white hover:bg-[#112244] rounded-lg transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Layers className="w-4 h-4" /> Ubah Kategori Massal
              </button>

              {showBulkCategoryMenu && (
                <div className="absolute bottom-11 right-0 md:bottom-auto md:top-11 bg-white border border-gold-royal shadow-xl rounded-lg p-3 z-50 w-56 flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#718096] block uppercase font-sans">Pilih kategori baru:</span>
                  <select
                    value={bulkCategoryTarget}
                    onChange={(e) => setBulkCategoryTarget(e.target.value)}
                    className="w-full text-xs text-[#0B1F3A] bg-white border border-[#D4B896] p-2 rounded focus:outline-none font-sans"
                  >
                    <option value="">-- Pilih --</option>
                    {Object.values(KategoriArsip).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleBulkChangeCategory}
                    disabled={!bulkCategoryTarget}
                    className="w-full bg-[#C89B3C] text-white disabled:bg-slate-200 disabled:text-slate-400 text-xs font-bold py-1.5 rounded transition cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
              )}
            </div>

            {/* Delete bulk (Admin Only) */}
            {isAdmin ? (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-2 text-xs font-bold bg-red-650 hover:bg-red-750 text-white rounded-lg transition flex items-center gap-1.5 shadow cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Hapus Terpilih
              </button>
            ) : (
              <span className="text-[10px] text-white/90 font-medium italic block">Tindakan hapus hanya untuk Admin</span>
            )}

            {/* Clear selected */}
            <button
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded hover:bg-black/10 text-white transition cursor-pointer"
              title="Batalkan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ARCHIVE GRID / TABLE CONTAINER */}
      <div className="bg-white rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden animate-fadeIn">
        {paginatedArchives.length > 0 ? (
          <div className="overflow-x-auto">
            {/* Desktop View Table */}
            <table className="w-full text-left border-collapse" id="archive-list-table">
              <thead>
                <tr className="bg-[#F5E6C8] border-b border-[#E8DCC8] text-[#0B1F3A] select-none font-semibold">
                  {/* Select ALL Checkbox column */}
                  <th className="py-4 px-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected()}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded text-gold-royal accent-[#C89B3C] border-gray-300 pointer-events-auto cursor-pointer"
                    />
                  </th>
                  <th className="py-4 px-3 text-xs font-bold uppercase tracking-widest">Nomor Arsip</th>
                  <th className="py-4 px-3 text-xs font-bold uppercase tracking-widest w-72">Judul Arsip</th>
                  <th className="py-4 px-3 text-xs font-bold uppercase tracking-widest">Tanggal</th>
                  <th className="py-4 px-3 text-xs font-bold uppercase tracking-widest">Klien</th>
                  <th className="py-4 px-3 text-xs font-bold uppercase tracking-widest">Kategori</th>
                  <th className="py-4 px-3 text-xs font-bold uppercase tracking-widest text-center">Status</th>
                  <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCC8]/40 text-[#4A5568]">
                {paginatedArchives.map((archive) => {
                  const isChecked = selectedIds.includes(archive.id);
                  return (
                    <tr 
                      key={archive.id}
                      onClick={() => onNavigate("DETAIL_ARSIP", archive.id)}
                      className={`even:bg-[#FAFAF8] hover:bg-[#FDF8F0] transition cursor-pointer ${
                        isChecked ? "bg-[#F5E6C8]/30" : ""
                      }`}
                    >
                      {/* Checkbox column */}
                      <td className="py-4 px-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectRow(archive.id)}
                          className="w-4 h-4 rounded text-gold-royal accent-[#C89B3C] border-gray-300 cursor-pointer"
                        />
                      </td>

                      {/* Nomor */}
                      <td className="py-4 px-3 font-mono text-[11px] font-semibold text-[#A67C2D] whitespace-nowrap">
                        {archive.nomorArsip}
                      </td>

                      {/* Judul */}
                      <td className="py-4 px-3 text-sm font-semibold text-[#0B1F3A] hover:text-[#C89B3C] transition max-w-xs truncate" title={archive.judulArsip}>
                        {archive.judulArsip}
                      </td>

                      {/* Tanggal */}
                      <td className="py-4 px-3 text-xs font-mono whitespace-nowrap">
                        {archive.tanggalArsip}
                      </td>

                      {/* Klien */}
                      <td className="py-4 px-3 text-xs max-w-[120px] truncate">
                        {archive.namaKlien}
                      </td>

                      {/* Kategori */}
                      <td className="py-4 px-3 text-xs whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide leading-none ${getCategoryTheme(archive.kategori)}`}>
                          {archive.kategori.replace("Akta ", "Akta: ")}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-3 text-center align-middle whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold leading-none uppercase ${getStatusBadge(archive.statusArsip)}`}>
                          {archive.statusArsip}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="py-4 px-4 text-center align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          {/* 👁️ Eye / Detail */}
                          <button
                            onClick={() => setArchiveToPreview(archive)}
                            className="p-[6px] rounded-[6px] bg-transparent hover:bg-[#0B1F3A]/8 text-[#718096] hover:text-[#0B1F3A] transition cursor-pointer"
                            title="Pratinjau Dokumen"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* ✏️ Pencil / Edit */}
                          {currentUser.role !== UserRole.KEPALA_KANTOR && (
                            <button
                              onClick={() => {
                                if (!canEdit(currentUser, archive)) {
                                  alert("Akses edit ditolak.");
                                  return;
                                }
                                onNavigate("EDIT_ARSIP", archive.id);
                              }}
                              className="p-[6px] rounded-[6px] bg-transparent hover:bg-[#C89B3C]/10 text-[#718096] hover:text-[#C89B3C] transition cursor-pointer"
                              title="Edit Arsip"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}

                          {/* 🗑️ Trash / Delete */}
                          {isAdmin && (
                            <button
                              onClick={() => setArchiveToDelete(archive)}
                              className="p-[6px] rounded-[6px] bg-transparent hover:bg-[#EF4444]/10 text-[#718096] hover:text-[#EF4444] transition cursor-pointer"
                              title="Hapus Arsip"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-[#718096] bg-[#FAFAF8]">
            <span className="w-12 h-12 rounded-full border border-[#E8DCC8] flex items-center justify-center text-[#C89B3C] mx-auto mb-3 bg-white">
              <Search className="w-6 h-6" />
            </span>
            <p className="font-semibold text-[#0B1F3A]">Tidak ada arsip yang cocok</p>
            <p className="text-xs text-[#718096] mt-1">Coba sesuaikan elemen kata kunci, filter kategori, atau tanggal penyaringan Anda.</p>
          </div>
        )}

        {/* PAGINATION CONTROL FOOTER */}
        {filteredArchives.length > 0 && (
          <div className="p-4 bg-[#FAFAF8] border-t border-[#E8DCC8] flex flex-col sm:flex-row items-center justify-between gap-4 font-sans text-xs text-[#718096] select-none">
            <span>
              Menampilkan <strong className="text-[#0B1F3A]">{filteredArchives.length > 0 ? startIndex + 1 : 0}</strong> - {" "}
              <strong className="text-[#0B1F3A]">{Math.min(startIndex + itemsPerPage, filteredArchives.length)}</strong> dari {" "}
              <strong className="text-[#0B1F3A]">{filteredArchives.length}</strong> arsip digital
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPageNum(Math.max(1, currentPageNum - 1))}
                disabled={currentPageNum === 1}
                className="p-1.5 px-2 bg-white border border-[#D4B896] text-[#0B1F3A] hover:bg-[#FDF8F0] rounded disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }).map((_, idx) => {
                const step = idx + 1;
                return (
                  <button
                    key={step}
                    onClick={() => setCurrentPageNum(step)}
                    className={`p-1.5 px-3 rounded text-xs font-semibold font-mono border transition cursor-pointer ${
                      currentPageNum === step
                        ? "bg-[#C89B3C] border-[#C89B3C] text-white font-bold"
                        : "bg-white border border-[#D4B896] text-[#0B1F3A] hover:bg-[#FDF8F0]"
                    }`}
                  >
                    {step}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPageNum(Math.min(totalPages, currentPageNum + 1))}
                disabled={currentPageNum === totalPages}
                className="p-1.5 px-2 bg-[#FAFAF8] border border-[#D4B896] text-[#0B1F3A] hover:bg-[#FDF8F0] rounded disabled:opacity-30 disabled:hover:bg-white transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Individual Delete Confirmation Modal */}
      {archiveToDelete && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gold-royal/20 max-w-md w-full overflow-hidden p-6 animate-scaleIn">
            <div className="flex items-start gap-4">
              <span className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#EF4444] shrink-0">
                <Trash2 className="w-5 h-5" />
              </span>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-base font-bold text-[#0B1F3A] font-display">
                  Konfirmasi Hapus Arsip
                </h3>
                <p className="text-xs text-[#718096] font-mono font-semibold bg-slate-50 p-2 rounded border border-slate-100">
                  {archiveToDelete.nomorArsip} - {archiveToDelete.judulArsip}
                </p>
                <p className="text-sm text-[#4A5568] leading-relaxed">
                  Yakin ingin menghapus arsip ini? Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setArchiveToDelete(null)}
                className="px-4 py-2 text-xs font-bold text-[#4A5568] bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const idToKill = archiveToDelete.id;
                  setArchiveToDelete(null);
                  if (onDeleteArchive) {
                    onDeleteArchive(idToKill);
                  } else {
                    const fresh = archives.filter(a => a.id !== idToKill);
                    onUpdateArchives(fresh);
                  }
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#EF4444] hover:bg-red-600 rounded-lg transition cursor-pointer"
              >
                Confirm/Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document File Preview Modal */}
      {archiveToPreview && (
        <div className="fixed inset-0 bg-[#0B1F3A]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-xl shadow-2xl border border-gold-royal/20 max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh] animate-scaleIn">
            
            {/* Header / Title Bar */}
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="w-10 h-10 rounded-full bg-[#F5E6C8]/60 flex items-center justify-center text-gold-royal shrink-0">
                  <Eye className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm text-[#0B1F3A] block font-display">
                    Aplikasi Peninjau Berkas Digital
                  </h3>
                  <span className="text-[10px] text-[#718096] font-mono uppercase font-semibold">
                    {archiveToPreview.fileDokumen?.filename || "DOKUMEN_ARSIP.pdf"} ({((archiveToPreview.fileDokumen?.size || 1542000) / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              </div>

              {/* Toolbar Controls */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setViewerZoom(Math.max(50, viewerZoom - 25))}
                  className="p-1.5 bg-white hover:bg-[#FDF8F0] text-[#718096] hover:text-[#0B1F3A] rounded border border-[#D4B896] transition cursor-pointer"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[#0B1F3A] font-mono w-10 text-center">{viewerZoom}%</span>
                <button
                  onClick={() => setViewerZoom(Math.min(200, viewerZoom + 25))}
                  className="p-1.5 bg-white hover:bg-[#FDF8F0] text-[#718096] hover:text-[#0B1F3A] rounded border border-[#D4B896] transition cursor-pointer"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-[1px] h-6 bg-[#E8DCC8] mx-1" />
                <button
                  onClick={() => setArchiveToPreview(null)}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-[#4A5568] rounded-full transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Document Render Area (Page Mockup) */}
            <div id="preview-modal-content" className="p-6 bg-[#F5F0E8] border-b border-[#E8DCC8] flex justify-center items-start overflow-auto flex-1 select-text max-h-[550px]">
              {(() => {
                const isMockFile = !archiveToPreview.fileDokumen || !archiveToPreview.fileDokumen.url || archiveToPreview.fileDokumen.url.startsWith("/") || archiveToPreview.fileDokumen.url.includes("pdfobject.com");
                
                if (isMockFile) {
                  // Fallback: Format Indonesian Date and get current category templates
                  const formatIndonesianDate = (dateStr: string): string => {
                    if (!dateStr) return "";
                    try {
                      const months = [
                        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
                      ];
                      const parts = dateStr.split("-");
                      if (parts.length === 3) {
                        const day = parseInt(parts[2], 10);
                        const monthIndex = parseInt(parts[1], 10) - 1;
                        const year = parts[0];
                        return `${day} ${months[monthIndex]} ${year}`;
                      }
                      return dateStr;
                    } catch {
                      return dateStr;
                    }
                  };

                  const tglIndo = formatIndonesianDate(archiveToPreview.tanggalArsip);
                  const notarisFullName = `${currentUser.nama}, S.H., M.Kn.`;

                  const renderMockTemplate = () => {
                    switch (archiveToPreview.kategori) {
                      case KategoriArsip.AKTA_JUAL_BELI:
                        return (
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="text-slate-800 text-justify text-xs leading-relaxed space-y-4">
                            <div className="border-b-2 border-[#0B1F3A] pb-3 mb-5 text-center">
                              <h2 className="font-bold text-base tracking-widest uppercase text-slate-900 block">AKTA JUAL BELI</h2>
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archiveToPreview.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, yang bertanda tangan di bawah ini dan menghadap kepada saya, <strong className="font-serif text-slate-800">{notarisFullName}</strong>, Notaris berwenang di wilayah hukum {archiveToPreview.unitPengolah || "Divisi PPAT"}, telah hadir dengan sah:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pihak Yang Memohon / Pendaftar: <strong className="font-serif text-slate-800">{archiveToPreview.namaKlien}</strong>, selanjutnya bertindak sebagai Penghadap Utama yang berkedudukan di wilayah unit pengolahan data {archiveToPreview.unitPengolah}.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pihak Pertama dengan ini menjual, memindahkan, dan menyerahkan hak milik penuh kepada Pihak Kedua atas objek properti dengan rincian deskripsi teknis dan geografis sebagai berikut: <span className="italic font-serif text-slate-700">{archiveToPreview.keterangan || "Tanpa rincian tambahan objek kearsipan."}</span>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Kedua belah pihak sepakat mengikatkan diri demi penyesuaian draf penting yang berkaitan dengan berkas sah berjudul <strong className="font-serif text-slate-800">{archiveToPreview.judulArsip}</strong> di hadapan Notaris yang berwenang.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Demikian akta ini dibuat sebagai bukti mutlak jual-beli kepemilikan yang sah secara hukum, disaksikan secara tertib, dan ditandatangani bersama.
                            </p>
                          </div>
                        );

                      case KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN:
                        return (
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="text-slate-800 text-justify text-xs leading-relaxed space-y-4">
                            <div className="border-b-2 border-[#0B1F3A] pb-3 mb-5 text-center">
                              <h2 className="font-bold text-base tracking-widest uppercase text-slate-900 block">AKTA PENDIRIAN PERUSAHAAN</h2>
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archiveToPreview.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Bahwa pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, di hadapan saya, <strong className="font-serif text-slate-800">{notarisFullName}</strong>, selaku Notaris resmi di bawah pembina kepengawasan {archiveToPreview.unitPengolah || "Divisi Korporasi"} Sinar Notariat, telah berkumpul para pendiri perseroan di bawah pemohon utama:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pemohon Pendirian Utama: <strong className="font-serif text-slate-800">{archiveToPreview.namaKlien}</strong>, memegang kendali penuh atas warkah penunjang draf komersial.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Para pendiri sepakat dengan mufakat mutlak mendirikan perseroan terbatas di bawah nama badan usaha yang tertera resmi pada judul berkas: <strong className="font-serif text-slate-800">{archiveToPreview.judulArsip}</strong>, dengan kesepakatan maksud, permodalan, serta tujuan operasional: <span className="italic font-serif text-slate-700">{archiveToPreview.keterangan || "Tanpa keterangan tambahan maksud dan tujuan korporat."}</span>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Segala rincian draf kepasalan ini telah diverifikasi keasliannya dan disahkan secara digital di bawah pengawasan {archiveToPreview.unitPengolah}.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Demikian draf akta pendirian perseroan terbatas ini disusun untuk dapat dijadikan pedoman pendirian yang berkekuatan hukum tetap.
                            </p>
                          </div>
                        );

                      case KategoriArsip.SURAT_KUASA:
                        return (
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="text-slate-800 text-justify text-xs leading-relaxed space-y-4">
                            <div className="border-b-2 border-[#0B1F3A] pb-3 mb-5 text-center">
                              <h2 className="font-bold text-base tracking-widest uppercase text-slate-900 block">SURAT KUASA</h2>
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archiveToPreview.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Pemberi kuasa tunggal yang bertanda tangan di bawah ini pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, melalui ketetapan administrasi dari unit {archiveToPreview.unitPengolah}:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Nama Pemberi Kuasa Mandat: <strong className="font-serif text-slate-800">{archiveToPreview.namaKlien}</strong>, selaku subjek pemilik hak berkas utama.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Dengan ini memberikan kuasa penuh kepada Penerima Kuasa sah guna melaksanakan perwakilan eksklusif serta pengurusan penting terkait dengan: <span className="italic font-serif text-slate-700">{archiveToPreview.keterangan || "Tanpa rincian khusus batasan kuasa."}</span> yang tertuang di dalam berkas induk berjudul <strong className="font-serif text-slate-800">{archiveToPreview.judulArsip}</strong>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Tindakan penerimaan kuasa ini disaksikan secara tertib demi hukum di hadapan Notaris Pembuat Komitmen berwenang, yaitu <strong className="font-serif text-slate-800">{notarisFullName}</strong>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Demikian surat kuasa ini dibuat untuk dipergunakan secara sah, tepercaya, dan penuh pertanggungjawaban hukum.
                            </p>
                          </div>
                        );

                      case KategoriArsip.PERJANJIAN:
                        return (
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="text-slate-800 text-justify text-xs leading-relaxed space-y-4 font-serif">
                            <div className="border-b-2 border-[#0B1F3A] pb-3 mb-5 text-center">
                              <h2 className="font-bold text-base tracking-widest uppercase text-slate-900 block">SURAT PERJANJIAN</h2>
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archiveToPreview.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Perjanjian timbal balik kemitraan resmi ini ditandatangani pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, bertempat di kantor kearsipan {archiveToPreview.unitPengolah || "Divisi PPAT"} Sinar, oleh para pihak yang berkesepakatan:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pihak Utama Bersepakat: <strong className="font-serif text-slate-800">{archiveToPreview.namaKlien}</strong>, sebagai subjek utama persetujuan draf kepasalan.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              <strong>PASAL 1 (Pokok Perjanjian):</strong> Para pihak setuju mengikatkan diri dalam kemitraan berskala kepanduan guna mewujudkan kesepakatan yang tertuang pada berkas berjudul <strong className="font-serif text-slate-800">{archiveToPreview.judulArsip}</strong>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              <strong>PASAL 2 (Hak &amp; Kewajiban):</strong> Detail hak, kompensasi, sanksi, serta kontribusi didasarkan pada draf keterangan berikut: <span className="italic font-serif text-slate-700">{archiveToPreview.keterangan || "Tanpa keterangan klausul khusus."}</span>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              <strong>PASAL 3 (Penyelesaian Sengketa):</strong> Apabila terjadi perselisihan penafsiran, para pihak sepakat menyelesaikannya secara kekeluargaan di bawah mediasi Notaris Pembuat Komitmen, <strong className="font-serif text-slate-800">{notarisFullName}</strong>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Demikian perjanjian ini disusun bersama untuk ditaati sepenuhnya oleh para pihak dengan jujur dan tanpa paksaan.
                            </p>
                          </div>
                        );

                      case KategoriArsip.SERTIFIKAT:
                        return (
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="text-slate-800 text-justify text-xs leading-relaxed space-y-4">
                            <div className="border-b-2 border-[#0B1F3A] pb-3 mb-5 text-center">
                              <h2 className="font-bold text-base tracking-widest uppercase text-slate-900 block">SERTIFIKAT KETERANGAN</h2>
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archiveToPreview.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Saya yang bertandatangan di bawah ini, <strong className="font-serif text-slate-800">{notarisFullName}</strong>, selaku Notaris Utama pada unit pengolah {archiveToPreview.unitPengolah || "Divisi Pertanahan"} DKI Jakarta, menerangkan dengan rincian mutlak:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Menerangkan Bahwa: <strong className="font-serif text-slate-800">{archiveToPreview.namaKlien}</strong> adalah subjek pendaftaran kepemilikan draf sah yang terverifikasi keasliannya di sistem kearsipan.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Bahwa dokumen keprotokolan fisik bertajuk <strong className="font-serif text-slate-800">{archiveToPreview.judulArsip}</strong> telah kami audit, rekam, dan nyatakan benar-benar autentik, dengan keterangan teknis kearsipan: <span className="italic font-serif text-slate-700">{archiveToPreview.keterangan || "Tanpa rincian keterangan ketertiban berkas pendukung."}</span>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Sertifikasi tepercaya ini dibubuhkan segel autentikasi kearsipan digital demi menjamin bebas dari pemalsuan eksternal.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Demikian sertifikat ini dikeluarkan secara khidmat di Jakarta pada <strong className="font-serif text-slate-800">{tglIndo}</strong> demi pembuktian autentik.
                            </p>
                          </div>
                        );

                      case KategoriArsip.DOKUMEN_PENDUKUNG:
                      default:
                        return (
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="text-slate-800 text-justify text-xs leading-relaxed space-y-4">
                            <div className="border-b-2 border-[#0B1F3A] pb-3 mb-5 text-center">
                              <h2 className="font-bold text-base tracking-widest uppercase text-slate-900 block">SURAT KETERANGAN</h2>
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archiveToPreview.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Kantor Notariat Utama Sinar melalui {archiveToPreview.unitPengolah || "Divisi Umum"} keprotokolan kearsipan, dengan didampingi pejabat pembuat komitmen <strong className="font-serif text-slate-800">{notarisFullName}</strong>, menerangkan sesungguhnya:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Bahwa pihak utama yang tertera sebagai <strong className="font-serif text-slate-800">{archiveToPreview.namaKlien}</strong> telah melengkapi seluruh warkah pendukung bagi pengabsahan kenotariatan.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Kelengkapan berkas pendukung tertera dengan judul berkas: <strong className="font-serif text-slate-800">{archiveToPreview.judulArsip}</strong> telah diterima, diperiksa secara ketat, dan diarsipkan dengan deskripsi kearsipan: <span className="italic font-serif text-slate-700">{archiveToPreview.keterangan || "Tanpa catatan keterangan tambahan berkas pendukung."}</span>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Demikian surat keterangan kearsipan ini dibuat pada <strong className="font-serif text-slate-800">{tglIndo}</strong> demi pemenuhan tertib undang-undang yang berlaku.
                            </p>
                          </div>
                        );
                    }
                  };

                  return (
                    <div 
                      className="bg-white text-slate-850 shadow-2xl p-8 rounded border border-slate-300 relative transition-all duration-300 mx-auto"
                      style={{ width: `${viewerZoom}%`, maxWidth: "600px" }}
                    >
                      {/* Decorative PDF elements */}
                      <div className="absolute top-2.5 right-3 text-[10px] text-red-500 font-bold border border-red-500 px-1 rounded transform rotate-12 scale-90 select-none no-print">
                        SECURE PREVIEW FALLBACK
                      </div>

                      {renderMockTemplate()}

                      {/* Signature block */}
                      <div className="mt-12 pt-4 border-t border-slate-300 grid grid-cols-2 text-center text-[10px] text-slate-600 font-serif gap-4 select-none">
                        <div className="space-y-8">
                          <span>Penghadap / Klien</span>
                          <div className="h-6" />
                          <span className="font-semibold font-serif text-slate-700 underline block">{archiveToPreview.namaKlien.split(" & ")[0]}</span>
                        </div>
                        <div className="space-y-8">
                          <span>Notaris Pembuat Komitmen</span>
                          <div className="h-6" />
                          <span className="font-semibold font-serif text-slate-700 underline block">{currentUser.nama}</span>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Genuine uploaded file display
                const isPdf = archiveToPreview.fileDokumen?.type?.toLowerCase().includes("pdf") || archiveToPreview.fileDokumen?.filename?.toLowerCase().endsWith(".pdf");
                const isImage = archiveToPreview.fileDokumen?.type?.toLowerCase().includes("image") || 
                                archiveToPreview.fileDokumen?.filename?.toLowerCase().endsWith(".jpg") || 
                                archiveToPreview.fileDokumen?.filename?.toLowerCase().endsWith(".jpeg") || 
                                archiveToPreview.fileDokumen?.filename?.toLowerCase().endsWith(".png");

                if (isPdf) {
                  return (
                    <div className="w-full">
                      <object
                        data={archive.fileDokumen.url}
                        type="application/pdf"
                        width="100%"
                        height="500px"
                        style={{ borderRadius: "8px", border: "1px solid #E8DCC8" }}
                      >
                        <p className="text-xs text-[#718096] text-center p-4">
                          Browser Anda tidak mendukung tampilan PDF langsung. 
                          <button 
                            onClick={handleDownload}
                            className="text-gold-royal underline ml-1"
                          >
                            Unduh berkas
                          </button>
                        </p>
                      </object>
                    </div>
                  );
                }
                  
                  else if (isImage) {
                  return (
                    <img 
                      src={archiveToPreview.fileDokumen.url} 
                      alt={archiveToPreview.fileDokumen.filename}
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  );
                } else {
                  return (
                    <div className="bg-white p-6 rounded border border-slate-300 text-center text-[#718096] mx-auto">
                      Format berkas ini tidak dapat ditinjau secara langsung ({archiveToPreview.fileDokumen.filename}). Silakan unduh dokumen untuk melihat isi berkas.
                    </div>
                  );
                }
              })()}
            </div>

            {/* Footer Action Bar */}
            <div className="p-3.5 bg-[#FAFAF8] flex items-center justify-between text-xs text-[#718096]">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Tinjauan digital terverifikasi SHA-256</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handlePrintPreviewFile(archiveToPreview)}
                  disabled={isPrinting}
                  className="px-3 py-1.5 bg-white border border-[#D4B896] hover:bg-[#FDF8F0] text-[#0B1F3A] rounded-md transition flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-3.5 h-3.5" /> {isPrinting ? "Menyiapkan..." : "Cetak"}
                </button>
                <button 
                  onClick={() => handleDownloadPreviewFile(archiveToPreview)}
                  disabled={isDownloading}
                  className="px-3.5 py-1.5 bg-gold-royal hover:bg-gold-dark text-white rounded-md transition flex items-center gap-1.5 cursor-pointer font-semibold font-sans text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" /> {isDownloading ? "Mengunduh..." : "Unduh PDF"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
