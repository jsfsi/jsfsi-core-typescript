import type React from 'react';
import { useMemo, useRef } from 'react';

import { CrashlyticsContext, type CrashlyticsContextType } from './CrashlyticsContext';
import { type CrashlyticsReporter, notifyReporter } from './CrashlyticsReport';
import { ErrorBoundary } from './ErrorBoundary';

export function CrashlyticsProvider({
  children,
  fallback,
  onReport,
}: {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error | null }>;
  onReport?: CrashlyticsReporter;
}) {
  const onReportRef = useRef(onReport);
  onReportRef.current = onReport;

  const value = useMemo<CrashlyticsContextType>(
    () => ({
      reportFailure: (...args: unknown[]) => {
        // biome-ignore lint/suspicious/noConsole: crashlytics default reporter
        console.error(args);
        notifyReporter(onReportRef.current, { source: 'report-failure', args });
      },
    }),
    [],
  );

  return (
    <ErrorBoundary fallback={fallback} onReport={onReport}>
      <CrashlyticsContext.Provider value={value}>{children}</CrashlyticsContext.Provider>
    </ErrorBoundary>
  );
}
