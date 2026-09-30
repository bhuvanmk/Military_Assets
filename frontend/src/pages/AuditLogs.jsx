import React, { useState, useEffect } from 'react';
import { auditLogService } from '../services/apiServices';
import { useAuth } from '../context/AuthContext';
import DataTable from '../components/common/DataTable';
import ErrorMessage from '../components/common/ErrorMessage';
import { Search, RefreshCw, FileText, Filter, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';

const AuditLogsPage = () => {
  const { user } = useAuth();

  const [logsPage, setLogsPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const fetchAuditLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        size: pageSize,
        action: actionFilter || undefined,
        entityType: entityFilter || undefined
      };
      const res = await auditLogService.getAuditLogs(params);
      if (res.success) {
        setLogsPage(res.data);
      } else {
        setError(res.message || 'Failed to retrieve audit trail');
      }
    } catch (err) {
      console.error('Error fetching audit logs', err);
      setError(err.response?.data?.message || err.message || 'Error connecting to audit service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, pageSize, actionFilter, entityFilter]);

  const getActionBadgeClass = (action) => {
    if (action.includes('CREATED') || action.includes('LOGIN')) {
      return 'text-green-400 bg-military-accent-greenBg border-military-accent-green/60';
    }
    if (action.includes('UPDATED') || action.includes('STATUS')) {
      return 'text-military-accent-amber bg-military-accent-amberBg border-military-accent-amber/60';
    }
    if (action.includes('CANCELLED') || action.includes('RESET') || action.includes('DELETED')) {
      return 'text-red-400 bg-military-accent-redBg border-military-accent-red/60';
    }
    return 'text-military-khaki bg-military-green-dark border-military-green-border';
  };

  const columns = [
    { header: 'EVENT ID', accessor: 'id', cellClassName: 'text-military-khaki' },
    {
      header: 'SECURITY ACTION',
      accessor: 'action',
      render: (row, val) => (
        <span className={`px-2 py-0.5 rounded-sm font-bold border text-[10px] ${getActionBadgeClass(val)}`}>
          {val}
        </span>
      )
    },
    { header: 'TARGET ENTITY', accessor: 'entityType', cellClassName: 'font-bold text-military-text-primary' },
    { header: 'ENTITY REF ID', accessor: 'entityId', render: (r, v) => v || '-' },
    { header: 'AUDIT DESCRIPTION / EVENT TRAIL', accessor: 'description', cellClassName: 'max-w-md' },
    {
      header: 'OPERATOR',
      accessor: 'userName',
      render: (row) => row.userName ? `${row.userName} (${row.userEmail})` : 'SYSTEM KERNEL'
    },
    { header: 'IP ADDRESS', accessor: 'ipAddress' },
    {
      header: 'TIMESTAMP (UTC)',
      accessor: 'createdAt',
      render: (row, val) => val ? format(new Date(val), 'yyyy-MM-dd HH:mm:ss') : '-'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-4 border-b border-military-green-border gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono uppercase tracking-widest text-military-accent-amber font-semibold">
              // COMMAND & CONTROL // SECURITY AUDIT TRAIL
            </span>
          </div>
          <h1 className="text-2xl font-stencil uppercase tracking-wider text-military-text-primary font-bold mt-0.5">
            IMMUTABLE SECURITY EVENT LOGS
          </h1>
          <p className="text-xs font-mono text-military-text-muted mt-0.5">
            System-wide auditable event registry. Read-only by High Command.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={fetchAuditLogs}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-military-green-surface hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary text-xs font-mono uppercase rounded-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SYNC LOGS</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="tactical-panel bg-military-green-surface p-4 rounded-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="block text-military-text-muted mb-1 uppercase">FILTER BY ACTION TYPE</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="">ALL ACTIONS</option>
              <option value="USER_LOGIN">USER_LOGIN</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="USER_UPDATED">USER_UPDATED</option>
              <option value="PURCHASE_CREATED">PURCHASE_CREATED</option>
              <option value="TRANSFER_CREATED">TRANSFER_CREATED</option>
              <option value="TRANSFER_UPDATED">TRANSFER_UPDATED</option>
              <option value="ASSIGNMENT_CREATED">ASSIGNMENT_CREATED</option>
              <option value="EXPENDITURE_CREATED">EXPENDITURE_CREATED</option>
              <option value="BASE_CREATED">BASE_CREATED</option>
              <option value="EQUIPMENT_CREATED">EQUIPMENT_CREATED</option>
              <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            </select>
          </div>

          <div>
            <label className="block text-military-text-muted mb-1 uppercase">FILTER BY ENTITY TYPE</label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(0);
              }}
              className="w-full px-2.5 py-1.5 bg-military-green-darkest border border-military-green-border text-military-text-primary rounded-sm focus:outline-none focus:border-military-khaki"
            >
              <option value="">ALL ENTITIES</option>
              <option value="USER">USER</option>
              <option value="PURCHASE">PURCHASE</option>
              <option value="TRANSFER">TRANSFER</option>
              <option value="ASSIGNMENT">ASSIGNMENT</option>
              <option value="EXPENDITURE">EXPENDITURE</option>
              <option value="BASE">BASE</option>
              <option value="EQUIPMENT_TYPE">EQUIPMENT_TYPE</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setActionFilter('');
                setEntityFilter('');
                setPage(0);
              }}
              className="w-full py-1.5 bg-military-green-dark hover:bg-military-green border border-military-green-border hover:border-military-khaki text-military-text-secondary rounded-sm transition-colors uppercase font-bold"
            >
              RESET FILTERS
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchAuditLogs} />}

      <DataTable
        columns={columns}
        data={logsPage?.content || []}
        loading={loading}
        emptyMessage="No audit records match the current filter selection."
        pagination={
          logsPage
            ? {
                pageNumber: logsPage.pageNumber,
                pageSize: logsPage.pageSize,
                totalElements: logsPage.totalElements,
                totalPages: logsPage.totalPages,
              }
            : null
        }
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default AuditLogsPage;
