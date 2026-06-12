/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  ChevronLeft, 
  Download, 
  Printer, 
  Edit3, 
  Trash2, 
  Sliders, 
  QrCode, 
  Eye, 
  CheckCircle, 
  History, 
  User as UserIcon, 
  Clock, 
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Archive, KategoriArsip, StatusArsip, User, UserRole } from "../types";

interface ArchiveDetailProps {
  archiveId: string;
  archives: Archive[];
  currentUser: User;
  onNavigate: (page: string, activeId?: string | null) => void;
  onDelete: (id: string) => void;
}

export default function ArchiveDetail({
  archiveId,
  archives,
  currentUser,
  onNavigate,
  onDelete
}: ArchiveDetailProps) {
  
  const archive = archives.find(a => a.id === archiveId);

  // Modal print view state
  const [showPrintLabel, setShowPrintLabel] = useState(false);
  
  // Gated Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Virtual Document Viewer zoom zoom states
  const [viewerZoom, setViewerZoom] = useState(100);

  if (!archive) {
    return (
      <div className="p-8 text-center text-slate-400 bg-navy-card rounded-xl border border-slate-800">
        <span className="text-sm font-semibold">Berkas Arsip Tidak Ditemukan</span>
        <button onClick={() => onNavigate("DAFTAR_ARSIP")} className="block mx-auto mt-4 text-xs text-gold-royal underline">Kembali ke Daftar</button>
      </div>
    );
  }

  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  // Can current user edit this archive?
  // Notaris can edit Akta category archives, Staff can edit what they manage
  const canEdit = currentUser.role === UserRole.ADMIN || 
    (currentUser.role === UserRole.NOTARIS && [KategoriArsip.AKTA_JUAL_BELI, KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN].includes(archive.kategori)) ||
    currentUser.role === UserRole.STAFF; // Staff/Notaris view edit button

  // Status Badge Themes
  const getStatusBadge = (status: StatusArsip) => {
    switch (status) {
      case StatusArsip.AKTIF:
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30";
      case StatusArsip.INAKTIF:
        return "bg-slate-500/10 text-slate-400 border border-slate-700/60";
      case StatusArsip.PERMANEN:
        return "bg-amber-500/10 text-gold-royal border border-gold-royal/30";
      case StatusArsip.MENUNGGU_PEMUSNAHAN:
        return "bg-red-500/10 text-red-400 border border-red-500/30";
    }
  };

  const getCategoryTheme = (cat: KategoriArsip) => {
    switch (cat) {
      case KategoriArsip.AKTA_JUAL_BELI:
        return "text-indigo-400 bg-indigo-950/20 border-indigo-900/40";
      case KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN:
        return "text-violet-400 bg-violet-950/20 border-violet-900/40";
      case KategoriArsip.SURAT_KUASA:
        return "text-sky-400 bg-sky-950/20 border-sky-900/40";
      case KategoriArsip.PERJANJIAN:
        return "text-emerald-400 bg-emerald-950/20 border-emerald-900/40";
      case KategoriArsip.SERTIFIKAT:
        return "text-amber-500 bg-amber-950/20 border-amber-900/40";
      case KategoriArsip.DOKUMEN_PENDUKUNG:
        return "text-slate-300 bg-slate-900/30 border-slate-800";
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = archive.fileDokumen.url;
    link.download = archive.fileDokumen.filename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintTrigger = () => {
    window.print();
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText.trim() === archive.judulArsip.trim()) {
      setDeleteError("");
      setShowDeleteModal(false);
      onDelete(archive.id);
    } else {
      setDeleteError("Ketik judul arsip dengan persis (perhatikan spasi dan huruf kapital).");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. BREADCRUMBS RAIL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] no-print">
        <div className="text-xs text-[#718096] font-medium">
          Beranda &gt; <span className="hover:text-gold-royal cursor-pointer select-none" onClick={() => onNavigate("DAFTAR_ARSIP")}>Daftar Arsip</span> &gt; {" "}
          <strong className="text-gold-royal font-semibold">Rincian Arsip</strong>
        </div>
        <button
          onClick={() => onNavigate("DAFTAR_ARSIP")}
          className="text-xs text-[#718096] hover:text-[#0B1F3A] flex items-center gap-1.5 cursor-pointer font-sans"
        >
          <ChevronLeft className="w-4 h-4 text-[#C89B3C]" /> Kembali ke Daftar
        </button>
      </div>

      {/* 2. ACTIONS TOOLBAR (Print labels, Editing, Gated Delete) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] no-print animate-fadeIn">
        {/* Left indicators */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono font-bold text-gold-dark bg-[#FDF8F0] border border-gold-royal/35 px-3 py-1 rounded">
            ID: {archive.id}
          </span>
          <span className="text-xs text-[#718096] font-mono">Dibuat: {archive.createdAt}</span>
        </div>

        {/* Action button grouping */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Print Label tag */}
          <button
            onClick={() => setShowPrintLabel(true)}
            className="px-3 py-2 text-xs font-bold bg-[#FAFAF8] hover:bg-[#FDF8F0] hover:text-[#C89B3C] text-[#0B1F3A] rounded-lg border border-[#D4B896] hover:border-[#C89B3C] transition cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Cetak Label QR
          </button>

          {/* Download doc */}
          <button
            onClick={handleDownload}
            className="px-3 py-2 text-xs font-bold bg-[#FAFAF8] hover:bg-[#FDF8F0] hover:text-[#C89B3C] text-[#0B1F3A] rounded-lg border border-[#D4B896] hover:border-[#C89B3C] transition cursor-pointer flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Unduh Berkas
          </button>

          {/* Edit btn if authorized */}
          {canEdit && (
            <button
              onClick={() => onNavigate("EDIT_ARSIP", archive.id)}
              className="px-4.5 py-2 text-xs font-bold bg-[#C89B3C] text-white hover:bg-[#A67C2D] rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="w-4 h-4" /> Edit Metadata
            </button>
          )}

          {/* Delete btn - Admin Only */}
          {isAdmin && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-3.5 py-2 text-xs font-bold border border-[#EF4444] text-[#EF4444] bg-white hover:bg-red-50 rounded-lg transition cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Hapus Arsip
            </button>
          )}
        </div>
      </div>

      {/* 3. CORE METADATA DETAILS (Two panels split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: TECHNICAL DETAILS & HISTORY */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main profile document */}
          <div className="bg-white p-6 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#E8DCC8]/65 pb-4">
              <div className="space-y-1.5">
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${getCategoryTheme(archive.kategori)}`}>
                  {archive.kategori}
                </span>
                <h1 className="text-xl font-bold text-[#0B1F3A] tracking-wide font-display mt-2">
                  {archive.judulArsip}
                </h1>
                <p className="font-mono text-sm text-[#A67C2D] font-semibold leading-none">{archive.nomorArsip}</p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
                <span className="text-[10px] text-[#718096] uppercase tracking-wider font-mono font-bold leading-none">STATUS ARSIP</span>
                <span className={`px-3 py-1 rounded text-[11px] font-bold uppercase ${getStatusBadge(archive.statusArsip)}`}>
                  {archive.statusArsip}
                </span>
              </div>
            </div>

            {/* Profile Grid Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-xs">
              <div className="space-y-1 bg-[#FAFAF8] p-3 rounded border border-[#E8DCC8]">
                <span className="text-[#718096] font-mono tracking-wider block">NAMA KLIEN / PIHAK UTAMA :</span>
                <span className="text-[#0B1F3A] font-bold block text-sm">{archive.namaKlien}</span>
              </div>

              <div className="space-y-1 bg-[#FAFAF8] p-3 rounded border border-[#E8DCC8]">
                <span className="text-[#718096] font-mono tracking-wider block">UNIT PENGOLAH :</span>
                <span className="text-[#0B1F3A] font-bold block text-sm">{archive.unitPengolah}</span>
              </div>

              <div className="space-y-1 bg-[#FAFAF8] p-3 rounded border border-[#E8DCC8]">
                <span className="text-[#718096] font-mono tracking-wider block">TANGGAL PENGESAHAN :</span>
                <span className="text-[#0B1F3A] font-bold block text-sm">{archive.tanggalArsip}</span>
              </div>

              <div className="space-y-1 bg-[#FAFAF8] p-3 rounded border border-[#E8DCC8]">
                <span className="text-[#718096] font-mono tracking-wider block">MASA RETENSI HUKUM / TGL RETENSI :</span>
                <span className="text-[#0B1F3A] font-bold block text-sm">
                  {archive.masaRetensi} Tahun ({archive.tanggalRetensi})
                </span>
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-2 pt-2 text-xs">
              <span className="text-[#718096] font-mono uppercase block">DESKRIPSI &amp; RINCIAN LOKASI FISIK :</span>
              <div className="bg-[#FAFAF8] p-3.5 rounded-lg border border-[#E8DCC8] leading-relaxed text-[#4A5568]">
                {archive.keterangan || "Tidak ada catatan rincian tambahan."}
              </div>
            </div>

            {/* Tags badges render */}
            <div className="space-y-2 pt-2">
              <span className="text-[#718096] text-xs font-semibold uppercase tracking-wider block">Label Kearsipan (Tags) :</span>
              <div className="flex flex-wrap gap-2">
                {archive.tags.length > 0 ? (
                  archive.tags.map((tg, idx) => (
                    <span key={idx} className="px-2.5 py-1 text-[10px] font-bold bg-[#F5E6C8] border border-[#C89B3C]/35 rounded-md text-gold-dark font-sans capitalize">
                      #{tg}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#718096] italic">Nihil tags disematkan.</span>
                )}
              </div>
            </div>

          </div>

          {/* VIRTUAL IN-APP DOCUMENT EMBED VIEWER */}
          <div className="bg-white rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] overflow-hidden flex flex-col font-sans">
            <div className="p-4 bg-[#FAFAF8] border-b border-[#E8DCC8] flex items-center justify-between gap-4 font-sans">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-gold-royal" />
                <div>
                  <span className="font-bold text-sm text-[#0B1F3A] block">Aplikasi Peninjau Berkas</span>
                  <span className="text-[10px] text-[#718096] font-mono uppercase">{archive.fileDokumen.filename}</span>
                </div>
              </div>

              {/* Toolbar view */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewerZoom(Math.max(50, viewerZoom - 25))}
                  className="p-1.5 bg-white hover:bg-[#FDF8F0] text-[#718096] hover:text-[#0B1F3A] rounded border border-[#D4B896] transition"
                  title="Perkecil"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-bold text-[#0B1F3A] font-mono w-10 text-center">{viewerZoom}%</span>
                <button
                  onClick={() => setViewerZoom(Math.min(200, viewerZoom + 25))}
                  className="p-1.5 bg-white hover:bg-[#FDF8F0] text-[#718096] hover:text-[#0B1F3A] rounded border border-[#D4B896] transition"
                  title="Perbesar"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embbed Render Area */}
            <div className="p-4 bg-[#F5F0E8] border-2 border-[#E8DCC8] flex justify-center items-start overflow-auto max-h-[550px] min-h-[300px]">
              {(() => {
                const isMockFile = !archive.fileDokumen || !archive.fileDokumen.url || archive.fileDokumen.url.startsWith("/") || archive.fileDokumen.url.includes("pdfobject.com");
                
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

                  const tglIndo = formatIndonesianDate(archive.tanggalArsip);
                  const notarisFullName = `${currentUser.nama}, S.H., M.Kn.`;

                  const renderMockTemplate = () => {
                    switch (archive.kategori) {
                      case KategoriArsip.AKTA_JUAL_BELI:
                        return (
                          <div style={{ fontFamily: "Georgia, 'Times New Roman', serif" }} className="text-slate-800 text-justify text-xs leading-relaxed space-y-4">
                            <div className="border-b-2 border-[#0B1F3A] pb-3 mb-5 text-center">
                              <h2 className="font-bold text-base tracking-widest uppercase text-slate-900 block">AKTA JUAL BELI</h2>
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archive.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, yang bertanda tangan di bawah ini dan menghadap kepada saya, <strong className="font-serif text-slate-800">{notarisFullName}</strong>, Notaris berwenang di wilayah hukum {archive.unitPengolah || "Divisi PPAT"}, telah hadir dengan sah:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pihak Yang Memohon / Pendaftar: <strong className="font-serif text-slate-800">{archive.namaKlien}</strong>, selanjutnya bertindak sebagai Penghadap Utama yang berkedudukan di wilayah unit pengolahan data {archive.unitPengolah}.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pihak Pertama dengan ini menjual, memindahkan, dan menyerahkan hak milik penuh kepada Pihak Kedua atas objek properti dengan rincian deskripsi teknis dan geografis sebagai berikut: <span className="italic font-serif text-slate-700">{archive.keterangan || "Tanpa rincian tambahan objek kearsipan."}</span>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Kedua belah pihak sepakat mengikatkan diri demi penyesuaian draf penting yang berkaitan dengan berkas sah berjudul <strong className="font-serif text-slate-800">{archive.judulArsip}</strong> di hadapan Notaris yang berwenang.
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
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archive.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Bahwa pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, di hadapan saya, <strong className="font-serif text-slate-800">{notarisFullName}</strong>, selaku Notaris resmi di bawah pembina kepengawasan {archive.unitPengolah || "Divisi Korporasi"} Sinar Notariat, telah berkumpul para pendiri perseroan di bawah pemohon utama:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pemohon Pendirian Utama: <strong className="font-serif text-slate-800">{archive.namaKlien}</strong>, memegang kendali penuh atas warkah penunjang draf komersial.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Para pendiri sepakat dengan mufakat mutlak mendirikan perseroan terbatas di bawah nama badan usaha yang tertera resmi pada judul berkas: <strong className="font-serif text-slate-800">{archive.judulArsip}</strong>, dengan kesepakatan maksud, permodalan, serta tujuan operasional: <span className="italic font-serif text-slate-700">{archive.keterangan || "Tanpa keterangan tambahan maksud dan tujuan korporat."}</span>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Segala rincian draf kepasalan ini telah diverifikasi keasliannya dan disahkan secara digital di bawah pengawasan {archive.unitPengolah}.
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
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archive.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Pemberi kuasa tunggal yang bertanda tangan di bawah ini pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, melalui ketetapan administrasi dari unit {archive.unitPengolah}:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Nama Pemberi Kuasa Mandat: <strong className="font-serif text-slate-800">{archive.namaKlien}</strong>, selaku subjek pemilik hak berkas utama.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Dengan ini memberikan kuasa penuh kepada Penerima Kuasa sah guna melaksanakan perwakilan eksklusif serta pengurusan penting terkait dengan: <span className="italic font-serif text-slate-700">{archive.keterangan || "Tanpa rincian khusus batasan kuasa."}</span> yang tertuang di dalam berkas induk berjudul <strong className="font-serif text-slate-800">{archive.judulArsip}</strong>.
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
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archive.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Perjanjian timbal balik kemitraan resmi ini ditandatangani pada hari ini, <strong className="font-serif text-slate-800">{tglIndo}</strong>, bertempat di kantor kearsipan {archive.unitPengolah || "Divisi PPAT"} Sinar, oleh para pihak yang berkesepakatan:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Pihak Utama Bersepakat: <strong className="font-serif text-slate-800">{archive.namaKlien}</strong>, sebagai subjek utama persetujuan draf kepasalan.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              <strong>PASAL 1 (Pokok Perjanjian):</strong> Para pihak setuju mengikatkan diri dalam kemitraan berskala kepanduan guna mewujudkan kesepakatan yang tertuang pada berkas berjudul <strong className="font-serif text-slate-800">{archive.judulArsip}</strong>.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              <strong>PASAL 2 (Hak &amp; Kewajiban):</strong> Detail hak, kompensasi, sanksi, serta kontribusi didasarkan pada draf keterangan berikut: <span className="italic font-serif text-slate-700">{archive.keterangan || "Tanpa keterangan klausul khusus."}</span>.
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
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archive.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Saya yang bertandatangan di bawah ini, <strong className="font-serif text-slate-800">{notarisFullName}</strong>, selaku Notaris Utama pada unit pengolah {archive.unitPengolah || "Divisi Pertanahan"} DKI Jakarta, menerangkan dengan rincian mutlak:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Menerangkan Bahwa: <strong className="font-serif text-slate-800">{archive.namaKlien}</strong> adalah subjek pendaftaran kepemilikan draf sah yang terverifikasi keasliannya di sistem kearsipan.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Bahwa dokumen keprotokolan fisik bertajuk <strong className="font-serif text-slate-800">{archive.judulArsip}</strong> telah kami audit, rekam, dan nyatakan benar-benar autentik, dengan keterangan teknis kearsipan: <span className="italic font-serif text-slate-700">{archive.keterangan || "Tanpa rincian keterangan ketertiban berkas pendukung."}</span>.
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
                              <p className="text-[10px] font-mono font-semibold text-slate-500 uppercase mt-1">Nomor: {archive.nomorArsip}</p>
                            </div>
                            <p className="indent-8 font-serif text-slate-700">
                              Kantor Notariat Utama Sinar melalui {archive.unitPengolah || "Divisi Umum"} keprotokolan kearsipan, dengan didampingi pejabat pembuat komitmen <strong className="font-serif text-slate-800">{notarisFullName}</strong>, menerangkan sesungguhnya:
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Bahwa pihak utama yang tertera sebagai <strong className="font-serif text-slate-800">{archive.namaKlien}</strong> telah melengkapi seluruh warkah pendukung bagi pengabsahan kenotariatan.
                            </p>
                            <p className="indent-8 font-serif text-slate-700">
                              Kelengkapan berkas pendukung tertera dengan judul berkas: <strong className="font-serif text-slate-800">{archive.judulArsip}</strong> telah diterima, diperiksa secara ketat, dan diarsipkan dengan deskripsi kearsipan: <span className="italic font-serif text-slate-700">{archive.keterangan || "Tanpa catatan keterangan tambahan berkas pendukung."}</span>.
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
                      style={{ width: `${viewerZoom}%`, maxWidth: "750px" }}
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
                          <span className="font-semibold font-serif text-slate-700 underline block">{archive.namaKlien.split(" & ")[0]}</span>
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
                const isPdf = archive.fileDokumen?.type?.toLowerCase().includes("pdf") || archive.fileDokumen?.filename?.toLowerCase().endsWith(".pdf");
                const isImage = archive.fileDokumen?.type?.toLowerCase().includes("image") || 
                                archive.fileDokumen?.filename?.toLowerCase().endsWith(".jpg") || 
                                archive.fileDokumen?.filename?.toLowerCase().endsWith(".jpeg") || 
                                archive.fileDokumen?.filename?.toLowerCase().endsWith(".png");

                if (isPdf) {
                  return (
                    <div className="w-full text-center space-y-3">
                    <p className="text-xs text-[#718096]">PDF tidak dapat ditampilkan langsung. Klik tombol di bawah untuk membuka.</p>
                    <a 
                      href={archive.fileDokumen.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-[#C89B3C] text-white text-xs font-bold rounded-lg hover:bg-[#A67C2D] transition"
      >
        Buka Dokumen PDF
      </a>
    </div>
  );
}
                else if (isImage) {
                  return (
                    <img 
                      src={archive.fileDokumen.url} 
                      alt={archive.fileDokumen.filename}
                      style={{ maxWidth: "100%", borderRadius: "8px" }}
                    />
                  );
                } else {
                  return (
                    <div className="bg-white p-6 rounded border border-slate-300 text-center text-[#718096]">
                      Format berkas ini tidak dapat ditinjau secara langsung ({archive.fileDokumen.filename}). Silakan unduh dokumen untuk melihat isi berkas.
                    </div>
                  );
                }
              })()}
            </div>

            <div className="p-3 bg-[#FAFAF8] border-t border-[#E8DCC8] flex items-center justify-between text-xs text-[#718096]">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-emerald-500" /> Tinjauan digital terverifikasi SHA-256</span>
              <button onClick={handleDownload} className="text-gold-dark hover:underline flex items-center gap-1 cursor-pointer">
                <ExternalLink className="w-3.5 h-3.5" /> Buka Tab Baru
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: QR CODES & DOCUMENT VERSIONS */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECURE QR CODE GENERATED AREA */}
          <div className="bg-white p-6 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] text-center space-y-4">
            <div className="text-left border-b border-[#E8DCC8] pb-2 mb-2 flex items-center gap-1.5">
              <QrCode className="w-4.5 h-4.5 text-[#C89B3C]" />
              <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-widest block font-sans">
                Kode QR Arsip Notaris
              </h4>
            </div>

            {/* QRCode Canvas Render */}
            <div className="bg-[#FAFAF8] p-4 rounded-lg inline-block shadow-inner border border-[#E8DCC8] animate-pulse">
              <QRCodeSVG 
                value={archive.nomorArsip} 
                size={140}
                bgColor="#FAFAF8"
                fgColor="#0B1F3A"
                includeMargin={false}
              />
            </div>

            <p className="text-[11px] text-[#718096] leading-relaxed text-justify px-2 leading-tight">
              Gunakan perangkat seluler untuk memindai Kode QR guna menelusuri draf kepasalan fisik secara instan di sistem berkas lemari fisik SiNAR.
            </p>
          </div>

          {/* DOCUMENT VERSION HISTORY RAIL */}
          <div className="bg-white p-6 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8DCC8] pb-2">
              <div className="flex items-center gap-1.5 font-sans">
                <History className="w-4.5 h-4.5 text-[#C89B3C]" />
                <h4 className="text-xs font-bold text-[#0B1F3A] uppercase tracking-widest block">
                  Riwayat Versi Berkas
                </h4>
              </div>
              <span className="text-[10px] font-mono bg-[#FAFAF8] border border-[#E8DCC8] text-[#C89B3C] font-semibold px-2 py-0.5 rounded">
                v{archive.versiDokumen.length || 1} aktif
              </span>
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {archive.versiDokumen.length > 0 ? (
                archive.versiDokumen.map((ver, idx) => (
                  <div key={idx} className="flex gap-2.5 p-2 bg-[#FAFAF8] border border-[#E8DCC8] rounded text-xs text-[#0B1F3A] relative">
                    <span className="absolute top-2 right-2 text-[9px] text-[#A67C2D] font-bold bg-[#F5E6C8] px-1.5 py-0.5 rounded border border-[#C89B3C]/10 font-mono">
                      v{ver.versi}
                    </span>

                    <div className="space-y-1 w-full pr-10">
                      <span className="font-semibold text-[#0B1F3A] block select-text truncate">{ver.filename}</span>
                      <p className="text-[10px] text-[#718096] leading-tight italic">{ver.catatan}</p>
                      
                      <div className="flex items-center justify-between gap-1 text-[9px] text-[#718096] font-mono pt-1.5 border-t border-[#E8DCC8]/65">
                        <span className="flex items-center gap-0.5"><UserIcon className="w-2.5 h-2.5 text-[#C89B3C]" /> usr: {ver.uploadedBy === "usr-01" ? "Admin" : ver.uploadedBy === "usr-03" ? "Notaris" : "Staff"}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {ver.uploadedAt.split(" ")[0]}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#718096] italic">Belum ada riwayat revisi berkas.</div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* --- PRINTABLE PHYSICAL NOTARY LABEL (Modal printable layout) --- */}
      {showPrintLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-bg/85 backdrop-blur-sm no-print">
          <div className="bg-white text-navy-bg w-full max-w-sm rounded-lg p-6 border-2 border-gold-royal relative">
            <h3 className="text-sm font-bold border-b border-slate-300 pb-2 mb-4 uppercase tracking-widest text-slate-500">Label Tag Arsip Fisik SiNAR</h3>
            
            {/* Tag Printable Layout Area */}
            <div id="physical-printable-tag" className="border-2 border-slate-900 p-4 rounded bg-white text-slate-900 font-sans space-y-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-slate-400 pb-2 mb-2 text-slate-900">
                <span className="text-[10px] font-bold tracking-widest uppercase font-sans">notariat utama sinar</span>
                <span className="text-[9px] font-mono bg-slate-200 px-1 rounded block">CODE: {archive.id}</span>
              </div>

              <div className="flex gap-3">
                <div className="bg-slate-100 p-1 rounded inline-block border border-slate-300">
                  <QRCodeSVG 
                    value={archive.nomorArsip} 
                    size={80}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>
                <div className="space-y-1 font-sans flex-1 text-slate-900 leading-tight">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider font-semibold">Nomor Arsip:</span>
                  <span className="text-[11px] font-bold font-mono tracking-tight block text-slate-900">{archive.nomorArsip}</span>
                  
                  <span className="text-[9px] font-mono text-slate-500 uppercase block tracking-wider font-semibold mt-1.5">Judul Akta:</span>
                  <span className="text-xs font-bold leading-none block truncate max-w-[170px] text-slate-900">{archive.judulArsip}</span>
                  
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 font-sans">
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold uppercase block">Kategori</span>
                      <span className="text-[9px] font-bold block italic truncate capitalize">{archive.kategori}</span>
                    </div>
                    <div>
                      <span className="text-[7px] text-slate-500 font-bold uppercase block">Tanggal</span>
                      <span className="text-[9px] font-bold block font-mono">{archive.tanggalArsip}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-[7px] text-slate-500 uppercase font-mono font-bold leading-none">
                <span>sistem pengarsipan terstruktur</span>
                <span>tgl retensi: {archive.tanggalRetensi}</span>
              </div>
            </div>

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => setShowPrintLabel(false)}
                className="flex-1 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold rounded cursor-pointer"
              >
                Tutup
              </button>
              <button
                onClick={handlePrintTrigger}
                className="flex-1 px-3 py-2 text-xs bg-gold-royal text-navy-bg hover:bg-gold-dark hover:text-white font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Cetak Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- GATED DELETE SECURITY DIALOG (Admin Gated Modal) --- */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-md no-print">
          <div className="w-full max-w-lg bg-white border-2 border-red-500 rounded-xl p-6 shadow-2xl relative overflow-hidden font-sans">
            {/* Red top bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" />

            <div className="flex items-start gap-3.5 mt-2">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full border border-red-500/20 shrink-0">
                <ShieldAlert className="w-8 h-8 animate-pulse" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold font-display text-[#0B1F3A] tracking-wide">
                  Konfirmasi Penghapusan Permanen
                </h3>
                <p className="text-xs text-[#4A5568] mt-1 leading-relaxed">
                  Tindakan ini sangat sensitif dan beresiko melanggar undang-undang kearsipan notarisan jika tidak dilandasi dokumen kepasalan yang sah. Seluruh berkas digital, metadata, dan histori versi akan dihapus selamanya dari SiNAR.
                </p>
              </div>
            </div>

            {/* Code confirm form */}
            <form onSubmit={handleConfirmDelete} className="mt-5 space-y-4">
              <div className="p-3 bg-red-50/50 border border-red-100 rounded text-xs select-none">
                <span className="text-[#718096] block uppercase font-mono tracking-wider font-bold mb-1">Judul Arsip yang Harus Diketik :</span>
                <strong className="text-red-600 select-all block break-all">{archive.judulArsip}</strong>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-[#4A5568] uppercase tracking-widest block">Ketik Ulang Judul Arsip Sesuai Profil *</label>
                <input
                  type="text"
                  required
                  placeholder="Ketik judul arsip kearsipan di atas..."
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-[#FAFAF8] border border-[#E8DCC8] focus:border-red-500 focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A]"
                />
                {deleteError && <p className="text-[10px] text-red-500 italic mt-1">{deleteError}</p>}
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  className="flex-1 px-3 py-2.5 bg-white border border-[#E8DCC8] hover:bg-[#FAFAF8] text-[#4A5568] font-semibold rounded-lg text-xs cursor-pointer text-center"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs transition cursor-pointer text-center"
                >
                  Ya, Hapus Permanen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
