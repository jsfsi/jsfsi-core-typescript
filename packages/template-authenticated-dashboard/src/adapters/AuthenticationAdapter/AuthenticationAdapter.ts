import { Result } from '@jsfsi-core/ts-crossplatform';
import 'firebase/compat/auth';

import { OnAuthStateChangedCallback } from '../../domain/models/OnAuthStateChangedCallback';
import { PasswordResetEmailFailure } from '../../domain/models/PasswordResetEmailFailure';
import { SignInFailure } from '../../domain/models/SignInFailure';
import { SignUpFailure } from '../../domain/models/SignUpFailure';
import { User } from '../../domain/models/User';
import { FirebaseClient } from '../FirebaseClient/FirebaseClient';

export class AuthenticationAdapter {
  constructor(private readonly firebaseClient: FirebaseClient) {}

  public async signOut() {
    await this.firebaseClient.signOut();
  }

  public onAuthStateChanged(callback: OnAuthStateChangedCallback): () => void {
    return this.firebaseClient.onAuthStateChanged(callback);
  }

  public async signIn(): Promise<Result<User, SignInFailure>> {
    return this.firebaseClient.signInWithGoogle();
  }

  public async signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignInFailure>> {
    return this.firebaseClient.signInWithEmailAndPassword({ email, password });
  }

  public async signUpWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignUpFailure>> {
    return this.firebaseClient.createUserWithEmailAndPassword({ email, password });
  }

  public async sendPasswordResetEmail(
    email: string,
  ): Promise<Result<void, PasswordResetEmailFailure>> {
    return this.firebaseClient.sendPasswordResetEmail(email);
  }
}
