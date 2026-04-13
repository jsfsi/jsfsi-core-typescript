import { AuthProvider, User, useInjection } from '@jsfsi-core/ts-react';

import { AuthenticationService } from '../../domain/services/AuthenticationService';
import { FullscreenLoader } from '../components/fullscreen-loader';

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  const authenticationService = useInjection(AuthenticationService);

  return (
    <AuthProvider<User>
      loader={FullscreenLoader}
      onAuthChanged={(callback) => authenticationService.onAuthStateChanged(callback)}
      onSignIn={() => authenticationService.signIn()}
      onSignOut={() => authenticationService.signOut()}
      onSignInWithEmailAndPassword={(credentials) =>
        authenticationService.signInWithEmailAndPassword(credentials)
      }
      onSignUp={() => authenticationService.signUp()}
      onSignUpWithEmailAndPassword={(credentials) =>
        authenticationService.signUpWithEmailAndPassword(credentials)
      }
      onSendPasswordResetEmail={(email) => authenticationService.sendPasswordResetEmail(email)}
    >
      {children}
    </AuthProvider>
  );
}
