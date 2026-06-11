/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Search, 
  History, 
  SlidersHorizontal, 
  ChevronRight, 
  ArrowRight,
  User as UserIcon,
  FolderLock,
  Tag,
  Clock
} from "lucide-react";
import { Archive, KategoriArsip, StatusArsip, User } from "../types";

interface ArchiveSearchProps {
  archives: Archive[];
  onNavigate: (page: string, activeId?: string | null) => void;
  recentSearches: string[];
  onAddRecentSearch: (query: string) => void;
}

export default function ArchiveSearch({
  archives,
  onNavigate,
  recentSearches,
  onAddRecentSearch
}: ArchiveSearchProps) {
  
  // Search parameters
  const [nomorArsip, setNomorArsip] = useState("");
  const [judulArsip, setJudulArsip] = useState("");
  const [namaKlien, setNamaKlien] = useState("");
  const [tagLabel, setTagLabel] = useState("");
  const [kategori, setKategori] = useState("Semua Kategori");
  const [statusArsip, setStatusArsip] = useState("Semua Status");
  const [unitPengolah, setUnitPengolah] = useState("Semua Unit");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");

  // Result state
  const [searchResults, setSearchResults] = useState<Archive[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState(""); // to feed the highlighter

  // Submit search
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch();
  };

  const performSearch = (overrideParams?: Record<string, string>) => {
    // Collect active parameters
    const nomor = overrideParams?.nomorArsip ?? nomorArsip;
    const judul = overrideParams?.judulArsip ?? judulArsip;
    const klien = overrideParams?.namaKlien ?? namaKlien;
    const tag = overrideParams?.tagLabel ?? tagLabel;
    const kat = overrideParams?.kategori ?? kategori;
    const status = overrideParams?.statusArsip ?? statusArsip;
    const unit = overrideParams?.unitPengolah ?? unitPengolah;
    const dari = overrideParams?.tanggalDari ?? tanggalDari;
    const sampai = overrideParams?.tanggalSampai ?? tanggalSampai;

    // Build search text for history
    const historyToken = [judul, nomor, klien, tag].filter(Boolean).join(" & ") || (kat !== "Semua Kategori" ? kat : "") || "Advanced Filter";
    onAddRecentSearch(historyToken);

    // Save term for highlighter focus
    setActiveSearchTerm(judul || nomor || klien || tag || "");

    const outcomes = archives.filter((item) => {
      let isMatch = true;

      if (nomor && !item.nomorArsip.toLowerCase().includes(nomor.toLowerCase())) isMatch = false;
      if (judul && !item.judulArsip.toLowerCase().includes(judul.toLowerCase())) isMatch = false;
      if (klien && !item.namaKlien.toLowerCase().includes(klien.toLowerCase())) isMatch = false;
      if (tag && !item.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))) isMatch = false;
      
      if (kat !== "Semua Kategori" && item.kategori !== kat) isMatch = false;
      if (status !== "Semua Status" && item.statusArsip !== status) isMatch = false;
      if (unit !== "Semua Unit" && item.unitPengolah !== unit) isMatch = false;

      if (dari && item.tanggalArsip < dari) isMatch = false;
      if (sampai && item.tanggalArsip > sampai) isMatch = false;

      return isMatch;
    });

    setSearchResults(outcomes);
    setHasSearched(true);
  };

  const rerunHistoryQuery = (queryText: string) => {
    setJudulArsip(queryText);
    setNomorArsip("");
    setNamaKlien("");
    setTagLabel("");
    setKategori("Semua Kategori");
    setStatusArsip("Semua Status");
    setUnitPengolah("Semua Unit");
    setTanggalDari("");
    setTanggalSampai("");

    performSearch({
      judulArsip: queryText,
      nomorArsip: "",
      namaKlien: "",
      tagLabel: "",
      kategori: "Semua Kategori",
      statusArsip: "Semua Status",
      unitPengolah: "Semua Unit",
      tanggalDari: "",
      tanggalSampai: ""
    });
  };

  // HIGHLIGHT KEYWORD HELPER
  const highlightMatch = (text: string, term: string) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${escapeRegex(term)})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) 
        ? <mark key={i} className="bg-[#F5E6C8] text-[#A67C2D] font-bold px-0.5 rounded border-b border-[#C89B3C]/50 capitalize">{part}</mark> 
        : part
    );
  };

  const escapeRegex = (string: string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
  };

  // Quick reset
  const clearSearch = () => {
    setNomorArsip("");
    setJudulArsip("");
    setNamaKlien("");
    setTagLabel("");
    setKategori("Semua Kategori");
    setStatusArsip("Semua Status");
    setUnitPengolah("Semua Unit");
    setTanggalDari("");
    setTanggalSampai("");
    setSearchResults(null);
    setHasSearched(false);
    setActiveSearchTerm("");
  };

  const getStatusBadge = (status: StatusArsip) => {
    switch (status) {
      case StatusArsip.AKTIF:
        return "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25";
      case StatusArsip.INAKTIF:
        return "bg-slate-500/10 text-[#718096] border border-slate-350";
      case StatusArsip.PERMANEN:
        return "bg-[#F5E6C8] text-[#A67C2D] border border-[#C89B3C]/30";
      case StatusArsip.MENUNGGU_PEMUSNAHAN:
        return "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="space-y-1 select-none">
        <h2 className="text-2xl font-bold font-display text-[#0B1F3A] tracking-wide">
          Pencarian Arsip Lanjutan
        </h2>
        <p className="text-[#4A5568] text-xs font-sans">
          Temukan berkas otentik lewat form pencarian komprehensif, multi-kriteria, dan berkecepatan tinggi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CRITERIA FORMS */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-5 h-fit font-sans">
          <div className="border-b border-[#E8DCC8] pb-3 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase font-display text-[#0B1F3A] tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#C89B3C]" /> Multi-Kriteria
            </span>
            {hasSearched && (
              <button onClick={clearSearch} className="text-xs text-[#EF4444] hover:text-[#EF4444]/80 font-bold transition cursor-pointer">
                Clear
              </button>
            )}
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            
            {/* Nomor Arsip */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Nomor Arsip</label>
              <input
                type="text"
                placeholder="cth: No. 12/AKTA-APP..."
                value={nomorArsip}
                onChange={(e) => setNomorArsip(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
              />
            </div>

            {/* Judul Arsip */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Judul Arsip</label>
              <input
                type="text"
                placeholder="kata kunci pada judul akta..."
                value={judulArsip}
                onChange={(e) => setJudulArsip(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
              />
            </div>

            {/* Nama Klien */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Nama Klien / Pihak</label>
              <input
                type="text"
                placeholder="cth: Robertus / Siti"
                value={namaKlien}
                onChange={(e) => setNamaKlien(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
              />
            </div>

            {/* Tag / Label */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Tag / Label</label>
              <input
                type="text"
                placeholder="cth: tanah / waris"
                value={tagLabel}
                onChange={(e) => setTagLabel(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
              />
            </div>

            {/* Kategori dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Kategori</label>
              <select
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] cursor-pointer"
              >
                <option value="Semua Kategori">Semua Kategori</option>
                {Object.values(KategoriArsip).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Status Prosedur</label>
              <select
                value={statusArsip}
                onChange={(e) => setStatusArsip(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] cursor-pointer"
              >
                <option value="Semua Status">Semua Status</option>
                {Object.values(StatusArsip).map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Unit Pengolah Dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Unit Pengolah</label>
              <select
                value={unitPengolah}
                onChange={(e) => setUnitPengolah(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] cursor-pointer"
              >
                <option value="Semua Unit">Semua Unit</option>
                <option value="Divisi PPAT">Divisi PPAT</option>
                <option value="Divisi Korporasi">Divisi Korporasi</option>
                <option value="Divisi Pertanahan">Divisi Pertanahan</option>
                <option value="Divisi Umum">Divisi Umum</option>
              </select>
            </div>

            {/* Date Dari - Sampai */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Tanggal Pengesahan</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                   type="date"
                   value={tanggalDari}
                   onChange={(e) => setTanggalDari(e.target.value)}
                   className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A] cursor-pointer"
                />
                <input
                   type="date"
                   value={tanggalSampai}
                   onChange={(e) => setTanggalSampai(e.target.value)}
                   className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A] cursor-pointer"
                />
              </div>
            </div>

            <button
              id="btn-advanced-search-submit"
              type="submit"
              className="w-full mt-2 bg-[#C89B3C] text-white hover:bg-[#A67C2D] font-bold tracking-widest text-xs rounded-lg py-3 cursor-pointer transition shadow-md"
            >
              CARI ARSIP
            </button>
          </form>

          {/* RECENT SEARCHES PANEL */}
          <div className="border-t border-[#E8DCC8] pt-4 mt-2 space-y-2.5">
            <span className="text-[11px] font-bold text-[#0B1F3A] flex items-center gap-1.5 uppercase tracking-wider select-none font-sans">
              <History className="w-4.5 h-4.5 text-gold-royal" /> Pencarian Terbaru
            </span>

            <div className="flex flex-col gap-1.5">
              {recentSearches.length > 0 ? (
                recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => rerunHistoryQuery(term)}
                    className="w-full flex items-center justify-between p-2 rounded bg-[#FAFAF8] hover:bg-[#FDF8F0] border border-[#E8DCC8] hover:border-[#C89B3C] text-xs text-left text-[#4A5568] hover:text-[#C89B3C] transition cursor-pointer group"
                  >
                    <span className="truncate pr-4">{term}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-royal group-hover:translate-x-0.5 transition" />
                  </button>
                ))
              ) : (
                <span className="text-[10px] text-slate-550 italic block font-sans">Pencarian historis Anda kosong.</span>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SEARCH RESULTS */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white p-4 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex items-center justify-between select-none font-sans">
            <span className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-wider">
              {searchResults === null 
                ? "Menanti instruksi perayapan database..." 
                : `Hasil penelusuran: ${searchResults.length} dokumen didapat`
              }
            </span>
            <span className="text-[10px] text-slate-500 font-mono">INDEX SEARCH CAPABLE: v4.0</span>
          </div>

          {/* Results grid */}
          {searchResults === null ? (
            <div className="bg-white border border-[#E8DCC8] rounded-xl p-16 text-center text-[#718096] shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col items-center justify-center font-sans">
              <div className="w-12 h-12 rounded-full border border-[#E8DCC8] bg-[#FAFAF8] flex items-center justify-center text-slate-400 mb-4 animate-pulse">
                <Search className="w-5 h-5 text-[#C89B3C]" />
              </div>
              <p className="font-semibold text-[#0B1F3A] text-sm font-display">Gunakan panel kiri untuk menyaring database</p>
              <p className="text-xs text-[#718096] mt-1 max-w-sm leading-relaxed">Masukkan kata kunci nomor akta, pihak klien, atau gunakan rentang penanggalan untuk memulai reka pencarian terpusat.</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4 font-sans">
              {searchResults.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white p-5 rounded-xl border border-[#E8DCC8] hover:border-[#C89B3C] shadow-[0_2px_12px_rgba(11,31,58,0.08)] hover:shadow-[0_4px_18px_rgba(200,155,60,0.12)] transition flex flex-col sm:flex-row justify-between gap-4 relative group"
                >
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#A67C2D] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C89B3C]/20">
                        {highlightMatch(item.nomorArsip, activeSearchTerm)}
                      </span>
                      <span className="text-[9px] font-semibold text-[#718096] uppercase tracking-wider font-mono">
                        {item.kategori}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-[#0B1F3A] group-hover:text-[#C89B3C] transition leading-tight font-display">
                        {highlightMatch(item.judulArsip, activeSearchTerm)}
                      </h4>
                      <p className="text-xs text-[#4A5568] leading-relaxed max-w-xl">
                        {item.keterangan}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#718096] pt-1 border-t border-[#E8DCC8]/40">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-gold-royal shrink-0" />
                        Klien: <strong className="text-[#0B1F3A] font-semibold">{highlightMatch(item.namaKlien, activeSearchTerm)}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> {item.tanggalArsip}
                      </span>
                      {item.tags.length > 0 && (
                        <span className="flex items-center gap-1 text-[11px]">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span className="text-[#718096] font-medium italic">{item.tags.join(", ")}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase leading-none ${getStatusBadge(item.statusArsip)}`}>
                      {item.statusArsip}
                    </span>
                    <button
                      onClick={() => onNavigate("DETAIL_ARSIP", item.id)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#FAFAF8] hover:bg-[#C89B3C] text-[#0B1F3A] hover:text-white rounded border border-[#D4B896] hover:border-transparent transition flex items-center gap-1 cursor-pointer"
                    >
                      Selidiki <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E8DCC8] rounded-xl p-16 text-center text-[#718096] shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col items-center justify-center font-sans">
              <div className="p-3.5 bg-[#EF4444]/5 text-[#EF4444] rounded-full border border-[#EF4444]/10 mb-4 animate-bounce">
                <FolderLock className="w-7 h-7" />
              </div>
              <p className="font-semibold text-[#0B1F3A] text-sm">Nihil Kecocokan Ditemukan</p>
              <p className="text-xs text-[#718096] mt-1 max-w-sm">
                Harap memeriksa ejaan judul akta, format nomor arsip digital, pengelompokan sub-unit, atau melebarkan kriteria range tanggal pengarsipan Anda.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
