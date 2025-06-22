import React, { useState } from 'react';
import {
  ChevronUpIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon
} from '@heroicons/react/24/outline';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  
  // Pagination
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
  
  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  getRowId?: (row: T) => string | number;
  
  // Actions
  actions?: Array<{
    label: string;
    icon?: React.ComponentType<any>;
    onClick: (row: T) => void;
    variant?: 'primary' | 'secondary' | 'danger';
    disabled?: (row: T) => boolean;
  }>;
  
  // Styling
  className?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  error = null,
  page = 1,
  limit = 10,
  total = 0,
  totalPages = 0,
  onPageChange,
  onLimitChange,
  sortBy,
  sortOrder = 'asc',
  onSort,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  getRowId = (row: any) => row.id,
  actions = [],
  className = '',
  emptyMessage = 'Ingen data funnet'
}: DataTableProps<T>) {
  const [internalSortBy, setInternalSortBy] = useState<string>('');
  const [internalSortOrder, setInternalSortOrder] = useState<'asc' | 'desc'>('asc');

  const currentSortBy = sortBy || internalSortBy;
  const currentSortOrder = sortOrder || internalSortOrder;

  const handleSort = (key: string) => {
    const newOrder = currentSortBy === key && currentSortOrder === 'asc' ? 'desc' : 'asc';
    
    if (onSort) {
      onSort(key, newOrder);
    } else {
      setInternalSortBy(key);
      setInternalSortOrder(newOrder);
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    
    if (selectedRows.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data);
    }
  };

  const handleRowSelect = (row: T) => {
    if (!onSelectionChange) return;
    
    const rowId = getRowId(row);
    const isSelected = selectedRows.some(r => getRowId(r) === rowId);
    
    if (isSelected) {
      onSelectionChange(selectedRows.filter(r => getRowId(r) !== rowId));
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const isRowSelected = (row: T) => {
    const rowId = getRowId(row);
    return selectedRows.some(r => getRowId(r) === rowId);
  };

  const getSortIcon = (columnKey: string) => {
    if (currentSortBy !== columnKey) return null;
    
    return currentSortOrder === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  const renderCellValue = (column: Column<T>, row: T) => {
    const value = (row as any)[column.key];
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return value?.toString() || '';
  };

  const getActionButtonClass = (variant: string = 'secondary') => {
    const baseClass = 'inline-flex items-center px-2.5 py-1.5 border text-xs font-medium rounded focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    switch (variant) {
      case 'primary':
        return `${baseClass} border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
      case 'danger':
        return `${baseClass} border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      default:
        return `${baseClass} border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white shadow overflow-hidden sm:rounded-md ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key.toString()}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === 'center' ? 'text-center' : 
                    column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key.toString())}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && getSortIcon(column.key.toString())}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={getRowId(row)}
                  className={`hover:bg-gray-50 ${isRowSelected(row) ? 'bg-blue-50' : ''}`}
                >
                  {selectable && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={isRowSelected(row)}
                        onChange={() => handleRowSelect(row)}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key.toString()}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {renderCellValue(column, row)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions.map((action, actionIndex) => (
                          <button
                            key={actionIndex}
                            onClick={() => action.onClick(row)}
                            disabled={action.disabled?.(row)}
                            className={`${getActionButtonClass(action.variant)} ${
                              action.disabled?.(row) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {action.icon && <action.icon className="w-4 h-4 mr-1" />}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Forrige
            </button>
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Neste
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-700">
                Viser <span className="font-medium">{(page - 1) * limit + 1}</span> til{' '}
                <span className="font-medium">{Math.min(page * limit, total)}</span> av{' '}
                <span className="font-medium">{total}</span> resultater
              </p>
              <select
                value={limit}
                onChange={(e) => onLimitChange?.(Number(e.target.value))}
                className="border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per side</option>
                <option value={25}>25 per side</option>
                <option value={50}>50 per side</option>
                <option value={100}>100 per side</option>
              </select>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange?.(1)}
                  disabled={page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDoubleLeftIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onPageChange?.(page - 1)}
                  disabled={page <= 1}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber: number;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (page <= 3) {
                    pageNumber = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => onPageChange?.(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNumber
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => onPageChange?.(page + 1)}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onPageChange?.(totalPages)}
                  disabled={page >= totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronDoubleRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 