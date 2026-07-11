import { vi } from 'vitest';

vi.mock('firebase-admin/app', () => ({
  getApps: vi.fn().mockReturnValue([]),
  initializeApp: vi.fn(),
  applicationDefault: vi.fn(),
}));

vi.mock('firebase-admin/auth', () => ({
  getAuth: vi.fn().mockReturnValue({
    verifyIdToken: vi.fn().mockResolvedValue({ uid: 'some-user-id', email: 'some-user-email' }),
  }),
  FirebaseAuthError: class FirebaseAuthError extends Error {
    code: string;
    constructor(code: string) {
      super();
      this.code = code;
    }
  },
}));
