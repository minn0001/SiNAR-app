/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum KategoriArsip {
  AKTA_JUAL_BELI = "Akta Jual Beli",
  AKTA_PENDIRIAN_PERUSAHAAN = "Akta Pendirian Perusahaan",
  SURAT_KUASA = "Surat Kuasa",
  PERJANJIAN = "Perjanjian",
  SERTIFIKAT = "Sertifikat",
  DOKUMEN_PENDUKUNG = "Dokumen Pendukung"
}

export enum StatusArsip {
  AKTIF = "Aktif",
  INAKTIF = "Inaktif",
  PERMANEN = "Permanen",
  MENUNGGU_PEMUSNAHAN = "Menunggu Pemusnahan"
}

export enum UserRole {
  ADMIN = "Admin",
  KEPALA_KANTOR = "Kepala Kantor",
  NOTARIS = "Notaris",
  STAFF = "Staff"
}

export enum UserStatus {
  AKTIF = "Aktif",
  NONAKTIF = "Nonaktif"
}

export interface DocumentFile {
  url: string;
  filename: string;
  size: number; // in bytes
  uploadedAt: string;
  uploadedBy: string; // userId
  type?: string;
}

export interface DocumentVersion {
  versi: number;
  url: string;
  filename: string;
  uploadedAt: string;
  uploadedBy: string; // userId
  catatan: string;
}

export interface Archive {
  id: string;
  nomorArsip: string; // auto-generated
  judulArsip: string;
  tanggalArsip: string; // YYYY-MM-DD
  kategori: KategoriArsip;
  statusArsip: StatusArsip;
  masaRetensi: number; // in years
  tanggalRetensi: string; // YYYY-MM-DD
  tags: string[];
  namaKlien: string;
  unitPengolah: string;
  keterangan: string;
  lokasiFisik?: string;
  fileDokumen: DocumentFile;
  versiDokumen: DocumentVersion[];
  qrCode: string; // auto-generated from archive ID or number
  createdBy: string; // userId
  createdAt: string;
  updatedBy: string; // userId
  updatedAt: string;
}

export interface User {
  id: string;
  nama: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastLogin: string;
  createdAt: string;
  username: string;
  nip_sk?: string;
  lastLogin?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  target: string; // archive number/title or "Sistem"
  ipAddress: string;
  device: string;
  timestamp: string;
}

export interface SystemConfig {
  nomorFormat: string; // e.g., "No. {urut}/{KATEGORI}/{BULAN_ROMAWI}/{TAHUN}"
  defaultRetensi: Record<KategoriArsip, number | "Permanen">;
  maxUploadSize: number; // in MB
  sessionTimeout: number; // in minutes
  backupSchedule: string; // "Harian" | "Mingguan"
  lastBackup: string;
  notifikasiRetensi: boolean;
  reminderSchedule: number[]; // e.g., [30, 7, 1] days before
}
