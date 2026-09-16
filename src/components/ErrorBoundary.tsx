import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('[JAM AI Error Boundary caught]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorageAndReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-950 px-4 text-center text-slate-100 selection:bg-indigo-500/30">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/20 text-red-400 shadow-[0_0_40px_rgba(239,68,68,0.2)] mb-6">
            <AlertTriangle className="h-10 w-10 text-red-400" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl mb-2">
            JAM AI Recovery Mode
          </h1>
          <p className="max-w-md text-sm text-slate-400 mb-6 leading-relaxed">
            एप्लिकेशन लोड होने में रुकावट आई थी। हमने सुरक्षित रिकवरी मोड तैयार किया है। नीचे दिए गए बटन से रीलोड करें:
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reload App (रीलोड करें)</span>
            </button>
            <button
              onClick={this.handleClearStorageAndReset}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800/90 border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-slate-700 transition-all cursor-pointer"
            >
              <Trash2 className="h-4 w-4 text-slate-400" />
              <span>Clear Cache & Reset</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
