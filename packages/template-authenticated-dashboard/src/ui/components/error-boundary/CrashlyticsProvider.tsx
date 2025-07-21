import { CrashlyticsContext } from './CrashlyticsContext';
import { ErrorBoundary } from './ErrorBoundary';

function reportCrash(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.error(args);
}

export function CrashlyticsProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <CrashlyticsContext.Provider value={{ reportFailure: reportCrash }}>
        {children}
      </CrashlyticsContext.Provider>
    </ErrorBoundary>
  );
}
