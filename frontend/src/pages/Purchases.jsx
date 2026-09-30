import React, { useState, useEffect } from 'react';
import { purchaseService, baseService, equipmentTypeService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/layout/AppLayout';
import DataTable from '../components/common/DataTable';
import Modal from '../components/common/Modal';
import ErrorMessage from '../components/common/ErrorMessage';
import { Plus, Search, RefreshCw, ShoppingCart, Calendar, User, Truck } from 'lucide-react';
import { format } from 'date-fns';

const Purchases = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [purchasesPage, setPurchasesPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
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
    quantity: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    supplier: '',
    remarks: ''
  });
  const [formError, setFormError] = useState('');

  // Selected Detail Modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);

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

  const fetchPurchases = async () => {
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
      const res = await purchaseService.getPurchases(params);
      if (res.success) {
        setPurchasesPage(res.data);
      } else {
        setError(res.message || 'Failed to retrieve purchases');
      }
    } catch (err) {
      console.error('Error fetching purchases', err);
      setError(err.response?.data?.message || err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [page, pageSize, selectedBaseId, selectedEquipmentTypeId, fromDate, toDate]);

  const handleOpenCreate = () => {
    setFormData({
      baseId: user?.baseId || (bases.length > 0 ? bases[0].id : ''),
      equipmentTypeId: equipmentTypes.length > 0 ? equipmentTypes[0].id : '',
      quantity: '10',
      purchaseDate: new Date().toISOString().split('T')[0],
      referenceNumber: `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      supplier: '',
      remarks: ''
    });
    setFormError('');
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.baseId || !formData.equipmentTypeId || !formData.quantity || !formData.referenceNumber || !formData.supplier) {
      setFormError('Please fill in all mandatory required fields.');
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setFormError('Purchase quantity must be greater than zero.');
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

      const res = await purchaseService.createPurchase(payload);
      if (res.success) {
        showToast({
          type: 'success',
          title: 'PURCHASE RECORDED',
          message: `Successfully recorded acquisition ${res.data.referenceNumber}`
        });
        setIsCreateModalOpen(false);
        fetchPurchases();
      } else {
        setFormError(res.message || 'Failed to record purchase');
      }
    } catch (err) {
      console.error('Create purchase error', err);
      setFormError(err.response?.data?.message || err.message || 'Server error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { header: 'PO REF #', accessor: 'referenceNumber', cellClassName: 'text-military-khaki font-bold' },
    { header: 'BASE STATION', accessor: 'baseName' },
    { header: 'EQUIPMENT TYPE', accessor: 'equipmentTypeName' },
    { header: 'CATEGORY', accessor: 'equipmentCategory' },
    {
      header: 'QUANTITY',
      accessor: 'quantity',
      align: 'right',
      render: (row, val) => (
        <span className="text-green-400 font-bold">
          +{val} {row.unit}
        </span>
      )
    },
    { header: 'SUPPLIER', accessor: 'supplier' },
    { header: 'PURCHASE DATE', accessor: 'purchaseDate' },
    { header: 'LOGGED BY', accessor: 'createdByName' },
    {
      header: 'ACTIONS',
      align: 'center',
      render: (row) => (
        <button
          onClick={() => setSelectedPurchase(row)}
          className="px-2 py-0.5 bg-military-green-dark hover:bg-military-olive border border-military-green-border hover:border-military-khaki rounded-sm text-[11px] text-military-text-secondary transition-colors"
        >
          DETAILS
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
              // PROCUREMENT & INBOUND REPLENISHMENT
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            PURCHASE LOGISTICS MANIFEST
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          {(user?.role === 'ADMIN' || user?.role === 'LOGISTICS_OFFICER') && (
            <button
              onClick={handleOpenCreate}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/70 text-military-text-primary font-mono text-xs uppercase font-bold rounded-sm shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>RECORD NEW PURCHASE</span>
            </button>
          )}

          <button
            onClick={fetchPurchases}
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
            <label className="block text-military-text-muted mb-1 uppercase">SEARCH MANIFEST</label>
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPurchases()}
                placeholder="Search PO #, supplier, remarks..."
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
                fetchPurchases();
              }}
              className="w-full py-1.5 bg-military-green-dark hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary rounded-sm transition-colors uppercase font-bold"
            >
              FILTER RESULTS
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchPurchases} />}

      {/* Manifest Table */}
      <DataTable
        columns={columns}
        data={purchasesPage?.content || []}
        loading={loading}
        emptyMessage="No purchase orders found matching requested filters."
        pagination={
          purchasesPage
            ? {
                pageNumber: purchasesPage.pageNumber,
                pageSize: purchasesPage.pageSize,
                totalElements: purchasesPage.totalElements,
                totalPages: purchasesPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />

      {/* ========================================================= */}
      {/* Create Purchase Modal Form */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="RECORD PROCUREMENT / PURCHASE ORDER"
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
                TARGET BASE STATION *
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
                PURCHASE ORDER DATE *
              </label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                PO REFERENCE CODE *
              </label>
              <input
                type="text"
                required
                value={formData.referenceNumber}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                placeholder="PO-2026-XXXX"
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>

            <div>
              <label className="block text-military-khaki mb-1 font-semibold uppercase">
                AUTHORIZED SUPPLIER / VENDOR *
              </label>
              <input
                type="text"
                required
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g. Oshkosh Defense, Harris RF..."
                className="w-full px-3 py-2 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
              />
            </div>
          </div>

          <div>
            <label className="block text-military-khaki mb-1 font-semibold uppercase">
              REMARKS & LOGISTICS NOTES
            </label>
            <textarea
              rows="3"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Delivery batch, condition on arrival, contract details..."
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
              {submitting ? 'RECORDING ORDER...' : 'RECORD PURCHASE'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* Purchase Details Modal */}
      {/* ========================================================= */}
      {selectedPurchase && (
        <Modal
          isOpen={!!selectedPurchase}
          onClose={() => setSelectedPurchase(null)}
          title={`PURCHASE MANIFEST // ${selectedPurchase.referenceNumber}`}
        >
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-military-green-darkest border border-military-green-border rounded-sm">
              <div>
                <span className="text-military-text-muted uppercase block">PO REFERENCE</span>
                <span className="text-military-khaki font-bold text-sm">{selectedPurchase.referenceNumber}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">BASE STATION</span>
                <span className="text-military-text-primary font-bold">{selectedPurchase.baseName}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">EQUIPMENT</span>
                <span className="text-military-text-primary">{selectedPurchase.equipmentTypeName} ({selectedPurchase.equipmentCategory})</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">QUANTITY ACQUIRED</span>
                <span className="text-green-400 font-bold text-sm">+{selectedPurchase.quantity} {selectedPurchase.unit}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">SUPPLIER</span>
                <span className="text-military-text-primary">{selectedPurchase.supplier}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">PURCHASE DATE</span>
                <span className="text-military-text-primary">{selectedPurchase.purchaseDate}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">RECORDED BY</span>
                <span className="text-military-text-primary">{selectedPurchase.createdByName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-military-text-muted uppercase block">SYSTEM TIMESTAMP</span>
                <span className="text-military-text-primary">{selectedPurchase.createdAt ? format(new Date(selectedPurchase.createdAt), 'yyyy-MM-dd HH:mm:ss') : '-'}</span>
              </div>
            </div>

            {selectedPurchase.remarks && (
              <div className="p-3 bg-military-green-dark border border-military-green-border rounded-sm">
                <span className="text-military-khaki font-bold uppercase block mb-1">REMARKS / NOTES:</span>
                <p className="text-military-text-secondary">{selectedPurchase.remarks}</p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-2 bg-military-olive hover:bg-military-olive-hover border border-military-khaki text-military-text-primary rounded-sm uppercase tracking-wider font-mono text-xs font-semibold transition-colors"
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

export default Purchases;
