import { mock } from '@jsfsi-core/ts-crossplatform';
import firebase from 'firebase/compat/app';
import { vi } from 'vitest';

class GoogleAuthProviderMock {}

const signInWithPopupMock = vi.fn().mockResolvedValue(
  mock<firebase.auth.UserCredential>({
    user: {
      uid: 'some-user-uid',
      providerId: 'mock-provider-id',
      email: 'mock-email',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    },
  }),
);

const signInWithEmailAndPasswordMock = vi.fn().mockResolvedValue(
  mock<firebase.auth.UserCredential>({
    user: {
      uid: 'some-user-uid',
      providerId: 'mock-provider-id',
      email: 'mock-email',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    },
  }),
);

const createUserWithEmailAndPasswordMock = vi.fn().mockResolvedValue(
  mock<firebase.auth.UserCredential>({
    user: {
      uid: 'some-user-uid',
      providerId: 'mock-provider-id',
      email: 'mock-email',
      getIdToken: vi.fn().mockResolvedValue('mock-id-token'),
    },
  }),
);

const signOutMock = vi.fn().mockResolvedValue(undefined);
const onAuthStateChangedMock = (callback: (user: unknown) => void) => {
  callback(null);
};

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
