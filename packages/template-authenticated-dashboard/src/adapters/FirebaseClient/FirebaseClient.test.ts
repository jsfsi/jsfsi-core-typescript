import { Ok } from '@jsfsi-core/ts-crossplatform';
import firebase from 'firebase/compat/app';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { configuration } from '../../ConfigurationService';

import { FirebaseClient } from './FirebaseClient';

describe('FirebaseClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('instantiates authentication service with firebase', () => {
      new FirebaseClient().initialize();

      expect(firebase.initializeApp).toHaveBeenCalledTimes(1);
      expect(firebase.initializeApp).toHaveBeenCalledWith({
        apiKey: configuration.VITE_FIREBASE_API_KEY,
        authDomain: configuration.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: configuration.VITE_FIREBASE_PROJECT_ID,
        storageBucket: configuration.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: configuration.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: configuration.VITE_FIREBASE_APP_ID,
      });
    });
  });

  describe('signOut', () => {
    it('calls firebase.auth().signOut()', () => {
      const authAdapter = new FirebaseClient().initialize();
      authAdapter.signOut();

      expect(firebase.auth().signOut).toHaveBeenCalledTimes(1);
    });
  });

  describe('signInWithGoogle', () => {
    it('calls firebase.auth().signInWithPopup()', async () => {
      const authAdapter = new FirebaseClient().initialize();
      const result = await authAdapter.signInWithGoogle();

      expect(firebase.auth().signInWithPopup).toHaveBeenCalledTimes(1);
      expect(result).toEqual(
        Ok({
          id: 'some-user-uid',
          providerId: 'mock-provider-id',
          email: 'mock-email',
          idToken: 'mock-id-token',
        }),
      );
    });
  });

  describe('signInWithEmailAndPassword', () => {
    it('calls firebase.auth().signInWithEmailAndPassword()', async () => {
      const authAdapter = new FirebaseClient().initialize();
      const result = await authAdapter.signInWithEmailAndPassword({
        email: 'test@test.com',
        password: 'password',
      });

      expect(firebase.auth().signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
      expect(firebase.auth().signInWithEmailAndPassword).toHaveBeenCalledWith(
        'test@test.com',
        'password',
      );
      expect(result).toEqual(
        Ok({
          id: 'some-user-uid',
          providerId: 'mock-provider-id',
          email: 'mock-email',
          idToken: 'mock-id-token',
        }),
      );
    });
  });

  describe('createUserWithEmailAndPassword', () => {
    it('calls firebase.auth().createUserWithEmailAndPassword()', async () => {
      const authAdapter = new FirebaseClient().initialize();
      await authAdapter.createUserWithEmailAndPassword({
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
      const authAdapter = new FirebaseClient().initialize();
      await authAdapter.sendPasswordResetEmail('test@test.com');

      expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('test@test.com');
    });
  });
});
