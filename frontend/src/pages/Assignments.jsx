import React, { useState, useEffect } from 'react';
import { assignmentService, baseService, equipmentTypeService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/AppLayout';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import { Plus, Search, RefreshCw, UserCheck } from 'lucide-react';
import { format } from 'date-fns';

const Assignments = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [assignmentsPage, setAssignmentsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [selectedEquipmentTypeId, setSelectedEquipmentTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Modal / Form state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    baseId: '',
    equipmentTypeId: '',
    personnelName: '',
    quantity: '',
    assignmentDate: new Date().toISOString().split('T')[0],
    remarks: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [basesRes, eqRes] = await Promise.all([
          baseService.getActiveBases(),
          equipmentTypeService.getActiveEquipmentTypes()
        ]);
        if (basesRes.success) setBases(basesRes.data || []);
        if (eqRes.success) setEquipmentTypes(eqRes.data || []);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    loadOptions();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: pageSize,
        search: search || undefined,
        baseId: selectedBaseId || undefined,
        equipmentTypeId: selectedEquipmentTypeId || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };
      const res = await assignmentService.getAssignments(params);
      if (res.success) {
        setAssignmentsPage(res.data);
      } else {
        setError(res.message || 'Failed to retrieve assignments');
      }
    } catch (err) {
      console.error('Error fetching assignments', err);
      setError(err.response?.data?.message || err.message || 'Error loading assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [page, pageSize, selectedBaseId, selectedEquipmentTypeId, fromDate, toDate]);

  const handleOpenCreate = () => {
    setFormData({
      baseId: user?.baseId || (bases.length > 0 ? bases[0].id : ''),
      equipmentTypeId: equipmentTypes.length > 0 ? equipmentTypes[0].id : '',
      personnelName: '',
      quantity: '1',
      assignmentDate: new Date().toISOString().split('T')[0],
      remarks: ''
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.baseId || !formData.equipmentTypeId || !formData.personnelName || !formData.quantity) {
      setFormError('Please fill in all mandatory fields.');
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setFormError('Assignment quantity must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        baseId: Number(formData.baseId),
        equipmentTypeId: Number(formData.equipmentTypeId),
        quantity: Number(formData.quantity)
      };

      const res = await assignmentService.createAssignment(payload);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'ASSET ASSIGNED',
          message: `Successfully issued ${payload.quantity} units to ${payload.personnelName}`
        });
        setIsCreateModalOpen(false);
        fetchAssignments();
      } else {
        setFormError(res.message || 'Failed to record assignment');
      }
    } catch (err) {
      console.error('Create assignment error', err);
      setFormError(err.response?.data?.message || err.message || 'Error occurred (verify sufficient available inventory)');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'ID', accessor: 'id', cellClassName: 'text-military-khaki' },
    { header: 'BASE STATION', accessor: 'baseName' },
    { header: 'ASSIGNED PERSONNEL / SQUAD', accessor: 'personnelName', cellClassName: 'font-bold text-military-text-primary' },
    { header: 'EQUIPMENT TYPE', accessor: 'equipmentTypeName' },
    { header: 'CATEGORY', accessor: 'equipmentCategory' },
    {
      header: 'QUANTITY',
      accessor: 'quantity',
      align: 'right',
      render: (row, val) => (
        <span className="text-military-accent-amber font-bold">
          -{val} {row.unit}
        </span>
      )
    },
    { header: 'ASSIGNMENT DATE', accessor: 'assignmentDate' },
    ...(user?.role !== 'LOGISTICS_OFFICER'
      ? [
          { header: 'REMARKS / REASON', accessor: 'remarks', cellClassName: 'max-w-xs truncate' },
          { header: 'LOGGED BY', accessor: 'createdByName' }
        ]
      : [
          {
            header: 'REMARKS / REASON',
            accessor: 'remarks',
            render: () => <span className="text-military-text-muted italic">[RESTRICTED]</span>
          },
          {
            header: 'LOGGED BY',
            accessor: 'createdByName',
            render: () => <span className="text-military-text-muted italic">[RESTRICTED]</span>
          }
        ])
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-military-green-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-military-khaki">
              // FIELD DEPLOYMENT & PERSONNEL ISSUANCE
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            EQUIPMENT ASSIGNMENTS MANIFEST
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {(user?.role === 'ADMIN' || user?.role === 'BASE_COMMANDER') && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/70 text-military-text-primary font-mono text-xs uppercase font-bold rounded-sm shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ISSUE NEW ASSIGNMENT</span>
            </button>
          )}

          <button
            onClick={fetchAssignments}
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
            <label className="block text-military-text-muted mb-1 uppercase">SEARCH PERSONNEL OR REMARKS</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchAssignments()}
                placeholder="Search squad leader, personnel name, remarks..."
                className="w-full pl-8 pr-3 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
              <Search className="w-3.5 h-3.5 text-military-steel-light absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-military-text-muted mb-1 uppercase">BASE LOCATION</label>
            <select
              value={selectedBaseId}
              onChange={(e) => {
                setSelectedBaseId(e.target.value);
                setPage(0);
              }}
              disabled={user?.role === 'BASE_COMMANDER' || user?.role === 'LOGISTICS_OFFICER'}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki disabled:opacity-60"
            >
              {user?.role === 'ADMIN' && <option value="">ALL BASES</option>}
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-military-text-muted mb-1 uppercase">EQUIPMENT TYPE</label>
            <select
              value={selectedEquipmentTypeId}
              onChange={(e) => {
                setSelectedEquipmentTypeId(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="">ALL TYPES</option>
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setPage(0);
                fetchAssignments();
              }}
              className="w-full py-1.5 bg-military-green-dark hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary rounded-sm transition-colors uppercase font-bold"
            >
              FILTER RESULTS
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchAssignments} />}

      {/* Manifest Table */}
      <DataTable
        columns={columns}
        data={assignmentsPage?.content || []}
        loading={loading}
        emptyMessage="No equipment assignments recorded matching the query."
        pagination={
          assignmentsPage
            ? {
                pageNumber: assignmentsPage.pageNumber,
                pageSize: assignmentsPage.pageSize,
                totalElements: assignmentsPage.totalElements,
                totalPages: assignmentsPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* Create Assignment Modal Form */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="ISSUE ASSET ASSIGNMENT TO PERSONNEL"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 font-mono text-xs">
          {formError && (
            <div className="p-3 bg-military-accent-redBg border border-military-accent-red text-red-300 rounded-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                ISSUING BASE STATION *
              </label>
              <select
                required
                value={formData.baseId}
                onChange={(e) => setFormData({ ...formData, baseId: e.target.value })}
                disabled={user?.role === 'BASE_COMMANDER' || user?.role === 'LOGISTICS_OFFICER'}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki disabled:opacity-60"
              >
                <option value="">SELECT BASE...</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                EQUIPMENT TYPE *
              </label>
              <select
                required
                value={formData.equipmentTypeId}
                onChange={(e) => setFormData({ ...formData, equipmentTypeId: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              >
                <option value="">SELECT EQUIPMENT TYPE...</option>
                {equipmentTypes.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.name} ({eq.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                PERSONNEL NAME / CALLSIGN *
              </label>
              <input
                type="text"
                required
                value={formData.personnelName}
                onChange={(e) => setFormData({ ...formData, personnelName: e.target.value })}
                placeholder="e.g. Captain Miller, Recon Squad Bravo"
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                QUANTITY TO ASSIGN *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                ASSIGNMENT DATE *
              </label>
              <input
                type="date"
                required
                value={formData.assignmentDate}
                onChange={(e) => setFormData({ ...formData, assignmentDate: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>
          </div>

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              MISSION OBJECTIVE & REMARKS
            </label>
            <textarea
              rows="3"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Operational deployment reason, expected return date..."
              className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-military-green-border">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 bg-military-green-dark hover:bg-military-green border border-military-green-border text-military-text-secondary rounded-sm transition-colors uppercase"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-military-olive hover:bg-military-olive-hover border border-military-khaki text-military-text-primary font-bold rounded-sm transition-colors uppercase disabled:opacity-50"
            >
              {submitting ? 'VALIDATING INVENTORY...' : 'ISSUE ASSET'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Assignments;
