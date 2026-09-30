import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
      const loggedUser = await login({ email, password });
      const normalizedRole = loggedUser.role?.replace('ROLE_', '');
      if (normalizedRole === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Authentication failed', err);
      const errMsg = err.response?.data?.message || err.message || 'Invalid email or password.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-topo-pattern flex flex-col justify-center items-center p-4 relative">
      {/* Subtle top scanline */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-military-olive via-military-khaki to-military-olive opacity-50" />

      <div className="w-full max-w-md">
        {/* Emblem & Branding Card */}
        <div className="tactical-panel bg-military-green-surface/95 border border-military-khaki/40 p-8 rounded-sm shadow-2xl backdrop-blur-md">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 p-2 rounded-full bg-military-green-dark border-2 border-military-khaki shadow-military-glow mb-3 flex items-center justify-center">
              <img src="/shield.svg" alt="Tactical Emblem" className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-stencil uppercase tracking-widest text-military-text-primary font-bold">
              Asset Management System
            </h1>
            <p className="text-xs font-mono uppercase tracking-wider text-military-khaki mt-1">
              User Login
            </p>
            <div className="mt-2 text-[10px] font-mono text-military-text-muted border border-military-green-border px-2 py-0.5 rounded-sm bg-military-green-dark/60">
              OPERATIONAL ACCESS // LEVEL-2 CLEARANCE
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-5 p-3 bg-military-accent-redBg border border-military-accent-red/60 text-red-300 text-xs font-mono rounded-sm flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-military-accent-red flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-military-khaki mb-1.5 font-semibold">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-military-steel-light">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="commander1@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-military-green-darkest border border-military-green-border text-military-text-primary text-xs font-mono rounded-sm focus:outline-none focus:border-military-khaki focus:ring-1 focus:ring-military-khaki placeholder-military-text-muted transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-military-khaki mb-1.5 font-semibold">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-military-steel-light">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-military-green-darkest border border-military-green-border text-military-text-primary text-xs font-mono rounded-sm focus:outline-none focus:border-military-khaki focus:ring-1 focus:ring-military-khaki placeholder-military-text-muted transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/60 text-military-text-primary font-stencil uppercase tracking-widest text-sm font-bold rounded-sm shadow-md transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-military-khaki" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 text-military-khaki" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tactical Footer Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-[10px] font-mono text-military-text-muted uppercase tracking-wider">
            SECURE TERMINAL // UNAUTHORIZED ATTEMPTS ARE AUDITED & LOGGED
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
