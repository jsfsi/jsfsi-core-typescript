import { vi } from 'vitest';

vi.mock('firebase-admin', () => ({
  apps: [],
  credential: {
    applicationDefault: vi.fn(),
  },
  initializeApp: vi.fn(),
  auth: vi.fn().mockReturnValue({
    verifyIdToken: vi.fn().mockResolvedValue({ uid: 'some-user-id', email: 'some-user-email' }),
  }),
}));
