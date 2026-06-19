/**
 * SiNAR – ProtectedAction
 * Wrapper untuk menyembunyikan (atau menonaktifkan) tombol/elemen UI
 * berdasarkan izin peran user. Mencegah user mengakses fitur yang
 * bukan haknya, walau dari sisi tampilan.
 *
 * CATATAN PENTING:
 * Ini hanya proteksi tampilan (frontend). Validasi sesungguhnya tetap
 * harus dilakukan di handler/aksi (mis. handleDeleteArchive di App.tsx)
 * dan idealnya juga di Supabase Row Level Security (RLS) — lihat
 * catatan di akhir file App.tsx hasil update.
 *
 * @example
 * // Sembunyikan total kalau tidak punya izin:
 * <ProtectedAction permission="hapus_arsip" currentUser={currentUser}>
 *   <button onClick={handleDelete}>Hapus</button>
 * </ProtectedAction>
 *
 * @example
 * // Tampilkan tapi disable (abu-abu) kalau tidak punya izin:
 * <ProtectedAction permission="hapus_arsip" currentUser={currentUser} mode="disable">
 *   <button onClick={handleDelete}>Hapus</button>
 * </ProtectedAction>
 *
 * @example
 * // Cek kepemilikan arsip (edit_arsip_sendiri), bukan permission biasa:
 * <ProtectedAction editCheck={{ user: currentUser, archive }}>
 *   <button onClick={handleEdit}>Edit</button>
 * </ProtectedAction>
 */

import React from "react";
import { User, KategoriArsip } from "../types";
import { can, canEdit, Permission } from "../lib/permissions";

interface ProtectedActionProps {
  children: React.ReactNode;
  currentUser?: User | null;
  /** Izin tunggal yang dibutuhkan, mis. "hapus_arsip" */
  permission?: Permission;
  /** Alternatif: cek izin edit berbasis kepemilikan arsip */
  editCheck?: {
    user: User | null;
    archive: { createdBy: string; kategori: KategoriArsip };
  };
  /** "hide" (default) = elemen disembunyikan total. "disable" = tampil tapi non-aktif */
  mode?: "hide" | "disable";
  /** Pesan tooltip saat mode="disable" dan user tidak punya izin */
  disabledMessage?: string;
}

export default function ProtectedAction({
  children,
  currentUser,
  permission,
  editCheck,
  mode = "hide",
  disabledMessage = "Anda tidak memiliki izin untuk aksi ini.",
}: ProtectedActionProps) {
  let allowed = true;

  if (permission) {
    allowed = can(currentUser, permission);
  } else if (editCheck) {
    allowed = editCheck.user ? canEdit(editCheck.user, editCheck.archive) : false;
  }

  if (allowed) return <>{children}</>;

  if (mode === "hide") return null;

  // mode === "disable": bungkus children, nonaktifkan interaksi
  return (
    <div
      title={disabledMessage}
      style={{ opacity: 0.4, pointerEvents: "none", cursor: "not-allowed" }}
      aria-disabled="true"
    >
      {children}
    </div>
  );
}
