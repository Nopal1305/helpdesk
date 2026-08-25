import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-orange-100 p-4 text-ink">
          <section className="w-full max-w-md border-2 border-ink bg-paper p-6 shadow-brutal">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-alert">Error</p>
            <h2 className="mt-2 font-display text-2xl font-black uppercase tracking-tight text-ink">
              Something went wrong
            </h2>
            <pre className="mt-4 p-4 bg-ink/5 border-2 border-ink text-xs text-ink/80 overflow-auto max-h-60">
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 cursor-pointer border-2 border-ink bg-go px-4 py-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-paper shadow-brutal-sm hover:-translate-y-1 hover:shadow-lg"
            >
              Reload App
            </button>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;