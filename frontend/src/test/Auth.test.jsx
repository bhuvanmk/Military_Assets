import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import AdminLogin from '../pages/AdminLogin';
import Sidebar from '../components/layout/Sidebar';
import { AuthProvider } from '../context/AuthContext';
import { AdminRoute } from '../components/layout/RouteGuards';

// Mock authService
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 2, email: 'commander1@example.com', role: 'BASE_COMMANDER', token: 'mock-token' }
    }),
    adminLogin: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 1, email: 'admin@gmail.com', role: 'ADMIN', token: 'mock-admin-token' }
    }),
    getCurrentUser: vi.fn().mockResolvedValue({
      success: true,
      data: { id: 1, email: 'admin@gmail.com', role: 'ADMIN', name: 'Admin Vance' }
    }),
    logout: vi.fn().mockResolvedValue({ success: true })
  }
}));

describe('Auth & Portal Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders User Login page correctly without admin links or role selectors', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </AuthProvider>
    );

    // Verify Titles & Subtitles
    expect(screen.getByText('Asset Management System')).toBeInTheDocument();
    expect(screen.getByText('User Login')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();

    // Verify absence of admin link or role selector
    expect(screen.queryByText(/ADMIN PORTAL/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Administrator Login/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('renders Admin Login page with restricted command styling and distinct labels', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AdminLogin />
        </MemoryRouter>
      </AuthProvider>
    );

    // Verify Titles & Subtitles
    expect(screen.getByText('ADMIN PORTAL')).toBeInTheDocument();
    expect(screen.getByText('Administrator Login')).toBeInTheDocument();
    expect(screen.getByText(/AUTHORIZED ADMINISTRATORS ONLY/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Admin Login/i })).toBeInTheDocument();
  });

  it('renders ADMIN sidebar with complete command menu items', () => {
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'admin@gmail.com', role: 'ADMIN', name: 'Commander Admin' }));

    render(
      <AuthProvider>
        <MemoryRouter>
          <Sidebar isOpen={true} onClose={() => {}} />
        </MemoryRouter>
      </AuthProvider>
    );

    expect(screen.getByText('USERS')).toBeInTheDocument();
    expect(screen.getByText('BASES')).toBeInTheDocument();
    expect(screen.getByText('EQUIPMENT')).toBeInTheDocument();
    expect(screen.getByText('AUDIT LOGS')).toBeInTheDocument();
    expect(screen.getByText('INVENTORY')).toBeInTheDocument();
  });

  it('allows authenticated ADMIN to access AdminRoute', async () => {
    localStorage.setItem('token', 'valid-admin-token');
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'admin@gmail.com', role: 'ADMIN', name: 'Admin Vance' }));

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/admin/dashboard']}>
          <AdminRoute>
            <div>ADMIN DASHBOARD CONTENT</div>
          </AdminRoute>
        </MemoryRouter>
      </AuthProvider>
    );

    expect(await screen.findByText('ADMIN DASHBOARD CONTENT')).toBeInTheDocument();
  });
});
