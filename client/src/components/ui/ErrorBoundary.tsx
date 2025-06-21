/**
 * Error Boundary Components
 * 
 * Robust error handling med fallback UI og error reporting
 * for bedre brukeropplevelse når komponenter krasjer
 */

import React, { Component, ReactNode } from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo | null, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReportButton?: boolean;
  enableRetry?: boolean;
  resetKeys?: Array<string | number>;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId()
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: ErrorBoundary.generateStaticErrorId()
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorInfoWithStack: ErrorInfo = {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: this.constructor.name
    };

    this.setState({
      errorInfo: errorInfoWithStack
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfoWithStack);
    }

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfoWithStack);
    }

    // Report error to monitoring service
    this.reportError(error, errorInfoWithStack);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { resetKeys } = this.props;
    const { hasError } = this.state;

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetKeys?.some((key, index) => key !== prevProps.resetKeys?.[index])) {
        this.resetErrorBoundary();
      }
    }
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static generateStaticErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    try {
      // Send error to monitoring service (replace with your actual service)
      fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          errorId: this.state.errorId,
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail if error reporting fails
      });
    } catch {
      // Silently fail if error reporting fails
    }
  };

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: this.generateErrorId()
      });
    }, 100);
  };

  private handleRetry = () => {
    this.resetErrorBoundary();
  };

  private handleReportIssue = () => {
    const { error, errorInfo, errorId } = this.state;
    
         const reportData = {
       errorId: errorId || 'unknown',
       message: error?.message || 'Unknown error',
       stack: error?.stack || 'No stack trace',
       componentStack: errorInfo?.componentStack || 'No component stack',
       url: window.location.href,
       timestamp: new Date().toISOString(),
     };

    // Open issue report (could be email, support system, etc.)
    const mailtoLink = `mailto:support@tms.no?subject=Error Report ${errorId}&body=${encodeURIComponent(
      `Feilrapport ID: ${errorId}\n\nBeskrivelse: ${reportData.message}\n\nURL: ${reportData.url}\n\nTidspunkt: ${reportData.timestamp}\n\nVennligst beskriv hva du gjorde når feilen oppstod:`
    )}`;
    
    window.open(mailtoLink);
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showReportButton = true, enableRetry = true } = this.props;

    if (hasError && error) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback(error, errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center px-2 py-1">
          <div className="max-w-md w-full text-center">
            <div className="mb-6">
              <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Noe gikk galt
              </h2>
              <p className="text-gray-600 mb-6">
                En uventet feil oppstod. Vi beklager ulempen.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mb-6 px-2 py-1 bg-red-50 border border-red-200 rounded-lg text-left">
                <h3 className="text-sm font-semibold text-red-800 mb-2">
                  Utviklingsinfo:
                </h3>
                <p className="text-xs text-red-700 font-mono mb-2">
                  {error.message}
                </p>
                {error.stack && (
                  <pre className="text-xs text-red-600 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}

            <div className="space-y-8">
              {enableRetry && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowPathIcon className="h-4 w-4 mr-2" />
                  Prøv igjen
                </button>
              )}

              {showReportButton && (
                <button
                  onClick={this.handleReportIssue}
                  className="w-full px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Rapporter feil
                </button>
              )}

              <button
                onClick={() => window.location.reload()}
                className="w-full px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Last inn siden på nytt
              </button>
            </div>

            <div className="mt-6 text-xs text-gray-400">
              Feil ID: {this.state.errorId}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { handleError, resetError };
};

// Simple error fallback component
export const SimpleErrorFallback: React.FC<{
  error: Error;
  retry: () => void;
}> = ({ error, retry }) => (
  <div className="px-2 py-1 bg-red-50 border border-red-200 rounded-lg">
    <h3 className="text-lg font-semibold text-red-800 mb-2">Feil oppstod</h3>
    <p className="text-red-700 mb-4">{error.message}</p>
    <button
      onClick={retry}
      className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Prøv igjen
    </button>
  </div>
);

// Async error boundary for async components
export const withAsyncErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    return (
      <ErrorBoundary fallback={fallback ? (error, _, retry) => React.createElement(fallback, { error, retry }) : undefined}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };

  WrappedComponent.displayName = `withAsyncErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

export default ErrorBoundary; 