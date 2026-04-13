import {
  BindingType,
  CrashlyticsProvider,
  IoCContextProvider,
  ThemeProvider,
} from '@jsfsi-core/ts-react';
import { I18nextProvider } from 'react-i18next';

import { Toaster } from '../components/sonner';
import i18n from '../i18n/i18n';
import { UnexpectedErrorPage } from '../pages/unexpected-error/UnexpectedErrorPage';

import { AppAuthProvider } from './AppAuthProvider';
import { AppBindings } from './AppBindings';
import { AppRouter } from './AppRouter';

type AppProvidersProps = {
  children: React.ReactNode;
  bindings?: readonly BindingType<unknown>[];
};

export function AppProviders({ children, bindings = AppBindings }: AppProvidersProps) {
  return (
    <IoCContextProvider bindings={bindings}>
      <CrashlyticsProvider fallback={UnexpectedErrorPage}>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AppAuthProvider>{children}</AppAuthProvider>
          </ThemeProvider>
        </I18nextProvider>
      </CrashlyticsProvider>
    </IoCContextProvider>
  );
}

export function App() {
  return (
    <AppProviders>
      <AppRouter />
      <Toaster richColors position="top-right" duration={3000} />
    </AppProviders>
  );
}
