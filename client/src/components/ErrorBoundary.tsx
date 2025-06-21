import React, { Component, ReactNode } from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';
import { logger } from '../utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught an error', { error: error.message, stack: error.stack, componentStack: errorInfo.componentStack });
    
    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null
    });

    // Her kan vi sende error til logging service som Sentry
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: React.ErrorInfo) => {
    // Implementer logging til extern service (Sentry, LogRocket, etc.)
    logger.error('Error logged to external service', { 
      error: error.message, 
      stack: error.stack, 
      componentStack: errorInfo.componentStack 
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/oversikt';
  };

  render() {
    if (this.state.hasError) {
      // Bruk custom fallback hvis oppgitt
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Standard error UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-2 py-1">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg px-2 py-1">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <FiAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div className="text-center">
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Noe gikk galt
              </h1>
              <p className="text-gray-600 mb-6">
                Det oppstod en uventet feil. Prøv å laste siden på nytt, eller gå tilbake til forsiden.
              </p>
              
              <div className="space-y-8">
                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiRefreshCw className="w-4 h-4 mr-2" />
                  Last siden på nytt
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center px-2 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                >
                  <FiHome className="w-4 h-4 mr-2" />
                  Gå til forsiden
                </button>
              </div>
              
              {/* Vis error detaljer i development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Vis feildetaljer (development)
                  </summary>
                  <div className="mt-2 px-2 py-1 bg-gray-100 rounded text-xs font-mono overflow-auto max-h-40">
                    <div className="text-red-600 font-bold">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    {this.state.error.stack && (
                      <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo && (
                      <div className="mt-4">
                        <div className="font-bold text-gray-700">Component Stack:</div>
                        <pre className="mt-1 whitespace-pre-wrap">
                          {this.state.errorInfo}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper for funksjonskomponenter
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

// Hook for å håndtere async errors
export const useErrorHandler = () => {
  const [, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    logger.error('Async error caught', { error: error.message, stack: error.stack });
    setError(error);
    
    // Trigger error boundary
    throw error;
  }, []);

  return handleError;
};

export default ErrorBoundary; 