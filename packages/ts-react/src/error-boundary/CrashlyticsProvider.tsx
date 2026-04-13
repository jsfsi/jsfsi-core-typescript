import React from 'react';

import { CrashlyticsContext } from './CrashlyticsContext';
import { ErrorBoundary } from './ErrorBoundary';

function reportCrash(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(args);
}

export function CrashlyticsProvider({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null }>;
}) {
  return (
    <ErrorBoundary fallback={fallback}>
      <CrashlyticsContext.Provider value={{ reportFailure: reportCrash }}>
        {children}
      </CrashlyticsContext.Provider>
    </ErrorBoundary>
  );
}
