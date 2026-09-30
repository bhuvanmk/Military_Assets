import React, { useState, useEffect } from 'react';
import { userService, baseService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/AppLayout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import { UserPlus, Search, RefreshCw, Key, ShieldCheck, UserCog } from 'lucide-react';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [usersPage, setUsersPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [bases, setBases] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'LOGISTICS_OFFICER',
    baseId: '',
    active: true
  });
  const [formError, setFormError] = useState('');

  // Password Reset Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [resetTargetUser, setResetTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    const loadBases = async () => {
      try {
        const res = await baseService.getActiveBases();
        if (res.success) setBases(res.data || []);
      } catch (err) {
        console.error('Failed to fetch bases for user management', err);
      }
    };
    loadBases();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: pageSize,
        search: search || undefined,
        role: selectedRole || undefined,
        baseId: selectedBaseId || undefined
      };
      const res = await userService.getUsers(params);
      if (res.success) {
        setUsersPage(res.data);
      } else {
        setError(res.message || 'Failed to retrieve personnel list');
      }
    } catch (err) {
      console.error('Error fetching users', err);
      setError(err.response?.data?.message || err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, pageSize, selectedRole, selectedBaseId]);

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'LOGISTICS_OFFICER',
      baseId: bases.length > 0 ? bases[0].id : '',
      active: true
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (targetUser) => {
    setEditingUser(targetUser);
    setFormData({
      name: targetUser.name,
      email: targetUser.email,
      password: '',
      role: targetUser.role,
      baseId: targetUser.baseId || '',
      active: targetUser.active
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.role === 'BASE_COMMANDER' && !formData.baseId) {
      setFormError('BASE_COMMANDER must be assigned to an active base.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        baseId: formData.baseId ? Number(formData.baseId) : null
      };

      if (editingUser) {
        const res = await userService.updateUser(editingUser.id, payload);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'PERSONNEL UPDATED',
            message: `Updated profile for ${res.data.name}`
          });
          setIsModalOpen(false);
          fetchUsers();
        }
      } else {
        const res = await userService.createUser(payload);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'PERSONNEL ENROLLED',
            message: `Created operator account for ${res.data.name}`
          });
          setIsModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      console.error('User save error', err);
      setFormError(err.response?.data?.message || err.message || 'Server error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser) => {
    try {
      const newStatus = !targetUser.active;
      const res = await userService.toggleStatus(targetUser.id, newStatus);
      if (res.success) {
        showToast({
          type: 'info',
          title: 'STATUS MODIFIED',
          message: `User ${targetUser.email} is now ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}`
        });
        fetchUsers();
      }
    } catch (err) {
      console.error('Toggle status error', err);
      showToast({
        type: 'error',
        title: 'STATUS UPDATE FAILED',
        message: err.response?.data?.message || err.message
      });
    }
  };

  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
    setResettingPassword(true);
    try {
      const res = await userService.resetPassword(resetTargetUser.id, newPassword);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'PASSCODE RESET',
          message: `Security passcode updated for ${resetTargetUser.email}`
        });
        setIsPasswordModalOpen(false);
        setNewPassword('');
      }
    } catch (err) {
      console.error('Password reset failed', err);
      showToast({
        type: 'error',
        title: 'RESET FAILED',
        message: err.response?.data?.message || err.message
      });
    } finally {
      setResettingPassword(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', cellClassName: 'text-military-khaki' },
    { header: 'OFFICER / OPERATOR NAME', accessor: 'name', cellClassName: 'font-bold text-military-text-primary' },
    { header: 'EMAIL (IDENTIFIER)', accessor: 'email' },
    {
      header: 'ASSIGNED ROLE',
      accessor: 'role',
      render: (row, val) => (
        <span className="font-bold text-military-khaki font-mono">
          {val ? val.replace('_', ' ') : '-'}
        </span>
      )
    },
    { header: 'ASSIGNED BASE STATION', accessor: 'baseName', render: (r, v) => v || 'GLOBAL HQ / UNRESTRICTED' },
    {
      header: 'CLEARANCE STATUS',
      accessor: 'active',
      align: 'center',
      render: (row, val) => <StatusBadge status={val} />
    },
    {
      header: 'ADMIN CONTROLS',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            className="px-2 py-0.5 bg-military-green-dark hover:bg-military-olive border border-military-green-border hover:border-military-khaki rounded-sm text-[11px] text-military-text-secondary transition-colors"
          >
            EDIT
          </button>
          <button
            onClick={() => {
              setResetTargetUser(row);
              setNewPassword('');
              setIsPasswordModalOpen(true);
            }}
            title="Reset Security Password"
            className="p-1 bg-military-green-dark hover:bg-military-olive border border-military-green-border text-military-khaki rounded-sm transition-colors"
          >
            <Key className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            disabled={row.id === currentUser?.id}
            className={`px-2 py-0.5 border rounded-sm text-[11px] font-mono transition-colors disabled:opacity-30 ${
              row.active
                ? 'bg-military-accent-redBg border-military-accent-red/60 text-red-300 hover:bg-military-accent-red/30'
                : 'bg-military-accent-greenBg border-military-accent-green/60 text-green-300 hover:bg-military-accent-green/30'
            }`}
          >
            {row.active ? 'DEACTIVATE' : 'ACTIVATE'}
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-military-green-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-military-accent-amber font-semibold">
              // COMMAND & CONTROL // PERSONNEL DIRECTORY
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            AUTHORIZED OPERATORS & USER ACCESS
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/70 text-military-text-primary font-mono text-xs uppercase font-bold rounded-sm shadow-md transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>ENROLL NEW PERSONNEL</span>
          </button>

          <button
            onClick={fetchUsers}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-military-green-surface hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary text-xs font-mono uppercase rounded-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="tactical-panel bg-military-green-surface p-4 rounded-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="lg:col-span-2">
            <label className="block text-military-text-muted mb-1 uppercase">SEARCH OPERATORS</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                placeholder="Search name, service email..."
                className="w-full pl-8 pr-3 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
              <Search className="w-3.5 h-3.5 text-military-steel-light absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-military-text-muted mb-1 uppercase">SECURITY ROLE</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="">ALL SECURITY ROLES</option>
              <option value="ADMIN">ADMINISTRATOR</option>
              <option value="BASE_COMMANDER">BASE COMMANDER</option>
              <option value="LOGISTICS_OFFICER">LOGISTICS OFFICER</option>
            </select>
          </div>

          <div>
            <label className="block text-military-text-muted mb-1 uppercase">BASE ASSIGNMENT</label>
            <select
              value={selectedBaseId}
              onChange={(e) => {
                setSelectedBaseId(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="">ALL BASES</option>
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setPage(0);
                fetchUsers();
              }}
              className="w-full py-1.5 bg-military-green-dark hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary rounded-sm transition-colors uppercase font-bold"
            >
              APPLY FILTER
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchUsers} />}

      {/* Manifest Table */}
      <DataTable
        columns={columns}
        data={usersPage?.content || []}
        loading={loading}
        emptyMessage="No personnel records found matching filters."
        pagination={
          usersPage
            ? {
                pageNumber: usersPage.pageNumber,
                pageSize: usersPage.pageSize,
                totalElements: usersPage.totalElements,
                totalPages: usersPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `EDIT PERSONNEL FILE // ${editingUser.name}` : 'ENROLL NEW PERSONNEL / OPERATOR'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
          {formError && (
            <div className="p-3 bg-military-accent-redBg border border-military-accent-red text-red-300 rounded-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                FULL NAME & RANK *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Major John Carter"
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                SERVICE EMAIL (LOGIN ID) *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="officer@example.com"
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                SECURITY CLEARANCE ROLE *
              </label>
              <select
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              >
                <option value="ADMIN">ADMIN (FULL ACCESS)</option>
                <option value="BASE_COMMANDER">BASE COMMANDER (SINGLE BASE RESTRICTED)</option>
                <option value="LOGISTICS_OFFICER">LOGISTICS OFFICER (PROCUREMENT/TRANSFERS)</option>
              </select>
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                ASSIGNED BASE STATION {formData.role === 'BASE_COMMANDER' && '* (MANDATORY)'}
              </label>
              <select
                required={formData.role === 'BASE_COMMANDER'}
                value={formData.baseId}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              >
                <option value="">{formData.role === 'ADMIN' ? 'GLOBAL HQ / UNASSIGNED' : 'SELECT BASE...'}</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {!editingUser && (
              <div className="md:col-span-2">
                <label className="block text-military-khaki mb-1 font-semibold uppercase">
                  INITIAL SECURITY PASSCODE * (MIN 6 CHARACTERS)
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-military-green-border">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-military-green-dark hover:bg-military-green border border-military-green-border text-military-text-secondary rounded-sm transition-colors uppercase"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-military-olive hover:bg-military-olive-hover border border-military-khaki text-military-text-primary font-bold rounded-sm transition-colors uppercase disabled:opacity-50"
            >
              {submitting ? 'SAVING...' : editingUser ? 'UPDATE PERSONNEL FILE' : 'ENROLL OPERATOR'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      {resetTargetUser && (
        <Modal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          title={`OVERRIDE PASSCODE // ${resetTargetUser.name}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handlePasswordResetSubmit} className="space-y-4 font-mono text-xs">
            <p className="text-military-text-secondary">
              Set a new emergency access passcode for operator <span className="text-military-khaki font-bold">{resetTargetUser.email}</span>.
            </p>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                NEW ACCESS PASSCODE (MIN 6 CHARACTERS) *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-military-green-border">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 bg-military-green-dark hover:bg-military-green border border-military-green-border text-military-text-secondary rounded-sm transition-colors uppercase"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={resettingPassword}
                className="px-5 py-2 bg-military-accent-red hover:bg-red-800 text-white font-bold rounded-sm transition-colors uppercase disabled:opacity-50"
              >
                {resettingPassword ? 'OVERWRITING...' : 'CONFIRM RESET'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default UsersPage;
