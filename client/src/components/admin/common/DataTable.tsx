import React, { useState, useMemo } from 'react';
import { ChevronUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export interface PaginationConfig {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface ActionConfig<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  className?: string;
  show?: (row: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  filters?: FilterConfig[];
  actions?: ActionConfig<T>[];
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
  emptyMessage?: string;
  className?: string;
  rowClassName?: (row: T, index: number) => string;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selectedRows: T[]) => void;
  bulkActions?: ActionConfig<T[]>[];
  selectedRowKeys?: React.Key[];
  onRowClick?: (record: T, index: number) => void;
  rowKey?: keyof T | ((record: T) => React.Key);
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  emptyText?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  filters,
  actions,
  onPageChange,
  onLimitChange,
  onSort,
  onFilter,
  emptyMessage = 'Ingen data funnet',
  className = '',
  rowClassName,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  bulkActions,
  selectedRowKeys = [],
  onRowClick,
  rowKey = 'id' as keyof T,
  size = 'middle',
  bordered = true,
  emptyText = 'Ingen data'
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleSort = (key: string) => {
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(data);
    } else {
      onSelectionChange?.([]);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, row]);
    } else {
      onSelectionChange?.(selectedRows.filter(r => r !== row));
    }
  };

  const isAllSelected = selectedRows.length === data.length && data.length > 0;
  const isIndeterminate = selectedRows.length > 0 && selectedRows.length < data.length;

  const getRowKey = (record: T, index: number): React.Key => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey] || index;
  };

  const handleRowSelection = (record: T, selected: boolean) => {
    if (!onSelectionChange) return;

    const key = getRowKey(record, 0);
    let newSelectedKeys: React.Key[];
    let newSelectedRows: T[];

    if (selected) {
      newSelectedKeys = [...selectedRowKeys, key];
      newSelectedRows = [...data.filter(item => selectedRowKeys.includes(getRowKey(item, 0))), record];
    } else {
      newSelectedKeys = selectedRowKeys.filter(k => k !== key);
      newSelectedRows = data.filter(item => newSelectedKeys.includes(getRowKey(item, 0)));
    }

    onSelectionChange(newSelectedRows);
  };

  const renderCell = (column: Column<T>, row: T, index: number) => {
    const value = typeof column.key === 'string' && column.key.includes('.') 
      ? column.key.split('.').reduce((obj, key) => obj?.[key], row)
      : row[column.key as keyof T];

    if (column.render) {
      return column.render(value, row, index);
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-400">-</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Ja' : 'Nei'}
        </span>
      );
    }

    if (typeof value === 'object') {
      return <span className="text-gray-400">Objekt</span>;
    }

    return String(value);
  };

  const renderPagination = () => {
    if (!pagination) return null;

    const { page, totalPages, total, limit } = pagination;
    const startItem = (page - 1) * limit + 1;
    const endItem = Math.min(page * limit, total);

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Forrige
          </button>
          <button
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= totalPages}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Neste
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div className="flex items-center space-x-2">
            <p className="text-sm text-gray-700">
              Viser <span className="font-medium">{startItem}</span> til{' '}
              <span className="font-medium">{endItem}</span> av{' '}
              <span className="font-medium">{total}</span> resultater
            </p>
            {onLimitChange && (
              <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                className="ml-2 text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange?.(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange?.(pageNum)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                    page === pageNum
                      ? 'bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange?.(page + 1)}
              disabled={page >= totalPages}
              className="relative inline-flex items-center p-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Laster...</span>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500 bg-gray-50 rounded-lg border">
        {emptyText}
      </div>
    );
  }

  const sizeClasses = {
    small: 'text-sm',
    middle: 'text-base',
    large: 'text-lg'
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {/* Filters */}
      {filters && filters.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {filter.type === 'text' && (
                  <input
                    type="text"
                    placeholder={filter.placeholder}
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                {filter.type === 'select' && (
                  <select
                    value={filterValues[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Alle</option>
                    {filter.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectable && selectedRows.length > 0 && bulkActions && (
        <div className="p-4 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedRows.length} element(er) valgt
            </span>
            <div className="flex space-x-2">
              {bulkActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick(selectedRows)}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    action.className || 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {action.icon && <span className="mr-1">{action.icon}</span>}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className={`min-w-full ${bordered ? 'border border-gray-200' : ''} ${sizeClasses[size]}`}>
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.className || ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUpIcon
                          className={`w-3 h-3 ${
                            sortKey === column.key && sortDirection === 'asc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                        <ChevronDownIcon
                          className={`w-3 h-3 -mt-1 ${
                            sortKey === column.key && sortDirection === 'desc'
                              ? 'text-blue-600'
                              : 'text-gray-400'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {actions && actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => {
              const key = getRowKey(row, index);
              const isSelected = selectedRowKeys.includes(key);
              
              return (
                <tr
                  key={key}
                  className={`
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    ${onRowClick ? 'cursor-pointer' : ''}
                    transition-colors duration-150
                  `}
                  onClick={() => onRowClick?.(row, index)}
                >
                  {selectable && (
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleRowSelection(row, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        column.className || ''
                      }`}
                    >
                      {renderCell(column, row, index)}
                    </td>
                  ))}
                  {actions && actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {actions
                          .filter((action) => !action.show || action.show(row))
                          .map((action, actionIndex) => (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                              className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md ${
                                action.className ||
                                'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                              }`}
                            >
                              {action.icon && (
                                <span className="mr-1">{action.icon}</span>
                              )}
                              {action.label}
                            </button>
                          ))}
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {renderPagination()}
    </div>
  );
} 