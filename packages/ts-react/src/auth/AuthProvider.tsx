import { type Result } from '@jsfsi-core/ts-crossplatform';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { PasswordResetEmailFailure } from './PasswordResetEmailFailure';
import { SignInFailure } from './SignInFailure';
import { SignUpFailure } from './SignUpFailure';

export type EmailPasswordCredentials = {
  email: string;
  password: string;
};

export type AuthMethods<TUser> = {
  signIn: () => Promise<Result<TUser, SignInFailure>>;
  signOut: () => Promise<void>;
  signInWithEmailAndPassword: (
    credentials: EmailPasswordCredentials,
  ) => Promise<Result<TUser, SignInFailure>>;
  signUp: () => Promise<Result<TUser, SignUpFailure>>;
  signUpWithEmailAndPassword: (
    credentials: EmailPasswordCredentials,
  ) => Promise<Result<TUser, SignUpFailure>>;
  sendPasswordResetEmail: (email: string) => Promise<Result<void, PasswordResetEmailFailure>>;
};

export type AuthService<TUser> = AuthMethods<TUser> & {
  onAuthStateChanged: (callback: (user: TUser | null) => void) => () => void;
};

export type AuthValue<TUser> = {
  currentUser: TUser | null;
  loading: boolean;
} & AuthMethods<TUser>;

const AuthContext = createContext<unknown>(null);

type AuthProviderProps<TUser> = {
  children: ReactNode;
  loader: React.ComponentType;
  onAuthChanged: (callback: (user: TUser | null) => void) => () => void;
  onSignIn: AuthMethods<TUser>['signIn'];
  onSignOut: AuthMethods<TUser>['signOut'];
  onSignInWithEmailAndPassword: AuthMethods<TUser>['signInWithEmailAndPassword'];
  onSignUp: AuthMethods<TUser>['signUp'];
  onSignUpWithEmailAndPassword: AuthMethods<TUser>['signUpWithEmailAndPassword'];
  onSendPasswordResetEmail: AuthMethods<TUser>['sendPasswordResetEmail'];
};

export function AuthProvider<TUser>({
  children,
  loader: Loader,
  onAuthChanged,
  onSignIn,
  onSignOut,
  onSignInWithEmailAndPassword,
  onSignUp,
  onSignUpWithEmailAndPassword,
  onSendPasswordResetEmail,
}: AuthProviderProps<TUser>) {
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState(true);

  const onAuthChangedRef = useRef(onAuthChanged);
  onAuthChangedRef.current = onAuthChanged;

  const methodsRef = useRef({
    onSignIn,
    onSignOut,
    onSignInWithEmailAndPassword,
    onSignUp,
    onSignUpWithEmailAndPassword,
    onSendPasswordResetEmail,
  });
  methodsRef.current = {
    onSignIn,
    onSignOut,
    onSignInWithEmailAndPassword,
    onSignUp,
    onSignUpWithEmailAndPassword,
    onSendPasswordResetEmail,
  };

  useEffect(() => {
    return onAuthChangedRef.current((user) => {
      setCurrentUser(user);
      setLoading(false);
    });
  }, []);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    try {
      return await fn();
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo<AuthValue<TUser>>(
    () => ({
      currentUser,
      loading,
      signOut: () => withLoading(() => methodsRef.current.onSignOut()),
      signIn: () => withLoading(() => methodsRef.current.onSignIn()),
      signInWithEmailAndPassword: (credentials) =>
        withLoading(() => methodsRef.current.onSignInWithEmailAndPassword(credentials)),
      signUp: () => withLoading(() => methodsRef.current.onSignUp()),
      signUpWithEmailAndPassword: (credentials) =>
        withLoading(() => methodsRef.current.onSignUpWithEmailAndPassword(credentials)),
      sendPasswordResetEmail: (email) =>
        withLoading(() => methodsRef.current.onSendPasswordResetEmail(email)),
    }),
    [currentUser, loading, withLoading],
  );

  return (
    <AuthContext.Provider value={value}>{loading ? <Loader /> : children}</AuthContext.Provider>
  );
}

export function useAuth<TUser>(): AuthValue<TUser> {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return value as AuthValue<TUser>;
}
