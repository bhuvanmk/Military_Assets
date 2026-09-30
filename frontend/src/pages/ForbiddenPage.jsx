import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const ForbiddenPage = () => {
  const { user } = useAuth();
  const normalizedRole = user?.role?.replace('ROLE_', '');
  const dashboardPath = normalizedRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-military-accent-redBg border border-military-accent-red rounded-full mb-4 animate-pulse">
        <ShieldAlert className="w-12 h-12 text-military-accent-red" />
      </div>

      <h1 className="text-3xl font-stencil uppercase tracking-widest text-military-accent-red font-bold">
        ACCESS DENIED // 403 RESTRICTED
      </h1>

      <p className="mt-2 text-sm font-mono text-military-text-muted max-w-md">
        Your current security clearance level does not authorize access to this tactical sector or command console.
      </p>

      <div className="mt-6">
        <Link
          to={dashboardPath}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/60 text-military-text-primary rounded-sm font-mono text-xs uppercase tracking-wider transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>RETURN TO COMMAND DASHBOARD</span>
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
