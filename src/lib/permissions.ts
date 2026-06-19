/**
 * SiNAR – Role-Based Access Control
 * Sumber kebenaran tunggal untuk semua aturan akses peran.
 *
 * CARA PAKAI:
 *   import { can } from "../lib/permissions";
 *   if (can(currentUser, "hapus_arsip")) { ... }
 */

import { UserRole, KategoriArsip } from "../types";

// ─── Daftar semua aksi yang bisa dikontrol ────────────────────────────────────
export type Permission =
  // Arsip
  | "lihat_arsip"
  | "tambah_arsip"
  | "edit_arsip_sendiri"     // hanya arsip milik sendiri (createdBy === userId)
  | "edit_arsip_semua"       // semua arsip
  | "hapus_arsip"
  // Laporan
  | "lihat_laporan"
  // Retensi
  | "lihat_retensi"
  // Audit Trail
  | "lihat_audit"
  // User Management
  | "kelola_pengguna"
  // Pengaturan Sistem
  | "pengaturan_sistem";

// ─── Pemetaan peran → daftar aksi yang diizinkan ─────────────────────────────
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    "lihat_arsip",
    "tambah_arsip",
    "edit_arsip_semua",
    "hapus_arsip",
    "lihat_laporan",
    "lihat_retensi",
    "lihat_audit",
    "kelola_pengguna",
    "pengaturan_sistem",
  ],

  [UserRole.KEPALA_KANTOR]: [
    // Read-only: hanya lihat
    "lihat_arsip",
    "lihat_laporan",
    "lihat_retensi",
    // Tidak bisa tambah, edit, hapus, audit, kelola user, atau pengaturan
  ],

  [UserRole.NOTARIS]: [
    "lihat_arsip",       // tapi dibatasi kategori Akta saja (lihat canAccessKategori)
    "tambah_arsip",      // kategori Akta saja
    "edit_arsip_semua", // kategori Akta saja
    "lihat_laporan",     // laporan Akta saja
  ],

  [UserRole.STAFF]: [
    "lihat_arsip",
    "tambah_arsip",       // semua kategori
    "edit_arsip_sendiri", // hanya arsip buatan sendiri
    // Tidak bisa hapus, laporan, audit, kelola user, pengaturan
  ],
};

// ─── Kategori yang boleh diakses Notaris ─────────────────────────────────────
export const NOTARIS_KATEGORI: KategoriArsip[] = [
  KategoriArsip.AKTA_JUAL_BELI,
  KategoriArsip.AKTA_PENDIRIAN_PERUSAHAAN,
];

// ─── Fungsi utama cek izin ────────────────────────────────────────────────────

/**
 * Cek apakah user punya izin untuk aksi tertentu.
 *
 * @example
 * can(currentUser, "hapus_arsip")        // → false untuk Staff
 * can(currentUser, "tambah_arsip")       // → true untuk Notaris & Staff
 */
export function can(
  user: { role: UserRole } | null | undefined,
  permission: Permission
): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(permission) ?? false;
}

/**
 * Cek apakah Notaris boleh mengakses/mengedit arsip berdasarkan kategorinya.
 * Peran lain yang sudah punya `lihat_arsip` tidak perlu melewati filter ini.
 *
 * @example
 * canAccessKategori(currentUser, KategoriArsip.SURAT_KUASA) // → false untuk Notaris
 */
export function canAccessKategori(
  user: { role: UserRole } | null | undefined,
  kategori: KategoriArsip
): boolean {
  if (!user) return false;
  if (user.role === UserRole.NOTARIS) {
    return NOTARIS_KATEGORI.includes(kategori);
  }
  // Peran lain yang punya lihat_arsip boleh akses semua kategori
  return can(user, "lihat_arsip");
}

/**
 * Cek apakah user boleh mengedit arsip tertentu.
 * Menggabungkan cek izin + kepemilikan arsip.
 *
 * @example
 * canEdit(currentUser, archive) // → true hanya jika Admin, atau pemilik (Staff/Notaris)
 */
export function canEdit(
  user: { id: string; role: UserRole } | null | undefined,
  archive: { createdBy: string; kategori: KategoriArsip }
): boolean {
  if (!user) return false;

  // Admin: edit semua tanpa batas
  if (can(user, "edit_arsip_semua") && user.role === UserRole.ADMIN) return true;

  // Notaris: edit semua arsip tapi hanya kategori Akta
  if (user.role === UserRole.NOTARIS) {
    return canAccessKategori(user, archive.kategori);
  }

  // Staff: hanya arsip buatan sendiri
  if (can(user, "edit_arsip_sendiri")) {
    return archive.createdBy === user.id;
  }

  return false;
}

/**
 * Cek apakah user boleh menambah arsip pada kategori tertentu.
 */
export function canTambah(
  user: { role: UserRole } | null | undefined,
  kategori?: KategoriArsip
): boolean {
  if (!user) return false;
  if (!can(user, "tambah_arsip")) return false;

  if (user.role === UserRole.NOTARIS && kategori) {
    return NOTARIS_KATEGORI.includes(kategori);
  }
  return true;
}

/**
 * Kembalikan halaman default setelah login berdasarkan peran.
 */
export function getDefaultPage(_role: UserRole): string {
  return "DASHBOARD"; // semua peran mulai dari Dashboard
}

/**
 * Cek apakah peran boleh mengakses halaman tertentu (page key dari App.tsx).
 */
export function canAccessPage(
  user: { role: UserRole } | null | undefined,
  page: string
): boolean {
  if (!user) return false;

  const pagePermissionMap: Record<string, Permission> = {
    LAPORAN:              "lihat_laporan",
    ARSIP_MENDEKATI_RETENSI: "lihat_retensi",
    AUDIT_TRAIL:          "lihat_audit",
    KELOLA_PENGGUNA:      "kelola_pengguna",
    PENGATURAN_SISTEM:    "pengaturan_sistem",
  };

  const required = pagePermissionMap[page];
  if (!required) return true; // halaman publik (Dashboard, Daftar Arsip, dll.)
  return can(user, required);
}
