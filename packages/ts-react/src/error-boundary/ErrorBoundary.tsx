import React, { Component, type ReactNode } from 'react';

import { type CrashlyticsReporter, notifyReporter } from './CrashlyticsReport';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: React.ComponentType<{ error: Error | null }>;
  onReport?: CrashlyticsReporter;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // biome-ignore lint/suspicious/noConsole: error boundary needs console.error
    console.error(error, errorInfo);
    notifyReporter(this.props.onReport, {
      source: 'boundary',
      args: [error],
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  public componentDidMount(): void {
    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler);
  }

  private readonly unhandledRejectionHandler = (event: PromiseRejectionEvent): void => {
    // biome-ignore lint/suspicious/noConsole: error boundary needs console.error
    console.error(event.reason);
    notifyReporter(this.props.onReport, { source: 'unhandled-rejection', args: [event.reason] });

    this.setState({ hasError: true, error: event.reason });
  };

  public render() {
    if (this.state.hasError) {
      const Fallback = this.props.fallback;
      if (Fallback) {
        return <Fallback error={this.state.error} />;
      }
      return <>{this.state.error?.message}</>;
    }

    return this.props.children;
  }
}
