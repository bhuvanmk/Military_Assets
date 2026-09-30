import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const normalizedRole = user?.role?.replace('ROLE_', '');

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'border-military-khaki text-military-khaki bg-military-khaki/10';
      case 'BASE_COMMANDER':
        return 'border-military-accent-amber text-military-accent-amber bg-military-accent-amber/10';
      case 'LOGISTICS_OFFICER':
        return 'border-blue-400 text-blue-400 bg-blue-500/10';
      default:
        return 'border-military-steel text-military-text-muted';
    }
  };

  const dashboardPath = normalizedRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  return (
    <header className="h-14 bg-military-green-dark border-b border-military-green-border px-4 flex items-center justify-between z-30 sticky top-0 shadow-md">
      {/* Left side: System Title & Tactical status dot */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-military-khaki p-1 hover:bg-military-green-surface rounded-sm"
          aria-label="Toggle Navigation"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to={dashboardPath} className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <img src="/shield.svg" alt="Command Emblem" className="w-7 h-7" />
          <div className="hidden sm:block">
            <span className="font-stencil tracking-wider text-sm font-bold text-military-text-primary">
              MILITARY ASSET MANAGEMENT
            </span>
            <span className="text-[10px] font-mono text-military-khaki ml-2 tracking-widest uppercase">
              // SECURE LOGISTICS NETWORK
            </span>
          </div>
        </Link>

        {/* System Online Badge */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-military-accent-greenBg border border-military-accent-green/50 text-[10px] font-mono text-green-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping inline-block mr-1"></span>
          <span>SYSTEM ONLINE (SECURE)</span>
        </div>
      </div>

      {/* Right side: Base badge, User rank, 24-hr clock, Logout */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Base Assignment Tag */}
        <div className="hidden md:flex items-center space-x-1 px-2.5 py-1 bg-military-green-surface border border-military-green-border text-[11px] font-mono text-military-text-secondary rounded-sm">
          <MapPin className="w-3.5 h-3.5 text-military-khaki" />
          <span>BASE:</span>
          <span className="font-bold text-military-khaki">
            {user?.baseName ? user.baseName.toUpperCase() : 'ALL SECTORS (HQ)'}
          </span>
        </div>

        {/* Live 24-Hour Clock */}
        <div className="hidden sm:flex flex-col text-right font-mono text-[11px] text-military-text-muted">
          <span className="text-military-text-primary font-semibold">
            {format(time, 'HH:mm:ss')} UTC
          </span>
          <span className="text-[9px] text-military-khaki">
            {format(time, 'yyyy-MM-dd')}
          </span>
        </div>

        {/* User Role Badge */}
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase font-bold border ${getRoleBadgeStyle(normalizedRole)}`}>
            {normalizedRole ? normalizedRole.replace('_', ' ') : 'USER'}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="flex items-center space-x-1 px-2.5 py-1 bg-military-accent-red/20 hover:bg-military-accent-red/30 border border-military-accent-red/60 text-red-300 hover:text-white rounded-sm text-xs font-mono uppercase transition-colors"
          title="Sign out of command session"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">LOGOUT</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
