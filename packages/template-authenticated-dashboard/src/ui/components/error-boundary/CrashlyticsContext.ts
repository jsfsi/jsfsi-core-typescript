import { createContext, useContext } from 'react';

export type CrashlyticsContextType = {
  reportFailure: (...args: unknown[]) => void;
};

export const CrashlyticsContext = createContext<CrashlyticsContextType>({
  /* c8 ignore next */
  reportFailure: () => undefined,
});

export const useCrashlytics = () => useContext(CrashlyticsContext);
