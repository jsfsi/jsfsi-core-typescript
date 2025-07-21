import { Result } from '@jsfsi-core/ts-crossplatform';
import { useEffect, useState, ReactNode } from 'react';

import { SignUpFailure } from '../../../domain/models/SignUpFailure';
import { User } from '../../../domain/models/User';
import { AuthenticationService } from '../../../domain/services/AuthenticationService';
import { FullscreenLoader } from '../fullscreen-loader';
import { useInjection } from '../ioc/IoCContext';

import { AuthContext } from './AuthContext';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const authenticationService = useInjection(AuthenticationService);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    setLoading(true);
    authenticationService.signOut();
  };

  const signIn = async () => {
    setLoading(true);
    const result = await authenticationService.signIn();
    setLoading(false);
    return result;
  };

  const signInWithEmailAndPassword = async (options: { email: string; password: string }) => {
    setLoading(true);
    const result = await authenticationService.signInWithEmailAndPassword(options);
    setLoading(false);
    return result;
  };

  const signUp = async (): Promise<Result<User, SignUpFailure>> => {
    setLoading(true);
    const result = await authenticationService.signUp();
    setLoading(false);
    return result;
  };

  const signUpWithEmailAndPassword = async (options: {
    email: string;
    password: string;
  }): Promise<Result<User, SignUpFailure>> => {
    setLoading(true);
    const result = await authenticationService.signUpWithEmailAndPassword(options);
    setLoading(false);
    return result;
  };

  const sendPasswordResetEmail = async (email: string) => {
    setLoading(true);
    const result = await authenticationService.sendPasswordResetEmail(email);
    setLoading(false);
    return result;
  };

  useEffect(() => {
    const unsubscribe = authenticationService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signOut,
    signIn,
    signInWithEmailAndPassword,
    signUp,
    signUpWithEmailAndPassword,
    sendPasswordResetEmail,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading && <FullscreenLoader />}
      {children}
    </AuthContext.Provider>
  );
}
