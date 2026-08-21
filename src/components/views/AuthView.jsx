import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { ALL_KEYS } from '../../constants/schema';
import { Eye, EyeOff, Lock, User } from 'lucide-react';

const BUILTIN_ACCOUNTS = [{ USER: 'demo', ROLE: 'USER', PASSWORD: '123', demo: true }];

export default function AuthView({ usersData = [], onLoginSuccess, onToast, serverStatus = {} }) {
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [signupForm, setSignupForm] = useState({ username: '', role: 'OPERATOR', pass1: '', pass2: '' });
  const [loading, setLoading] = useState(false);

  const getAllUsers = () => {
    const map = new Map();
    BUILTIN_ACCOUNTS.forEach(u => map.set(u.USER.toLowerCase(), { ...u }));
    usersData.forEach(r => {
      const u = String(r[0] || '').trim();
      if (u) map.set(u.toLowerCase(), { USER: u, ROLE: String(r[1] || '').trim(), PASSWORD: String(r[2] || '') });
    });
    return [...map.values()];
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const userList = getAllUsers();
    const found = userList.find(x => x.USER.toLowerCase() === username.trim().toLowerCase() && String(x.PASSWORD) === password);

    if (!found) {
      onToast('Username atau password salah. Akun demo: demo / 123', 'err');
      return;
    }
    onLoginSuccess({ USER: found.USER, ROLE: found.ROLE, demo: !!found.demo });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupForm.username.length < 3) return onToast('Username minimal 3 karakter', 'warn');
    if (signupForm.pass1.length < 3) return onToast('Password minimal 3 karakter', 'warn');
    if (signupForm.pass1 !== signupForm.pass2) return onToast('Konfirmasi password tidak sama', 'err');

    setLoading(true);
    try {
      const userList = getAllUsers();
      if (userList.some(x => x.USER.toLowerCase() === signupForm.username.toLowerCase())) {
        throw new Error('Username sudah terdaftar.');
      }

      const nextId = 'USER' + String(usersData.length + 1).padStart(5, '0');
      const { error } = await supabase.from('db_user').insert([{
        id_user: nextId,
        username: signupForm.username,
        role: signupForm.role,
        password: signupForm.pass1
      }]);

      if (error) throw error;
      onToast(`Akun ${signupForm.username} berhasil terdaftar! Silakan login.`, 'ok');
      setTab('login');
      setUsername(signupForm.username);
    } catch (err) {
      onToast('Gagal mendaftar: ' + err.message, 'err');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.15fr_1fr] bg-[#f2f5fb]">
      <div className="relative hidden lg:flex flex-col justify-between bg-[#0c1424] text-white p-10 overflow-hidden">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-xl tracking-wider">PERFORMA</span>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-cyan-300 font-mono">V 1.0</span>
          </div>
          <h1 className="text-5xl font-extrabold mt-12 leading-tight">Performa<br/>Produksi</h1>
          <p className="mt-4 text-slate-300 max-w-md text-sm leading-relaxed">
            Pusat kendali data produksi prepress — CTCP, CTP, Screen, Flexo, dan Etching terintegrasi Supabase.
          </p>
        </div>
        <div>
          <div className="flex h-1.5 w-56 rounded overflow-hidden">
            <span className="flex-1 bg-[#00aeef]"></span>
            <span className="flex-1 bg-[#ec008c]"></span>
            <span className="flex-1 bg-[#ffd400]"></span>
            <span className="flex-1 bg-[#111111]"></span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 tracking-widest font-mono">C · M · Y · K — REGISTRATION OK</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'login' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
            >
              Masuk
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${tab === 'signup' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
            >
              Sign Up
            </button>
          </div>

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Username</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    placeholder="username"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-[#0c1424] hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition">
                Masuk ke Sistem
              </button>

              <div className="rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs p-3">
                <b>Akun demo:</b> demo / 123
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">Username Baru</label>
                <input
                  type="text"
                  required
                  value={signupForm.username}
                  onChange={e => setSignupForm({ ...signupForm, username: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:bg-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Role</label>
                <select
                  value={signupForm.role}
                  onChange={e => setSignupForm({ ...signupForm, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:bg-white mt-1"
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
                  required
                  value={signupForm.pass1}
                  onChange={e => setSignupForm({ ...signupForm, pass1: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:bg-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">Ulangi Password</label>
                <input
                  type="password"
                  required
                  value={signupForm.pass2}
                  onChange={e => setSignupForm({ ...signupForm, pass2: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:bg-white mt-1"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#0c1424] hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition mt-2"
              >
                {loading ? 'Mendaftarkan…' : 'Daftar Akun'}
              </button>
            </form>
          )}

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-6 text-[10px] text-slate-500 border-t border-slate-100 pt-3">
            {ALL_KEYS.map(k => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${serverStatus[k] === 'live' ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                <span>{k.replace('db_', '').toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}