import React, { useState, useEffect } from 'react';
import { dashboardService, baseService, equipmentTypeService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import MetricCard from '../components/common/MetricCard';
import Modal from '../components/common/Modal';
import DataTable from '../components/common/DataTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import {
  Package,
  ShoppingCart,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  Flame,
  CheckCircle2,
  Filter,
  RefreshCw,
  Calculator,
  PieChart as PieIcon,
  BarChart3
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard = () => {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [selectedBaseId, setSelectedBaseId] = useState('');
  const [selectedEquipmentTypeId, setSelectedEquipmentTypeId] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Formula Modal State
  const [isFormulaModalOpen, setIsFormulaModalOpen] = useState(false);

  // Load filter lists
  useEffect(() => {
    const loadFilterOptions = async () => {
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
    loadFilterOptions();
  }, []);

  // Fetch Dashboard Metrics
  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedBaseId) params.baseId = selectedBaseId;
      if (selectedEquipmentTypeId) params.equipmentTypeId = selectedEquipmentTypeId;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await dashboardService.getDashboard(params);
      if (res.success) {
        setData(res.data);
      } else {
        setError(res.message || 'Failed to retrieve dashboard metrics');
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to Command HQ');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [selectedBaseId, selectedEquipmentTypeId, fromDate, toDate]);

  const handleResetFilters = () => {
    setSelectedBaseId('');
    setSelectedEquipmentTypeId('');
    setFromDate('');
    setToDate('');
  };

  const COLORS = ['#C2B280', '#4B5320', '#626B2E', '#E0A100', '#2B6CB0', '#4A5259'];

  const inventoryColumns = [
    { header: 'BASE STATION', accessor: 'baseName' },
    { header: 'EQUIPMENT TYPE', accessor: 'equipmentTypeName' },
    { header: 'CATEGORY', accessor: 'equipmentCategory' },
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
        <span className="text-military-khaki font-bold bg-military-green-dark px-2 py-0.5 rounded-sm border border-military-khaki/30">
          {val}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with Title and Designation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-military-green-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-military-khaki">
              // SECTOR LOGISTICS HEADQUARTERS
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            OPERATIONAL ASSET DASHBOARD
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchDashboard}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-military-green-surface hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary text-xs font-mono uppercase rounded-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC DATA</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="tactical-panel bg-military-green-surface p-4 rounded-sm">
        <div className="flex items-center space-x-2 mb-3 text-xs font-mono uppercase text-military-khaki font-semibold">
          <Filter className="w-4 h-4 text-military-khaki" />
          <span>TACTICAL FILTERS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          {/* Base Selector */}
          <div>
            <label className="block text-military-text-muted mb-1 uppercase">BASE LOCATION</label>
            <select
              value={selectedBaseId}
              onChange={(e) => setSelectedBaseId(e.target.value)}
              disabled={user?.role === 'BASE_COMMANDER' || user?.role === 'LOGISTICS_OFFICER'}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki disabled:opacity-60"
            >
              {user?.role === 'ADMIN' && <option value="">ALL BASES (GLOBAL)</option>}
              {bases.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Equipment Type Selector */}
          <div>
            <label className="block text-military-text-muted mb-1 uppercase">EQUIPMENT TYPE</label>
            <select
              value={selectedEquipmentTypeId}
              onChange={(e) => setSelectedEquipmentTypeId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="">ALL EQUIPMENT TYPES</option>
              {equipmentTypes.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.name.toUpperCase()} ({eq.category})
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-military-text-muted mb-1 uppercase">DATE RANGE (FROM)</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-military-text-muted mb-1 uppercase">DATE RANGE (TO)</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            />
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            <button
              onClick={handleResetFilters}
              className="w-full py-1.5 bg-military-green-dark hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary rounded-sm transition-colors"
            >
              CLEAR FILTERS
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchDashboard} />}

      {loading && !data ? (
        <LoadingSpinner message="CALCULATING INVENTORY BALANCES..." />
      ) : (
        <>
          {/* ========================================================= */}
          {/* 8 Metric Status Panels Layout (Exact User Layout Spec) */}
          {/* Row 1: Opening | Purchases | Transfer In */}
          {/* Row 2: Transfer Out | Net Movement */}
          {/* Row 3: Assigned | Expended | Closing */}
          {/* ========================================================= */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono uppercase tracking-widest text-military-khaki font-semibold">
                // 8-FACTOR INVENTORY BALANCE OVERVIEW
              </h2>
              <span className="text-[11px] font-mono text-military-text-muted">
                SCOPE: {data?.baseName || 'ALL BASES'} &bull; {data?.equipmentTypeName || 'ALL EQUIPMENT'}
              </span>
            </div>

            {/* Row 1: Opening Balance | Purchases | Transfer In */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="1. OPENING BALANCE"
                value={data?.openingBalance}
                subtext="Stored baseline balance"
                icon={Package}
                variant="default"
              />
              <MetricCard
                title="2. PURCHASES (+)"
                value={data?.purchases}
                subtext="Newly procured units"
                icon={ShoppingCart}
                variant="success"
              />
              <MetricCard
                title="3. TRANSFER IN (+)"
                value={data?.transferIn}
                subtext="Inbound completed transfers"
                icon={ArrowDownLeft}
                variant="success"
              />
            </div>

            {/* Row 2: Transfer Out | Net Movement */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MetricCard
                title="4. TRANSFER OUT (-)"
                value={data?.transferOut}
                subtext="Outbound completed transfers"
                icon={ArrowUpRight}
                variant="danger"
              />
              <MetricCard
                title="5. NET MOVEMENT"
                value={data?.netMovement}
                subtext="Purchases + Transfer In - Transfer Out"
                icon={TrendingUp}
                variant="highlight"
                isClickable={true}
                onClick={() => setIsFormulaModalOpen(true)}
              />
            </div>

            {/* Row 3: Assigned | Expended | Closing Balance */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                title="6. ASSIGNED (-)"
                value={data?.assigned}
                subtext="Deployed to personnel"
                icon={UserCheck}
                variant="amber"
              />
              <MetricCard
                title="7. EXPENDED (-)"
                value={data?.expended}
                subtext="Consumed, damaged, retired"
                icon={Flame}
                variant="danger"
              />
              <MetricCard
                title="8. CLOSING BALANCE"
                value={data?.closingBalance}
                subtext="Final operational inventory"
                icon={CheckCircle2}
                variant="primary"
              />
            </div>
          </div>

          {/* Visualization Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Category Distribution Chart */}
            <div className="tactical-panel bg-military-green-surface p-5 rounded-sm">
              <div className="flex items-center justify-between mb-4 border-b border-military-green-border pb-2">
                <div className="flex items-center space-x-2">
                  <PieIcon className="w-4 h-4 text-military-khaki" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-military-khaki font-bold">
                    // CATEGORY DISTRIBUTION (CLOSING BALANCE)
                  </h3>
                </div>
              </div>
              <div className="h-64">
                {data?.categoryDistribution && data.categoryDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                        nameKey="category"
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {data.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E251A',
                          borderColor: '#384632',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#F0F2EB'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-military-text-muted">
                    NO CATEGORY DATA AVAILABLE
                  </div>
                )}
              </div>
            </div>

            {/* Inventory Movements Chart */}
            <div className="tactical-panel bg-military-green-surface p-5 rounded-sm">
              <div className="flex items-center justify-between mb-4 border-b border-military-green-border pb-2">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-military-khaki" />
                  <h3 className="text-xs font-mono uppercase tracking-wider text-military-khaki font-bold">
                    // EQUIPMENT INVENTORY COMPARISON
                  </h3>
                </div>
              </div>
              <div className="h-64">
                {data?.monthlyActivity && data.monthlyActivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyActivity}>
                      <XAxis dataKey="name" stroke="#8E9689" fontSize={10} fontFamily="monospace" />
                      <YAxis stroke="#8E9689" fontSize={10} fontFamily="monospace" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E251A',
                          borderColor: '#384632',
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          color: '#F0F2EB'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                      <Bar dataKey="closing" name="Closing" fill="#C2B280" />
                      <Bar dataKey="purchases" name="Purchases" fill="#4B5320" />
                      <Bar dataKey="assigned" name="Assigned" fill="#E0A100" />
                      <Bar dataKey="expended" name="Expended" fill="#B3261E" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-military-text-muted">
                    NO ACTIVITY DATA AVAILABLE
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Detailed Ledger Manifest Table */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono uppercase tracking-widest text-military-khaki font-semibold">
                // COMPREHENSIVE INVENTORY MANIFEST
              </h3>
            </div>
            <DataTable
              columns={inventoryColumns}
              data={data?.inventorySummary || []}
              loading={loading}
              emptyMessage="No inventory positions found matching filter parameters."
            />
          </div>
        </>
      )}

      {/* ========================================================= */}
      {/* Net Movement Interactive Formula Popup Modal */}
      {/* ========================================================= */}
      <Modal
        isOpen={isFormulaModalOpen}
        onClose={() => setIsFormulaModalOpen(false)}
        title="NET MOVEMENT CALCULATION BREAKDOWN"
        maxWidth="max-w-xl"
      >
        <div className="space-y-4 font-mono text-xs text-military-text-primary">
          <div className="p-3 bg-military-green-dark border border-military-khaki/30 rounded-sm">
            <p className="text-military-khaki font-bold uppercase tracking-wider mb-1">
              [FORMULA SPECIFICATION]
            </p>
            <p className="text-military-text-secondary leading-relaxed">
              Net Movement represents the net additions or deductions of assets to the base within the selected timeframe:
            </p>
            <div className="my-2 p-2 bg-military-green-darkest border border-military-green-border text-center text-sm font-bold text-military-khaki">
              Net Movement = Purchases + Transfer In - Transfer Out
            </div>
          </div>

          {data && (
            <div className="p-4 bg-military-green-darkest border border-military-green-border rounded-sm space-y-2">
              <div className="text-xs uppercase text-military-text-muted font-bold mb-2">
                ACTIVE COMPUTATION FOR SELECTED SCOPE:
              </div>

              <div className="flex items-center justify-between border-b border-military-green-border/60 pb-1">
                <span className="text-green-400">Purchases (+)</span>
                <span className="font-bold text-green-400">{data.purchases}</span>
              </div>

              <div className="flex items-center justify-between border-b border-military-green-border/60 pb-1">
                <span className="text-green-400">Transfer In (+)</span>
                <span className="font-bold text-green-400">{data.transferIn}</span>
              </div>

              <div className="flex items-center justify-between border-b border-military-green-border/60 pb-1">
                <span className="text-red-400">Transfer Out (-)</span>
                <span className="font-bold text-red-400">{data.transferOut}</span>
              </div>

              <div className="flex items-center justify-between pt-2 text-sm font-bold text-military-khaki">
                <span>Total Net Movement:</span>
                <span>
                  {data.purchases} + {data.transferIn} - {data.transferOut} ={' '}
                  <span className="underline">{data.netMovement}</span>
                </span>
              </div>
            </div>
          )}

          <div className="p-3 bg-military-olive/20 border border-military-olive rounded-sm text-[11px] text-military-text-secondary">
            <span className="text-military-khaki font-bold">NOTE ON TRANSFERS:</span> In accordance with Command Directives, only <span className="text-green-400 font-bold">COMPLETED</span> status transfers are factored into Transfer In / Transfer Out balances. Pending transfers remain in quarantine.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setIsFormulaModalOpen(false)}
              className="px-4 py-2 bg-military-olive hover:bg-military-olive-hover border border-military-khaki text-military-text-primary rounded-sm uppercase tracking-wider font-mono text-xs font-semibold transition-colors"
            >
              ACKNOWLEDGE & CLOSE
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
