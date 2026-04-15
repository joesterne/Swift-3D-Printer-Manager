import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
          <div className="max-w-md w-full glass-card p-10 text-center space-y-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
            
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500 shadow-lg shadow-red-500/10">
              <AlertCircle size={40} />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white uppercase tracking-tight">System Malfunction</h1>
              <p className="text-white/40 text-sm leading-relaxed">
                Something went wrong while processing your request. Our engineers have been notified.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-black/40 rounded-xl p-4 text-left border border-white/5 overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-red-400/80 leading-tight">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-xl h-12"
                onClick={this.handleReset}
              >
                <RefreshCcw size={18} className="mr-2" /> Retry
              </Button>
              <Button 
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl h-12"
                onClick={this.handleGoHome}
              >
                <Home size={18} className="mr-2" /> Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
