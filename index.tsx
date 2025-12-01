import React, { Component, ReactNode, ErrorInfo } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Basic Error Boundary to catch crashes and show message instead of black screen
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Enigma App Crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-red-500 p-4 font-mono text-center">
          <h1 className="text-2xl font-bold mb-4">Tizimda xatolik yuz berdi</h1>
          <p className="text-sm bg-gray-900 p-4 rounded border border-gray-700 max-w-md overflow-auto">
            {this.state.error?.message || "Noma'lum xatolik"}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Sahifani yangilash
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
  </React.StrictMode>
);