import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  emptyMessage = 'No records found matching current query parameters.',
  pagination,
  onPageChange,
  rowKey = 'id'
}) => {
  if (loading) {
    return (
      <div className="bg-military-green-surface border border-military-green-border rounded-sm p-12">
        <LoadingSpinner message="RETRIEVING LEDGER RECORDS..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-military-green-surface border border-military-green-border rounded-sm p-4">
        <EmptyState message={emptyMessage} />
      </div>
    );
  }

  return (
    <div className="bg-military-green-surface border border-military-green-border rounded-sm overflow-hidden shadow-military-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-military-green-dark border-b border-military-green-border text-military-khaki font-mono text-xs uppercase tracking-wider sticky top-0 z-10">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`py-3 px-4 font-semibold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-military-green-border/50 text-xs font-mono text-military-text-secondary">
            {data.map((row, rIdx) => (
              <tr
                key={row[rowKey] || rIdx}
                className="hover:bg-military-green/40 transition-colors even:bg-military-green-dark/30"
              >
                {columns.map((col, cIdx) => {
                  const val = col.accessor ? (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]) : null;
                  return (
                    <td
                      key={cIdx}
                      className={`py-3 px-4 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, val) : val !== null && val !== undefined ? String(val) : '-'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {pagination && (
        <div className="flex items-center justify-between px-4 py-3 bg-military-green-dark border-t border-military-green-border text-xs font-mono text-military-text-muted">
          <div>
            SHOWING PAGE <span className="text-military-khaki font-bold">{pagination.pageNumber + 1}</span> OF{' '}
            <span className="text-military-khaki font-bold">{Math.max(1, pagination.totalPages)}</span> ({pagination.totalElements} TOTAL ENTRIES)
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange && onPageChange(pagination.pageNumber - 1)}
              disabled={pagination.pageNumber === 0}
              className="px-2.5 py-1 bg-military-green-surface border border-military-green-border rounded-sm hover:border-military-khaki text-military-text-secondary disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>PREV</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange(pagination.pageNumber + 1)}
              disabled={pagination.pageNumber >= pagination.totalPages - 1}
              className="px-2.5 py-1 bg-military-green-surface border border-military-green-border rounded-sm hover:border-military-khaki text-military-text-secondary disabled:opacity-40 disabled:pointer-events-none flex items-center space-x-1"
            >
              <span>NEXT</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
