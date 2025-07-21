import 'firebase/compat/auth';

import { Result } from '@jsfsi-core/ts-crossplatform';

import { AuthenticationAdapter } from '../../adapters/AuthenticationAdapter/AuthenticationAdapter';
import { PasswordResetEmailFailure } from '../../domain/models/PasswordResetEmailFailure';
import { SignInFailure } from '../../domain/models/SignInFailure';
import { User } from '../../domain/models/User';
import { SignUpFailure } from '../models/SignUpFailure';

export type OnAuthStateChangedCallback = (user: User | null) => void;

export class AuthenticationService {
  constructor(private readonly authAdapter: AuthenticationAdapter) {}

  public async signOut() {
    await this.authAdapter.signOut();
  }

  public onAuthStateChanged(callback: OnAuthStateChangedCallback): () => void {
    return this.authAdapter.onAuthStateChanged((user) => {
      callback(user);
    });
  }

  public async signIn(): Promise<Result<User, SignInFailure>> {
    return this.authAdapter.signIn();
  }

  public async signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignInFailure>> {
    return this.authAdapter.signInWithEmailAndPassword({ email, password });
  }

  public async signUpWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignUpFailure>> {
    return this.authAdapter.signUpWithEmailAndPassword({ email, password });
  }

  public async signUp(): Promise<Result<User, SignUpFailure>> {
    return this.authAdapter.signIn();
  }

  public async sendPasswordResetEmail(
    email: string,
  ): Promise<Result<void, PasswordResetEmailFailure>> {
    return this.authAdapter.sendPasswordResetEmail(email);
  }
}
