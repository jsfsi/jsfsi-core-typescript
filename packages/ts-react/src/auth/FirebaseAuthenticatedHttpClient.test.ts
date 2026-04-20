import { mock, NetworkFailure } from '@jsfsi-core/ts-crossplatform';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { FirebaseAuthenticatedHttpClient } from './FirebaseAuthenticatedHttpClient';
import { FirebaseClient } from './FirebaseClient';

class TestableFirebaseAuthenticatedHttpClient extends FirebaseAuthenticatedHttpClient {
  public testGetHeaders() {
    return this.getHeaders();
  }
}

describe('FirebaseAuthenticatedHttpClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  describe('#getHeaders', () => {
    it('injects Authorization: Bearer <firebase id token> and Content-Type: application/json', async () => {
      const firebaseClient = mock<FirebaseClient>({
        getIdToken: async () => 'test-id-token',
      });
      const client = new TestableFirebaseAuthenticatedHttpClient(
        firebaseClient,
        'https://api.example.test',
      );

      const headers = await client.testGetHeaders();

      expect(headers).toEqual(
        new Set([
          ['Authorization', 'Bearer test-id-token'],
          ['Content-Type', 'application/json'],
        ]),
      );
    });

    it('omits the Authorization header when FirebaseClient.getIdToken resolves to undefined', async () => {
      const firebaseClient = mock<FirebaseClient>({
        getIdToken: async () => undefined,
      });
      const client = new TestableFirebaseAuthenticatedHttpClient(
        firebaseClient,
        'https://api.example.test',
      );

      const headers = await client.testGetHeaders();

      expect(headers).toEqual(new Set([['Content-Type', 'application/json']]));
    });
  });

  describe('#fetch', () => {
    it('calls baseUrl + path when fetch is invoked', async () => {
      const fetchMock = vi.fn().mockResolvedValue(new Response('{"ok":true}', { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);
      const firebaseClient = mock<FirebaseClient>({
        getIdToken: async () => 'test-id-token',
      });
      const client = new FirebaseAuthenticatedHttpClient(
        firebaseClient,
        'https://api.example.test',
      );

      await client.fetch('/users', z.object({ ok: z.boolean() }), NetworkFailure);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(fetchMock.mock.calls[0]![0]).toBe('https://api.example.test/users');
    });
  });
});
