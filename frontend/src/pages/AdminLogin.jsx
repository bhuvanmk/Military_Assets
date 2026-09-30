import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Lock, Mail, AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { adminLogin, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const normalizedRole = user.role?.replace('ROLE_', '');
      if (normalizedRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await adminLogin({ email, password });
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      console.error('Admin authentication failed', err);
      const errMsg = err.response?.data?.message || err.message || 'Invalid admin credentials.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-military-green-darkest flex flex-col justify-center items-center p-4 relative overflow-hidden font-mono">
      {/* Top Red Alert Banner */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-military-accent-amber to-red-600" />

      {/* Background Matrix/Grid scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,19,0.9),rgba(18,24,19,0.95)),repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(239,68,68,0.03)_2px,rgba(239,68,68,0.03)_4px)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Command Center Card */}
        <div className="tactical-panel bg-military-green-surface/98 border-2 border-red-800/80 p-8 rounded-sm shadow-[0_0_40px_rgba(220,38,38,0.15)] backdrop-blur-md">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 p-2 rounded-full bg-black/80 border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] mb-3 flex items-center justify-center">
              <ShieldAlert className="w-9 h-9 text-red-500 animate-pulse" />
            </div>
            <h1 className="text-2xl font-stencil uppercase tracking-widest text-red-500 font-bold">
              ADMIN PORTAL
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-military-accent-amber mt-1">
              Administrator Login
            </p>
            <div className="mt-3 text-[10px] font-mono font-bold text-red-400 border border-red-700/60 px-3 py-1 rounded-sm bg-red-950/40 tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
              <span>AUTHORIZED ADMINISTRATORS ONLY</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 bg-red-950/70 border border-red-600 text-red-200 text-xs font-mono rounded-sm flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-red-400 mb-1.5 font-semibold">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-400/60">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-red-900/60 text-military-text-primary text-xs font-mono rounded-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-military-text-muted transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-red-400 mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-red-400/60">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-black/60 border border-red-900/60 text-military-text-primary text-xs font-mono rounded-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder-military-text-muted transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-red-800 hover:bg-red-700 border border-red-500 text-white font-stencil uppercase tracking-widest text-sm font-bold rounded-sm shadow-[0_0_15px_rgba(220,38,38,0.3)] transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-red-300" />
                  <span>AUTHENTICATING ROOT...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-red-300" />
                  <span>Admin Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Warning */}
        <div className="mt-4 text-center">
          <p className="text-[10px] font-mono text-red-400/80 uppercase tracking-widest">
            RESTRICTED ACCESS // ALL ACTIVITY IS RECORDED & REPORTED
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
