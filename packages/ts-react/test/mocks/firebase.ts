import { mock } from '@jsfsi-core/ts-crossplatform';
import firebase from 'firebase/compat/app';
import { vi } from 'vitest';

class GoogleAuthProviderMock {}

const sendEmailVerificationMock = vi.fn().mockResolvedValue(undefined);
const reloadMock = vi.fn().mockResolvedValue(undefined);

function userMock(): firebase.User {
  return mock<firebase.User>({
    uid: 'some-user-uid',
    providerId: 'mock-provider-id',
    email: 'mock-email',
    emailVerified: false,
    getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    sendEmailVerification: sendEmailVerificationMock,
    reload: reloadMock,
  });
}

const signInWithPopupMock = vi
  .fn()
  .mockResolvedValue(mock<firebase.auth.UserCredential>({ user: userMock() }));

const signInWithEmailAndPasswordMock = vi
  .fn()
  .mockResolvedValue(mock<firebase.auth.UserCredential>({ user: userMock() }));

const createUserWithEmailAndPasswordMock = vi
  .fn()
  .mockResolvedValue(mock<firebase.auth.UserCredential>({ user: userMock() }));

const signOutMock = vi.fn().mockResolvedValue(undefined);
const onAuthStateChangedMock = vi.fn((callback: (user: unknown) => void) => {
  callback(null);
  return () => undefined;
});

const sendPasswordResetEmailMock = vi.fn().mockResolvedValue(undefined);

function authMock() {
  return {
    signInWithPopup: signInWithPopupMock,
    signOut: signOutMock,
    onAuthStateChanged: onAuthStateChangedMock,
    signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
    createUserWithEmailAndPassword: createUserWithEmailAndPasswordMock,
    sendPasswordResetEmail: sendPasswordResetEmailMock,
  };
}
authMock.GoogleAuthProvider = GoogleAuthProviderMock;

vi.mock('firebase/compat/app', () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    auth: authMock,
  },
}));
