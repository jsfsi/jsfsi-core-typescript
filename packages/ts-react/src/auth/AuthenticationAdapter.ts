import type { Result } from '@jsfsi-core/ts-crossplatform';

import type { AuthService, EmailPasswordCredentials } from './AuthProvider';
import type { EmailVerificationFailure } from './EmailVerificationFailure';
import type { PasswordResetEmailFailure } from './PasswordResetEmailFailure';
import type { ReloadUserFailure } from './ReloadUserFailure';
import type { SignInFailure } from './SignInFailure';
import type { SignUpFailure } from './SignUpFailure';
import type { User } from './User';

export type AuthClient<TUser extends User> = {
  onAuthStateChanged(callback: (user: TUser | null) => void): () => void;
  signOut(): Promise<void>;
  signInWithGoogle(): Promise<Result<TUser, SignInFailure>>;
  signInWithEmailAndPassword(credentials: EmailPasswordCredentials): Promise<Result<TUser, SignInFailure>>;
  createUserWithEmailAndPassword(credentials: EmailPasswordCredentials): Promise<Result<TUser, SignUpFailure>>;
  sendPasswordResetEmail(email: string): Promise<Result<void, PasswordResetEmailFailure>>;
  sendEmailVerification(): Promise<Result<void, EmailVerificationFailure>>;
  reloadUser(): Promise<Result<TUser | null, ReloadUserFailure>>;
};

export class AuthenticationAdapter<TUser extends User> implements AuthService<TUser> {
  constructor(private readonly client: AuthClient<TUser>) {}

  public onAuthStateChanged(callback: (user: TUser | null) => void) {
    return this.client.onAuthStateChanged(callback);
  }

  public async signOut() {
    await this.client.signOut();
  }

  public async signIn() {
    return this.client.signInWithGoogle();
  }

  public async signInWithEmailAndPassword(credentials: EmailPasswordCredentials) {
    return this.client.signInWithEmailAndPassword(credentials);
  }

  public async signUp() {
    return this.client.signInWithGoogle();
  }

  public async signUpWithEmailAndPassword(credentials: EmailPasswordCredentials) {
    return this.client.createUserWithEmailAndPassword(credentials);
  }

  public async sendPasswordResetEmail(email: string) {
    return this.client.sendPasswordResetEmail(email);
  }

  public async sendEmailVerification() {
    return this.client.sendEmailVerification();
  }

  public async reloadUser() {
    return this.client.reloadUser();
  }
}
