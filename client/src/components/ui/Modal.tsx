import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  type?: 'default' | 'confirmation' | 'success' | 'warning' | 'error' | 'info';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  footer?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  preventBodyScroll?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  type = 'default',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  footer,
  icon,
  preventBodyScroll = true
}) => {
  const { actualTheme } = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Handle body scroll prevention
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, preventBodyScroll]);

  // Focus management
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const getSizeClasses = () => {
    const sizes = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
      full: 'max-w-7xl mx-4'
    };
    return sizes[size];
  };

  const getTypeIcon = () => {
    if (icon) return icon;

    const typeIcons = {
      default: null,
      confirmation: ExclamationTriangleIcon,
      success: CheckCircleIcon,
      warning: ExclamationTriangleIcon,
      error: XCircleIcon,
      info: InformationCircleIcon
    };

    return typeIcons[type];
  };

  const getTypeClasses = () => {
    const typeColors = {
      default: '',
      confirmation: actualTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      success: actualTheme === 'dark' ? 'text-green-400' : 'text-green-600',
      warning: actualTheme === 'dark' ? 'text-yellow-400' : 'text-yellow-600',
      error: actualTheme === 'dark' ? 'text-red-400' : 'text-red-600',
      info: actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600'
    };

    return typeColors[type];
  };

  if (!isOpen) return null;

  const TypeIcon = getTypeIcon();

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      {/* Backdrop */}
      <div 
        className="flex items-end justify-center min-h-screen pt-4 px-2 pb-20 text-center sm:block sm:p-0"
        onClick={handleBackdropClick}
      >
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
          aria-hidden="true" 
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        {/* Modal panel */}
        <div
          ref={modalRef}
          tabIndex={-1}
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${getSizeClasses()} ${
            actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white'
          } ${className}`}
        >
          {/* Header */}
          {(title || showCloseButton || TypeIcon) && (
            <div className={`px-6 py-4 border-b ${
              actualTheme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {TypeIcon && (
                    <TypeIcon className={`h-6 w-6 ${getTypeClasses()}`} />
                  )}
                  {title && (
                    <h3 
                      id="modal-title" 
                      className={`text-lg font-medium ${
                        actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      }`}
                    >
                      {title}
                    </h3>
                  )}
                </div>
                
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={`rounded-md p-2 transition-colors ${
                      actualTheme === 'dark'
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                    aria-label="Lukk modal"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="px-2 py-1">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className={`px-6 py-4 border-t ${
              actualTheme === 'dark' ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'
            }`}>
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'error' | 'info';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Bekreft handling',
  message,
  confirmText = 'Bekreft',
  cancelText = 'Avbryt',
  type = 'warning',
  isLoading = false
}) => {
  const { actualTheme } = useTheme();

  const handleConfirm = () => {
    onConfirm();
    if (!isLoading) {
      onClose();
    }
  };

  const getConfirmButtonClasses = () => {
    const variants = {
      warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      error: 'bg-red-600 hover:bg-red-700 text-white',
      info: 'bg-blue-600 hover:bg-blue-700 text-white'
    };
    return variants[type];
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type={type}
      size="sm"
      footer={
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${getConfirmButtonClasses()}`}
          >
            {isLoading ? 'Venter...' : confirmText}
          </button>
        </div>
      }
    >
      <p className={`text-sm ${
        actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {message}
      </p>
    </Modal>
  );
};

// Success Modal
interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = 'Suksess!',
  message,
  actionText = 'OK',
  onAction
}) => {
  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      type="success"
      size="sm"
      footer={
        <button
          type="button"
          onClick={handleAction}
          className="w-full px-2 py-1 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          {actionText}
        </button>
      }
    >
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {message}
      </p>
    </Modal>
  );
};

// Form Modal
interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  size?: ModalProps['size'];
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Lagre',
  cancelText = 'Avbryt',
  isSubmitting = false,
  submitDisabled = false,
  size = 'md'
}) => {
  const { actualTheme } = useTheme();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${
              actualTheme === 'dark'
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cancelText}
          </button>
          {onSubmit && (
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || submitDisabled}
              className="px-2 py-1 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Lagrer...' : submitText}
            </button>
          )}
        </div>
      }
    >
      {children}
    </Modal>
  );
};

// Hook for modal state management
export const useModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    open,
    close,
    toggle
  };
};

// Modal Manager for handling multiple modals
interface ModalManagerContextType {
  openModal: (id: string) => void;
  closeModal: (id: string) => void;
  isModalOpen: (id: string) => boolean;
}

const ModalManagerContext = React.createContext<ModalManagerContextType | null>(null);

export const ModalManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [openModals, setOpenModals] = React.useState<Set<string>>(new Set());

  const openModal = (id: string) => {
    setOpenModals(prev => new Set(prev).add(id));
  };

  const closeModal = (id: string) => {
    setOpenModals(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const isModalOpen = (id: string) => {
    return openModals.has(id);
  };

  return (
    <ModalManagerContext.Provider value={{ openModal, closeModal, isModalOpen }}>
      {children}
    </ModalManagerContext.Provider>
  );
};

export const useModalManager = () => {
  const context = React.useContext(ModalManagerContext);
  if (!context) {
    throw new Error('useModalManager must be used within a ModalManagerProvider');
  }
  return context;
};

export default Modal; 