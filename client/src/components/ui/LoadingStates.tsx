/**
 * Loading States Components
 * 
 * Omfattende collection av loading states og skeleton screens
 * for bedre brukeropplevelse
 */

import React from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
// Removed unused import: FiLoader

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  rounded = false,
  animate = true,
}) => {
  const { actualTheme } = useTheme();

  const baseClasses = `animate-pulse ${
    actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
  }`;

  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[rounded ? 'circular' : 'rectangular']} ${className}`}
      style={style}
    />
  );
};

// ============================================================================
// TEXT SKELETONS
// ============================================================================

interface TextSkeletonProps {
  lines?: number;
  className?: string;
  lineHeights?: string[];
}

export const TextSkeleton: React.FC<TextSkeletonProps> = ({
  lines = 3,
  className,
  lineHeights = ['h-4', 'h-4', 'h-3'],
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            lineHeights[index] || 'h-4',
            index === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
          )}
        />
      ))}
    </div>
  );
};

export const HeadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn('h-8 w-2/3', className)} />
);

export const SubheadingSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Skeleton className={cn('h-6 w-1/2', className)} />
);

// ============================================================================
// CARD SKELETONS
// ============================================================================

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg shadow-sm p-6 border', className)}>
    <div className="flex items-center space-x-3 mb-4">
      <Skeleton className="h-10 w-10" rounded />
      <div className="flex-1">
        <Skeleton className="h-5 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
    <TextSkeleton lines={2} />
  </div>
);

export const StatsCardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-lg shadow-sm p-6 border', className)}>
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-8 w-8" rounded />
    </div>
    <Skeleton className="h-8 w-1/2 mb-2" />
    <Skeleton className="h-4 w-2/3" />
  </div>
);

// ============================================================================
// TABLE SKELETONS
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  className?: string;
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}) => (
  <div className={cn('bg-white rounded-lg shadow-sm border overflow-hidden', className)}>
    {showHeader && (
      <div className="border-b bg-gray-50 px-2 py-1">
        <div className="grid cards-spacing-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, index) => (
            <Skeleton key={`header-${index}`} className="h-4 w-3/4" />
          ))}
        </div>
      </div>
    )}
    <div className="divide-y">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="px-2 py-1">
          <div className="grid cards-spacing-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 w-5/6" />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ============================================================================
// FORM SKELETONS
// ============================================================================

export const FormFieldSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-6', className)}>
    <Skeleton className="h-4 w-1/4" />
    <Skeleton className="h-10 w-full rounded-md" />
  </div>
);

export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({
  fields = 4,
  className,
}) => (
  <div className={cn('cards-spacing-vertical', className)}>
    {Array.from({ length: fields }).map((_, index) => (
      <FormFieldSkeleton key={index} />
    ))}
    <div className="flex space-x-3 pt-4">
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-20 rounded-md" />
    </div>
  </div>
);

// ============================================================================
// LIST SKELETONS
// ============================================================================

export const ListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center space-x-3 p-3', className)}>
    <Skeleton className="h-8 w-8" rounded />
    <div className="flex-1">
      <Skeleton className="h-4 w-3/4 mb-1" />
      <Skeleton className="h-3 w-1/2" />
    </div>
    <Skeleton className="h-6 w-16 rounded-full" />
  </div>
);

export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({
  items = 6,
  className,
}) => (
  <div className={cn('bg-white rounded-lg shadow-sm border divide-y', className)}>
    {Array.from({ length: items }).map((_, index) => (
      <ListItemSkeleton key={index} />
    ))}
  </div>
);

// ============================================================================
// PAGE SKELETONS
// ============================================================================

export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50 px-2 py-1">
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <HeadingSkeleton className="mb-2" />
        <TextSkeleton lines={1} className="w-1/3" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <StatsCardSkeleton key={index} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid">
        <div>
          <SubheadingSkeleton className="mb-4" />
          <CardSkeleton />
        </div>
        <div>
          <SubheadingSkeleton className="mb-4" />
          <ListSkeleton items={4} />
        </div>
      </div>
    </div>
  </div>
);

export const PageSkeleton: React.FC<{ title?: boolean; description?: boolean }> = ({
  title = true,
  description = true,
}) => (
  <div className="min-h-screen bg-gray-50 px-2 py-1">
    <div className="max-w-7xl mx-auto">
      {title && <HeadingSkeleton className="mb-2" />}
      {description && <TextSkeleton lines={1} className="w-1/2 mb-8" />}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 cards-spacing-grid">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </div>
  </div>
);

// ============================================================================
// LOADING INDICATORS
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ 
  size = 'md', 
  color = 'primary',
  className = '' 
}) => {
  const { actualTheme } = useTheme();
  
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const colorClasses = {
    primary: actualTheme === 'dark' ? 'text-blue-400' : 'text-blue-600',
    white: 'text-white',
    gray: actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
  };

  return (
    <ArrowPathIcon 
      className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin ${className}`}
    />
  );
};

export const LoadingOverlay: React.FC<{
  children?: React.ReactNode;
  message?: string;
  className?: string;
}> = ({ children, message = 'Laster...', className }) => (
  <div className={cn('relative', className)}>
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-3" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
    {children}
  </div>
);

// ============================================================================
// BUTTON LOADING STATES
// ============================================================================

interface LoadingButtonProps {
  loading: boolean;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  type = 'button',
  className = ''
}) => {
  const { actualTheme } = useTheme();

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: actualTheme === 'dark' 
      ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-800' 
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300',
    secondary: actualTheme === 'dark'
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 focus:ring-gray-500 disabled:bg-gray-800'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 disabled:bg-gray-50',
    outline: actualTheme === 'dark'
      ? 'border border-gray-600 text-gray-200 hover:bg-gray-700 focus:ring-gray-500 disabled:border-gray-700 disabled:text-gray-500'
      : 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 disabled:border-gray-200 disabled:text-gray-400'
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${isDisabled ? 'cursor-not-allowed' : ''} ${className}`}
    >
      {loading && (
        <Spinner 
          size={size === 'lg' ? 'md' : 'sm'} 
          color={variant === 'primary' ? 'white' : 'gray'} 
          className="mr-2" 
        />
      )}
      {children}
    </button>
  );
};

// ============================================================================
// PROGRESSIVE LOADING
// ============================================================================

interface ProgressiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  lowQualitySrc?: string;
  fallback?: React.ReactNode;
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  src,
  lowQualitySrc,
  alt,
  fallback,
  className,
  ...props
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [currentSrc, setCurrentSrc] = React.useState(lowQualitySrc || src);

  React.useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
    };
    img.onerror = () => {
      setError(true);
      setLoading(false);
    };
    img.src = src;
  }, [src]);

  if (error && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {loading && lowQualitySrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Spinner size="sm" />
        </div>
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          loading ? 'opacity-50' : 'opacity-100',
          className
        )}
        {...props}
      />
    </div>
  );
};

// ============================================================================
// ADDITIONAL COMPONENTS FOR BACKWARDS COMPATIBILITY
// ============================================================================

// Alias for Spinner to match imports
export const LoadingSpinner = Spinner;

// Search skeleton component
export const SearchSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('cards-spacing-vertical', className)}>
    <FormFieldSkeleton />
    <div className="grid grid-cols-3 cards-spacing-grid">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  </div>
);

// Inline loader component
export const InlineLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'sm' }) => (
  <Spinner size={size} />
);

// Error state component
export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({ 
  title = 'Noe gikk galt',
  message = 'Kunne ikke laste inn data. Prøv igjen senere.',
  onRetry,
  className 
}) => (
  <div className={cn('text-center py-12', className)}>
    <div className="text-gray-400 text-6xl mb-4">⚠️</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="btn btn-primary"
      >
        Prøv igjen
      </button>
    )}
  </div>
);

// Empty state component
export const EmptyState: React.FC<{
  title?: string;
  message?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ 
  title = 'Ingen data',
  message = 'Det finnes ingen elementer å vise.',
  action,
  className 
}) => (
  <div className={cn('text-center py-12', className)}>
    <div className="text-gray-400 text-6xl mb-4">📭</div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-4">{message}</p>
    {action && <div>{action}</div>}
  </div>
);

// Alias for StatsCardSkeleton for backwards compatibility
export const StatsSkeleton = StatsCardSkeleton;

// Progress bar component
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'blue',
  showLabel = false,
  label,
  className = ''
}) => {
  const { actualTheme } = useTheme();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600', 
    yellow: 'bg-yellow-600',
    red: 'bg-red-600'
  };

  const backgroundClass = actualTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className={`text-sm font-medium ${
            actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {label}
          </span>
          <span className={`text-sm ${
            actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full ${backgroundClass} rounded-full ${sizeClasses[size]}`}>
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} rounded-full transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Circular progress component
interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 60,
  strokeWidth = 4,
  color = 'blue',
  showLabel = true,
  className = ''
}) => {
  const { actualTheme } = useTheme();
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    blue: '#3B82F6',
    green: '#10B981',
    yellow: '#F59E0B',
    red: '#EF4444'
  };

  const trackColor = actualTheme === 'dark' ? '#374151' : '#E5E7EB';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colorClasses[color]}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      
      {showLabel && (
        <div className={`absolute inset-0 flex items-center justify-center text-sm font-medium ${
          actualTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {Math.round(percentage)}%
        </div>
      )}
    </div>
  );
};

// Enhanced loading overlay (replaces existing LoadingOverlay functionality)
export const FullPageLoadingOverlay: React.FC<{
  message?: string;
  transparent?: boolean;
}> = ({
  message = 'Laster...',
  transparent = false
}) => {
  const { actualTheme } = useTheme();

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      transparent 
        ? 'bg-black bg-opacity-25' 
        : actualTheme === 'dark' 
          ? 'bg-gray-900 bg-opacity-90' 
          : 'bg-white bg-opacity-90'
    }`}>
      <div className={`text-center p-6 rounded-lg ${
        !transparent && (actualTheme === 'dark' ? 'bg-gray-800' : 'bg-white')
      } ${!transparent && 'shadow-lg'}`}>
        <Spinner size="xl" className="mx-auto mb-4" />
        <p className={`text-lg font-medium ${
          actualTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
          {message}
        </p>
      </div>
    </div>
  );
};

// Inline loading state for content areas
interface InlineLoadingProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  size = 'md',
  message,
  className = ''
}) => {
  const { actualTheme } = useTheme();

  const sizeClasses = {
    sm: 'py-4',
    md: 'py-8',
    lg: 'py-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      <Spinner size={size} className="mb-2" />
      {message && (
        <p className={`text-sm ${
          actualTheme === 'dark' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default {
  Spinner,
  LoadingButton,
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  ProgressBar,
  CircularProgress,
  LoadingOverlay,
  FullPageLoadingOverlay,
  InlineLoading
};

 