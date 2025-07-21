import { Fail, Ok, Result } from '@jsfsi-core/ts-crossplatform';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

import { configuration } from '../../ConfigurationService';
import { OnAuthStateChangedCallback } from '../../domain/models/OnAuthStateChangedCallback';
import { PasswordResetEmailFailure } from '../../domain/models/PasswordResetEmailFailure';
import { SignInFailure } from '../../domain/models/SignInFailure';
import { SignUpFailure } from '../../domain/models/SignUpFailure';
import { User } from '../../domain/models/User';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: configuration.VITE_FIREBASE_API_KEY,
  authDomain: configuration.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: configuration.VITE_FIREBASE_PROJECT_ID,
  storageBucket: configuration.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: configuration.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: configuration.VITE_FIREBASE_APP_ID,
};

export class FirebaseClient {
  private firebaseUser: firebase.User | null = null;
  private auth?: firebase.auth.Auth;
  private googleProvider?: firebase.auth.GoogleAuthProvider;

  /* c8 ignore start */
  private get firebaseAuth() {
    if (!this.auth) {
      throw new Error('Authentication adapter not initialized');
    }

    return this.auth;
  }

  private get firebaseGoogleProvider() {
    if (!this.googleProvider) {
      throw new Error('Authentication adapter not initialized');
    }

    return this.googleProvider;
  }
  /* c8 ignore end */

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
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

    this.auth = firebase.auth();
    this.googleProvider = new firebase.auth.GoogleAuthProvider();

    return this;
  }

  public async signOut() {
    await this.firebaseAuth.signOut();
  }

  public onAuthStateChanged(callback: OnAuthStateChangedCallback): () => void {
    return this.firebaseAuth.onAuthStateChanged(async (user) => {
      this.firebaseUser = user;

      const providerUser = this.firebaseUser
        ? await this.mapFirebaseUserToUser(this.firebaseUser)
        : null;

      /* c8 ignore next */
      callback(providerUser);
    });
  }

  public async signInWithGoogle(): Promise<Result<User, SignInFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.signInWithPopup(this.firebaseGoogleProvider);

      if (!firebaseUser.user) {
        return Fail(new SignInFailure('User not returned from Firebase'));
      }

      this.firebaseUser = firebaseUser.user;

      const user = await this.mapFirebaseUserToUser(this.firebaseUser);

      return Ok(user);
    } catch (error) {
      return Fail(new SignInFailure(error));
    }
  }

  public async signInWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignInFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.signInWithEmailAndPassword(email, password);

      if (!firebaseUser.user) {
        return Fail(new SignInFailure('User not returned from Firebase'));
      }

      this.firebaseUser = firebaseUser.user;

      const user = await this.mapFirebaseUserToUser(this.firebaseUser);

      return Ok(user);
    } catch (error) {
      return Fail(new SignInFailure(error));
    }
  }

  public async createUserWithEmailAndPassword({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<Result<User, SignUpFailure>> {
    try {
      const firebaseUser = await this.firebaseAuth.createUserWithEmailAndPassword(email, password);

      if (!firebaseUser.user) {
        return Fail(new SignUpFailure('User not returned from Firebase'));
      }

      this.firebaseUser = firebaseUser.user;

      const user = await this.mapFirebaseUserToUser(this.firebaseUser);

      return Ok(user);
    } catch (error) {
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
      return Fail(new PasswordResetEmailFailure(error));
    }
  }
}
