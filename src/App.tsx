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
import Sidebar from "./components/Sidebar";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ArchiveList from "./components/ArchiveList";
import ArchiveAddEdit from "./components/ArchiveAddEdit";
import ArchiveDetail from "./components/ArchiveDetail";
import ArchiveSearch from "./components/ArchiveSearch";
import Reports from "./components/Reports";
import RetentionWarning from "./components/RetentionWarning";
import AuditTrail from "./components/AuditTrail";
import UserManagement from "./components/UserManagement";
import SystemSettings from "./components/SystemSettings";
import SessionTimeoutModal from "./components/SessionTimeoutModal";

import { mockUsers, mockArchives, mockAuditLogs, defaultSystemConfig } from "./mockData";
import { Archive, User, AuditLog, SystemConfig } from "./types";

// --- RBAC IMPORTS ---
import { can, canAccessPage, canAccessKategori, canEdit } from "./lib/permissions";

const SESSION_LIMIT = 30 * 60; // 30 minutes in seconds
const WARNING_LIMIT = 5 * 60; // 5 minutes in seconds

export default function App() {
  // --- CORE SYSTEM STATE ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>("LOGIN");
  const [activeArchiveId, setActiveArchiveId] = useState<string | null>(null);
  
  const [allArchives, setAllArchives] = useState<Archive[]>([]);
  const [loadingArchives, setLoadingArchives] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>(mockUsers);
  const [allAuditLogs, setAllAuditLogs] = useState<AuditLog[]>(mockAuditLogs);
  const [systemConfig, setSystemConfig] = useState<SystemConfig>(() => {
    try {
      const saved = localStorage.getItem("sinar_system_config");
      return saved ? JSON.parse(saved) : defaultSystemConfig;
    } catch {
      return defaultSystemConfig;
    }
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};

  // Baca archive ID dari URL saat pertama kali load
  const getArchiveIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('archive');
  };
  const [pendingArchiveFromUrl] = useState(getArchiveIdFromUrl);

  useEffect(() => {
  const loadArchives = async () => {
    const { data, error } = await supabase
      .from('arsip')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAllArchives(data.map((row: any) => row.data));
    } else {
      setAllArchives(mockArchives);
    }
    setLoadingArchives(false);
  };
  loadArchives();
}, []);

  useEffect(() => {
    const loadAuditLogs = async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data && data.length > 0) {
        setAllAuditLogs(data.map((row: any) => row.data));
      }
    };
    loadAuditLogs();
  }, []);
  
  useEffect(() => {
    if (pendingArchiveFromUrl && currentUser && allArchives.length > 0) {
      const exists = allArchives.find(a => a.id === pendingArchiveFromUrl);
      if (exists) {
        setActiveArchiveId(pendingArchiveFromUrl);
        setCurrentPage("DETAIL_ARSIP");
      }
    }
  }, [currentUser, allArchives, pendingArchiveFromUrl]);
  
  // --- SESSION TIMER STATE ---
  const [secondsRemaining, setSecondsRemaining] = useState<number>(SESSION_LIMIT);
  const [showTimeoutModal, setShowTimeoutModal] = useState<boolean>(false);

  // Countdown effect
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSessionForceLogout();
          return 0;
        }

        // Show timeout warning when less than 5 minutes remain (25 minutes elapsed)
        if (prev - 1 === WARNING_LIMIT) {
          setShowTimeoutModal(true);
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentUser]);

  // Reset timer on user interaction
  const resetActivityTimer = () => {
    if (currentUser) {
      setSecondsRemaining(SESSION_LIMIT);
      setShowTimeoutModal(false);
    }
  };

  // --- MUTATION EVENTS & ACTIONS ---

  const handleLoginSuccess = async (user: User) => {
    const now = new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const userWithLoginTime: User = {
    ...user,
    lastLogin: now + " WIB"
  };
    
    setCurrentUser(userWithLoginTime);
    setCurrentPage("DASHBOARD");
    setSecondsRemaining(SESSION_LIMIT);
    setShowTimeoutModal(false);
    await appendAuditLog("Login", "Sistem", user);
    
    // Reload audit logs from Supabase after login
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data && data.length > 0) {
      setAllAuditLogs(data.map((row: any) => row.data));
    }
  };

  const handleLogout = () => {
    if (currentUser) {
      appendAuditLog("Logout", "Sistem", currentUser);
    }
    setCurrentUser(null);
    setCurrentPage("LOGIN");
    setActiveArchiveId(null);
  };

  const handleSessionForceLogout = () => {
    alert("Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 30 menit demi alasan keamanan.");
    setCurrentUser(null);
    setCurrentPage("LOGIN");
    setActiveArchiveId(null);
  };

  const handleExtendSession = () => {
    setSecondsRemaining(SESSION_LIMIT);
    setShowTimeoutModal(false);
  };

  // Appends security logs to audit history
  const appendAuditLog = async (action: string, target: string, actor: User) => {
    const freshLog: AuditLog = {
      id: `log-gen-${Date.now()}`,
      userId: actor.id,
      userName: actor.nama,
      userRole: actor.role,
      action: action,
      target: target,
      ipAddress: "192.168.1.135",
      device: "Browser Session / Safari Desktop",
      timestamp: new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hour12: false }).replace(/\//g, "-").replace(",", "")
    };
    setAllAuditLogs((prev) => [freshLog, ...prev]);
    await supabase.from('audit_log').insert({ data: freshLog });
  };

  // Navigates and triggers soft updates
  // --- RBAC GUARD: cek izin halaman sebelum navigasi ---
  const handleNavigate = (page: string, activeId: string | null = null) => {
    resetActivityTimer();

    // Halaman LOGIN selalu boleh diakses
    if (page !== "LOGIN" && !canAccessPage(currentUser, page)) {
      showToast("Anda tidak memiliki akses ke halaman ini.", "error");
      return; // batalkan navigasi, tetap di halaman semula
    }

    setCurrentPage(page);
    if (activeId !== null) {
      setActiveArchiveId(activeId);
    }
  };

  // Archive edits or creation saves
  // --- RBAC GUARD: cek izin tambah/edit sebelum simpan ---
  const handleSaveArchive = async (archive: Archive) => {
  if (!currentUser) return;

  const isNew = !allArchives.find((a) => a.id === archive.id);

  if (isNew) {
    if (!can(currentUser, "tambah_arsip")) {
      showToast("Anda tidak memiliki izin untuk menambah arsip.", "error");
      return;
    }
    if (!canAccessKategori(currentUser, archive.kategori)) {
      showToast("Peran Anda hanya dapat menambah arsip kategori Akta.", "error");
      return;
    }
    await supabase.from('arsip').insert({ data: archive });
    setAllArchives(prev => [archive, ...prev]);
    appendAuditLog("Tambah Arsip", archive.nomorArsip, currentUser);
  } else {
    const existing = allArchives.find((a) => a.id === archive.id)!;
    if (!canEdit(currentUser, existing)) {
      showToast("Anda tidak memiliki izin untuk mengedit arsip ini.", "error");
      return;
    }
    await supabase.from('arsip').update({ data: archive }).eq('data->>id', archive.id);
    setAllArchives(prev => prev.map((a) => (a.id === archive.id ? archive : a)));
    appendAuditLog("Edit Arsip", archive.nomorArsip, currentUser);
  }
  showToast("Dokumen berhasil disimpan");
  handleNavigate("DAFTAR_ARSIP");
};
  
  // Bulk actions or general state swaps
  const handleUpdateArchivesList = (updated: Archive[]) => {
    setAllArchives(updated);
  };

  // Delete gate action
  // --- RBAC GUARD: hanya Admin yang boleh hapus ---
  const handleDeleteArchive = async (id: string) => {
  if (!currentUser) return;

  if (!can(currentUser, "hapus_arsip")) {
    showToast("Hanya Admin yang dapat menghapus arsip.", "error");
    return;
  }

  const targetDoc = allArchives.find((a) => a.id === id);
  if (!targetDoc) return;

  await supabase.from('arsip').delete().eq('data->>id', id);
    
  const fileName = targetDoc.fileDokumen?.url?.split("/dokumen-arsip/")[1];
  if (fileName) {
    const decodedFileName = decodeURIComponent(fileName);
    await supabase.storage.from("dokumen-arsip").remove([decodedFileName]);
  }

setAllArchives(prev => prev.filter((a) => a.id !== id));
  setAllArchives(prev => prev.filter((a) => a.id !== id));
  appendAuditLog("Hapus Arsip", `${targetDoc.nomorArsip} (${targetDoc.judulArsip})`, currentUser);
  
  alert(`Arsip ${targetDoc.judulArsip} berhasil dihapus permanen secara aman.`);
  handleNavigate("DAFTAR_ARSIP");
};

  const handleUpdateUsers = (freshUsers: User[]) => {
    setAllUsers(freshUsers);
  };

  const handleAddRecentSearch = (query: string) => {
    if (!query || recentSearches.includes(query)) return;
    setRecentSearches((prev) => [query, ...prev.slice(0, 4)]);
  };

  // Calculate the sidebar notification badge count (Archives nearing retention/overdue within 180 days)
  const calculateRetentionAlertCount = (): number => {
    const todayMs = new Date("2026-06-08").getTime();
    return allArchives.filter((a) => {
      if (a.statusArsip === "Permanen") return false;
      try {
        const expiryMs = new Date(a.tanggalRetensi).getTime();
        const diffDays = Math.round((expiryMs - todayMs) / (1000 * 60 * 60 * 24));
        return diffDays <= 180;
      } catch {
        return false;
      }
    }).length;
  };

  // --- RBAC: arsip yang ditampilkan, difilter sesuai kategori yang boleh dilihat peran ---
  // Catatan: saat ini hanya Notaris yang dibatasi kategori (Akta saja).
  // Peran lain dengan izin "lihat_arsip" tetap melihat semua arsip.
  const visibleArchives = allArchives.filter((a) => canAccessKategori(currentUser, a.kategori));

  // --- RENDER ROUTING MANAGER ---
  const renderPageLayout = () => {
    // --- RBAC GUARD: pengecekan terakhir sebelum render, mencegah akses via state langsung ---
    if (!canAccessPage(currentUser, currentPage)) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
          <p className="text-[#0B1F3A] font-semibold">Akses Ditolak</p>
          <p className="text-sm text-[#718096]">Anda tidak memiliki izin untuk membuka halaman ini.</p>
        </div>
      );
    }

    switch (currentPage) {
      case "DASHBOARD":
        if (loadingArchives) {
          return <div className="flex items-center justify-center h-64 text-[#718096] text-sm">Memuat data arsip...</div>;
        }
        return (
          <Dashboard
            archives={visibleArchives}
            currentUser={currentUser!}
            onNavigate={handleNavigate}
            retentionUrgentList={visibleArchives.filter((a) => {
              if (a.statusArsip === "Permanen") return false;
              const diff = (new Date(a.tanggalRetensi).getTime() - new Date("2026-06-08").getTime()) / (1000 * 3600 * 24);
              return diff <= 180;
            })}
          />
        );

      case "DAFTAR_ARSIP":
        return (
          <ArchiveList
            archives={visibleArchives}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onUpdateArchives={handleUpdateArchivesList}
            onDeleteArchive={handleDeleteArchive}
          />
        );

      case "TAMBAH_ARSIP":
        // --- RBAC GUARD: Kepala Kantor tidak boleh tambah arsip ---
        if (!can(currentUser, "tambah_arsip")) {
          return (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
              <p className="text-[#0B1F3A] font-semibold">Akses Ditolak</p>
              <p className="text-sm text-[#718096]">Peran Anda tidak dapat menambah arsip.</p>
            </div>
          );
        }
        return (
          <ArchiveAddEdit
            mode="add"
            archives={allArchives}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSave={handleSaveArchive}
            systemConfig={systemConfig}
          />
        );

      case "EDIT_ARSIP": {
        // --- RBAC GUARD: cek kepemilikan + kategori sebelum render form edit ---
        const targetArchive = allArchives.find((a) => a.id === activeArchiveId);
        if (!targetArchive || !canEdit(currentUser, targetArchive)) {
          return (
            <div className="flex flex-col items-center justify-center h-64 text-center gap-2">
              <p className="text-[#0B1F3A] font-semibold">Akses Ditolak</p>
              <p className="text-sm text-[#718096]">Anda tidak memiliki izin untuk mengedit arsip ini.</p>
            </div>
          );
        }
        return (
          <ArchiveAddEdit
            mode="edit"
            archives={allArchives}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onSave={handleSaveArchive}
            activeArchiveId={activeArchiveId}
            systemConfig={systemConfig}
          />
        );
      }

      case "DETAIL_ARSIP":
        return (
          <ArchiveDetail
            archiveId={activeArchiveId || ""}
            archives={visibleArchives}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onDelete={handleDeleteArchive}
          />
        );

      case "PENCARIAN_ARSIP":
        return (
          <ArchiveSearch
            archives={visibleArchives}
            onNavigate={handleNavigate}
            recentSearches={recentSearches}
            onAddRecentSearch={handleAddRecentSearch}
          />
        );

      case "LAPORAN":
        return <Reports archives={visibleArchives} currentUser={currentUser!} />;

      case "ARSIP_MENDEKATI_RETENSI":
        return (
          <RetentionWarning
            archives={visibleArchives}
            currentUser={currentUser}
            onUpdateArchives={handleUpdateArchivesList}
            onNavigate={handleNavigate}
          />
        );

      case "AUDIT_TRAIL":
        return (
          <AuditTrail
            currentUser={currentUser}
            auditLogs={allAuditLogs}
            mockUsers={allUsers}
          />
        );

      case "KELOLA_PENGGUNA":
        return (
          <UserManagement
            currentUser={currentUser}
            users={allUsers}
            onUpdateUsers={handleUpdateUsers}
          />
        );

      case "PENGATURAN_SISTEM":
        return <SystemSettings systemConfig={systemConfig} onUpdateConfig={(newConfig) => {
          setSystemConfig(newConfig);
          localStorage.setItem("sinar_system_config", JSON.stringify(newConfig));
        }} />;

      default:
        return <Dashboard archives={visibleArchives} currentUser={currentUser} onNavigate={handleNavigate} retentionUrgentList={[]} />;
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div 
      className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#F5F0E8] text-[#0B1F3A] font-sans antialiased"
      onClick={resetActivityTimer}
      onKeyDown={resetActivityTimer}
    >
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={(p) => handleNavigate(p)}
        currentUser={currentUser}
        onLogout={handleLogout}
        retentionWarningCount={calculateRetentionAlertCount()}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto pb-16 md:pb-0">
        
        {/* Content Sheet */}
        <main className="flex-1 p-4 md:p-6 pt-4 md:pt-6 w-full max-w-6xl">
          {renderPageLayout()}
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
       <div className={`fixed bottom-6 right-6 z-50 flex items-center px-5 py-4 rounded-xl shadow-2xl text-white text-sm font-semibold transition-all duration-300 animate-fadeIn ${
    toast.type === "success" ? "bg-emerald-500" : "bg-red-500"
  }`}>
    {toast.message}
  </div>
)}
      
      {/* Session warning Dialog */}
      {currentUser && (
        <SessionTimeoutModal
          isOpen={showTimeoutModal}
          secondsRemaining={secondsRemaining}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}
