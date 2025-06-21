import React from 'react';
import { FaCheck, FaExclamationTriangle, FaInfo, FaTimes } from 'react-icons/fa';

interface NotificationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export default function NotificationDialog({
  isOpen,
  title,
  message,
  type = 'info',
  onClose
}: NotificationDialogProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck className="h-6 w-6 text-green-600" />;
      case 'error':
        return <FaTimes className="h-6 w-6 text-red-600" />;
      case 'warning':
        return <FaExclamationTriangle className="h-6 w-6 text-orange-600" />;
      case 'info':
        return <FaInfo className="h-6 w-6 text-blue-600" />;
      default:
        return <FaInfo className="h-6 w-6 text-blue-600" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-100',
          button: 'bg-green-600 hover:bg-green-700'
        };
      case 'error':
        return {
          bg: 'bg-red-100',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          bg: 'bg-orange-100',
          button: 'bg-orange-600 hover:bg-orange-700'
        };
      case 'info':
        return {
          bg: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      default:
        return {
          bg: 'bg-blue-100',
          button: 'bg-blue-600 hover:bg-blue-700'
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
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
          
          <button
            type="button"
            onClick={onClose}
            className={`w-full px-4 py-2 text-white rounded-lg transition-colors ${colors.button}`}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
} 