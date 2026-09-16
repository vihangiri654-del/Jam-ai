import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  Activity,
  Server,
  Cpu,
  Zap,
  CheckCircle2,
  AlertCircle,
  LogOut,
  X,
  Sparkles,
  RefreshCw,
  Sliders,
  Users,
  UserX,
  UserCheck,
  Trash2,
  Laptop,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { UserAccount } from '../types';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminAuthenticated: boolean;
  onAdminLoginSuccess: (adminInfo: any) => void;
  onAdminLogout: () => void;
  onNavigateToDashboard: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  isAdminAuthenticated,
  onAdminLoginSuccess,
  onAdminLogout,
  onNavigateToDashboard,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccessAnimation, setLoginSuccessAnimation] = useState(false);

  // Active Admin Sub-tab
  const [activeTab, setActiveTab] = useState<'users' | 'telemetry' | 'controls'>('users');

  // Admin Surveillance User Registry State
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [userActionMessage, setUserActionMessage] = useState<string | null>(null);

  // Admin Dashboard Telemetry state
  const [telemetry, setTelemetry] = useState<any>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);

  // Feature Toggles
  const [features, setFeatures] = useState({
    neuralTTS: true,
    appBuilder: true,
    imageStudio: true,
    voiceCalling: true,
    searchGrounding: true,
  });

  useEffect(() => {
    if (isOpen && isAdminAuthenticated) {
      fetchUsers();
      fetchTelemetry();
    }
  }, [isOpen, isAdminAuthenticated]);

  if (!isOpen) return null;

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTelemetry = async () => {
    setTelemetryLoading(true);
    try {
      const res = await fetch('/api/admin/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTelemetryLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: cleanPass }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && (data.role === 'SUPER_ADMIN' || data.role === 'ADMIN')) {
        setLoginSuccessAnimation(true);
        const adminData = {
          email: cleanEmail,
          name: data.user?.name || 'Vihaan Giri',
          role: 'SUPER_ADMIN',
          loginTime: Date.now(),
        };
        localStorage.setItem('jam_ai_admin_session', JSON.stringify(adminData));
        onAdminLoginSuccess(adminData);

        setTimeout(() => {
          setLoginSuccessAnimation(false);
          setEmail('');
          setPassword('');
          fetchUsers();
          fetchTelemetry();
        }, 600);
      } else {
        setErrorMessage(data.error || 'Access Denied: Invalid admin credentials.');
      }
    } catch {
      setErrorMessage('Network error during authentication. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKickUser = async (userEmail: string) => {
    try {
      const res = await fetch('/api/admin/users/kick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserActionMessage(`User ${userEmail} kicked and access revoked.`);
        fetchUsers();
      } else {
        setUserActionMessage(data.error || 'Failed to kick user.');
      }
    } catch {
      setUserActionMessage('Error executing kick action.');
    }
    setTimeout(() => setUserActionMessage(null), 3500);
  };

  const handleUnbanUser = async (userEmail: string) => {
    try {
      const res = await fetch('/api/admin/users/unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserActionMessage(`User ${userEmail} unbanned. Status restored.`);
        fetchUsers();
      }
    } catch {
      setUserActionMessage('Error unbanning user.');
    }
    setTimeout(() => setUserActionMessage(null), 3500);
  };

  const handleDeleteUser = async (userEmail: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete ${userEmail}?`)) return;
    try {
      const res = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUserActionMessage(`User ${userEmail} deleted from database.`);
        fetchUsers();
      }
    } catch {
      setUserActionMessage('Error deleting user.');
    }
    setTimeout(() => setUserActionMessage(null), 3500);
  };

  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('jam_ai_admin_session');
    onAdminLogout();
    onClose();
  };

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      id="admin-security-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 transition-all"
    >
      <div className="relative flex flex-col w-full max-w-4xl max-h-[94vh] rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-600 to-red-600 text-white shadow-lg shadow-orange-950/40">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                JAM AI — Super Admin Command Center
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Vihaan Giri Portal
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                सुरक्षा निगरानी, उपयोगकर्ता नियंत्रण (User Kick/Ban) व सिस्टम आर्किटेक्चर
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {!isAdminAuthenticated ? (
            /* Pristine Clean Login Form - No exposed credentials or auto-fills */
            <div className="max-w-md mx-auto py-8">
              <div className="text-center mb-6">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 to-red-500/20 border border-amber-500/30 text-amber-400">
                  <Lock className="h-7 w-7" />
                </div>
                <h4 className="text-lg font-bold text-white">
                  Super Admin Authentication
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  एडमिन क्रेडेंशियल्स दर्ज करके एक्सेस अनलॉक करें
                </p>
              </div>

              {loginSuccessAnimation ? (
                <div className="flex flex-col items-center justify-center p-8 space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-bounce">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    Access Granted. Welcome Vihaan Giri!
                  </span>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  {errorMessage && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs">
                      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Admin Email</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="Enter Admin Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                      <span>Admin Password</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Enter Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-orange-950/50 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying Super Admin...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Sign In & Unlock Admin Hub</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* Authenticated Admin Dashboard */
            <div className="space-y-5">
              
              {/* Creator Banner */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-amber-500/30 shadow-md">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white font-black text-lg shadow-lg shadow-indigo-500/30">
                    VG
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-extrabold text-white">Vihaan Giri</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Master Creator & Super Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      vihangiri654@gmail.com • Total System Authority
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={onNavigateToDashboard}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-950 transition-all active:scale-95"
                  >
                    <span>Dashboard</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-950/50 text-slate-300 hover:text-red-300 border border-slate-700 hover:border-red-800 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Sub-Navigation Tabs */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'users'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>उपयोगकर्ता नियंत्रण (User Surveillance & Kick)</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-900 text-white">
                    {users.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'telemetry'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>सर्वर टेलीमेट्री (Server Diagnostics)</span>
                </button>

                <button
                  onClick={() => setActiveTab('controls')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'controls'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Sliders className="h-4 w-4" />
                  <span>फ़ीचर स्विच (System Toggles)</span>
                </button>
              </div>

              {/* Toast Message */}
              {userActionMessage && (
                <div className="p-3 rounded-xl bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-xs font-semibold flex items-center justify-between">
                  <span>{userActionMessage}</span>
                  <button onClick={() => setUserActionMessage(null)}>
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* TAB 1: User Surveillance & Kick Hub */}
              {activeTab === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-white">
                        लॉगिन किए गए सभी उपयोगकर्ता (Registered & Active Accounts)
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        सभी उपयोगकर्ताओं के ईमेल, पासवर्ड व एक्टिविटी देखें, तथा जिसे चाहें किक या अनबैन करें।
                      </p>
                    </div>
                    <button
                      onClick={fetchUsers}
                      className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${loadingUsers ? 'animate-spin' : ''}`} />
                      <span>रिफ्रेश</span>
                    </button>
                  </div>

                  {/* Users Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                        <tr>
                          <th className="p-3">User & Email</th>
                          <th className="p-3">Real Password</th>
                          <th className="p-3">Device / IP</th>
                          <th className="p-3">Status</th>
                          <th className="p-3 text-right">Admin Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {users.map((u) => {
                          const isSuperAdmin = u.role === 'SUPER_ADMIN' || u.email === 'vihangiri654@gmail.com';
                          const isRevealed = revealedPasswords[u.id];

                          return (
                            <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 font-bold text-white text-xs">
                                    {u.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-white">{u.name}</span>
                                      {isSuperAdmin && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                          ADMIN
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                                  </div>
                                </div>
                              </td>

                              <td className="p-3 font-mono text-xs">
                                <div className="flex items-center gap-1.5">
                                  <span className={isRevealed ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                                    {isRevealed ? u.password || '—' : '••••••••'}
                                  </span>
                                  <button
                                    onClick={() => togglePasswordReveal(u.id)}
                                    className="p-1 rounded text-slate-400 hover:text-white"
                                    title={isRevealed ? 'Hide Password' : 'Show Password'}
                                  >
                                    {isRevealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                  </button>
                                </div>
                              </td>

                              <td className="p-3 text-[11px] text-slate-400">
                                <div className="flex items-center gap-1">
                                  <Laptop className="h-3 w-3 text-slate-500" />
                                  <span>{u.device || 'Desktop/Mobile'}</span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-mono">{u.ip || 'Local Network'}</span>
                              </td>

                              <td className="p-3">
                                {u.status === 'ACTIVE' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    ACTIVE
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                                    KICKED / BANNED
                                  </span>
                                )}
                              </td>

                              <td className="p-3 text-right">
                                {isSuperAdmin ? (
                                  <span className="text-[10px] text-slate-500 italic">Immune</span>
                                ) : (
                                  <div className="flex items-center justify-end gap-1.5">
                                    {u.status === 'ACTIVE' ? (
                                      <button
                                        onClick={() => handleKickUser(u.email)}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 text-[11px] font-bold transition-colors"
                                        title="Kick out this user immediately"
                                      >
                                        <UserX className="h-3 w-3" />
                                        <span>किक करें</span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleUnbanUser(u.email)}
                                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[11px] font-bold transition-colors"
                                        title="Unban this user"
                                      >
                                        <UserCheck className="h-3 w-3" />
                                        <span>Unban</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => handleDeleteUser(u.email)}
                                      className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800"
                                      title="Delete user"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: Server Telemetry */}
              {activeTab === 'telemetry' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <Activity className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Core Server</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        {telemetry?.status || 'ONLINE'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <Server className="h-3.5 w-3.5 text-indigo-400" />
                        <span>Uptime</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {telemetry?.uptimeSeconds ? `${Math.floor(telemetry.uptimeSeconds / 60)}m ${telemetry.uptimeSeconds % 60}s` : 'Active'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <Cpu className="h-3.5 w-3.5 text-purple-400" />
                        <span>Memory Heap</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {telemetry?.memoryUsageMb ? `${telemetry.memoryUsageMb.heapUsed} MB` : 'Optimal'}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                        <Zap className="h-3.5 w-3.5 text-amber-400" />
                        <span>Cached Voice</span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {telemetry?.quotaStatus?.cachedTtsClips ?? 0} clips
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <h5 className="text-xs font-bold text-white mb-2">Connected AI Models</h5>
                    <div className="space-y-2">
                      {[
                        { name: 'Gemini 2.5 Flash', desc: 'Primary Reasoning & Intelligence Engine', status: 'ACTIVE' },
                        { name: 'Gemini TTS Neural Synthesizer', desc: 'Puck, Charon, Aoede Voice Timbre', status: 'ACTIVE' },
                        { name: 'Imagen 3.0', desc: 'Studio Photorealistic Rendering', status: 'ACTIVE' },
                      ].map((m, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                          <div>
                            <span className="font-bold text-white">{m.name}</span>
                            <p className="text-[11px] text-slate-400">{m.desc}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: Feature Controls */}
              {activeTab === 'controls' && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <h5 className="text-xs font-bold text-white">Admin Feature Switchboard</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <button
                      type="button"
                      onClick={() => toggleFeature('neuralTTS')}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <span>Neural Voice & Multi-Character</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${features.neuralTTS ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                        {features.neuralTTS ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFeature('appBuilder')}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <span>App Creation Engine & Live Architect</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${features.appBuilder ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                        {features.appBuilder ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFeature('imageStudio')}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <span>Image Studio & Canvas</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${features.imageStudio ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                        {features.imageStudio ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleFeature('voiceCalling')}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
                    >
                      <span>Live Voice Call ("बात करें")</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${features.voiceCalling ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'}`}>
                        {features.voiceCalling ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        {isAdminAuthenticated && (
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/80">
            <span className="text-xs text-slate-400">
              Admin Session Active: <strong className="text-white">Vihaan Giri</strong>
            </span>
            <button
              onClick={onNavigateToDashboard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-950 transition-all active:scale-95"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
