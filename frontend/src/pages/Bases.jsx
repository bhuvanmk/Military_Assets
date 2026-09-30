import React, { useState, useEffect } from 'react';
import { baseService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/AppLayout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import { Plus, Search, RefreshCw, Building2 } from 'lucide-react';

const BasesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [basesPage, setBasesPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBase, setEditingBase] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    active: true
  });
  const [formError, setFormError] = useState('');

  const fetchBases = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await baseService.getAllAdminBases({
        page,
        size: pageSize,
        search: search || undefined
      });
      if (res.success) {
        setBasesPage(res.data);
      } else {
        setError(res.message || 'Failed to retrieve bases');
      }
    } catch (err) {
      console.error('Error fetching bases', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBases();
  }, [page, pageSize]);

  const handleOpenCreate = () => {
    setEditingBase(null);
    setFormData({ name: '', location: '', description: '', active: true });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b) => {
    setEditingBase(b);
    setFormData({
      name: b.name,
      location: b.location,
      description: b.description || '',
      active: b.active
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.location) {
      setFormError('Base name and location are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingBase) {
        const res = await baseService.updateBase(editingBase.id, formData);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'BASE UPDATED',
            message: `Base station ${res.data.name} modified successfully.`
          });
          setIsModalOpen(false);
          fetchBases();
        }
      } else {
        const res = await baseService.createBase(formData);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'BASE INITIALIZED',
            message: `New base station ${res.data.name} established in network.`
          });
          setIsModalOpen(false);
          fetchBases();
        }
      }
    } catch (err) {
      console.error('Save base error', err);
      setFormError(err.response?.data?.message || err.message || 'Error saving base');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', cellClassName: 'text-military-khaki' },
    { header: 'BASE STATION NAME', accessor: 'name', cellClassName: 'font-bold text-military-text-primary' },
    { header: 'TACTICAL SECTOR / LOCATION', accessor: 'location' },
    { header: 'DESCRIPTION', accessor: 'description', cellClassName: 'max-w-xs truncate' },
    {
      header: 'OPERATIONAL STATUS',
      accessor: 'active',
      align: 'center',
      render: (row, val) => <StatusBadge status={val} />
    },
    {
      header: 'ACTIONS',
      align: 'right',
      render: (row) => (
        <button
          onClick={() => handleOpenEdit(row)}
          className="px-2.5 py-1 bg-military-green-dark hover:bg-military-olive border border-military-green-border hover:border-military-khaki rounded-sm text-[11px] text-military-text-secondary transition-colors"
        >
          EDIT
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-military-green-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-military-accent-amber font-semibold">
              // COMMAND & CONTROL // INSTALLATION REGISTRY
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            TACTICAL BASE STATIONS
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/70 text-military-text-primary font-mono text-xs uppercase font-bold rounded-sm shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ESTABLISH NEW BASE</span>
          </button>

          <button
            onClick={fetchBases}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-military-green-surface hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary text-xs font-mono uppercase rounded-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="tactical-panel bg-military-green-surface p-4 rounded-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(0);
            fetchBases();
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search base name or sector coordinates..."
              className="w-full pl-8 pr-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary text-xs font-mono rounded-sm focus:outline-none focus:border-military-khaki"
            />
            <Search className="w-3.5 h-3.5 text-military-steel-light absolute left-2.5 top-3" />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-military-olive hover:bg-military-olive-hover border border-military-khaki text-military-text-primary font-mono text-xs font-bold uppercase rounded-sm transition-colors"
          >
            SEARCH
          </button>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchBases} />}

      <DataTable
        columns={columns}
        data={basesPage?.content || []}
        loading={loading}
        emptyMessage="No base stations found."
        pagination={
          basesPage
            ? {
                pageNumber: basesPage.pageNumber,
                pageSize: basesPage.pageSize,
                totalElements: basesPage.totalElements,
                totalPages: basesPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create / Edit Base Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBase ? `CONFIGURE BASE // ${editingBase.name}` : 'ESTABLISH NEW BASE STATION'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
          {formError && (
            <div className="p-3 bg-military-accent-redBg border border-military-accent-red text-red-300 rounded-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              BASE DESIGNATION NAME *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Delta Outpost"
              className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              SECTOR / GEOGRAPHICAL LOCATION *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Sector 12 - Western Highlands"
              className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              TACTICAL DESCRIPTION & MISSION
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Primary logistics hub, radar outpost, airfield..."
              className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="baseActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded bg-military-green-darkest border-military-green-border text-military-olive focus:ring-military-khaki"
            />
            <label htmlFor="baseActive" className="text-military-text-secondary uppercase">
              ACTIVE OPERATIONAL STATUS
            </label>
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
              {submitting ? 'SAVING...' : editingBase ? 'UPDATE BASE' : 'ESTABLISH BASE'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BasesPage;
