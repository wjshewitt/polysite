"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Filter out empty errors from websocket library
    if (error && typeof error === 'object' && Object.keys(error).length === 0) {
      console.warn("ErrorBoundary: Ignored empty error object from websocket");
      return;
    }
    
    // Use console.warn instead of console.error to prevent Next.js from throwing
    console.warn("ErrorBoundary caught an error:", error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback || DefaultErrorFallback;
      return <Fallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error; resetError: () => void }> = ({
  error,
  resetError,
}) => (
  <div className="h-full bg-card border border-border flex items-center justify-center">
    <div className="flex flex-col items-center gap-4 p-6 text-center">
      <div className="text-destructive font-mono text-lg">⚠️ Something went wrong</div>
      <div className="text-muted-foreground font-mono text-sm max-w-md">
        An unexpected error occurred. This might be due to a network issue or a temporary glitch.
      </div>
      {error && (
        <details className="text-xs text-muted-foreground/80">
          <summary>Error details</summary>
          <pre className="mt-2 p-2 bg-muted rounded text-left overflow-auto max-w-sm">
            {error.message}
          </pre>
        </details>
      )}
      <button
        onClick={resetError}
        className="px-4 py-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded transition-colors font-mono text-sm"
      >
        Try Again
      </button>
    </div>
  </div>
);