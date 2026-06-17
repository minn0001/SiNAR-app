/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Eye, EyeOff, Key, Mail, Lock } from "lucide-react";
import { User, UserRole } from "../types";
import { mockUsers } from "../mockData";

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123"); // default mock password
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Email / Username wajib diisi.");
      return;
    }
    
    // Find matching mock user
    const matchedUser = mockUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchedUser) {
      if (password === "password123" || password.length >= 6) {
        setErrorMsg("");
        onLoginSuccess(matchedUser);
      } else {
        setErrorMsg("Sandi salah. Ketik 'password123' untuk uji coba.");
      }
    } else {
      setErrorMsg("Kredensial tidak terdaftar dalam sistem SiNAR.");
    }
  };

  const selectPreset = (role: UserRole) => {
    const userForRole = mockUsers.find((u) => u.role === role);
    if (userForRole) {
      setEmail(userForRole.email);
      setPassword("password123");
      setErrorMsg("");
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ 
        background: "radial-gradient(ellipse at center, #F5E6C8 0%, #F5F0E8 60%, #EDE8E0 100%)",
        minHeight: "100vh",
        width: "100%"
      }}
    >
      {/* Large watermark text "SiNAR" centered behind card */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none font-sans font-bold text-center uppercase tracking-widest z-0"
        style={{ color: "rgba(200,155,60,0.07)", fontSize: "160px", lineHeight: "1" }}
      >
        SiNAR
      </div>

      {/* Two faint gold circles (decorative rings) */}
      <div 
        className="absolute pointer-events-none z-0 rounded-full"
        style={{ 
          top: "-80px", 
          right: "-80px", 
          width: "300px", 
          height: "300px", 
          border: "1px solid rgba(200,155,60,0.12)" 
        }} 
      />
      <div 
        className="absolute pointer-events-none z-0 rounded-full"
        style={{ 
          bottom: "-60px", 
          left: "-60px", 
          width: "200px", 
          height: "200px", 
          border: "1px solid rgba(200,155,60,0.09)" 
        }} 
      />

      {/* Thin horizontal gold line above the card */}
      <div 
        className="relative z-10 pointer-events-none"
        style={{ width: "60px", height: "2px", background: "#C89B3C", margin: "0 auto 24px auto" }}
      />

      <div 
        className="w-full max-w-lg bg-[#FFFFFF] relative overflow-hidden p-8 sm:p-10 flex flex-col z-10" 
        style={{ 
          boxShadow: "0 20px 60px rgba(11,31,58,0.10), 0 0 0 1px rgba(200,155,60,0.15)", 
          borderRadius: "16px",
          border: "1px solid #E8DCC8" 
        }}
      >
        {/* Top Gold Ribbon Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold-royal to-gold-dark" />

        {/* Brand Banner */}
        <div className="flex flex-col items-center text-center justify-center mb-8">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-inner"
            style={{ backgroundColor: "#F5E6C8", border: "2px solid #C89B3C", color: "#C89B3C", boxShadow: "0 0 20px rgba(200,155,60,0.25)" }}
          >
            <svg 
              viewBox="20 10 110 110" 
              className="w-[88%] h-[88%]" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Rays of Light */}
              <line x1="75" y1="46" x2="75" y2="30" stroke="#C89B3C" strokeWidth="3" strokeLinecap="round" />
              <line x1="63" y1="49" x2="52" y2="38" stroke="#C89B3C" strokeWidth="3" strokeLinecap="round" />
              <line x1="87" y1="49" x2="98" y2="38" stroke="#C89B3C" strokeWidth="3" strokeLinecap="round" />
              <line x1="55" y1="56" x2="42" y2="50" stroke="#C89B3C" strokeWidth="3" strokeLinecap="round" />
              <line x1="95" y1="56" x2="108" y2="50" stroke="#C89B3C" strokeWidth="3" strokeLinecap="round" />

              {/* Book Outline */}
              <path 
                d="M 75,65 Q 60,58 43,62 L 43,96 Q 60,92 75,99 Q 90,92 107,96 L 107,62 Q 90,58 75,65 Z" 
                stroke="#C89B3C" 
                strokeWidth="4" 
                strokeLinejoin="round" 
                strokeLinecap="round" 
                fill="none"
              />

              {/* Center Crease (Dashed Line) */}
              <line x1="75" y1="65" x2="75" y2="99" stroke="#C89B3C" strokeWidth="2.5" strokeDasharray="3,3" />

              {/* Left Page Lines */}
              <line x1="52" y1="73" x2="68" y2="73" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="49" y1="81" x2="68" y2="81" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="52" y1="89" x2="68" y2="89" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />

              {/* Right Page Lines */}
              <line x1="82" y1="73" x2="98" y2="73" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="82" y1="81" x2="101" y2="81" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />
              <line x1="82" y1="89" x2="98" y2="89" stroke="#C89B3C" strokeWidth="3.5" strokeLinecap="round" />

              {/* "N" Circle Hub */}
              <circle cx="75" cy="60" r="10.5" fill="#C89B3C" />
              <text 
                x="75" 
                y="64.5" 
                fontFamily="Inter, system-ui, sans-serif" 
                fontWeight="bold" 
                fontSize="13" 
                fill="#F5E6C8" 
                textAnchor="middle"
              >N</text>
            </svg>
          </div>
          <h1 className="text-3xl font-bold font-display tracking-wider text-[#0B1F3A]">
            SiNAR
          </h1>
          <p className="text-gold-royal font-medium text-xs tracking-widest mt-1 uppercase">
            Sistem Informasi Notaris &amp; Arsip Digital
          </p>
          <div className="w-24 h-[1px] bg-gold-royal/30 mt-3" />
        </div>

        {/* Main Log In Form */}
        <form onSubmit={handleSubmit} className="space-y-5" id="login-form">
          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 text-xs rounded-lg flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {errorMsg}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-widest block">
              Alamat Email / Pengguna
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C89B3C]">
                <Mail className="w-4 h-4" />
              </span>
              <input
                id="login-email-input"
                type="email"
                placeholder="cth: notaris@sinar-notaris.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FFFFFF] text-[#0B1F3A] placeholder-[#A0AEC0] text-sm border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg py-3 pl-10 pr-4 transition duration-200 focus:ring-1 focus:ring-gold-royal"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-widest block">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email); // pre-fill kalau email sudah diisi
                  setShowForgotModal(true);
                }}
                className="text-xs text-gold-royal hover:text-gold-dark hover:underline transition font-medium"
              >
                Lupa Sandi?
              </button>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C89B3C]">
                <Lock className="w-4 h-4" />
              </span>
              <input
                id="login-password-input"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#FFFFFF] text-[#0B1F3A] placeholder-[#A0AEC0] text-sm border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg py-3 pl-10 pr-10 transition duration-200 focus:ring-1 focus:ring-gold-royal"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-gold-royal transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#4A5568] select-none">
              <input
                id="login-remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#D4B896] text-gold-royal bg-[#FFFFFF] focus:ring-sky-500 checked:bg-gold-royal cursor-pointer accent-gold-royal"
              />
              Ingat Saya
            </label>
            <span className="text-[10px] text-[#A0AEC0] font-mono">ID: SEC-SSL:v1.0</span>
          </div>

          <button
            id="login-submit-button"
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-gold-dark to-gold-royal text-navy-bg hover:from-gold-royal hover:to-gold-dark hover:text-white font-bold tracking-widest text-sm rounded-lg py-3.5 shadow-lg transition-transform hover:-translate-y-[1px] cursor-pointer"
          >
            MASUK
          </button>
        </form>

        {/* Quick Presets Section for Reviewers */}
        <div className="mt-8 pt-6 border-t border-[#E8DCC8]">
          <div className="flex items-center gap-1.5 mb-3">
            <Key className="w-4 h-4 text-gold-royal" />
            <h4 className="text-xs font-semibold text-[#718096] tracking-wider uppercase">
              Uji Coba Cepat (Pilih Peran Akun)
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => selectPreset(UserRole.ADMIN)}
              className="px-3 py-2 text-left bg-[#F5F0E8] hover:bg-[#F5E6C8] border border-[#E8DCC8] hover:border-gold-royal text-xs rounded transition cursor-pointer flex flex-col"
            >
              <span className="font-semibold text-[#0B1F3A]">1. Admin</span>
              <span className="text-[10px] text-[#718096] truncate">hendrawan@sinar...</span>
            </button>
            <button
              onClick={() => selectPreset(UserRole.NOTARIS)}
              className="px-3 py-2 text-left bg-[#F5F0E8] hover:bg-[#F5E6C8] border border-[#E8DCC8] hover:border-gold-royal text-xs rounded transition cursor-pointer flex flex-col"
            >
              <span className="font-semibold text-[#0B1F3A]">2. Notaris</span>
              <span className="text-[10px] text-[#718096] truncate">prasetyo.u@sinar...</span>
            </button>
            <button
              onClick={() => selectPreset(UserRole.KEPALA_KANTOR)}
              className="px-3 py-2 text-left bg-[#F5F0E8] hover:bg-[#F5E6C8] border border-[#E8DCC8] hover:border-gold-royal text-xs rounded transition cursor-pointer flex flex-col"
            >
              <span className="font-semibold text-[#0B1F3A]">3. Kepala Kantor</span>
              <span className="text-[10px] text-[#718096] truncate">ratna.sari@sinar...</span>
            </button>
            <button
              onClick={() => selectPreset(UserRole.STAFF)}
              className="px-3 py-2 text-left bg-[#F5F0E8] hover:bg-[#F5E6C8] border border-[#E8DCC8] hover:border-gold-royal text-xs rounded transition cursor-pointer flex flex-col"
            >
              <span className="font-semibold text-[#0B1F3A]">4. Staff / Pengolah</span>
              <span className="text-[10px] text-[#718096] truncate">dewi.lestari@sinar...</span>
            </button>
          </div>
        </div>
      </div>

      {showForgotModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
    <div className="bg-white w-full max-w-sm rounded-xl border border-[#E8DCC8] shadow-2xl overflow-hidden">
      {/* Gold top bar */}
      <div className="h-1 w-full bg-gradient-to-r from-gold-dark via-gold-royal to-gold-dark" />
      
      <div className="p-6 space-y-4">
        {!forgotSent ? (
          <>
            <div>
              <h3 className="text-base font-bold text-[#0B1F3A] font-display tracking-wide">
                Reset Kata Sandi
              </h3>
              <p className="text-xs text-[#718096] mt-1 leading-relaxed">
                Masukkan alamat email akun SiNAR kamu. Kami akan mengirimkan instruksi reset sandi ke email tersebut.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#0B1F3A] uppercase tracking-widest block">
                Alamat Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#C89B3C]">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  placeholder="cth: notaris@sinar-notaris.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-[#FAFAF8] text-[#0B1F3A] placeholder-[#A0AEC0] text-sm border border-[#D4B896] focus:border-gold-royal focus:outline-none rounded-lg py-2.5 pl-10 pr-4 transition"
                />
              </div>
            </div>

            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setForgotEmail("");
                  setForgotSent(false);
                }}
                className="flex-1 px-3 py-2.5 bg-[#F5F0E8] hover:bg-[#EDE8E0] text-[#4A5568] font-semibold rounded-lg text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (forgotEmail) setForgotSent(true);
                }}
                className="flex-1 px-3 py-2.5 bg-gold-royal hover:bg-gold-dark text-white font-bold rounded-lg text-xs transition cursor-pointer"
              >
                Kirim Instruksi
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-2 space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <Mail className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0B1F3A]">Email Terkirim!</h3>
                <p className="text-xs text-[#718096] mt-1.5 leading-relaxed">
                  Instruksi reset sandi telah dikirim ke<br />
                  <strong className="text-[#0B1F3A]">{forgotEmail}</strong>
                </p>
                <p className="text-[10px] text-[#A0AEC0] mt-2">
                  Periksa folder spam jika tidak muncul dalam beberapa menit.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotEmail("");
                setForgotSent(false);
              }}
              className="w-full px-3 py-2.5 bg-gold-royal hover:bg-gold-dark text-white font-bold rounded-lg text-xs transition cursor-pointer"
            >
              Kembali ke Login
            </button>
          </>
        )}
      </div>
    </div>
  </div>
)}
    </div>
  );
}
