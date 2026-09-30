import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, AdminRoute } from './components/layout/RouteGuards';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import Expenditures from './pages/Expenditures';
import UsersPage from './pages/Users';
import BasesPage from './pages/Bases';
import EquipmentTypesPage from './pages/EquipmentTypes';
import AuditLogsPage from './pages/AuditLogs';
import ForbiddenPage from './pages/ForbiddenPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default Entry Point: Always start at /login for users */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Public Auth Portals */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/403" element={<ForbiddenPage />} />

          {/* Normal User Shell & Operational Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="expenditures" element={<Expenditures />} />
          </Route>

          {/* Admin Shell & Headquarters Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AppLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="bases" element={<BasesPage />} />
            <Route path="equipment" element={<EquipmentTypesPage />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="transfers" element={<Transfers />} />
            <Route path="assignments" element={<Assignments />} />
            <Route path="expenditures" element={<Expenditures />} />
            <Route path="audit-logs" element={<AuditLogsPage />} />
          </Route>

          {/* Catch-all: Send to /login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
