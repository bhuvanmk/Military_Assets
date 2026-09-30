import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  ArrowLeftRight,
  UserCheck,
  Flame,
  Users,
  Building2,
  Cpu,
  FileText,
  ShieldCheck,
  User,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  // Role-specific nav items
  // ADMIN: Dashboard, Users, Bases, Equipment, Inventory, Purchases, Transfers, Assignments, Expenditures, Audit Logs, Logout
  // BASE_COMMANDER: Dashboard, Inventory, Purchases, Transfers, Assignments, Expenditures, Logout
  // LOGISTICS_OFFICER: Dashboard, Inventory, Purchases, Transfers, Logout

  const getNavItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { to: '/admin/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
        { to: '/admin/users', label: 'USERS', icon: Users },
        { to: '/admin/bases', label: 'BASES', icon: Building2 },
        { to: '/admin/equipment', label: 'EQUIPMENT', icon: Cpu },
        { to: '/admin/inventory', label: 'INVENTORY', icon: Boxes },
        { to: '/admin/purchases', label: 'PURCHASES', icon: ShoppingCart },
        { to: '/admin/transfers', label: 'TRANSFERS', icon: ArrowLeftRight },
        { to: '/admin/assignments', label: 'ASSIGNMENTS', icon: UserCheck },
        { to: '/admin/expenditures', label: 'EXPENDITURES', icon: Flame },
        { to: '/admin/audit-logs', label: 'AUDIT LOGS', icon: FileText },
      ];
    }

    if (user?.role === 'BASE_COMMANDER') {
      return [
        { to: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
        { to: '/inventory', label: 'INVENTORY', icon: Boxes },
        { to: '/purchases', label: 'PURCHASES', icon: ShoppingCart },
        { to: '/transfers', label: 'TRANSFERS', icon: ArrowLeftRight },
        { to: '/assignments', label: 'ASSIGNMENTS', icon: UserCheck },
        { to: '/expenditures', label: 'EXPENDITURES', icon: Flame },
      ];
    }

    // LOGISTICS_OFFICER
    return [
      { to: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
      { to: '/inventory', label: 'INVENTORY', icon: Boxes },
      { to: '/purchases', label: 'PURCHASES', icon: ShoppingCart },
      { to: '/transfers', label: 'TRANSFERS', icon: ArrowLeftRight },
    ];
  };

  const navItems = getNavItems();
  const isAdmin = user?.role === 'ADMIN';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-14 bottom-0 left-0 w-64 bg-military-green-darkest border-r ${
          isAdmin ? 'border-red-900/60' : 'border-military-green-border'
        } z-40 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation links */}
        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          <div>
            <div className={`px-3 mb-2 text-[10px] font-mono tracking-widest uppercase font-semibold flex items-center justify-between ${
              isAdmin ? 'text-red-400' : 'text-military-khaki/70'
            }`}>
              <span>{isAdmin ? '// ADMIN COMMAND OPS' : '// LOGISTICS OPERATIONS'}</span>
              {isAdmin && <ShieldCheck className="w-3.5 h-3.5 text-red-500" />}
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => onClose && onClose()}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2.5 rounded-sm text-xs font-mono tracking-wider transition-all relative ${
                        isActive
                          ? (isAdmin
                              ? 'bg-red-950/60 text-white font-bold border-l-2 border-red-500 shadow-sm'
                              : 'bg-military-olive text-military-text-primary font-bold shadow-sm')
                          : (isAdmin
                              ? 'text-military-text-muted hover:text-white hover:bg-red-950/30'
                              : 'text-military-text-muted hover:text-military-text-primary hover:bg-military-green-surface')
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {!isAdmin && isActive && (
                          <span className="absolute left-0 top-0 bottom-0 w-1 bg-military-khaki rounded-r" />
                        )}
                        <Icon className={`w-4 h-4 ${
                          isActive
                            ? (isAdmin ? 'text-red-400' : 'text-military-khaki')
                            : 'text-military-steel-light'
                        }`} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}

              {/* Logout item inside sidebar */}
              <button
                onClick={logout}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-sm text-xs font-mono tracking-wider transition-all text-left ${
                  isAdmin
                    ? 'text-red-400 hover:text-white hover:bg-red-950/40'
                    : 'text-military-accent-red hover:text-red-300 hover:bg-military-green-surface'
                }`}
              >
                <LogOut className="w-4 h-4 text-red-400" />
                <span>LOGOUT</span>
              </button>
            </nav>
          </div>
        </div>

        {/* User Card at Bottom of Sidebar */}
        <div className={`p-3 bg-military-green-dark/80 border-t ${
          isAdmin ? 'border-red-900/60' : 'border-military-green-border'
        }`}>
          <div className="flex items-center space-x-3 p-2 bg-military-green-surface rounded-sm border border-military-green-border/50">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center flex-shrink-0 font-mono font-bold text-xs border ${
              isAdmin
                ? 'bg-red-950/60 text-red-400 border-red-700/60'
                : 'bg-military-olive text-military-khaki border-military-khaki/30'
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono font-bold text-military-text-primary truncate">
                {user?.name || 'OPERATOR'}
              </p>
              <p className="text-[10px] font-mono text-military-text-muted truncate">
                {user?.email || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
