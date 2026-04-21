import { Fail, Ok } from '@jsfsi-core/ts-crossplatform';
import firebase from 'firebase/compat/app';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EmailVerificationFailure } from './EmailVerificationFailure';
import { FirebaseClient, type FirebaseConfig } from './FirebaseClient';

const config: FirebaseConfig = {
  apiKey: 'test-api-key',
  authDomain: 'test-auth-domain',
  projectId: 'test-project-id',
  storageBucket: 'test-storage-bucket',
  messagingSenderId: 'test-messaging-sender-id',
  appId: 'test-app-id',
};

const expectedUser = {
  id: 'some-user-uid',
  providerId: 'mock-provider-id',
  email: 'mock-email',
  idToken: 'mock-id-token',
  emailVerified: false,
};

describe('FirebaseClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('initializes firebase with the provided config', () => {
      new FirebaseClient(config).initialize();

      expect(firebase.initializeApp).toHaveBeenCalledTimes(1);
      expect(firebase.initializeApp).toHaveBeenCalledWith(config);
    });
  });

  describe('signOut', () => {
    it('calls firebase.auth().signOut()', () => {
      const client = new FirebaseClient(config).initialize();
      client.signOut();

      expect(firebase.auth().signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('signInWithGoogle', () => {
    it('calls firebase.auth().signInWithPopup()', async () => {
      const client = new FirebaseClient(config).initialize();
      const result = await client.signInWithGoogle();

      expect(firebase.auth().signInWithPopup).toHaveBeenCalledTimes(1);
      expect(result).toEqual(Ok(expectedUser));
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('calls firebase.auth().signInWithEmailAndPassword()', async () => {
      const client = new FirebaseClient(config).initialize();
      const result = await client.signInWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(firebase.auth().signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(firebase.auth().signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@test.com',
        'password',
      );
      expect(result).toEqual(Ok(expectedUser));
    });
  });

  describe('createUserWithEmailAndPassword', () => {
    it('calls firebase.auth().createUserWithEmailAndPassword()', async () => {
      const client = new FirebaseClient(config).initialize();
      await client.createUserWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(firebase.auth().createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(firebase.auth().createUserWithEmailAndPassword).toHaveBeenCalledWith(
        'test@test.com',
        'password',
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('calls firebase.auth().sendPasswordResetEmail()', async () => {
      const client = new FirebaseClient(config).initialize();
      await client.sendPasswordResetEmail('test@test.com');

      expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
    });
  });

  describe('onAuthStateChanged', () => {
    it('calls firebase.auth().onAuthStateChanged', () => {
      const client = new FirebaseClient(config).initialize();
      const callback = vi.fn();

      client.onAuthStateChanged(callback);

      expect(firebase.auth().onAuthStateChanged).toHaveBeenCalledTimes(1);
    });
  });

  describe('getIdToken', () => {
    it("returns the Firebase user's id token when a user is signed in", async () => {
      const client = new FirebaseClient(config).initialize();
      await client.signInWithGoogle();

      const idToken = await client.getIdToken();

      expect(idToken).toBe('mock-id-token');
    });

    it('returns undefined when no user is signed in', async () => {
      const client = new FirebaseClient(config).initialize();

      const idToken = await client.getIdToken();

      expect(idToken).toBeUndefined();
    });
  });

  describe('sendEmailVerification', () => {
    it('calls sendEmailVerification on the signed-in firebase user', async () => {
      const client = new FirebaseClient(config).initialize();
      const signIn = await client.signInWithGoogle();
      const [signedInUser] = signIn;

      const result = await client.sendEmailVerification();

      expect(result).toEqual(Ok(undefined));
      expect(signedInUser).not.toBeUndefined();
    });

    it('returns an EmailVerificationFailure when no user is signed in', async () => {
      const client = new FirebaseClient(config).initialize();

      const result = await client.sendEmailVerification();

      expect(result).toEqual(Fail(new EmailVerificationFailure('No user signed in')));
    });
  });

  describe('reloadUser', () => {
    it('reloads the signed-in firebase user and returns the refreshed user', async () => {
      const client = new FirebaseClient(config).initialize();
      await client.signInWithGoogle();

      const result = await client.reloadUser();

      expect(result).toEqual(Ok(expectedUser));
    });

    it('returns Ok(null) when no user is signed in', async () => {
      const client = new FirebaseClient(config).initialize();

      const result = await client.reloadUser();

      expect(result).toEqual(Ok(null));
    });
  });
});
