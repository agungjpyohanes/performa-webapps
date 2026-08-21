import React, { useState } from 'react';
import { ALL_KEYS } from '../../constants/schema';
import { supabase } from '../../services/supabase';
import { Eye, EyeOff } from 'lucide-react';

const BUILTIN_ACCOUNTS = [{ USER: 'demo', ROLE: 'USER', PASSWORD: '123', demo: true }];

export default function AuthView({ usersData = [], onLoginSuccess, onToast, serverStatus = {} }) {
  const [tab, setTab] = useState('login');
  const [luUser, setLuUser] = useState('');
  const [luPass, setLuPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const [signupForm, setSignupForm] = useState({ user: '', role: 'OPERATOR', pass1: '', pass2: '' });

  const getAllUsers = () => {
    const map = new Map();
    BUILTIN_ACCOUNTS.forEach(u => map.set(u.USER.toLowerCase(), { ...u }));
    usersData.forEach(r => {
      const u = String(r[0] || '').trim();
      if (u) map.set(u.toLowerCase(), { USER: u, ROLE: String(r[1] || '').trim(), PASSWORD: String(r[2] ?? '') });
    });
    return [...map.values()];
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const found = getAllUsers().find(x => x.USER.toLowerCase() === luUser.trim().toLowerCase() && String(x.PASSWORD) === luPass);
    if (!found) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
      onToast('Username/password salah. Coba demo: <b>demo / 123</b>', 'err');
      return;
    }
    onLoginSuccess({ USER: found.USER, ROLE: found.ROLE, demo: !!found.demo });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { user, role, pass1, pass2 } = signupForm;
    if (user.length < 3) return onToast('Username minimal 3 karakter', 'warn');
    if (pass1.length < 3) return onToast('Password minimal 3 karakter', 'warn');
    if (pass1 !== pass2) return onToast('Konfirmasi password tidak sama', 'err');

    setLoading(true);
    try {
      const existing = getAllUsers();
      if (existing.some(x => x.USER.toLowerCase() === user.toLowerCase())) {
        throw new Error(`Username "${user}" sudah terdaftar.`);
      }
      const nextId = 'USER' + String(usersData.length + 1).padStart(5, '0');
      const { error } = await supabase.from('db_user').insert([{
        id_user: nextId,
        username: user,
        role: role,
        password: String(pass1)
      }]);
      if (error) throw error;

      onToast(`Akun "${user}" berhasil didaftarkan ke db_user — silakan masuk`, 'ok');
      setTab('login');
      setLuUser(user);
      setLuPass('');
    } catch (err) {
      onToast('Gagal mendaftar: ' + (err.message || err.toString()), 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_1fr] bg-[#f2f5fb]">
      {/* Kolom Kiri Info */}
      <div className="relative hidden lg:flex flex-col justify-between bg-[#0c1424] text-white p-10 overflow-hidden">
        <div className="absolute inset-0 halftone opacity-70"></div>
        <div
          className="absolute -right-28 -bottom-28 w-[430px] h-[430px] opacity-15 pointer-events-none"
          style={{ animation: 'spinSlow 46s linear infinite' }}
        >
          <svg viewBox="0 0 100 100" fill="none" stroke="white" strokeWidth="2">
            <circle cx="50" cy="50" r="46" />
            <circle cx="50" cy="50" r="14" />
            <path d="M50 0v100M0 50h100" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <img
            className="w-9 h-9 rounded-lg bg-white p-1"
            src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512"
            alt="logo"
          />
          <span className="font-display font-bold tracking-wide">PERFORMA</span>
          <span className="badge bg-white/10 text-cyan-300">V 1.0</span>
        </div>

        <div className="relative z-10">
          <img
            className="w-24 h-24 rounded-2xl bg-white p-2 shadow-2xl"
            src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512"
            alt="logo main"
          />
          <h1 className="font-display text-5xl font-extrabold leading-tight mt-6">
            Performa<br />Produksi
          </h1>
          <p className="mt-4 text-slate-300 max-w-md text-sm leading-relaxed">
            Pusat kendali data produksi prepress — monitoring plate CTCP & CTP, screen, flexo, dan etching terintegrasi Supabase PostgreSQL.
          </p>

          <div className="mt-7 flex gap-2 flex-wrap text-[11px] font-semibold">
            <span className="badge bg-white/10 text-white">
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: '#8b5cf6' }}></span>CTCP
            </span>
            <span className="badge bg-white/10 text-white">
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: '#10b981' }}></span>CTP
            </span>
            <span className="badge bg-white/10 text-white">
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: '#06b6d4' }}></span>SCREEN
            </span>
            <span className="badge bg-white/10 text-white">
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: '#6366f1' }}></span>FLEXO
            </span>
            <span className="badge bg-white/10 text-white">
              <span className="w-2 h-2 rounded-full mr-1.5" style={{ background: '#f59e0b' }}></span>ETCHING
            </span>
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex h-1.5 w-56 rounded overflow-hidden">
            <span className="flex-1" style={{ background: '#00aeef' }}></span>
            <span className="flex-1" style={{ background: '#ec008c' }}></span>
            <span className="flex-1" style={{ background: '#ffd400' }}></span>
            <span className="flex-1" style={{ background: '#111' }}></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 tracking-widest">C · M · Y · K — REGISTRATION OK</p>
        </div>
      </div>

      {/* Kolom Kanan Form Card */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          {/* Mobile Header Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-5">
            <img
              className="w-12 h-12 rounded-xl bg-white p-1 border border-slate-200"
              src="https://drive.google.com/thumbnail?id=1lH4lh1q8CrraoC1fMY1q7tf3B0nezFiJ&sz=w512"
              alt="mobile logo"
            />
            <div>
              <div className="font-display font-extrabold text-slate-900 text-lg leading-tight">PERFORMA</div>
              <span className="badge bg-slate-200 text-slate-600">V 1.0</span>
            </div>
          </div>

          <div className={`card p-7 sm:p-8 shadow-xl ${isShaking ? 'shake' : ''}`}>
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === 'login' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === 'signup' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                }`}
              >
                Sign Up
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Username</label>
                  <input
                    className="inp mt-1"
                    autoComplete="username"
                    value={luUser}
                    onChange={e => setLuUser(e.target.value)}
                    placeholder="username"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500">Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="inp pr-10"
                      autoComplete="current-password"
                      value={luPass}
                      onChange={e => setLuPass(e.target.value)}
                      placeholder="••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary w-full justify-center py-2.5">
                  Masuk ke Sistem
                </button>

                <p className="text-[11px] text-slate-400 text-center">
                  Tekan <b>Enter</b> untuk masuk · belum punya akun? pilih tab <b>Sign Up</b>
                </p>

                <div className="rounded-lg bg-cyan-50/60 border border-cyan-200 text-cyan-800 text-xs p-3 leading-relaxed">
                  <b>Akun demo:</b> <b>demo / 123</b><br />
                  <span className="text-cyan-700/80">
                    {usersData.length > 0
                      ? `✓ ${usersData.length} akun db_user termuat dari Supabase.`
                      : 'Menghubungkan ke Supabase…'}
                  </span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500">Username baru</label>
                  <input
                    className="inp mt-1"
                    value={signupForm.user}
                    onChange={e => setSignupForm({ ...signupForm, user: e.target.value })}
                    placeholder="username"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Role</label>
                  <select
                    className="inp mt-1"
                    value={signupForm.role}
                    onChange={e => setSignupForm({ ...signupForm, role: e.target.value })}
                  >
                    <option>OPERATOR</option>
                    <option>DESIGNER</option>
                    <option>KOORDINATOR</option>
                    <option>SUPERVISOR</option>
                    <option>MANAGER</option>
                    <option>ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Password</label>
                  <input
                    type="password"
                    className="inp mt-1"
                    value={signupForm.pass1}
                    onChange={e => setSignupForm({ ...signupForm, pass1: e.target.value })}
                    placeholder="min. 3 karakter"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500">Ulangi password</label>
                  <input
                    type="password"
                    className="inp mt-1"
                    value={signupForm.pass2}
                    onChange={e => setSignupForm({ ...signupForm, pass2: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-2.5">
                  {loading ? 'Mendaftarkan…' : 'Daftar Akun'}
                </button>
              </form>
            )}

            {/* Indikator Status Koneksi Tabel */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-4 text-[10px] text-slate-500">
              {ALL_KEYS.map(k => (
                <div key={k} className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      serverStatus[k] === 'live' ? 'bg-emerald-400' : 'bg-slate-300 blink'
                    }`}
                  ></span>
                  <span>{k.replace('db_', '').toUpperCase()}</span>
                  <span className="text-slate-400">
                    {serverStatus[k] === 'live' ? 'live ✓' : 'mencari…'}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              ✓ Terhubung ke Database Supabase.
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-400 mt-4">© 2026 PERFORMA · Aether Code</p>
        </div>
      </div>
    </div>
  );
}