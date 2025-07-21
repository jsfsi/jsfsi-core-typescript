import { I18nextProvider } from 'react-i18next';

import { AuthProvider } from '../components/auth/AuthProvider';
import { CrashlyticsProvider } from '../components/error-boundary/CrashlyticsProvider';
import { BindingType, IoCContextProvider } from '../components/ioc/IoCContextProvider';
import { Toaster } from '../components/sonner';
import i18n from '../i18n/i18n';
import { ThemeProvider } from '../theme/ThemeProvider';

import { AppBindings } from './AppBindings';
import { AppRouter } from './AppRouter';

type AppProvidersProps = {
  children: React.ReactNode;
  bindings?: readonly BindingType<unknown>[];
};

export function AppProviders({ children, bindings = AppBindings }: AppProvidersProps) {
  return (
    <IoCContextProvider bindings={bindings}>
      <CrashlyticsProvider>
        <I18nextProvider i18n={i18n}>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <AuthProvider>{children}</AuthProvider>
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
