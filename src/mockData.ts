/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Archive, User, AuditLog, SystemConfig, KategoriArsip, StatusArsip, UserRole, UserStatus } from "./types";

// Helper function to calculate date offsets relative to today (June 8, 2026)
const getRelativeDate = (offsetDays: number): string => {
  const baseDate = new Date("2026-06-08");
  baseDate.setDate(baseDate.getDate() + offsetDays);
  return baseDate.toISOString().split("T")[0];
};

export const mockUsers: User[] = [
  {
    id: "usr-01",
    nama: "Hendrawan Syahputra, S.H., M.Kn.",
    email: "hendrawan@sinar-notaris.com",
    role: UserRole.ADMIN,
    status: UserStatus.AKTIF,
    lastLogin: "2026-06-08 08:30",
    createdAt: "2024-01-15 10:00",
    username: "hendrawan",
    nip_sk: "NIP-19810412-101"
  },
  {
    id: "usr-02",
    nama: "Hj. Ratna Sari, S.H.",
    email: "ratna.sari@sinar-notaris.com",
    role: UserRole.KEPALA_KANTOR,
    status: UserStatus.AKTIF,
    lastLogin: "2026-06-07 15:45",
    createdAt: "2024-01-15 10:15",
    username: "ratna",
    nip_sk: "NIP-19750918-102"
  },
  {
    id: "usr-03",
    nama: "Prasetyo Utomo, S.H., M.Kn.",
    email: "prasetyo.u@sinar-notaris.com",
    role: UserRole.NOTARIS,
    status: UserStatus.AKTIF,
    lastLogin: "2026-06-08 08:15",
    createdAt: "2024-02-01 09:00",
    username: "prasetyo",
    nip_sk: "SK-2022/NOT-03"
  },
  {
    id: "usr-04",
    nama: "Dewi Lestari",
    email: "dewi.lestari@sinar-notaris.com",
    role: UserRole.STAFF,
    status: UserStatus.AKTIF,
    lastLogin: "2026-06-08 07:45",
    createdAt: "2024-02-10 11:30",
    username: "dewi",
    nip_sk: "SK-2023/STF-04"
  },
  {
    id: "usr-05",
    nama: "Rian Hidayat",
    email: "rian.hidayat@sinar-notaris.com",
    role: UserRole.STAFF,
    status: UserStatus.NONAKTIF,
    lastLogin: "2026-05-20 16:00",
    createdAt: "2024-03-01 14:00",
    username: "rian",
    nip_sk: "SK-2024/STF-05"
  }
];

export const defaultSystemConfig: SystemConfig = {
  nomorFormat: "No. {urut}/{KATEGORI}/{BULAN_ROMAWI}/{TAHUN}",
  defaultRetensi: {
    [KategoriArsip.AKTA_JUAL_BELI]: 10,
    [KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN]: 30,
    [KategoriArsip.SURAT_KUASA]: 10,
    [KategoriArsip.PERJANJIAN]: 10,
    [KategoriArsip.SERTIFIKAT]: 99, // Treated as Permanen
    [KategoriArsip.DOKUMEN_PENDUKUNG]: 5
  },
  maxUploadSize: 10, // in MB
  sessionTimeout: 30, // in minutes
  backupSchedule: "Mingguan",
  lastBackup: "2026-06-07 01:00",
  notifikasiRetensi: true,
  reminderSchedule: [30, 7, 1]
};

export const mockArchives: Archive[] = [
  {
    id: "arc-001",
    nomorArsip: "No. 01/AKTA-AJB/VI/2016",
    judulArsip: "Akta Jual Beli Tanah & Bangunan Kav. 12 Sentul City",
    tanggalArsip: "2016-06-20",
    kategori: KategoriArsip.AKTA_JUAL_BELI,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 10,
    tanggalRetensi: getRelativeDate(12), // 2026-06-20 (12 days left - RED < 30 days)
    tags: ["AJB", "tanah", "Sentul", "waris"],
    namaKlien: "Budi Santoso & Siti Aminah",
    unitPengolah: "Divisi PPAT",
    keterangan: "AJB atas sebidang tanah seluas 250 m2 beserta bangunan di atasnya. Surat-surat lengkap.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "AJB_Budi_Siti_Sentul.pdf",
      size: 4210500, // ~4.0 MB
      uploadedAt: "2024-05-10 09:30",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "AJB_Budi_Siti_Sentul_v1.pdf",
        uploadedAt: "2024-05-10 09:30",
        uploadedBy: "usr-03",
        catatan: "Dokumen awal hasil scan legalisir"
      }
    ],
    qrCode: "No. 01/AKTA-AJB/VI/2016",
    createdBy: "usr-03",
    createdAt: "2024-05-10 09:30",
    updatedBy: "usr-03",
    updatedAt: "2024-05-10 09:30"
  },
  {
    id: "arc-002",
    nomorArsip: "No. 12/AKTA-APP/VIII/1996",
    judulArsip: "Akta Pendirian PT Citra Karunia Abadi",
    tanggalArsip: "1996-08-15",
    kategori: KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 30,
    tanggalRetensi: getRelativeDate(68), // 2026-08-15 (68 days left - AMBER 30-90 days)
    tags: ["PT", "Corporation", "Pendirian", "Saham"],
    namaKlien: "Direksi PT Citra Karunia Abadi (Bp. Robertus)",
    unitPengolah: "Divisi Korporasi",
    keterangan: "Dokumen asli pendirian Perseroan Terbatas sesuai pengesahan Kemenkumham RI.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "Pendirian_PT_Citra_Karunia.pdf",
      size: 6120400, // ~5.8 MB
      uploadedAt: "2024-05-11 11:20",
      uploadedBy: "usr-01"
    },
    versiDokumen: [
      {
        versi: 2,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "Pendirian_PT_Citra_Karunia_Revisi.pdf",
        uploadedAt: "2024-06-15 14:10",
        uploadedBy: "usr-01",
        catatan: "Sesuai dengan lampiran koreksi Kemenkumham"
      },
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "Pendirian_PT_Citra_Karunia_v1.pdf",
        uploadedAt: "2024-05-11 11:20",
        uploadedBy: "usr-01",
        catatan: "Draft scan pertama"
      }
    ],
    qrCode: "No. 12/AKTA-APP/VIII/1996",
    createdBy: "usr-01",
    createdAt: "2024-05-11 11:20",
    updatedBy: "usr-01",
    updatedAt: "2024-06-15 14:10"
  },
  {
    id: "arc-003",
    nomorArsip: "No. 45/SK/M/X/2016",
    judulArsip: "Surat Kuasa Khusus Penjualan Aset Ruko Kelapa Gading",
    tanggalArsip: "2016-10-10",
    kategori: KategoriArsip.SURAT_KUASA,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 10,
    tanggalRetensi: getRelativeDate(124), // 2026-10-10 (124 days left - YELLOW 90-180 days)
    tags: ["Kuasa", "Aset", "Ruko", "Kelapa Gading"],
    namaKlien: "Ibu Megawati Sukma kepada Sdr. Anton Wijaya",
    unitPengolah: "Divisi Umum",
    keterangan: "Surat kuasa mutlak untuk menjual sebidang tanah ruko di Boulevard Gading.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "Surat_Kuasa_Ruko_KG.pdf",
      size: 1530200,
      uploadedAt: "2024-05-12 10:15",
      uploadedBy: "usr-04"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "Surat_Kuasa_Ruko_KG.pdf",
        uploadedAt: "2024-05-12 10:15",
        uploadedBy: "usr-04",
        catatan: "Finalized scan"
      }
    ],
    qrCode: "No. 45/SK/M/X/2016",
    createdBy: "usr-04",
    createdAt: "2024-05-12 10:15",
    updatedBy: "usr-04",
    updatedAt: "2024-05-12 10:15"
  },
  {
    id: "arc-004",
    nomorArsip: "No. 08/SRT-XLL/II/2026",
    judulArsip: "Sertifikat Hak Milik (SHM) No. 4452 Menteng",
    tanggalArsip: "2026-02-10",
    kategori: KategoriArsip.SERTIFIKAT,
    statusArsip: StatusArsip.PERMANEN,
    masaRetensi: 99,
    tanggalRetensi: "2125-02-10", // Permanen
    tags: ["SHM", "Menteng", "Sertifikat", "Asli"],
    namaKlien: "PT Pembangunan Jaya Agung",
    unitPengolah: "Divisi Pertanahan",
    keterangan: "Sertifikat Hak Milik tanah seluas 1.200 m2 di kawasan Menteng, Jakarta Pusat.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "SHM_4452_Menteng_Jaya.pdf",
      size: 8900100, // ~8.5 MB
      uploadedAt: "2026-02-12 14:00",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "SHM_4452_Menteng_Jaya.pdf",
        uploadedAt: "2026-02-12 14:00",
        uploadedBy: "usr-03",
        catatan: "Sertifikat asli scan warna resolusi tinggi"
      }
    ],
    qrCode: "No. 08/SRT-XLL/II/2026",
    createdBy: "usr-03",
    createdAt: "2026-02-12 14:00",
    updatedBy: "usr-03",
    updatedAt: "2026-02-12 14:00"
  },
  {
    id: "arc-005",
    nomorArsip: "No. 32/PERJ/X/2021",
    judulArsip: "Perjanjian Kerjasama Jasa Konsultan TI PT Telko & PT Tech",
    tanggalArsip: "2021-10-05",
    kategori: KategoriArsip.PERJANJIAN,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 10,
    tanggalRetensi: "2031-10-05", // Healthy
    tags: ["PKS", "IT", "Telko", "Vendor"],
    namaKlien: "PT Telekomunikasi Utama & PT Tech Solution Indonesia",
    unitPengolah: "Divisi Korporasi",
    keterangan: "Perjanjian Kerjasama penyediaan outsourcing developer dan maintenance server.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "PKS_Telko_TechSolutions.pdf",
      size: 2450000,
      uploadedAt: "2021-10-06 16:30",
      uploadedBy: "usr-04"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "PKS_Telko_TechSolutions.pdf",
        uploadedAt: "2021-10-06 16:30",
        uploadedBy: "usr-04",
        catatan: "Signed copy scan"
      }
    ],
    qrCode: "No. 32/PERJ/X/2021",
    createdBy: "usr-04",
    createdAt: "2021-10-06 16:30",
    updatedBy: "usr-04",
    updatedAt: "2021-10-06 16:30"
  },
  {
    id: "arc-006",
    nomorArsip: "No. 89/DOK-PND/IV/2021",
    judulArsip: "Dokumen KTP, KK & NPWP Ahli Waris Almarhum H. Sukarno",
    tanggalArsip: "2021-04-10",
    kategori: KategoriArsip.DOKUMEN_PENDUKUNG,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 5,
    tanggalRetensi: getRelativeDate(-59), // 2026-04-10 (Overdue - past retention, MENUNGGU PEMUSNAHAN)
    tags: ["KTP", "Silsilah", "NPWP", "Ahli Waris"],
    namaKlien: "Keluarga Besar Alm. H. Sukarno",
    unitPengolah: "Divisi PPAT",
    keterangan: "Dokumen kependudukan pendukung guna pembuatan Fatwa Waris dan Pembagian Hak Bersama.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "Komersial_Dokumen_AhliWaris.pdf",
      size: 3402900,
      uploadedAt: "2021-04-12 11:00",
      uploadedBy: "usr-04"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "Komersial_Dokumen_AhliWaris.pdf",
        uploadedAt: "2021-04-12 11:00",
        uploadedBy: "usr-04",
        catatan: "Scan berkas asli"
      }
    ],
    qrCode: "No. 89/DOK-PND/IV/2021",
    createdBy: "usr-04",
    createdAt: "2021-04-12 11:00",
    updatedBy: "usr-04",
    updatedAt: "2021-04-12 11:00"
  },
  {
    id: "arc-007",
    nomorArsip: "No. 11/AKTA-AJB/XII/2015",
    judulArsip: "Akta Jual Beli Ruko Grand Wisata Bekasi Blok C",
    tanggalArsip: "2015-12-11",
    kategori: KategoriArsip.AKTA_JUAL_BELI,
    statusArsip: StatusArsip.INAKTIF,
    masaRetensi: 10,
    tanggalRetensi: getRelativeDate(-178), // 2015-12-11 + 10 = 2025-12-11 (Passed retention, inactive)
    tags: ["AJB", "Bekasi", "Ruko", "Inaktif"],
    namaKlien: "Sdr. Hermawan & Ibu Amalia",
    unitPengolah: "Divisi PPAT",
    keterangan: "AJB Ruko Bekasi Blok C, status telah lunas dan sertifikat asli dikembalikan.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "AJB_Ruko_GrandWisata.pdf",
      size: 2950000,
      uploadedAt: "2015-12-12 10:00",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "AJB_Ruko_GrandWisata.pdf",
        uploadedAt: "2015-12-12 10:00",
        uploadedBy: "usr-03",
        catatan: "Scan arsip asli"
      }
    ],
    qrCode: "No. 11/AKTA-AJB/XII/2015",
    createdBy: "usr-03",
    createdAt: "2015-12-12 10:00",
    updatedBy: "usr-03",
    updatedAt: "2015-12-12 10:00"
  },
  {
    id: "arc-008",
    nomorArsip: "No. 05/SK/V/2016",
    judulArsip: "Surat Kuasa Pengurusan Waris Tanah Caruban Cirebon",
    tanggalArsip: "2016-05-15",
    kategori: KategoriArsip.SURAT_KUASA,
    statusArsip: StatusArsip.MENUNGGU_PEMUSNAHAN,
    masaRetensi: 10,
    tanggalRetensi: getRelativeDate(-24), // 2026-05-15 (Passed, waiting for destruction)
    tags: ["Waris", "Cirebon", "Kuasa"],
    namaKlien: "Bambang Pamungkas dkk",
    unitPengolah: "Divisi PPAT",
    keterangan: "Surat kuasa kepengurusan warisan tanah, masa aktif retensi habis.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "SK_Waris_Cirebon.pdf",
      size: 1980000,
      uploadedAt: "2016-05-16 11:30",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "SK_Waris_Cirebon_v1.pdf",
        uploadedAt: "2016-05-16 11:30",
        uploadedBy: "usr-03",
        catatan: "Original file"
      }
    ],
    qrCode: "No. 05/SK/V/2016",
    createdBy: "usr-03",
    createdAt: "2016-05-16 11:30",
    updatedBy: "usr-03",
    updatedAt: "2016-05-16 11:30"
  },
  {
    id: "arc-009",
    nomorArsip: "No. 55/AKTA-APP/XI/2010",
    judulArsip: "Akta Pendirian Yayasan Bina Kasih Bangsa",
    tanggalArsip: "2010-11-20",
    kategori: KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN,
    statusArsip: StatusArsip.PERMANEN,
    masaRetensi: 30,
    tanggalRetensi: "2040-11-20", // Healthy, long range
    tags: ["Yayasan", "Bina Kasih", "Pendidikan"],
    namaKlien: "H. Maimunah & Rekan Pendiri",
    unitPengolah: "Divisi Korporasi",
    keterangan: "Pendirian Yayasan Sosial dan Keagamaan Bina Kasih Bangsa Jakarta.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "Pendirian_Yayasan_BinaKasih.pdf",
      size: 5120000,
      uploadedAt: "2010-11-22 15:00",
      uploadedBy: "usr-01"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "Pendirian_Yayasan_BinaKasih.pdf",
        uploadedAt: "2010-11-22 15:00",
        uploadedBy: "usr-01",
        catatan: "Berkas awal"
      }
    ],
    qrCode: "No. 55/AKTA-APP/XI/2010",
    createdBy: "usr-01",
    createdAt: "2010-11-22 15:00",
    updatedBy: "usr-01",
    updatedAt: "2010-11-22 15:00"
  },
  {
    id: "arc-010",
    nomorArsip: "No. 02/AKTA-AJB/I/2026",
    judulArsip: "Akta Jual Beli Apartemen Sudirman Residence Tower B",
    tanggalArsip: "2026-01-10",
    kategori: KategoriArsip.AKTA_JUAL_BELI,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 10,
    tanggalRetensi: "2036-01-10",
    tags: ["AJB", "Apartemen", "Sudirman", "Mewah"],
    namaKlien: "Christian Sugiono & PT Grand Sudirman",
    unitPengolah: "Divisi PPAT",
    keterangan: "AJB Satuan Rumah Susun (Sarusun) Tower B Lantai 22-A Sudirman Residence.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "AJB_Apartemen_Sudirman_Christian.pdf",
      size: 4720900,
      uploadedAt: "2026-01-12 11:20",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "AJB_Apartemen_Sudirman_Christian.pdf",
        uploadedAt: "2026-01-12 11:20",
        uploadedBy: "usr-03",
        catatan: "Scan warna akta asli"
      }
    ],
    qrCode: "No. 02/AKTA-AJB/I/2026",
    createdBy: "usr-03",
    createdAt: "2026-01-12 11:20",
    updatedBy: "usr-03",
    updatedAt: "2026-01-12 11:20"
  },
  {
    id: "arc-011",
    nomorArsip: "No. 14/PERJ/III/2026",
    judulArsip: "Perjanjian Kredit Multi Guna PT Bank Mandiri",
    tanggalArsip: "2026-03-14",
    kategori: KategoriArsip.PERJANJIAN,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 10,
    tanggalRetensi: "2036-03-14",
    tags: ["Kredit", "Bank", "Mandiri", "Agunan"],
    namaKlien: "PT Jayakrama Semesta & Bank Mandiri Cabang Thamrin",
    unitPengolah: "Divisi Korporasi",
    keterangan: "Perjanjian penyediaan kredit sindikasi senilai Rp. 15 Miliar dengan agunan aset perseroan.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "Perjanjian_Kredit_Sindikasi.pdf",
      size: 7800000,
      uploadedAt: "2026-03-15 10:00",
      uploadedBy: "usr-04"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "Perjanjian_Kredit_Sindikasi.pdf",
        uploadedAt: "2026-03-15 10:00",
        uploadedBy: "usr-04",
        catatan: "Full document scan"
      }
    ],
    qrCode: "No. 14/PERJ/III/2026",
    createdBy: "usr-04",
    createdAt: "2026-03-15 10:00",
    updatedBy: "usr-04",
    updatedAt: "2026-03-15 10:00"
  },
  {
    id: "arc-012",
    nomorArsip: "No. 03/SERT-XLL/V/2012",
    judulArsip: "Sertifikat Hak Guna Bangunan (SHGB) No. 89 Kebayoran Baru",
    tanggalArsip: "2012-05-05",
    kategori: KategoriArsip.SERTIFIKAT,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 20,
    tanggalRetensi: "2032-05-05", // Active healthy
    tags: ["SHGB", "Kebayoran", "Rami", "Komersil"],
    namaKlien: "PT Plaza Indonesia Realty",
    unitPengolah: "Divisi Pertanahan",
    keterangan: "Sertifikat Hak Guna Bangunan untuk ruko komersial di Kebayoran Baru.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "SHGB_89_Kebayoran.pdf",
      size: 3820000,
      uploadedAt: "2024-05-02 08:30",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "SHGB_89_Kebayoran_v1.pdf",
        uploadedAt: "2024-05-02 08:30",
        uploadedBy: "usr-03",
        catatan: "Verifikasi BPN"
      }
    ],
    qrCode: "No. 03/SERT-XLL/V/2012",
    createdBy: "usr-03",
    createdAt: "2024-05-02 08:30",
    updatedBy: "usr-03",
    updatedAt: "2024-05-02 08:30"
  },
  {
    id: "arc-013",
    nomorArsip: "No. 07/DOK-PND/VI/2021",
    judulArsip: "Dokumen Amdal PT Tambang Utama Kaltim",
    tanggalArsip: "2021-06-05",
    kategori: KategoriArsip.DOKUMEN_PENDUKUNG,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 5,
    tanggalRetensi: getRelativeDate(-3), // 2026-06-05 (3 days overdue - red status warning)
    tags: ["Amdal", "Kaltim", "Tambang", "Lingkungan"],
    namaKlien: "PT Tambang Utama Kaltim",
    unitPengolah: "Divisi Korporasi",
    keterangan: "Studi Kelayakan Lingkungan Amdal Tambang Pasir Besi Kaltim.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "Amdal_PT_Tambang_Kaltim.pdf",
      size: 9240000,
      uploadedAt: "2021-06-10 14:00",
      uploadedBy: "usr-04"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "Amdal_PT_Tambang_Kaltim.pdf",
        uploadedAt: "2021-06-10 14:00",
        uploadedBy: "usr-04",
        catatan: "Finalized book"
      }
    ],
    qrCode: "No. 07/DOK-PND/VI/2021",
    createdBy: "usr-04",
    createdAt: "2021-06-10 14:00",
    updatedBy: "usr-04",
    updatedAt: "2021-06-10 14:00"
  },
  {
    id: "arc-014",
    nomorArsip: "No. 40/AKTA-AJB/IV/2016",
    judulArsip: "Akta Jual Beli Sawah Blok Sawah Gede Cianjur",
    tanggalArsip: "2016-04-12",
    kategori: KategoriArsip.AKTA_JUAL_BELI,
    statusArsip: StatusArsip.MENUNGGU_PEMUSNAHAN,
    masaRetensi: 10,
    tanggalRetensi: getRelativeDate(-57), // Cyanjur sawah AJB overdue
    tags: ["AJB", "Cianjur", "Sawah", "Pemusnahan"],
    namaKlien: "H. Abdul Halim & Bp. Kasmuri",
    unitPengolah: "Divisi PPAT",
    keterangan: "Sawah seluas 1.5 Hektare di Kecamatan Sawah Gede, Cianjur, Jabar.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "AJB_Sawah_Gede_Cianjur.pdf",
      size: 3200100,
      uploadedAt: "2016-04-14 10:25",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "AJB_Sawah_Gede_Cianjur.pdf",
        uploadedAt: "2016-04-14 10:25",
        uploadedBy: "usr-03",
        catatan: "Scan AJB asli"
      }
    ],
    qrCode: "No. 40/AKTA-AJB/IV/2016",
    createdBy: "usr-03",
    createdAt: "2016-04-14 10:25",
    updatedBy: "usr-03",
    updatedAt: "2016-04-14 10:25"
  },
  {
    id: "arc-015",
    nomorArsip: "No. 15/SK/V/2016",
    judulArsip: "Surat Kuasa Hibah Rumah Puri Indah Jakarta Barat",
    tanggalArsip: "2016-05-25",
    kategori: KategoriArsip.SURAT_KUASA,
    statusArsip: StatusArsip.AKTIF,
    masaRetensi: 10,
    tanggalRetensi: getRelativeDate(17), // 2026-05-25 + 10 = 2026-05-25 (Actually offset - 14 days, wait, 17 days relative: 17 days left! RED)
    tags: ["Hibah", "Rumah", "Puri Indah", "Kuasa"],
    namaKlien: "Keluarga Handoko Wiratno",
    unitPengolah: "Divisi PPAT",
    keterangan: "Surat kuasa penandatanganan akta hibah sebuah rumah mewah di cluster Puri Indah.",
    fileDokumen: {
      url: "https://pdfobject.com/pdf/sample.pdf",
      filename: "SK_Hibah_Puri_Indah.pdf",
      size: 2150300,
      uploadedAt: "2016-05-27 13:45",
      uploadedBy: "usr-03"
    },
    versiDokumen: [
      {
        versi: 1,
        url: "https://pdfobject.com/pdf/sample.pdf",
        filename: "SK_Hibah_Puri_Indah_Original.pdf",
        uploadedAt: "2016-05-27 13:45",
        uploadedBy: "usr-03",
        catatan: "Original hardcopy scan"
      }
    ],
    qrCode: "No. 15/SK/V/2016",
    createdBy: "usr-03",
    createdAt: "2016-05-27 13:45",
    updatedBy: "usr-03",
    updatedAt: "2016-05-27 13:45"
  }
];

export const mockAuditLogs: AuditLog[] = [
  {
    id: "log-21",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Login",
    target: "Sistem",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-08 08:30:14"
  },
  {
    id: "log-20",
    userId: "usr-03",
    userName: "Prasetyo Utomo, S.H., M.Kn.",
    userRole: UserRole.NOTARIS,
    action: "Login",
    target: "Sistem",
    ipAddress: "192.168.1.120",
    device: "macOS Sonoma / Safari 17.4",
    timestamp: "2026-06-08 08:15:22"
  },
  {
    id: "log-19",
    userId: "usr-04",
    userName: "Dewi Lestari",
    userRole: UserRole.STAFF,
    action: "Login",
    target: "Sistem",
    ipAddress: "192.168.1.104",
    device: "Windows 10 / Firefox 125",
    timestamp: "2026-06-08 07:45:01"
  },
  {
    id: "log-18",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Lihat Detail",
    target: "No. 01/AKTA-AJB/VI/2016",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-08 08:31:05"
  },
  {
    id: "log-17",
    userId: "usr-04",
    userName: "Dewi Lestari",
    userRole: UserRole.STAFF,
    action: "Tambah Arsip",
    target: "No. 08/SRT-XLL/II/2026",
    ipAddress: "192.168.1.104",
    device: "Windows 10 / Firefox 125",
    timestamp: "2026-06-08 08:02:11"
  },
  {
    id: "log-16",
    userId: "usr-03",
    userName: "Prasetyo Utomo, S.H., M.Kn.",
    userRole: UserRole.NOTARIS,
    action: "Download",
    target: "No. 02/AKTA-AJB/I/2026",
    ipAddress: "192.168.1.120",
    device: "macOS Sonoma / Safari 17.4",
    timestamp: "2026-06-08 08:19:40"
  },
  {
    id: "log-15",
    userId: "usr-02",
    userName: "Hj. Ratna Sari, S.H.",
    userRole: UserRole.KEPALA_KANTOR,
    action: "Login",
    target: "Sistem",
    ipAddress: "192.168.1.115",
    device: "iPad OS / Mobile Safari",
    timestamp: "2026-06-07 15:45:10"
  },
  {
    id: "log-14",
    userId: "usr-02",
    userName: "Hj. Ratna Sari, S.H.",
    userRole: UserRole.KEPALA_KANTOR,
    action: "Export Laporan",
    target: "Laporan Kategori",
    ipAddress: "192.168.1.115",
    device: "iPad OS / Mobile Safari",
    timestamp: "2026-06-07 16:00:22"
  },
  {
    id: "log-13",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Edit Arsip",
    target: "No. 12/AKTA-APP/VIII/1996",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-07 11:20:44"
  },
  {
    id: "log-12",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Export Laporan",
    target: "Laporan Rekapitulasi",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-07 09:12:00"
  },
  {
    id: "log-11",
    userId: "usr-04",
    userName: "Dewi Lestari",
    userRole: UserRole.STAFF,
    action: "Lihat Detail",
    target: "No. 32/PERJ/X/2021",
    ipAddress: "192.168.1.104",
    device: "Windows 10 / Firefox 125",
    timestamp: "2026-06-06 14:50:11"
  },
  {
    id: "log-10",
    userId: "usr-03",
    userName: "Prasetyo Utomo, S.H., M.Kn.",
    userRole: UserRole.NOTARIS,
    action: "Tambah Arsip",
    target: "No. 02/AKTA-AJB/I/2026",
    ipAddress: "192.168.1.120",
    device: "macOS Sonoma / Safari 17.4",
    timestamp: "2026-06-06 11:05:00"
  },
  {
    id: "log-9",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Edit Arsip",
    target: "No. 12/AKTA-APP/VIII/1996",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-05 16:22:10"
  },
  {
    id: "log-8",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Login",
    target: "Sistem",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-05 15:40:02"
  },
  {
    id: "log-7",
    userId: "usr-04",
    userName: "Dewi Lestari",
    userRole: UserRole.STAFF,
    action: "Logout",
    target: "Sistem",
    ipAddress: "192.168.1.104",
    device: "Windows 10 / Firefox 125",
    timestamp: "2026-06-05 12:45:00"
  },
  {
    id: "log-6",
    userId: "usr-04",
    userName: "Dewi Lestari",
    userRole: UserRole.STAFF,
    action: "Download",
    target: "No. 45/SK/M/X/2016",
    ipAddress: "192.168.1.104",
    device: "Windows 10 / Firefox 125",
    timestamp: "2026-06-05 10:15:33"
  },
  {
    id: "log-5",
    userId: "usr-04",
    userName: "Dewi Lestari",
    userRole: UserRole.STAFF,
    action: "Login",
    target: "Sistem",
    ipAddress: "192.168.1.104",
    device: "Windows 10 / Firefox 125",
    timestamp: "2026-06-05 08:30:10"
  },
  {
    id: "log-4",
    userId: "usr-03",
    userName: "Prasetyo Utomo, S.H., M.Kn.",
    userRole: UserRole.NOTARIS,
    action: "Download",
    target: "No. 11/AKTA-AJB/XII/2015",
    ipAddress: "192.168.1.120",
    device: "macOS Sonoma / Safari 17.4",
    timestamp: "2026-06-04 14:50:00"
  },
  {
    id: "log-3",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Hapus Arsip",
    target: "No. 99/DOK-PND/VI/2021 (Dokumen Sampah)",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-04 11:30:15"
  },
  {
    id: "log-2",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Logout",
    target: "Sistem",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-03 17:00:10"
  },
  {
    id: "log-1",
    userId: "usr-01",
    userName: "Hendrawan Syahputra, S.H., M.Kn.",
    userRole: UserRole.ADMIN,
    action: "Login",
    target: "Sistem",
    ipAddress: "192.168.1.101",
    device: "Windows 11 / Chrome 124",
    timestamp: "2026-06-03 08:30:11"
  }
];
