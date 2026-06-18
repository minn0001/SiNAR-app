/**
 * SiNAR – usePermission hook
 * Membungkus fungsi dari lib/permissions.ts agar mudah dipakai di komponen.
 *
 * @example
 *   const { can, canEdit, canAccessPage } = usePermission(currentUser);
 *   if (can("hapus_arsip")) { ... }
 *   if (canEdit(archive)) { ... }
 */

import { User, KategoriArsip } from "../types";
import {
  can as canFn,
  canAccessKategori as canAccessKategoriFn,
  canEdit as canEditFn,
  canTambah as canTambahFn,
  canAccessPage as canAccessPageFn,
  Permission,
} from "../lib/permissions";

export function usePermission(currentUser: User | null) {
  return {
    /** Cek izin atas satu aksi, mis. can("hapus_arsip") */
    can: (permission: Permission) => canFn(currentUser, permission),

    /** Cek apakah user boleh akses kategori arsip tertentu (relevan untuk Notaris) */
    canAccessKategori: (kategori: KategoriArsip) =>
      canAccessKategoriFn(currentUser, kategori),

    /** Cek apakah user boleh edit arsip tertentu (cek kepemilikan + kategori) */
    canEdit: (archive: { createdBy: string; kategori: KategoriArsip }) =>
      currentUser ? canEditFn(currentUser, archive) : false,

    /** Cek apakah user boleh menambah arsip pada kategori tertentu */
    canTambah: (kategori?: KategoriArsip) => canTambahFn(currentUser, kategori),

    /** Cek apakah user boleh mengakses halaman (page key di App.tsx) */
    canAccessPage: (page: string) => canAccessPageFn(currentUser, page),

    /** Role user saat ini, untuk kebutuhan kondisional ringan */
    role: currentUser?.role ?? null,
  };
}
