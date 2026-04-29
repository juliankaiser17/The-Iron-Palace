import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center p-8 bg-black/40 border border-red-500/20 rounded-sm">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 rounded-sm">
                <AlertTriangle size={32} />
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg tracking-[0.2em] text-red-500 uppercase mb-2">SYSTEM FAILURE</h2>
              <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                CRITICAL EXCEPTION DETECTED IN RENDER ENGINE. 
                <br /><span className="text-white/40">{this.state.error?.message}</span>
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-white/5 border border-white/10 font-mono text-[10px] uppercase tracking-widest hover:bg-white/10 transition-colors"
            >
              Restart Module
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
