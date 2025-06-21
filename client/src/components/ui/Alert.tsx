import React from 'react';

interface AlertProps {
  type?: 'info' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
  className?: string;
}

const typeStyles = {
  info: 'bg-blue-100 text-blue-900 border-blue-300',
  warning: 'bg-yellow-100 text-yellow-900 border-yellow-300',
  error: 'bg-red-100 text-red-900 border-red-300',
  success: 'bg-green-100 text-green-900 border-green-300',
};

export default function Alert({ type = 'info', children, className = '' }: AlertProps) {
  return (
    <div
      className={`w-full flex items-center gap-2 px-4 py-2 mt-0 mb-0 ${typeStyles[type]} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
} 