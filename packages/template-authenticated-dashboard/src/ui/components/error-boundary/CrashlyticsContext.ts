import { createContext, useContext } from 'react';

export type CrashlyticsContextType = {
  reportFailure: (...args: unknown[]) => void;
};

export const CrashlyticsContext = createContext<CrashlyticsContextType>({
  /* v8 ignore next -- @preserve */
  reportFailure: () => undefined,
});

export const useCrashlytics = () => useContext(CrashlyticsContext);
