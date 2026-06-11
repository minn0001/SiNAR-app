/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://mdcoxcwtgveczzvbjwzx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kY294Y3d0Z3ZlY3p6dmJqd3p4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDE4MTQsImV4cCI6MjA5NjcxNzgxNH0.CsfMpWulQPrizMRyzZVleSC17nIHtZVO2Ru_8H7kQgs'
);
import { 
  UploadCloud, 
  Trash, 
  Save, 
  X, 
  CheckCircle,
  Tag,
  Plus,
  HelpCircle,
  AlertCircle,
  FileText,
  History
} from "lucide-react";
import { Archive, KategoriArsip, StatusArsip, User, DocumentVersion } from "../types";

interface ArchiveAddEditProps {
  mode: "add" | "edit";
  archives: Archive[];
  currentUser: User;
  onNavigate: (page: string, activeId?: string | null) => void;
  onSave: (archive: Archive) => void;
  activeArchiveId?: string | null;
}

export default function ArchiveAddEdit({
  mode,
  archives,
  currentUser,
  onNavigate,
  onSave,
  activeArchiveId
}: ArchiveAddEditProps) {
  
  // Find current archive if editing
  const existingArchive = mode === "edit" && activeArchiveId 
    ? archives.find(a => a.id === activeArchiveId) 
    : null;

  // Form states
  const [judulArsip, setJudulArsip] = useState("");
  const [nomorArsip, setNomorArsip] = useState("");
  const [tanggalArsip, setTanggalArsip] = useState(new Date().toISOString().split("T")[0]);
  const [kategori, setKategori] = useState<KategoriArsip>(KategoriArsip.AKTA_JUAL_BELI);
  const [statusArsip, setStatusArsip] = useState<StatusArsip>(StatusArsip.AKTIF);
  const [masaRetensi, setMasaRetensi] = useState<number>(30); // Default for AJB (Akta)
  const [namaKlien, setNamaKlien] = useState("");
  const [unitPengolah, setUnitPengolah] = useState("Divisi PPAT");
  const [keterangan, setKeterangan] = useState("");
  
  // Tag fields
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // File Upload states (mocked with realistic metadata)
  const [uploadedFile, setUploadedFile] = useState<{
    filename: string;
    size: number;
    url: string;
    uploadedAt: string;
    uploadedBy: string;
    type?: string;
  } | null>(null);

  const [dragOver, setDragOver] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [versionNote, setVersionNote] = useState("Unggah revisi atau perbaikan draf penyesuaian");

  // Load existing data if editing
  useEffect(() => {
    if (mode === "edit" && existingArchive) {
      setJudulArsip(existingArchive.judulArsip);
      setNomorArsip(existingArchive.nomorArsip);
      setTanggalArsip(existingArchive.tanggalArsip);
      setKategori(existingArchive.kategori);
      setStatusArsip(existingArchive.statusArsip);
      setMasaRetensi(existingArchive.masaRetensi);
      setNamaKlien(existingArchive.namaKlien);
      setUnitPengolah(existingArchive.unitPengolah);
      setKeterangan(existingArchive.keterangan);
      setTags(existingArchive.tags);
      setUploadedFile({
        filename: existingArchive.fileDokumen.filename,
        size: existingArchive.fileDokumen.size,
        url: existingArchive.fileDokumen.url,
        uploadedAt: existingArchive.fileDokumen.uploadedAt,
        uploadedBy: existingArchive.fileDokumen.uploadedBy,
        type: existingArchive.fileDokumen.type || (existingArchive.fileDokumen.filename.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg")
      });
    } else {
      // Clear forms for fresh ADD mode
      setJudulArsip("");
      setTanggalArsip(new Date().toISOString().split("T")[0]);
      setKategori(KategoriArsip.AKTA_JUAL_BELI);
      setStatusArsip(StatusArsip.AKTIF);
      setMasaRetensi(10); // Standard starting AJB
      setNamaKlien("");
      setUnitPengolah("Divisi PPAT");
      setKeterangan("");
      setTags([]);
      setUploadedFile(null);
    }
    setFormErrors({});
  }, [mode, existingArchive]);

  // Map Category to standard retention periods (Autofill trigger)
  const updateDefaultRetention = (selectedCat: KategoriArsip) => {
    switch (selectedCat) {
      case KategoriArsip.AKTA_JUAL_BELI:
      case KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN:
        setMasaRetensi(30);
        break;
      case KategoriArsip.SURAT_KUASA:
      case KategoriArsip.PERJANJIAN:
        setMasaRetensi(10);
        break;
      case KategoriArsip.SERTIFIKAT:
        setMasaRetensi(99); // Permanen
        setStatusArsip(StatusArsip.PERMANEN);
        break;
      case KategoriArsip.DOKUMEN_PENDUKUNG:
        setMasaRetensi(5);
        break;
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as KategoriArsip;
    setKategori(val);
    updateDefaultRetention(val);
  };

  // Roman Numeral generator helper for Archive Numbers
  const getRomanMonth = (dateStr: string): string => {
    try {
      const date = new Date(dateStr);
      const romanMonths = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
      return romanMonths[date.getMonth()] || "VI";
    } catch {
      return "VI";
    }
  };

  // Auto-generate Archive Number based on Format
  useEffect(() => {
    if (mode === "add" && tanggalArsip && kategori) {
      const year = tanggalArsip.split("-")[0] || "2026";
      const romanMonth = getRomanMonth(tanggalArsip);
      
      let categoryCode = "DOK";
      if (kategori === KategoriArsip.AKTA_JUAL_BELI) categoryCode = "AKTA-AJB";
      else if (kategori === KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN) categoryCode = "AKTA-APP";
      else if (kategori === KategoriArsip.SURAT_KUASA) categoryCode = "SK";
      else if (kategori === KategoriArsip.PERJANJIAN) categoryCode = "PERJ";
      else if (kategori === KategoriArsip.SERTIFIKAT) categoryCode = "SERT-XLL";

      // Sequential increment simulation
      const countOfCategory = archives.filter(a => a.kategori === kategori).length + 1;
      const serial = String(countOfCategory).padStart(2, "0");

      setNomorArsip(`No. ${serial}/${categoryCode}/${romanMonth}/${year}`);
    }
  }, [tanggalArsip, kategori, mode, archives.length]);

  // TAG OPERATIONS
  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, idx) => idx !== index));
  };

  // HANDLE MOCK FILE UPLOAD
  const handleFileSelect = async (targetFiles: FileList | null) => {
    if (!targetFiles || targetFiles.length === 0) return;
    const file = targetFiles[0];

    // Validation checks
    const ext = file.name.split(".").pop()?.toLowerCase();
    const sizeMB = file.size / (1024 * 1024);

    if (ext !== "pdf" && ext !== "jpg" && ext !== "jpeg") {
      setFormErrors({ ...formErrors, file: "Koreksi format file. Sistem hanya menerima file berekstensi PDF atau JPG." });
      return;
    }

    if (sizeMB > 10) {
      setFormErrors({ ...formErrors, file: `Ukuran file melebihi kapasitas. Maksimal ukuran file 10MB (file Anda: ${sizeMB.toFixed(1)}MB).` });
      return;
    }

// Upload to Supabase Storage
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('dokumen-arsip')
      .upload(fileName, file);
    
    if (error) {
      setFormErrors({ ...formErrors, file: "Gagal mengupload file. Coba lagi." });
      return;
    }

    const { data: urlData } = supabase.storage
      .from('dokumen-arsip')
      .getPublicUrl(fileName);

    setUploadedFile({
      filename: file.name,
      size: file.size,
      url: urlData.publicUrl,
      uploadedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      uploadedBy: currentUser.id,
      type: file.type || (ext === "pdf" ? "application/pdf" : "image/jpeg")
    });
    
    // Clear error
    const errorsCopy = { ...formErrors };
    delete errorsCopy.file;
    setFormErrors(errorsCopy);
  };

  // Drag and drop listeners
  const onDragover = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragleave = () => {
    setDragOver(false);
  };

  const onDropfile = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  // VALIDATE & SUBMIT FORM
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!judulArsip.trim()) errors.judul = "Judul arsip wajib diisi.";
    if (!nomorArsip.trim()) errors.nomor = "Nomor urut arsip wajib diisi.";
    if (!tanggalArsip) errors.tanggal = "Pilih tanggal pengesahan arsip.";
    if (!uploadedFile) errors.file = "Unggah berkas dokumen utama (PDF/JPG) berkas.";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // scroll to error banner
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Calculate dynamic retention expiry date: tanggalArsip + masaRetensi (in years)
    let tanggalRetensi = "";
    try {
      const docDate = new Date(tanggalArsip);
      docDate.setFullYear(docDate.getFullYear() + masaRetensi);
      tanggalRetensi = docDate.toISOString().split("T")[0];
    } catch {
      tanggalRetensi = "2036-06-08"; // fallback
    }

    // Version Control Integration
    let mergedVersions: DocumentVersion[] = [];
    if (mode === "edit" && existingArchive) {
      
      // If a new file is uploaded or even if meta is edited, check if document details changed
      const hasNewFile = uploadedFile?.filename !== existingArchive.fileDokumen.filename;

      if (hasNewFile) {
        // Record the previous version from existing fileDokumen state
        const oldVersionRecord: DocumentVersion = {
          versi: existingArchive.versiDokumen.length > 0 ? existingArchive.versiDokumen[0].versi : 1,
          url: existingArchive.fileDokumen.url,
          filename: existingArchive.fileDokumen.filename,
          uploadedAt: existingArchive.fileDokumen.uploadedAt,
          uploadedBy: existingArchive.fileDokumen.uploadedBy,
          catatan: versionNote || "Dokumen di-reparasi oleh operator system."
        };
        mergedVersions = [oldVersionRecord, ...existingArchive.versiDokumen];
      } else {
        mergedVersions = [...existingArchive.versiDokumen];
      }
    } else {
      // Add Mode standard: version 1 in history
      const initialVersion: DocumentVersion = {
        versi: 1,
        url: uploadedFile!.url,
        filename: uploadedFile!.filename,
        uploadedAt: uploadedFile!.uploadedAt,
        uploadedBy: uploadedFile!.uploadedBy,
        catatan: "Registrasi inisial pada SiNAR"
      };
      mergedVersions = [initialVersion];
    }

    const payload: Archive = {
      id: mode === "edit" && existingArchive ? existingArchive.id : `arc-gen-${Date.now()}`,
      nomorArsip: nomorArsip.trim(),
      judulArsip: judulArsip.trim(),
      tanggalArsip,
      kategori,
      statusArsip,
      masaRetensi,
      tanggalRetensi,
      tags,
      namaKlien: namaKlien.trim() || "Nihil / Umum",
      unitPengolah,
      keterangan: keterangan.trim() || "Tanpa rincian tambahan.",
      fileDokumen: {
        url: uploadedFile!.url,
        filename: uploadedFile!.filename,
        size: uploadedFile!.size,
        uploadedAt: uploadedFile!.uploadedAt,
        uploadedBy: uploadedFile!.uploadedBy,
        type: uploadedFile!.type || (uploadedFile!.filename.toLowerCase().endsWith(".pdf") ? "application/pdf" : "image/jpeg")
      },
      versiDokumen: mergedVersions,
      qrCode: nomorArsip.trim(),
      createdBy: mode === "edit" && existingArchive ? existingArchive.createdBy : currentUser.id,
      createdAt: mode === "edit" && existingArchive ? existingArchive.createdAt : new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedBy: currentUser.id,
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    onSave(payload);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BREADCRUMB */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)]">
        <div className="text-xs text-[#718096] font-medium">
          Beranda &gt; <span className="hover:text-gold-royal cursor-pointer select-none" onClick={() => onNavigate("DAFTAR_ARSIP")}>Daftar Arsip</span> &gt; {" "}
          <strong className="text-gold-royal font-semibold">{mode === "edit" ? "Edit Arsip" : "Tambah Arsip"}</strong>
        </div>
        <button
          onClick={() => onNavigate("DAFTAR_ARSIP")}
          className="text-xs text-[#718096] hover:text-[#0B1F3A] flex items-center gap-1 cursor-pointer font-sans"
        >
          <X className="w-4 h-4" /> Batal &amp; Kembali
        </button>
      </div>

      {Object.keys(formErrors).length > 0 && (
        <div className="p-4 bg-red-55 border-l-4 border-red-500 text-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-550 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="font-semibold text-red-800 block font-heading">Formulir Gagal Dikirim</strong>
            <p className="leading-relaxed">Silakan mengisi seluruh kolom wajib bertanda bintang merah (*) dan unggah berkas draf penyesuaian dengan benar sebelum melakukan proses penyimpanan.</p>
          </div>
        </div>
      )}

      {/* FORM WRAPPER */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="archive-add-edit-form">
        
        {/* LEFT COLUMN: PRIMARY INPUTS */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-5 animate-fadeIn">
          <h3 className="text-base font-semibold font-display text-[#0B1F3A] border-b border-[#E8DCC8]/65 pb-3 flex items-center gap-1.5 uppercase tracking-wide">
            <FileText className="w-5 h-5 text-[#C89B3C]" /> Informasi Utama Arsip
          </h3>

          <div className="space-y-4">
            {/* Judul */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                Judul Arsip / Akta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="cth: Akta Jual Beli Pendirian Cabang Ruko PT Harapan Bangsa"
                value={judulArsip}
                onChange={(e) => setJudulArsip(e.target.value)}
                className={`w-full bg-white border ${
                  formErrors.judul ? "border-red-505 focus:ring-red-200" : "border-[#D4B896] focus:border-gold-royal"
                } focus:outline-none rounded-lg p-3 text-sm text-[#0B1F3A] placeholder-[#A0AEC0] transition`}
              />
              {formErrors.judul && <p className="text-[10px] text-red-500 italic">{formErrors.judul}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nomor Arsip */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                  Nomor Arsip <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="No. 00/KATE/MON/YEAR"
                  value={nomorArsip}
                  onChange={(e) => setNomorArsip(e.target.value)}
                  className={`w-full bg-white border ${
                    formErrors.nomor ? "border-red-505" : "border-[#D4B896] focus:border-gold-royal"
                  } font-mono text-xs focus:outline-none rounded-lg p-3 text-[#0B1F3A] transition`}
                />
                <span className="text-[9px] text-[#718096] leading-none">Auto-generasi berdasar format. Dapat disunting.</span>
              </div>

              {/* Tanggal */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                  Tanggal Pengesahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={tanggalArsip}
                  onChange={(e) => setTanggalArsip(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kategori */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                  Kategori Dokumen <span className="text-red-500">*</span>
                </label>
                <select
                  value={kategori}
                  onChange={handleCategoryChange}
                  className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A] cursor-pointer"
                >
                  {Object.values(KategoriArsip).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                  Status Arsip <span className="text-red-500">*</span>
                </label>
                <select
                  value={statusArsip}
                  onChange={(e) => setStatusArsip(e.target.value as StatusArsip)}
                  className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A] cursor-pointer"
                >
                  {Object.values(StatusArsip).map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nama Klien & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                  Nama Klien / Pihak Utama
                </label>
                <input
                  type="text"
                  placeholder="Nama klien atau perseroan"
                  value={namaKlien}
                  onChange={(e) => setNamaKlien(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                  Unit Pengolah Arsip
                </label>
                <select
                  value={unitPengolah}
                  onChange={(e) => setUnitPengolah(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A] cursor-pointer"
                >
                  <option value="Divisi PPAT">Divisi PPAT</option>
                  <option value="Divisi Korporasi">Divisi Korporasi</option>
                  <option value="Divisi Pertanahan">Divisi Pertanahan</option>
                  <option value="Divisi Umum">Divisi Umum</option>
                </select>
              </div>
            </div>

            {/* Keterangan */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                Keterangan Dokumen
              </label>
              <textarea
                rows={3}
                placeholder="Rincian deskripsi, letak fisik lemari / rak, catatan khusus, dll."
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A] placeholder-[#A0AEC0]"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: METADATA, VERSION & UPLOAD */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* SECURE FILE UPLOAD BOX */}
          <div className="bg-white p-6 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4">
            <h4 className="text-xs font-bold text-[#718096] uppercase tracking-widest block">
              File Berkas Digital <span className="text-red-500">*</span>
            </h4>

            {/* Drop Container Area */}
            {!uploadedFile ? (
              <div 
                onDragOver={onDragover}
                onDragLeave={onDragleave}
                onDrop={onDropfile}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                  dragOver
                    ? "bg-[#F5E6C8] border-[#C89B3C]"
                    : "bg-[#FAFAF8] border-[#D4B896] hover:border-gold-royal"
                } ${formErrors.file ? "border-red-500" : ""}`}
                onClick={() => document.getElementById("file-picker-input")?.click()}
              >
                <input
                  id="file-picker-input"
                  type="file"
                  accept=".pdf,image/jpeg,image/jpg"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-[#C89B3C] mb-2 animate-bounce" />
                <span className="text-xs font-semibold text-[#0B1F3A]">Drag &amp; Drop file di sini</span>
                <span className="text-[10px] text-[#718096] mt-1 font-sans">atau klik untuk menelusuri komputer</span>
                <span className="text-[9px] text-[#718096] font-mono mt-3 uppercase">PDF / JPG, Max 10MB</span>
              </div>
            ) : (
              <div className="p-4 bg-[#FDF8F0] border-l-2 border-[#C89B3C] rounded-r-lg space-y-3 relative">
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="absolute top-3 right-3 text-[#718096] hover:text-red-500 transition"
                  title="Ganti File"
                >
                  <Trash className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-red-100 text-red-650 rounded">
                    <span className="font-bold text-xs font-mono">PDF</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-[#0B1F3A] block truncate">{uploadedFile.filename}</span>
                    <span className="text-[10px] text-[#718096] font-mono block">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                <div className="text-[9px] text-[#718096] font-mono pt-2 border-t border-[#E8DCC8]/65 leading-relaxed">
                  <span>Diupload pada: {uploadedFile.uploadedAt} WIB</span>
                  <span className="block italic">Pemberi Berkas: digital_operator_{uploadedFile.uploadedBy}</span>
                </div>
              </div>
            )}
            {formErrors.file && <p className="text-[10px] text-red-500 italic mt-1">{formErrors.file}</p>}
          </div>

          {/* EDIT VERSION NOTES PANEL (Only displayed if modifying document file in Edit Mode) */}
          {mode === "edit" && existingArchive && uploadedFile && uploadedFile.filename !== existingArchive.fileDokumen.filename && (
            <div className="bg-white p-6 rounded-xl border border-gold-royal/30 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-3 animate-slideIn">
              <div className="flex items-center gap-1.5 text-gold-royal font-semibold text-xs border-b border-[#E8DCC8]/65 pb-2 uppercase">
                <History className="w-4 h-4" /> Versi Baru Terdeteksi
              </div>
              <p className="text-[11px] text-[#718096] leading-relaxed font-sans">
                Anda mengunggah berkas dengan nama/meta berbeda dari berkas saat ini. Dokumen versi lama akan otomatis di-arsip ke histori versi ({existingArchive.versiDokumen.length + 1}).
              </p>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-[#718096] uppercase tracking-wider block">Catatan Perubahan Versi *</label>
                <input
                  type="text"
                  required
                  value={versionNote}
                  onChange={(e) => setVersionNote(e.target.value)}
                  className="w-full text-xs text-[#0B1F3A] bg-white border border-[#D4B896] p-2 rounded focus:outline-none focus:border-gold-royal"
                />
              </div>
            </div>
          )}

          {/* RETENTION METADATA BLOCK */}
          <div className="bg-white p-6 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4">
            <h4 className="text-xs font-bold text-[#718096] uppercase tracking-widest block border-b border-[#E8DCC8]/65 pb-2">
              Pengaturan Retensi Hukum
            </h4>

            <div className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#718096] uppercase tracking-widest block">
                  Masa Retensi (Tahun)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={masaRetensi}
                  onChange={(e) => setMasaRetensi(parseInt(e.target.value) || 1)}
                  className="w-full bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-3 text-xs text-[#0B1F3A]"
                />
                <span className="text-[9px] text-[#718096] font-mono leading-none block">Akta AJB: 30 th | Surat Kuasa: 10 th | Perjanjian: 10 th</span>
              </div>

              <div className="p-3.5 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg text-[11px] text-[#718096] leading-relaxed font-sans">
                Dengan masa retensi <strong className="text-gold-royal">{masaRetensi} Tahun</strong>, perkiraan tanggal retensi jatuh pada: <strong className="text-[#0B1F3A]">
                  {tanggalArsip ? (parseInt(tanggalArsip.split("-")[0]) + masaRetensi) + tanggalArsip.substring(4) : "2036-06-08"}
                </strong>. Sesudah tanggal tersebut, status akan berubah otomatis ke Inaktif/Pemusnahan.
              </div>
            </div>
          </div>

          {/* DYNAMIC TAG INPUT FIELD */}
          <div className="bg-white p-6 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-3">
            <h4 className="text-xs font-bold text-[#718096] uppercase tracking-widest block font-display">
              Label / Kata Kunci (Tag)
            </h4>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="cth: tanah"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                className="flex-1 bg-white border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A]"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="bg-gold-royal text-white hover:bg-gold-dark transition p-2 px-3 rounded-lg text-xs font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Render selected tags list */}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {tags.map((tg, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#F5E6C8] border border-[#C89B3C]/30 text-[10px] text-gold-dark font-semibold capitalize font-mono"
                  >
                    {tg}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(idx)}
                      className="text-red-500 hover:text-red-700 font-bold ml-0.5 scale-90"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-[10px] text-[#718096] italic block pt-1">Belum ada label disematkan. Klik Enter untuk menambah label.</span>
            )}
          </div>

          {/* SUBMIT FORM BUTTONS ACTIONS */}
          <div className="flex gap-3 grid grid-cols-2">
            <button
              onClick={() => onNavigate("DAFTAR_ARSIP")}
              type="button"
              className="px-4 py-3 bg-[#FAFAF8] border border-[#D4B896] hover:bg-[#FDF8F0] text-[#0B1F3A] font-semibold rounded-xl text-xs transition cursor-pointer text-center"
            >
              Batalkan
            </button>
            <button
              type="submit"
              className="px-4 py-3 bg-gradient-to-r from-[#A67C2D] to-[#C89B3C] text-white hover:from-[#C89B3C] hover:to-[#A67C2D] font-bold rounded-xl text-xs shadow-lg transition-all hover:-translate-y-[1px] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save className="w-4.5 h-4.5" />
              Simpan Arsip
            </button>
          </div>

        </div>

      </form>
    </div>
  );
}
