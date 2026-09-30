import React, { useState, useEffect } from 'react';
import { equipmentTypeService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/AppLayout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import { Plus, Search, RefreshCw, Cpu } from 'lucide-react';

const EquipmentTypesPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [equipmentPage, setEquipmentPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Vehicles',
    unit: 'Units',
    description: '',
    active: true
  });
  const [formError, setFormError] = useState('');

  const fetchEquipmentTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await equipmentTypeService.getAllAdminEquipmentTypes({
        page,
        size: pageSize,
        search: search || undefined
      });
      if (res.success) {
        setEquipmentPage(res.data);
      } else {
        setError(res.message || 'Failed to retrieve equipment types');
      }
    } catch (err) {
      console.error('Error fetching equipment types', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentTypes();
  }, [page, pageSize]);

  const handleOpenCreate = () => {
    setEditingEquipment(null);
    setFormData({
      name: '',
      category: 'Vehicles',
      unit: 'Units',
      description: '',
      active: true
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (eq) => {
    setEditingEquipment(eq);
    setFormData({
      name: eq.name,
      category: eq.category,
      unit: eq.unit,
      description: eq.description || '',
      active: eq.active
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name || !formData.category || !formData.unit) {
      setFormError('Equipment name, category, and unit are required.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingEquipment) {
        const res = await equipmentTypeService.updateEquipmentType(editingEquipment.id, formData);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'EQUIPMENT UPDATED',
            message: `Equipment specification ${res.data.name} modified.`
          });
          setIsModalOpen(false);
          fetchEquipmentTypes();
        }
      } else {
        const res = await equipmentTypeService.createEquipmentType(formData);
        if (res.success) {
          showToast({
            type: 'success',
            title: 'EQUIPMENT CATALOGUED',
            message: `Registered ${res.data.name} in central inventory catalogue.`
          });
          setIsModalOpen(false);
          fetchEquipmentTypes();
        }
      }
    } catch (err) {
      console.error('Save equipment error', err);
      setFormError(err.response?.data?.message || err.message || 'Error saving equipment type');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', cellClassName: 'text-military-khaki' },
    { header: 'EQUIPMENT NAME / MODEL', accessor: 'name', cellClassName: 'font-bold text-military-text-primary' },
    { header: 'LOGISTICAL CATEGORY', accessor: 'category', cellClassName: 'text-military-khaki font-semibold' },
    { header: 'STANDARD UNIT', accessor: 'unit' },
    { header: 'TECHNICAL DESCRIPTION', accessor: 'description', cellClassName: 'max-w-xs truncate' },
    {
      header: 'CATALOGUE STATUS',
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
              // COMMAND & CONTROL // SPECIFICATION CATALOGUE
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            EQUIPMENT & ASSET TYPES
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/70 text-military-text-primary font-mono text-xs uppercase font-bold rounded-sm shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>CATALOGUE NEW EQUIPMENT</span>
          </button>

          <button
            onClick={fetchEquipmentTypes}
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
            fetchEquipmentTypes();
          }}
          className="flex gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search equipment name or category..."
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

      {error && <ErrorMessage message={error} onRetry={fetchEquipmentTypes} />}

      <DataTable
        columns={columns}
        data={equipmentPage?.content || []}
        loading={loading}
        emptyMessage="No equipment types catalogued."
        pagination={
          equipmentPage
            ? {
                pageNumber: equipmentPage.pageNumber,
                pageSize: equipmentPage.pageSize,
                totalElements: equipmentPage.totalElements,
                totalPages: equipmentPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create / Edit Equipment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEquipment ? `EDIT SPECIFICATION // ${editingEquipment.name}` : 'REGISTER EQUIPMENT TYPE'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 font-mono text-xs">
          {formError && (
            <div className="p-3 bg-military-accent-redBg border border-military-accent-red text-red-300 rounded-sm">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              EQUIPMENT MODEL / TITLE *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Tactical All-Terrain Vehicle"
              className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                CATEGORY *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              >
                <option value="Vehicles">Vehicles</option>
                <option value="Safety & Medical">Safety & Medical</option>
                <option value="Communications">Communications</option>
                <option value="Protective Gear">Protective Gear</option>
                <option value="Tactical Gear">Tactical Gear</option>
              </select>
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                MEASUREMENT UNIT *
              </label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="Units, Sets, Kits, Boxes..."
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>
          </div>

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              SPECIFICATION & MAINTENANCE DETAILS
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Operational capabilities, weight class, frequency specs..."
              className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="eqActive"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="rounded bg-military-green-darkest border-military-green-border text-military-olive focus:ring-military-khaki"
            />
            <label htmlFor="eqActive" className="text-military-text-secondary uppercase">
              ACTIVE IN EQUIPMENT INVENTORY
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
              {submitting ? 'SAVING...' : editingEquipment ? 'UPDATE SPECIFICATION' : 'CATALOGUE EQUIPMENT'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EquipmentTypesPage;
