import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Toast from '../common/Toast';

export const ToastContext = React.createContext({
  showToast: () => {},
});

export const useToast = () => React.useContext(ToastContext);

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const showToast = ({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString();
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <div className="min-h-screen bg-military-green-darkest text-military-text-primary flex flex-col font-sans selection:bg-military-khaki selection:text-military-green-darkest">
        {/* Top Navbar */}
        <Navbar onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        <div className="flex flex-1 relative">
          {/* Collapsible/Fixed Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64 p-4 md:p-6 lg:p-8 bg-tactical-grid min-h-[calc(100vh-3.5rem)] overflow-x-hidden">
            <Outlet />
          </main>
        </div>

        {/* Global Toast Container */}
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastContext.Provider>
  );
};

export default AppLayout;
