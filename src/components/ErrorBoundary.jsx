import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Back2U caught error in component tree:', error, errorInfo);
  }

  handleReset = () => {
    // Clear potentially corrupted local keys
    try {
      // Don't wipe current user, just reset error
    } catch {}
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FD] font-sans">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 text-center">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              An unexpected error occurred while updating the campus board. You can reload the page to continue.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 font-mono mb-6 text-left overflow-x-auto border border-slate-200">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 rounded-full text-xs font-bold text-white bg-[#371B7A] hover:bg-[#2C1563] shadow-md transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reload Campus Board</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
