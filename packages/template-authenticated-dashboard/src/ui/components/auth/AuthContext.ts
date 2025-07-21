import { Ok, Result } from '@jsfsi-core/ts-crossplatform';
import { createContext, useContext } from 'react';

import { PasswordResetEmailFailure } from '../../../domain/models/PasswordResetEmailFailure';
import { SignInFailure } from '../../../domain/models/SignInFailure';
import { SignUpFailure } from '../../../domain/models/SignUpFailure';
import { User } from '../../../domain/models/User';

export type AuthContextType = {
  currentUser: User | null;
  loading: boolean;
  signIn: () => Promise<Result<User, SignInFailure>>;
  signOut: () => Promise<void>;
  signInWithEmailAndPassword: (options: {
    email: string;
    password: string;
  }) => Promise<Result<User, SignInFailure>>;
  signUp: () => Promise<Result<User, SignUpFailure>>;
  signUpWithEmailAndPassword: (options: {
    email: string;
    password: string;
  }) => Promise<Result<User, SignUpFailure>>;
  sendPasswordResetEmail: (email: string) => Promise<Result<void, PasswordResetEmailFailure>>;
};

const dummyUser: User = {
  id: 'context-placeholder',
  providerId: 'context-placeholder',
  email: 'context-placeholder',
  idToken: 'context-placeholder',
  name: 'context-placeholder',
  avatar: 'context-placeholder',
};

export const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signIn: async () => Ok(dummyUser),
  signOut: async () => undefined,
  signInWithEmailAndPassword: async () => Ok(dummyUser),
  signUp: async () => Ok(dummyUser),
  signUpWithEmailAndPassword: async () => Ok(dummyUser),
  sendPasswordResetEmail: async () => Ok(undefined),
});

export const useAuth = () => useContext(AuthContext);
