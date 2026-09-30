import React, { useState, useEffect } from 'react';
import { inventoryService, baseService, equipmentTypeService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import ErrorMessage from '../components/common/ErrorMessage';
import { Search, Filter, RefreshCw, Layers } from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth();

  const [inventoryPage, setInventoryPage] = useState(null);
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

  const fetchInventory = async () => {
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

      const res = await inventoryService.getInventory(params);
      if (res.success) {
        setInventoryPage(res.data);
      } else {
        setError(res.message || 'Failed to fetch inventory ledger');
      }
    } catch (err) {
      console.error('Error fetching inventory ledger', err);
      setError(err.response?.data?.message || err.message || 'Error loading ledger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, pageSize, selectedBaseId, selectedEquipmentTypeId, fromDate, toDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchInventory();
  };

  const columns = [
    { header: 'BASE LOCATION', accessor: 'baseName' },
    { header: 'EQUIPMENT TYPE', accessor: 'equipmentTypeName' },
    { header: 'CATEGORY', accessor: 'equipmentCategory' },
    { header: 'UNIT', accessor: 'unit' },
    { header: 'OPENING', accessor: 'openingBalance', align: 'right' },
    { header: 'PURCHASES (+)', accessor: 'purchases', align: 'right' },
    { header: 'TRANSFER IN (+)', accessor: 'transferIn', align: 'right' },
    { header: 'TRANSFER OUT (-)', accessor: 'transferOut', align: 'right' },
    {
      header: 'NET MOVEMENT',
      accessor: 'netMovement',
      align: 'right',
      render: (row, val) => (
        <span className={val >= 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
          {val > 0 ? `+${val}` : val}
        </span>
      )
    },
    { header: 'ASSIGNED (-)', accessor: 'assigned', align: 'right' },
    { header: 'EXPENDED (-)', accessor: 'expended', align: 'right' },
    {
      header: 'CLOSING BALANCE',
      accessor: 'closingBalance',
      align: 'right',
      render: (row, val) => (
        <span className="text-military-khaki font-bold bg-military-green-dark px-2.5 py-1 rounded-sm border border-military-khaki/30 text-sm">
          {val}
        </span>
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
              // CENTRAL LEDGER REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            INVENTORY LEDGER & ASSET BALANCES
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchInventory}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-military-green-surface hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary text-xs font-mono uppercase rounded-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH LEDGER</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="tactical-panel bg-military-green-surface p-4 rounded-sm">
        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <label className="block text-military-text-muted mb-1 uppercase">SEARCH KEYWORD</label>
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by base, equipment name, category..."
                  className="w-full pl-8 pr-3 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
                />
                <Search className="w-3.5 h-3.5 text-military-steel-light absolute left-2.5 top-2.5" />
              </div>
            </div>

            {/* Base Selector */}
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

            {/* Equipment Type */}
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

            {/* Submit / Filter Buttons */}
            <div className="flex items-end space-x-2">
              <button
                type="submit"
                className="w-full py-1.5 bg-military-olive hover:bg-military-olive-hover border border-military-khaki/60 text-military-text-primary rounded-sm transition-colors uppercase font-bold"
              >
                APPLY SEARCH
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchInventory} />}

      {/* Manifest Table */}
      <DataTable
        columns={columns}
        data={inventoryPage?.content || []}
        loading={loading}
        emptyMessage="No ledger records match the requested search criteria."
        pagination={
          inventoryPage
            ? {
                pageNumber: inventoryPage.pageNumber,
                pageSize: inventoryPage.pageSize,
                totalElements: inventoryPage.totalElements,
                totalPages: inventoryPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default Inventory;
