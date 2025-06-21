import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  ChevronDownIcon,
  TrashIcon,
  PencilIcon,
  ArchiveBoxIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  FolderIcon,
  TagIcon,
  EyeIcon,
  NoSymbolIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  action: (selectedIds: string[]) => void | Promise<void>;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  requiresConfirmation?: boolean;
  confirmationMessage?: string;
}

interface BulkActionsProps {
  selectedItems: string[];
  totalItems: number;
  actions: BulkAction[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  className?: string;
  compact?: boolean;
}

interface BulkSelectionBarProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onAction: (actionId: string, selectedIds: string[]) => void;
  selectedIds: string[];
}

const BulkActions: React.FC<BulkActionsProps> = ({
  selectedItems,
  totalItems,
  actions,
  onSelectAll,
  onDeselectAll,
  className = '',
  compact = false
}) => {
  const { actualTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmingAction, setConfirmingAction] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCount = selectedItems.length;
  const isAllSelected = selectedCount === totalItems && totalItems > 0;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalItems;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  const handleActionClick = async (action: BulkAction) => {
    setIsOpen(false);

    if (action.requiresConfirmation) {
      setConfirmingAction(action.id);
      return;
    }

    await action.action(selectedItems);
  };

  const handleConfirmAction = async () => {
    if (!confirmingAction) return;
    
    const action = actions.find(a => a.id === confirmingAction);
    if (action) {
      await action.action(selectedItems);
    }
    setConfirmingAction(null);
  };

  const getVariantClasses = (variant: BulkAction['variant'] = 'default') => {
    const variants = {
      default: actualTheme === 'dark'
        ? 'text-gray-200 hover:bg-gray-700'
        : 'text-gray-700 hover:bg-gray-50',
      danger: actualTheme === 'dark'
        ? 'text-red-400 hover:bg-red-900/20'
        : 'text-red-600 hover:bg-red-50',
      warning: actualTheme === 'dark'
        ? 'text-yellow-400 hover:bg-yellow-900/20'
        : 'text-yellow-600 hover:bg-yellow-50',
      success: actualTheme === 'dark'
        ? 'text-green-400 hover:bg-green-900/20'
        : 'text-green-600 hover:bg-green-50'
    };
    return variants[variant];
  };

  if (selectedCount === 0 && !compact) return null;

  return (
    <>
      <div className={`flex items-center justify-between ${className}`}>
        {/* Selection control */}
        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(input) => {
                if (input) input.indeterminate = isIndeterminate;
              }}
              onChange={handleSelectAllToggle}
              className={`h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 ${
                actualTheme === 'dark' ? 'bg-gray-700 border-gray-600' : ''
              }`}
            />
            <span className={`ml-2 text-sm ${
              actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {selectedCount > 0 
                ? `${selectedCount} av ${totalItems} valgt`
                : `Velg alle (${totalItems})`
              }
            </span>
          </label>

          {selectedCount > 0 && (
            <button
              onClick={onDeselectAll}
              className={`text-sm underline ${
                actualTheme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Fjern alle
            </button>
          )}
        </div>

        {/* Actions dropdown */}
        {selectedCount > 0 && actions.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center px-3 py-2 border text-sm font-medium rounded-md transition-colors ${
                actualTheme === 'dark'
                  ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
              }`}
            >
              Handlinger
              <ChevronDownIcon className={`ml-1 h-4 w-4 transition-transform ${
                isOpen ? 'rotate-180' : ''
              }`} />
            </button>

            {isOpen && (
              <div className={`absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50 border ${
                actualTheme === 'dark'
                  ? 'bg-gray-800 border-gray-600'
                  : 'bg-white border-gray-200'
              }`}>
                <div className="py-1">
                  {actions.map((action) => {
                    const Icon = action.icon;
                    const disabled = action.disabled;
                    
                    return (
                      <button
                        key={action.id}
                        onClick={() => !disabled && handleActionClick(action)}
                        disabled={disabled}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center space-x-2 ${
                          disabled
                            ? actualTheme === 'dark'
                              ? 'text-gray-500 cursor-not-allowed'
                              : 'text-gray-400 cursor-not-allowed'
                            : getVariantClasses(action.variant)
                        }`}
                      >
                        {Icon && <Icon className="h-4 w-4" />}
                        <span>{action.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmingAction && (
        <ConfirmationModal
          action={actions.find(a => a.id === confirmingAction)!}
          selectedCount={selectedCount}
          onConfirm={handleConfirmAction}
          onCancel={() => setConfirmingAction(null)}
        />
      )}
    </>
  );
};

// Confirmation modal component
const ConfirmationModal: React.FC<{
  action: BulkAction;
  selectedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ action, selectedCount, onConfirm, onCancel }) => {
  const { actualTheme } = useTheme();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2 py-1 bg-black bg-opacity-50">
      <div className={`w-full max-w-md rounded-lg shadow-lg ${
        actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="px-2 py-1">
          <div className="flex items-center space-x-3 mb-4">
            {action.icon && (
              <action.icon className={`h-6 w-6 ${
                action.variant === 'danger' ? 'text-red-500' : 'text-blue-500'
              }`} />
            )}
            <h3 className={`text-lg font-medium ${
              actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
            }`}>
              Bekreft handling
            </h3>
          </div>

          <p className={`text-sm mb-6 ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {action.confirmationMessage || 
              `Er du sikker på at du vil ${action.label.toLowerCase()} ${selectedCount} element${selectedCount > 1 ? 'er' : ''}?`
            }
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                actualTheme === 'dark'
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Avbryt
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                action.variant === 'danger'
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {action.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Bulk selection bar component for sticky positioning
export const BulkSelectionBar: React.FC<BulkSelectionBarProps> = ({
  selectedCount,
  totalCount,
  actions,
  onSelectAll,
  onDeselectAll,
  onAction,
  selectedIds
}) => {
  const { actualTheme } = useTheme();

  if (selectedCount === 0) return null;

  return (
    <div className={`sticky top-0 z-30 px-4 py-3 border-b ${
      actualTheme === 'dark'
        ? 'bg-blue-900 border-blue-700'
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span className={`font-medium ${
            actualTheme === 'dark' ? 'text-blue-200' : 'text-blue-800'
          }`}>
            {selectedCount} element{selectedCount > 1 ? 'er' : ''} valgt
          </span>
          
          <button
            onClick={onDeselectAll}
            className={`text-sm underline ${
              actualTheme === 'dark'
                ? 'text-blue-300 hover:text-blue-200'
                : 'text-blue-700 hover:text-blue-800'
            }`}
          >
            Fjern valg
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {actions.slice(0, 3).map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onAction(action.id, selectedIds)}
                disabled={action.disabled}
                className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  action.variant === 'danger'
                    ? actualTheme === 'dark'
                      ? 'bg-red-800 text-red-200 hover:bg-red-700'
                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                    : actualTheme === 'dark'
                      ? 'bg-blue-800 text-blue-200 hover:bg-blue-700'
                      : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                }`}
              >
                {Icon && <Icon className="h-4 w-4 mr-1" />}
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Hook for managing bulk selection
export const useBulkSelection = (items: any[], keyField: string = 'id') => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectAll = () => {
    setSelectedIds(items.map(item => item[keyField]));
  };

  const deselectAll = () => {
    setSelectedIds([]);
  };

  const toggleItem = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectItems = (ids: string[]) => {
    setSelectedIds(prev => Array.from(new Set([...prev, ...ids])));
  };

  const deselectItems = (ids: string[]) => {
    setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
  };

  const isSelected = (id: string) => selectedIds.includes(id);

  return {
    selectedIds,
    selectAll,
    deselectAll,
    toggleItem,
    selectItems,
    deselectItems,
    isSelected,
    selectedCount: selectedIds.length,
    isAllSelected: selectedIds.length === items.length && items.length > 0,
    isIndeterminate: selectedIds.length > 0 && selectedIds.length < items.length
  };
};

// Common bulk actions
export const createCommonBulkActions = (handlers: {
  onDelete?: (ids: string[]) => void;
  onEdit?: (ids: string[]) => void;
  onArchive?: (ids: string[]) => void;
  onDuplicate?: (ids: string[]) => void;
  onExport?: (ids: string[]) => void;
  onMove?: (ids: string[]) => void;
  onTag?: (ids: string[]) => void;
  onMarkRead?: (ids: string[]) => void;
  onBlock?: (ids: string[]) => void;
}): BulkAction[] => {
  const actions: BulkAction[] = [];

  if (handlers.onEdit) {
    actions.push({
      id: 'edit',
      label: 'Rediger',
      icon: PencilIcon,
      action: handlers.onEdit,
      variant: 'default'
    });
  }

  if (handlers.onDuplicate) {
    actions.push({
      id: 'duplicate',
      label: 'Dupliser',
      icon: DocumentDuplicateIcon,
      action: handlers.onDuplicate,
      variant: 'default'
    });
  }

  if (handlers.onMove) {
    actions.push({
      id: 'move',
      label: 'Flytt',
      icon: FolderIcon,
      action: handlers.onMove,
      variant: 'default'
    });
  }

  if (handlers.onTag) {
    actions.push({
      id: 'tag',
      label: 'Merk',
      icon: TagIcon,
      action: handlers.onTag,
      variant: 'default'
    });
  }

  if (handlers.onMarkRead) {
    actions.push({
      id: 'mark-read',
      label: 'Merk som lest',
      icon: EyeIcon,
      action: handlers.onMarkRead,
      variant: 'default'
    });
  }

  if (handlers.onExport) {
    actions.push({
      id: 'export',
      label: 'Eksporter',
      icon: ArrowDownTrayIcon,
      action: handlers.onExport,
      variant: 'default'
    });
  }

  if (handlers.onArchive) {
    actions.push({
      id: 'archive',
      label: 'Arkiver',
      icon: ArchiveBoxIcon,
      action: handlers.onArchive,
      variant: 'warning',
      requiresConfirmation: true
    });
  }

  if (handlers.onBlock) {
    actions.push({
      id: 'block',
      label: 'Blokker',
      icon: NoSymbolIcon,
      action: handlers.onBlock,
      variant: 'warning',
      requiresConfirmation: true
    });
  }

  if (handlers.onDelete) {
    actions.push({
      id: 'delete',
      label: 'Slett',
      icon: TrashIcon,
      action: handlers.onDelete,
      variant: 'danger',
      requiresConfirmation: true,
      confirmationMessage: 'Denne handlingen kan ikke angres. Er du sikker på at du vil slette de valgte elementene?'
    });
  }

  return actions;
};

export default BulkActions; 