import React from 'react';
import { FaTrash, FaExclamationTriangle, FaCheck, FaInfo } from 'react-icons/fa';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'success' | 'info';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  details?: string[];
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  type = 'warning',
  confirmText = 'Bekreft',
  cancelText = 'Avbryt',
  onConfirm,
  onCancel,
  details
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <FaTrash className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <FaExclamationTriangle className="h-6 w-6 text-orange-600" />;
      case 'success':
        return <FaCheck className="h-6 w-6 text-green-600" />;
      case 'info':
        return <FaInfo className="h-6 w-6 text-blue-600" />;
      default:
        return <FaExclamationTriangle className="h-6 w-6 text-orange-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-100',
          border: 'border-red-200',
          text: 'text-red-800',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-200', 
          text: 'text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'success':
        return {
          bg: 'bg-green-100',
          border: 'border-green-200',
          text: 'text-green-800',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          border: 'border-blue-200',
          text: 'text-blue-800',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          bg: 'bg-orange-100',
          border: 'border-orange-200',
          text: 'text-orange-800',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl px-2 py-1 w-full max-w-md mx-4 shadow-2xl">
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${colors.bg} mb-4`}>
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {message}
          </p>
          
          {details && details.length > 0 && (
            <div className={`${colors.bg} ${colors.border} border rounded-lg p-3 mb-6`}>
              <p className={`text-sm ${colors.text} font-medium mb-2`}>Dette vil påvirke:</p>
              <ul className={`text-sm ${colors.text} space-y-1 text-left`}>
                {details.map((detail, index) => (
                  <li key={index}>• {detail}</li>
                ))}
              </ul>
              {type === 'danger' && (
                <p className={`text-sm ${colors.text} font-medium mt-2`}>
                  Denne handlingen kan ikke angres!
                </p>
              )}
            </div>
          )}
          
          <div className="flex cards-spacing-grid">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-2 py-1 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${colors.button}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 