import { Fail, Ok, type Result } from '@jsfsi-core/ts-crossplatform';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { type AuthClient } from './AuthenticationAdapter';
import { type EmailPasswordCredentials } from './AuthProvider';
import { PasswordResetEmailFailure } from './PasswordResetEmailFailure';
import { SignInFailure } from './SignInFailure';
import { SignUpFailure } from './SignUpFailure';
import { type User } from './User';

export type FirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export class FirebaseClient implements AuthClient<User> {
  private firebaseUser: firebase.User | null = null;
  private auth?: firebase.auth.Auth;
  private googleProvider?: firebase.auth.GoogleAuthProvider;

  constructor(private readonly config: FirebaseConfig) {}

  private get firebaseAuth() {
    /* v8 ignore if -- @preserve */
    if (!this.auth) {
      throw new Error('Firebase client not initialized');
    }

    /* v8 ignore next -- @preserve */
    return this.auth;
  }

  private get firebaseGoogleProvider() {
    /* v8 ignore if -- @preserve */
    if (!this.googleProvider) {
      throw new Error('Firebase client not initialized');
    }

    /* v8 ignore next -- @preserve */
    return this.googleProvider;
  }

  private async mapFirebaseUserToUser(firebaseUser: firebase.User): Promise<User> {
    return {
      id: firebaseUser.uid,
      providerId: firebaseUser.providerId,
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      avatar: firebaseUser.photoURL,
      idToken: await firebaseUser.getIdToken(),
    };
  }

  public initialize() {
    /* v8 ignore next -- @preserve */
    if (!firebase.apps.length) {
      firebase.initializeApp(this.config);
    }

    this.auth = firebase.auth();
    this.googleProvider = new firebase.auth.GoogleAuthProvider();

    return this;
  }

  public async signOut() {
    await this.firebaseAuth.signOut();
  }

  public onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return this.firebaseAuth.onAuthStateChanged(async (user) => {
      this.firebaseUser = user;

      /* v8 ignore next -- @preserve */
      const providerUser = this.firebaseUser
        ? /* v8 ignore next -- @preserve */
          await this.mapFirebaseUserToUser(this.firebaseUser)
        : null;

      /* v8 ignore next -- @preserve */
      callback(providerUser);
    });
  }

  public async signInWithGoogle(): Promise<Result<User, SignInFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.signInWithPopup(this.firebaseGoogleProvider);

      /* v8 ignore if -- @preserve */
      if (!firebaseUser.user) {
        return Fail(new SignInFailure('User not returned from Firebase'));
      }

      this.firebaseUser = firebaseUser.user;

      const user = await this.mapFirebaseUserToUser(this.firebaseUser);

      return Ok(user);
    } catch (error) {
      /* v8 ignore next -- @preserve */
      return Fail(new SignInFailure(error));
    }
  }

  public async signInWithEmailAndPassword({
    email,
    password,
  }: EmailPasswordCredentials): Promise<Result<User, SignInFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.signInWithEmailAndPassword(email, password);

      /* v8 ignore if -- @preserve */
      if (!firebaseUser.user) {
        return Fail(new SignInFailure('User not returned from Firebase'));
      }

      this.firebaseUser = firebaseUser.user;

      const user = await this.mapFirebaseUserToUser(this.firebaseUser);

      return Ok(user);
    } catch (error) {
      /* v8 ignore next -- @preserve */
      return Fail(new SignInFailure(error));
    }
  }

  public async createUserWithEmailAndPassword({
    email,
    password,
  }: EmailPasswordCredentials): Promise<Result<User, SignUpFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.createUserWithEmailAndPassword(email, password);

      /* v8 ignore if -- @preserve */
      if (!firebaseUser.user) {
        return Fail(new SignUpFailure('User not returned from Firebase'));
      }

      this.firebaseUser = firebaseUser.user;

      const user = await this.mapFirebaseUserToUser(this.firebaseUser);

      return Ok(user);
    } catch (error) {
      /* v8 ignore next -- @preserve */
      return Fail(new SignUpFailure(error));
    }
  }

  public async getIdToken(): Promise<string | undefined> {
    return this.firebaseUser?.getIdToken();
  }

  public async sendPasswordResetEmail(
    email: string,
  ): Promise<Result<void, PasswordResetEmailFailure>> {
    try {
      await this.firebaseAuth.sendPasswordResetEmail(email);
      return Ok(undefined);
    } catch (error) {
      /* v8 ignore next -- @preserve */
      return Fail(new PasswordResetEmailFailure(error));
    }
  }
}
