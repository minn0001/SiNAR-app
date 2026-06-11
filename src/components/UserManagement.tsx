/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  RefreshCw,
  X,
  FileCheck,
  CheckCircle,
  Key
} from "lucide-react";
import { User, UserRole, UserStatus } from "../types";

interface UserManagementProps {
  currentUser: User;
  users: User[];
  onUpdateUsers: (updatedList: User[]) => void;
}

export default function UserManagement({
  currentUser,
  users,
  onUpdateUsers
}: UserManagementProps) {
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<User | null>(null);
  const [showPassModal, setShowPassModal] = useState<User | null>(null);
  
  // New User Form State
  const [newUsername, setNewUsername] = useState("");
  const [newNama, setNewNama] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>(UserRole.STAFF);
  const [newNip, setNewNip] = useState("");
  const [genPassText, setGenPassText] = useState("");

  const generateRandomPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 11; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
  };

  const handleOpenAddModal = () => {
    setNewUsername("");
    setNewNama("");
    setNewEmail("");
    setNewRole(UserRole.STAFF);
    setNewNip("");
    setGenPassText(generateRandomPassword());
    setShowAddModal(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `usr-gen-${Date.now()}`,
      username: newUsername.trim().toLowerCase(),
      nama: newNama.trim(),
      email: newEmail.trim().toLowerCase(),
      role: newRole,
      status: UserStatus.AKTIF,
      lastLogin: "-",
      nip_sk: newNip.trim() || undefined,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    onUpdateUsers([...users, newUser]);
    setShowAddModal(false);
    alert(`Pengguna baru ${newNama} (${newRole}) berhasil terdaftar di SiNAR dengan kredensial aman.`);
  };

  // Status toggle
  const toggleUserStatus = (userId: string) => {
    if (userId === currentUser.id) {
      alert("Anda dilarang menonaktifkan akun administratif aktif Anda sendiri!");
      return;
    }

    const updated = users.map((u) => {
      if (u.id === userId) {
        const nextStatus = u.status === UserStatus.AKTIF ? UserStatus.NONAKTIF : UserStatus.AKTIF;
        return { ...u, status: nextStatus };
      }
      return u;
    });
    onUpdateUsers(updated);
  };

  // Run Reset Password simulation
  const handleResetPassword = (u: User) => {
    const freshPass = generateRandomPassword();
    setGenPassText(freshPass);
    setShowPassModal(u);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gold-royal/15 shadow-[0_2px_12px_rgba(11,31,58,0.08)] select-none">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold font-display text-[#0B1F3A] tracking-wide flex items-center gap-2">
            <Users className="w-5.5 h-5.5 text-gold-royal" /> Kelola Pengguna Kepegawaian
          </h2>
          <p className="text-[#4A5568] text-xs">Pemberian wewenang peran operator, manajemen status kearsipan, dan rotasi kunci sandi</p>
        </div>

        <button
          id="btn-add-new-user"
          onClick={handleOpenAddModal}
          className="px-4 py-2 text-xs font-bold bg-[#C89B3C] text-white hover:bg-[#A67C2D] rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
        >
          <UserPlus className="w-4 h-4" /> Tambah Petugas
        </button>
      </div>

      {/* DETAILED USER CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {users.map((row) => {
          const isActive = row.status === UserStatus.AKTIF;
          const isMe = row.id === currentUser.id;

          return (
            <div 
              key={row.id}
              className={`bg-white rounded-xl border p-5 shadow-[0_2px_12px_rgba(11,31,58,0.08)] flex flex-col justify-between gap-4 transition-all duration-300 relative ${
                isActive ? "border-gold-royal/15 hover:border-[#C89B3C] hover:shadow-md" : "border-slate-200/80 opacity-60"
              }`}
            >
              <div className="space-y-3">
                {/* Status + Badge header */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold bg-[#FAFAF8] border border-[#E8DCC8] px-2 py-0.5 rounded text-[#718096]">
                    ID: {row.id}
                  </span>
                  
                  <div className="flex items-center gap-1.5 font-sans">
                    {isMe && (
                      <span className="text-[9px] font-bold bg-[#C89B3C] text-white px-2 py-0.5 rounded uppercase font-mono">
                        ANDA
                      </span>
                    )}
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded ${
                      isActive 
                        ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/25" 
                        : "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25"
                    }`}>
                      {row.status}
                    </span>
                  </div>
                </div>

                {/* User name information */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-[#0B1F3A] tracking-wide">{row.nama}</h3>
                  <span className="text-xs text-[#A67C2D] font-bold uppercase tracking-wider font-mono block">
                    {row.role}
                  </span>
                </div>

                <div className="space-y-1.5 pt-2 text-xs text-[#4A5568] border-t border-[#E8DCC8]/65">
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#718096]" /> {row.email}
                  </p>
                  <p className="flex items-center gap-1.5 truncate">
                    <Lock className="w-3.5 h-3.5 text-[#718096]" /> Username: <strong className="text-[#0B1F3A] font-medium">{row.username}</strong>
                  </p>
                  {row.nip_sk && (
                    <p className="flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-[#718096]" /> SK/NIP: <span className="font-mono text-[#0B1F3A]">{row.nip_sk}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Grid actions controls */}
              <div className="flex items-center justify-between border-t border-[#E8DCC8]/65 pt-3 mt-1 text-xs select-none">
                <span className="text-[10px] text-[#718096] font-mono italic">login: {row.lastLogin}</span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleUserStatus(row.id)}
                    className="p-1.5 hover:bg-[#FDF8F0] text-[#718096] hover:text-[#0B1F3A] rounded border border-gold-royal/15 transition cursor-pointer"
                    title={isActive ? "Nonaktifkan Petugas" : "Aktifkan Petugas"}
                  >
                    {isActive ? <ToggleRight className="w-5 h-5 text-[#10B981]" /> : <ToggleLeft className="w-5 h-5 text-slate-400" />}
                  </button>

                  <button
                    onClick={() => handleResetPassword(row)}
                    className="px-2 py-1.5 bg-[#FAFAF8] hover:bg-[#FDF8F0] text-[#718096] hover:text-[#C89B3C] rounded border border-[#E8DCC8] transition flex items-center gap-1 cursor-pointer"
                    title="Soft Reset Password"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> <span className="text-[10px] font-bold">Reset</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}

      </div>

      {/* --- ADD USER MODAL --- */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-md select-none font-sans">
          <div className="w-full max-w-md bg-white border border-[#E8DCC8] rounded-xl p-6 shadow-2xl relative font-sans">
            
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#718096] hover:text-[#0B1F3A] transition"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b border-[#E8DCC8] pb-3 font-sans">
              <UserPlus className="w-5.5 h-5.5 text-gold-royal" />
              <h3 className="text-base font-bold text-[#0B1F3A] tracking-wide">Pendaftaran Petugas Baru</h3>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-left font-sans">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap beserta gelar..."
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Alamat Email *</label>
                <input
                  type="email"
                  required
                  placeholder="alamat@kantornotaris.com..."
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="nama.singkat..."
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Nomor SK / NIP</label>
                  <input
                    type="text"
                    placeholder="cth: SK-2025/11"
                    value={newNip}
                    onChange={(e) => setNewNip(e.target.value)}
                    className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#718096] uppercase tracking-widest block">Peran Wewenang *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-white border border-[#D4B896] focus:border-[#C89B3C] focus:outline-none rounded-lg p-2.5 text-xs text-[#0B1F3A]"
                >
                  <option value={UserRole.STAFF}>STAFF (Kearsipan &amp; Entri)</option>
                  <option value={UserRole.NOTARIS}>NOTARIS (Verifikator &amp; Pembuat Akta)</option>
                  <option value={UserRole.KEPALA_KANTOR}>KEPALA KANTOR (Pemantau &amp; Pimpinan)</option>
                  <option value={UserRole.ADMIN}>ADMIN (Penuh Administrator)</option>
                </select>
              </div>

              <div className="p-3 bg-[#FAFAF8] border border-[#E8DCC8] rounded-lg">
                <span className="text-[9px] text-[#718096] font-bold uppercase tracking-wider block">Kata Sandi Generis Aman :</span>
                <code className="text-xs text-[#A67C2D] font-bold block mt-1 tracking-widest font-mono">{genPassText}</code>
                <p className="text-[9px] text-[#718096] mt-1.5 leading-snug">Salin kata sandi di atas. Petugas akan diverifikasi dan diarahkan mengganti password pada login pertama kali.</p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#C89B3C] text-white hover:bg-[#A67C2D] font-bold text-xs py-3 rounded-lg transition mt-3 cursor-pointer"
              >
                Daftar Petugas Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- RESET PASSWORD SECURED SUCCESS POPUP DRAW --- */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/15 backdrop-blur-md select-none font-sans">
          <div className="bg-white border-2 border-[#C89B3C] rounded-xl p-6 shadow-[0_20px_50px_rgba(200,155,60,0.15)] max-w-sm text-center space-y-4">
            
            <div className="w-12 h-12 rounded-full bg-[#FAFAF8] text-gold-royal flex items-center justify-center mx-auto border border-gold-royal/20">
              <Key className="w-5 h-5 text-[#C89B3C]" />
            </div>

            <div className="space-y-1 font-sans">
              <h3 className="text-lg font-bold text-[#0B1F3A]">Reset Kata Sandi Sukses</h3>
              <p className="text-xs text-[#718096] leading-snug font-sans">Kata sandi baru untuk <strong className="text-[#0B1F3A] font-sans">{showPassModal.nama}</strong> berhasil dirubah secara administratif:</p>
            </div>

            <div className="p-3 bg-[#FAFAF8] border border-[#E8DCC8] rounded text-center select-text">
              <code className="text-sm font-bold text-[#C89B3C] tracking-widest font-mono">{genPassText}</code>
            </div>

            <p className="text-[10px] text-[#718096] italic leading-snug font-sans">Hubungi petugas bersangkutan secara aman untuk mengkoordinasikan sandi keprotokolan transkripsi ini.</p>

            <button
              onClick={() => setShowPassModal(null)}
              className="w-full py-2 bg-[#C89B3C] text-white hover:bg-[#A67C2D] font-bold text-xs rounded transition cursor-pointer"
            >
              Saya Mengerti &amp; Sudah Menyalin
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
