import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RotateCcw, Home } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Error Boundary Caught Exception]:', error, errorInfo);
  }

  private handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-[#0a0a0c]/20 rounded-3xl border border-dashed border-gray-200 dark:border-white/10 max-w-2xl mx-auto my-8">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-400 rounded-2xl mb-4">
              <ShieldAlert className="h-10 w-10 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Well, this is unexpected
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
              We encountered an isolated rendering hitch in this workspace panel. Don't worry, your general session and other data are entirely safe.
            </p>

            {this.state.error && (
              <div className="w-full text-left p-4 bg-gray-100 dark:bg-white/5 rounded-2xl mb-6 font-mono text-xs text-rose-500 dark:text-rose-400 max-h-40 overflow-y-auto border border-gray-200/50 dark:border-white/5">
                <p className="font-bold mb-1">Error Trace:</p>
                <p>{this.state.error.message || String(this.state.error)}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center">
              <button
                id="error-boundary-retry-btn"
                onClick={this.handleReset}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
                Retry Workspace
              </button>
              
              <a
                id="error-boundary-home-link"
                href="/"
                className="flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </a>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
