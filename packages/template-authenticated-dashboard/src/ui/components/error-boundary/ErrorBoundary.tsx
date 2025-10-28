import React, { Component, type ReactNode } from 'react';

import { UnexpectedErrorPage } from '../../pages/unexpected-error/UnexpectedErrorPage';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
interface ErrorBoundaryProps {
  children?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };

    window.addEventListener('unhandledrejection', this.unhandledRejectionHandler);
  }

  public static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('unhandledrejection', this.unhandledRejectionHandler.bind(this));
  }

  /* v8 ignore next -- @preserve */
  private unhandledRejectionHandler(event: PromiseRejectionEvent): void {
    // eslint-disable-next-line no-console
    console.error(event.reason);

    this.setState({ hasError: true, error: event.reason });
  }

  public render() {
    if (this.state.hasError) {
      return <UnexpectedErrorPage>{this.state.error?.message}</UnexpectedErrorPage>;
    }

    return this.props.children;
  }
}
