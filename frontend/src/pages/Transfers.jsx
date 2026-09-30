import React, { useState, useEffect } from 'react';
import { transferService, baseService, equipmentTypeService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/AppLayout';
import DataTable from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import { Plus, Search, RefreshCw, ArrowLeftRight, Check, X, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

const Transfers = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [transfersPage, setTransfersPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [selectedEquipmentTypeId, setSelectedEquipmentTypeId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Create Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromBaseId: '',
    toBaseId: '',
    equipmentTypeId: '',
    quantity: '',
    transferDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    status: 'PENDING',
    remarks: ''
  });
  const [formError, setFormError] = useState('');

  // Status Update Modal
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [statusUpdateData, setStatusUpdateData] = useState({ status: '', remarks: '' });
  const [updatingStatus, setUpdatingStatus] = useState(false);

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

  const fetchTransfers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: pageSize,
        search: search || undefined,
        baseId: selectedBaseId || undefined,
        equipmentTypeId: selectedEquipmentTypeId || undefined,
        status: selectedStatus || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };
      const res = await transferService.getTransfers(params);
      if (res.success) {
        setTransfersPage(res.data);
      } else {
        setError(res.message || 'Failed to retrieve transfers');
      }
    } catch (err) {
      console.error('Error fetching transfers', err);
      setError(err.response?.data?.message || err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, [page, pageSize, selectedBaseId, selectedEquipmentTypeId, selectedStatus, fromDate, toDate]);

  const handleOpenCreate = () => {
    const defaultFrom = user?.baseId || (bases.length > 0 ? bases[0].id : '');
    const defaultTo = bases.find((b) => b.id !== Number(defaultFrom))?.id || '';

    setFormData({
      fromBaseId: defaultFrom,
      toBaseId: defaultTo,
      equipmentTypeId: equipmentTypes.length > 0 ? equipmentTypes[0].id : '',
      quantity: '5',
      transferDate: new Date().toISOString().split('T')[0],
      referenceNumber: `TR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'PENDING',
      remarks: ''
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (formData.fromBaseId === formData.toBaseId) {
      setFormError('Source and destination bases cannot be identical.');
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setFormError('Transfer quantity must be greater than zero.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        fromBaseId: Number(formData.fromBaseId),
        toBaseId: Number(formData.toBaseId),
        equipmentTypeId: Number(formData.equipmentTypeId),
        quantity: Number(formData.quantity)
      };

      const res = await transferService.createTransfer(payload);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'TRANSFER INITIATED',
          message: `Transfer manifest ${res.data.referenceNumber} created successfully.`
        });
        setIsCreateModalOpen(false);
        fetchTransfers();
      } else {
        setFormError(res.message || 'Failed to create transfer');
      }
    } catch (err) {
      console.error('Create transfer error', err);
      setFormError(err.response?.data?.message || err.message || 'Server validation error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTransfer) return;
    setUpdatingStatus(true);
    try {
      const res = await transferService.updateTransferStatus(selectedTransfer.id, {
        status: newStatus,
        remarks: statusUpdateData.remarks || `Status updated to ${newStatus}`
      });
      if (res.success) {
        showToast({
          type: 'success',
          title: 'STATUS UPDATED',
          message: `Transfer ${selectedTransfer.referenceNumber} is now ${newStatus}.`
        });
        setSelectedTransfer(null);
        fetchTransfers();
      }
    } catch (err) {
      console.error('Update transfer status error', err);
      showToast({
        type: 'error',
        title: 'STATUS UPDATE FAILED',
        message: err.response?.data?.message || err.message || 'Insufficient inventory or unauthorized'
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const columns = [
    { header: 'TRANSFER REF #', accessor: 'referenceNumber', cellClassName: 'text-military-khaki font-bold' },
    { header: 'FROM BASE (SOURCE)', accessor: 'fromBaseName' },
    { header: 'TO BASE (DESTINATION)', accessor: 'toBaseName' },
    { header: 'EQUIPMENT TYPE', accessor: 'equipmentTypeName' },
    {
      header: 'QUANTITY',
      accessor: 'quantity',
      align: 'right',
      render: (row, val) => (
        <span className="font-bold text-military-text-primary">
          {val} {row.unit}
        </span>
      )
    },
    { header: 'DATE', accessor: 'transferDate' },
    {
      header: 'STATUS',
      accessor: 'status',
      align: 'center',
      render: (row, val) => <StatusBadge status={val} />
    },
    { header: 'LOGGED BY', accessor: 'createdByName' },
    {
      header: 'ACTIONS',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => {
            setSelectedTransfer(row);
            setStatusUpdateData({ status: row.status, remarks: '' });
          }}
          className="px-2 py-0.5 bg-military-green-dark hover:bg-military-olive border border-military-green-border hover:border-military-khaki rounded-sm text-[11px] text-military-text-secondary transition-colors"
        >
          MANAGE
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-military-green-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-military-khaki">
              // INTER-BASE ASSET REDISTRIBUTION
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            TRANSFER DISPATCH & RECEIVING
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/70 text-military-text-primary font-mono text-xs uppercase font-bold rounded-sm shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>DISPATCH NEW TRANSFER</span>
          </button>

          <button
            onClick={fetchTransfers}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-military-green-surface hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary text-xs font-mono uppercase rounded-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="tactical-panel bg-military-green-surface p-4 rounded-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div className="lg:col-span-2">
            <label className="block text-military-text-muted mb-1 uppercase">SEARCH TRANSFERS</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTransfers()}
                placeholder="Search reference, remarks..."
                className="w-full pl-8 pr-3 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
              <Search className="w-3.5 h-3.5 text-military-steel-light absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-military-text-muted mb-1 uppercase">BASE FILTER</label>
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

          <div>
            <label className="block text-military-text-muted mb-1 uppercase">STATUS</label>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="">ALL STATUSES</option>
              <option value="PENDING">PENDING</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setPage(0);
                fetchTransfers();
              }}
              className="w-full py-1.5 bg-military-green-dark hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary rounded-sm transition-colors uppercase font-bold"
            >
              FILTER
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchTransfers} />}

      {/* Manifest Table */}
      <DataTable
        columns={columns}
        data={transfersPage?.content || []}
        loading={loading}
        emptyMessage="No transfer operations recorded matching filters."
        pagination={
          transfersPage
            ? {
                pageNumber: transfersPage.pageNumber,
                pageSize: transfersPage.pageSize,
                totalElements: transfersPage.totalElements,
                totalPages: transfersPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* ========================================================= */}
      {/* Create Transfer Modal Form */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="DISPATCH INTER-BASE ASSET TRANSFER"
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
                SOURCE BASE (FROM) *
              </label>
              <select
                required
                value={formData.fromBaseId}
                onChange={(e) => setFormData({ ...formData, fromBaseId: e.target.value })}
                disabled={user?.role === 'BASE_COMMANDER' || user?.role === 'LOGISTICS_OFFICER'}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki disabled:opacity-60"
              >
                <option value="">SELECT SOURCE BASE...</option>
                {bases.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                DESTINATION BASE (TO) *
              </label>
              <select
                required
                value={formData.toBaseId}
                onChange={(e) => setFormData({ ...formData, toBaseId: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              >
                <option value="">SELECT DESTINATION BASE...</option>
                {bases
                  .filter((b) => b.id !== Number(formData.fromBaseId))
                  .map((b) => (
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
                QUANTITY (UNITS) *
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
                DISPATCH DATE *
              </label>
              <input
                type="date"
                required
                value={formData.transferDate}
                onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                TRANSFER REF CODE *
              </label>
              <input
                type="text"
                required
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="TR-2026-XXXX"
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>
          </div>

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              INITIAL STATUS
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="PENDING">PENDING (In Transit / Awaiting Arrival)</option>
              <option value="COMPLETED">COMPLETED (Immediate Execution)</option>
            </select>
          </div>

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              CONVOY & LOGISTICS REMARKS
            </label>
            <textarea
              rows="3"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Convoy callsign, route details, escort notes..."
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
              {submitting ? 'DISPATCHING...' : 'DISPATCH TRANSFER'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* Transfer Details & Status Management Modal */}
      {/* ========================================================= */}
      {selectedTransfer && (
        <Modal
          isOpen={!!selectedTransfer}
          onClose={() => setSelectedTransfer(null)}
          title={`TRANSFER MANIFEST // ${selectedTransfer.referenceNumber}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-military-green-darkest border border-military-green-border rounded-sm">
              <div>
                <span className="text-military-text-muted uppercase block">TRANSFER REF #</span>
                <span className="text-military-khaki font-bold text-sm">{selectedTransfer.referenceNumber}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">CURRENT STATUS</span>
                <div className="mt-1">
                  <StatusBadge status={selectedTransfer.status} />
                </div>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">SOURCE BASE (FROM)</span>
                <span className="text-military-text-primary font-bold">{selectedTransfer.fromBaseName}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">DESTINATION BASE (TO)</span>
                <span className="text-military-text-primary font-bold">{selectedTransfer.toBaseName}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">EQUIPMENT MOVED</span>
                <span className="text-military-text-primary">{selectedTransfer.equipmentTypeName} ({selectedTransfer.equipmentCategory})</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">QUANTITY</span>
                <span className="text-military-text-primary font-bold text-sm">{selectedTransfer.quantity} {selectedTransfer.unit}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">TRANSFER DATE</span>
                <span className="text-military-text-primary">{selectedTransfer.transferDate}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">INITIATED BY</span>
                <span className="text-military-text-primary">{selectedTransfer.createdByName || 'N/A'}</span>
              </div>
            </div>

            {selectedTransfer.remarks && (
              <div className="p-3 bg-military-green-dark border border-military-green-border rounded-sm">
                <span className="text-military-khaki font-bold uppercase block mb-1">LOGISTICS REMARKS:</span>
                <p className="text-military-text-secondary">{selectedTransfer.remarks}</p>
              </div>
            )}

            {/* Status Change Action Section */}
            {selectedTransfer.status === 'PENDING' && (
              <div className="p-4 bg-military-green-dark border border-military-khaki/40 rounded-sm space-y-3">
                <span className="text-military-khaki font-bold uppercase block">
                  // COMMAND ACTIONS (UPDATE CONVOY STATUS)
                </span>
                <input
                  type="text"
                  value={statusUpdateData.remarks}
                  onChange={(e) => setStatusUpdateData({ ...statusUpdateData, remarks: e.target.value })}
                  placeholder="Optional status transition remark (e.g. Received intact at Bravo depot)"
                  className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki text-xs"
                />
                <div className="flex space-x-3 pt-1">
                  <button
                    onClick={() => handleStatusChange('COMPLETED')}
                    disabled={updatingStatus}
                    className="flex-1 py-2 bg-military-accent-green hover:bg-green-700 text-white font-bold rounded-sm uppercase tracking-wider flex items-center justify-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    <span>MARK COMPLETED (RECEIVE & UPDATE BALANCES)</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('CANCELLED')}
                    disabled={updatingStatus}
                    className="px-4 py-2 bg-military-accent-red hover:bg-red-800 text-white font-bold rounded-sm uppercase tracking-wider flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    <span>CANCEL TRANSFER</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTransfer(null)}
                className="px-4 py-2 bg-military-green-dark hover:bg-military-green border border-military-green-border text-military-text-secondary rounded-sm uppercase tracking-wider font-mono text-xs transition-colors"
              >
                CLOSE MANIFEST
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Transfers;
