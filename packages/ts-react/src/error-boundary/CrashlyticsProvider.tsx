import type React from 'react';

import { CrashlyticsContext } from './CrashlyticsContext';
import { ErrorBoundary } from './ErrorBoundary';

function reportCrash(...args: unknown[]) {
  // biome-ignore lint/suspicious/noConsole: crashlytics default reporter
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
      <CrashlyticsContext.Provider value={{ reportFailure: reportCrash }}>{children}</CrashlyticsContext.Provider>
    </ErrorBoundary>
  );
}
