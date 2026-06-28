import React, { useState, useEffect } from "react";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowRight,
  User as UserIcon,
  FolderLock,
  MapPin,
  Clock
} from "lucide-react";
import { Archive, KategoriArsip, StatusArsip } from "../types";

interface ArchiveSearchProps {
  archives: Archive[];
  onNavigate: (page: string, activeId?: string | null) => void;
}

export default function ArchiveSearch({
  archives,
  onNavigate,
}: ArchiveSearchProps) {
  
  const [nomorArsip, setNomorArsip] = useState("");
  const [judulArsip, setJudulArsip] = useState("");
  const [namaKlien, setNamaKlien] = useState("");
  const [lokasiFisik, setLokasiFisik] = useState("");
  const [kategori, setKategori] = useState("Semua Kategori");
  const [statusArsip, setStatusArsip] = useState("Semua Status");
  const [unitPengolah, setUnitPengolah] = useState("Semua Unit");
  const [tanggalDari, setTanggalDari] = useState("");
  const [tanggalSampai, setTanggalSampai] = useState("");
  const [searchResults, setSearchResults] = useState<Archive[] | null>(null);
  const [activeSearchTerm, setActiveSearchTerm] = useState("");

  const hasAnyInput = nomorArsip || judulArsip || namaKlien || lokasiFisik ||
    kategori !== "Semua Kategori" || statusArsip !== "Semua Status" ||
    unitPengolah !== "Semua Unit" || tanggalDari || tanggalSampai;

  useEffect(() => {
    if (!hasAnyInput) {
      setSearchResults(null);
      setActiveSearchTerm("");
      return;
    }

    setActiveSearchTerm(judulArsip || nomorArsip || namaKlien || lokasiFisik || "");

    const results = archives.filter((item) => {
      if (nomorArsip && !item.nomorArsip.toLowerCase().includes(nomorArsip.toLowerCase())) return false;
      if (judulArsip && !item.judulArsip.toLowerCase().includes(judulArsip.toLowerCase())) return false;
      if (namaKlien && !item.namaKlien.toLowerCase().includes(namaKlien.toLowerCase())) return false;
      if (lokasiFisik && !(item.lokasiFisik || "").toLowerCase().includes(lokasiFisik.toLowerCase())) return false;
      if (kategori !== "Semua Kategori" && item.kategori !== kategori) return false;
      if (statusArsip !== "Semua Status" && item.statusArsip !== statusArsip) return false;
      if (unitPengolah !== "Semua Unit" && item.unitPengolah !== unitPengolah) return false;
      if (tanggalDari && item.tanggalArsip < tanggalDari) return false;
      if (tanggalSampai && item.tanggalArsip > tanggalSampai) return false;
      return true;
    });

    setSearchResults(results);
  }, [nomorArsip, judulArsip, namaKlien, lokasiFisik, kategori, statusArsip, unitPengolah, tanggalDari, tanggalSampai]);

  const clearSearch = () => {
    setNomorArsip("");
    setJudulArsip("");
    setNamaKlien("");
    setLokasiFisik("");
    setKategori("Semua Kategori");
    setStatusArsip("Semua Status");
    setUnitPengolah("Semua Unit");
    setTanggalDari("");
    setTanggalSampai("");
    setSearchResults(null);
    setActiveSearchTerm("");
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term || !text) return text;
    const regex = new RegExp(`(${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-[#F5E6C8] text-[#A67C2D] font-bold px-0.5 rounded border-b border-[#C89B3C]/50">{part}</mark>
        : part
    );
  };

  const getStatusBadge = (status: StatusArsip) => {
    switch (status) {
      case StatusArsip.AKTIF: return "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25";
      case StatusArsip.INAKTIF: return "bg-slate-500/10 text-[#718096] border border-slate-300";
      case StatusArsip.PERMANEN: return "bg-[#F5E6C8] text-[#A67C2D] border border-[#C89B3C]/30";
      case StatusArsip.MENUNGGU_PEMUSNAHAN: return "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25";
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 select-none">
        <h2 className="text-2xl font-bold font-display text-[#0B1F3A] tracking-wide">Pencarian Arsip Lanjutan</h2>
        <p className="text-[#4A5568] text-xs font-sans">Temukan berkas otentik lewat form pencarian komprehensif, multi-kriteria, dan berkecepatan tinggi</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT: FILTER PANEL */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] space-y-4 h-fit font-sans">
          <div className="border-b border-[#E8DCC8] pb-3 flex items-center justify-between">
            <span className="text-sm font-semibold uppercase font-display text-[#0B1F3A] tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-[#C89B3C]" /> Multi-Kriteria
            </span>
            {hasAnyInput && (
              <button onClick={clearSearch} className="text-xs text-[#EF4444] hover:text-[#EF4444]/80 font-bold transition cursor-pointer">
                Reset
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Nomor Arsip</label>
              <input type="text" placeholder="cth: No. 12/AKTA-APP..." value={nomorArsip}
                onChange={(e) => setNomorArsip(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Judul Arsip</label>
              <input type="text" placeholder="kata kunci pada judul akta..." value={judulArsip}
                onChange={(e) => setJudulArsip(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Nama Klien / Pihak</label>
              <input type="text" placeholder="cth: Robertus / Siti" value={namaKlien}
                onChange={(e) => setNamaKlien(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Lokasi Fisik
              </label>
              <input type="text" placeholder="cth: L1-R3-B12" value={lokasiFisik}
                onChange={(e) => setLokasiFisik(e.target.value.toUpperCase())}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] font-mono" />
              <span className="text-[9px] text-[#718096]">Format: Lemari-Rak-Box</span>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Kategori</label>
              <select value={kategori} onChange={(e) => setKategori(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] cursor-pointer">
                <option value="Semua Kategori">Semua Kategori</option>
                {Object.values(KategoriArsip).map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Status Prosedur</label>
              <select value={statusArsip} onChange={(e) => setStatusArsip(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] cursor-pointer">
                <option value="Semua Status">Semua Status</option>
                {Object.values(StatusArsip).map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Unit Pengolah</label>
              <select value={unitPengolah} onChange={(e) => setUnitPengolah(e.target.value)}
                className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A] cursor-pointer">
                <option value="Semua Unit">Semua Unit</option>
                <option value="Divisi PPAT">Divisi PPAT</option>
                <option value="Divisi Korporasi">Divisi Korporasi</option>
                <option value="Divisi Pertanahan">Divisi Pertanahan</option>
                <option value="Divisi Umum">Divisi Umum</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Tanggal Pengesahan</label>
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={tanggalDari} onChange={(e) => setTanggalDari(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A]" />
                <input type="date" value={tanggalSampai} onChange={(e) => setTanggalSampai(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2 text-xs text-[#0B1F3A]" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: RESULTS */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-[#E8DCC8] shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex items-center justify-between select-none font-sans">
            <span className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-wider">
              {searchResults === null
                ? "Menanti instruksi perayapan database..."
                : `Hasil penelusuran: ${searchResults.length} dokumen didapat`}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">INDEX SEARCH CAPABLE: v4.0</span>
          </div>

          {searchResults === null ? (
            <div className="bg-white border border-[#E8DCC8] rounded-xl p-16 text-center shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col items-center justify-center font-sans">
              <div className="w-12 h-12 rounded-full border border-[#E8DCC8] bg-[#FAFAF8] flex items-center justify-center mb-4 animate-pulse">
                <Search className="w-5 h-5 text-[#C89B3C]" />
              </div>
              <p className="font-semibold text-[#0B1F3A] text-sm">Gunakan panel kiri untuk menyaring database</p>
              <p className="text-xs text-[#718096] mt-1 max-w-sm leading-relaxed">Ketik di salah satu field untuk langsung melihat hasil pencarian secara real-time.</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-4 font-sans">
              {searchResults.map((item) => (
                <div key={item.id}
                  className="bg-white p-5 rounded-xl border border-[#E8DCC8] hover:border-[#C89B3C] shadow-[0_2px_12px_rgba(11,31,58,0.08)] transition flex flex-col sm:flex-row justify-between gap-4 group">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-[#A67C2D] bg-[#FDF8F0] px-2 py-0.5 rounded border border-[#C89B3C]/20">
                        {highlightMatch(item.nomorArsip, activeSearchTerm)}
                      </span>
                      <span className="text-[9px] font-semibold text-[#718096] uppercase tracking-wider font-mono">{item.kategori}</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-semibold text-[#0B1F3A] group-hover:text-[#C89B3C] transition font-display">
                        {highlightMatch(item.judulArsip, activeSearchTerm)}
                      </h4>
                      <p className="text-xs text-[#4A5568] leading-relaxed max-w-xl">{item.keterangan}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-[#718096] pt-1 border-t border-[#E8DCC8]/40">
                      <span className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-[#C89B3C] shrink-0" />
                        Klien: <strong className="text-[#0B1F3A]">{highlightMatch(item.namaKlien, activeSearchTerm)}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> {item.tanggalArsip}
                      </span>
                      {item.lokasiFisik && (
                        <span className="flex items-center gap-1 font-mono text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{highlightMatch(item.lokasiFisik, activeSearchTerm)}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-start sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase ${getStatusBadge(item.statusArsip)}`}>
                      {item.statusArsip}
                    </span>
                    <button onClick={() => onNavigate("DETAIL_ARSIP", item.id)}
                      className="px-3.5 py-1.5 text-xs font-bold bg-[#FAFAF8] hover:bg-[#C89B3C] text-[#0B1F3A] hover:text-white rounded border border-[#D4B896] hover:border-transparent transition flex items-center gap-1 cursor-pointer">
                      Selidiki <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#E8DCC8] rounded-xl p-16 text-center shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col items-center justify-center font-sans">
              <div className="p-3.5 bg-[#EF4444]/5 text-[#EF4444] rounded-full border border-[#EF4444]/10 mb-4">
                <FolderLock className="w-7 h-7" />
              </div>
              <p className="font-semibold text-[#0B1F3A] text-sm">Nihil Kecocokan Ditemukan</p>
              <p className="text-xs text-[#718096] mt-1 max-w-sm">Coba perlebar kriteria pencarian atau periksa ejaan yang dimasukkan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
