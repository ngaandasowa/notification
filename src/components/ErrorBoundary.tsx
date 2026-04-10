import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    if (hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
          <div className="w-20 h-20 bg-black rounded-3xl flex items-center justify-center mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Something went wrong</h1>
          <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
            We encountered an unexpected error. This might be due to a connection issue or a temporary glitch.
          </p>
          
          {error && (
            <div className="w-full max-w-lg p-4 bg-gray-50 rounded-2xl border border-gray-200 mb-8 overflow-auto max-h-40">
              <code className="text-xs text-black font-mono text-left block">
                {error.message}
              </code>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-8 py-3 bg-black text-white font-bold rounded-full hover:bg-gray-800 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Page
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-8 py-3 bg-white border-2 border-black text-black font-bold rounded-full hover:bg-gray-50 transition-all"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
