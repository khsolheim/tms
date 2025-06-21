import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  size = 'md', 
  message = 'Laster...', 
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-8">
        <div 
          className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
          role="status"
          aria-label={message}
        />
        {message && (
          <p className="text-sm text-gray-600 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

// Spesialiserte loading komponenter for ulike kontekster
export function PageLoadingSpinner() {
  return (
    <LoadingSpinner 
      size="lg" 
      message="Laster side..." 
      fullScreen={false}
    />
  );
}

export function ComponentLoadingSpinner() {
  return (
    <LoadingSpinner 
      size="md" 
      message="Laster innhold..." 
      fullScreen={false}
    />
  );
}

export function FullScreenLoadingSpinner() {
  return (
    <LoadingSpinner 
      size="lg" 
      message="Laster applikasjon..." 
      fullScreen={true}
    />
  );
} 