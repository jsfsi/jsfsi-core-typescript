import nock from 'nock';
import { afterEach, describe, expect, it, vi } from 'vitest';
import z from 'zod';

import { Failure } from '../failures/failure';
import { Fail, Ok } from '../result/result';

import { NetworkConflictFailure } from './failures/NetworkConflictFailure';
import { NetworkFailure } from './failures/NetworkFailure';
import { NotFoundFailure } from './failures/NotFoundFailure';
import { HttpSafeClient } from './HttpSafeClient';
import { EmptyResponse } from './models/EmptyResponse';

function contextHeaders(): Set<[string, string]> {
  return new Set([
    ['Authorization', 'Bearer mock-id-token'],
    ['Content-Type', 'application/json'],
  ]);
}

class TestHttpClient extends HttpSafeClient {
  public getHeadersMock = vi.fn<() => Promise<Set<[string, string]>>>();

  protected override async getHeaders(): Promise<Set<[string, string]>> {
    return await this.getHeadersMock();
  }
}

describe('HttpSafeClient', () => {
  afterEach(() => {
    vi.clearAllMocks();
    nock.cleanAll();
  });

  describe('#fetch', () => {
    const TestResponseSchema = z.object({
      id: z.string(),
      name: z.string(),
      value: z.number(),
    });

    const TestListResponseSchema = z.object({
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
        }),
      ),
    });

    class TestFailure extends Failure {
      constructor(
        public readonly error: unknown,
        public readonly metadata?: unknown,
      ) {
        super();
      }
    }

    class TestListFailure extends Failure {
      constructor(
        public readonly error: unknown,
        public readonly metadata?: unknown,
      ) {
        super();
      }
    }

    it('successfully fetches data with GET request', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .matchHeader('Content-Type', 'application/json')
        .get('/test-endpoint')
        .reply(200, {
          id: 'test-id',
          name: 'Test Item',
          value: 42,
        });

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
        method: 'GET',
      });

      expect(client.getHeadersMock).toHaveBeenCalledTimes(1);
      expect(result).toEqual(
        Ok({
          id: 'test-id',
          name: 'Test Item',
          value: 42,
        }),
      );
    });

    it('successfully fetches data with POST request and body', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .matchHeader('Content-Type', 'application/json')
        .post('/test-endpoint', { name: 'New Item', value: 100 })
        .reply(201, {
          id: 'created-id',
          name: 'Created Item',
          value: 100,
        });

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
        method: 'POST',
        body: JSON.stringify({ name: 'New Item', value: 100 }),
      });

      expect(result).toEqual(
        Ok({
          id: 'created-id',
          name: 'Created Item',
          value: 100,
        }),
      );
    });

    it('successfully fetches data with custom headers', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .matchHeader('Content-Type', 'application/json')
        .matchHeader('X-Custom-Header', 'custom-value')
        .get('/test-endpoint')
        .reply(200, {
          id: 'test-id',
          name: 'Test Item',
          value: 42,
        });

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
        method: 'GET',
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(result).toEqual(
        Ok({
          id: 'test-id',
          name: 'Test Item',
          value: 42,
        }),
      );
    });

    it('successfully fetches list data', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .matchHeader('Content-Type', 'application/json')
        .get('/test-list')
        .reply(200, {
          items: [
            { id: 'item-1', name: 'Item 1' },
            { id: 'item-2', name: 'Item 2' },
          ],
        });

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const result = await client.fetch('/test-list', TestListResponseSchema, TestListFailure, {
        method: 'GET',
      });

      expect(result).toEqual(
        Ok({
          items: [
            { id: 'item-1', name: 'Item 1' },
            { id: 'item-2', name: 'Item 2' },
          ],
        }),
      );
    });

    it('successfully fetches data with 204 status', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .matchHeader('Content-Type', 'application/json')
        .put('/test-endpoint')
        .reply(204);

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const result = await client.fetch('/test-endpoint', EmptyResponse, TestFailure, {
        method: 'PUT',
      });

      expect(result).toEqual(Ok(undefined));
    });

    it('returns empty response when response is empty', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .matchHeader('Content-Type', 'application/json')
        .get('/test-endpoint')
        .reply(200, '');

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const result = await client.fetch('/test-endpoint', EmptyResponse, TestFailure, {
        method: 'GET',
      });

      expect(result).toEqual(Ok(undefined));
    });

    describe('error handling', () => {
      it('returns a failure when response is not ok (status: 400)', async () => {
        const baseUrl = 'https://example.test';
        const errorResponse = { error: 'Bad Request', message: 'Invalid input' };

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .matchHeader('Content-Type', 'application/json')
          .post('/test-endpoint')
          .reply(400, errorResponse);

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
          method: 'POST',
        });

        expect(result).toEqual(
          Fail(
            new TestFailure({
              error: errorResponse,
              metadata: {
                status: 400,
                statusText: 'Bad Request',
              },
            }),
          ),
        );
      });

      it('handles non-JSON error responses gracefully', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .matchHeader('Content-Type', 'application/json')
          .get('/test-endpoint')
          .reply(500, 'Internal Server Error');

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(
          Fail(
            new TestFailure({
              error: { message: 'Internal Server Error' },
              metadata: {
                status: 500,
                statusText: 'Internal Server Error',
              },
            }),
          ),
        );
      });

      it('returns a failure when response body fails to parse with schema', async () => {
        const baseUrl = 'https://example.test';
        const invalidResponse = {
          id: 'test-id',
          value: 'not-a-number',
        };

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .matchHeader('Content-Type', 'application/json')
          .get('/test-endpoint')
          .reply(200, invalidResponse);

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(
          Fail(new TestFailure(new Error('Invalid response body'), invalidResponse)),
        );
      });

      it('returns a network failure when it is unable to connect', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .matchHeader('Content-Type', 'application/json')
          .get('/test-endpoint')
          .replyWithError('Network error');

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(Fail(new NetworkFailure(new Error('Network error'))));
      });

      it('handles redirect responses (301, 302) as network failures', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .matchHeader('Content-Type', 'application/json')
          .get('/test-endpoint')
          .reply(301, { error: 'Moved Permanently' });

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(Fail(new NetworkFailure(expect.any(Error))));
      });

      it('returns a network conflict failure when response is 409', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .matchHeader('Content-Type', 'application/json')
          .post('/test-endpoint')
          .reply(409, { error: 'Conflict' });

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
          method: 'POST',
        });

        expect(result).toEqual(
          Fail(
            new NetworkConflictFailure({
              status: 409,
              statusText: 'Conflict',
              body: { error: 'Conflict' },
            }),
          ),
        );
      });

      it('returns a not found failure when response is 404', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .matchHeader('Content-Type', 'application/json')
          .get('/test-endpoint')
          .reply(404, { error: 'Not Found' });

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetch('/test-endpoint', TestResponseSchema, TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(Fail(new NotFoundFailure()));
      });
    });
  });

  describe('#fetchBlob', () => {
    class TestFailure extends Failure {
      constructor(
        public readonly error: unknown,
        public readonly metadata?: unknown,
      ) {
        super();
      }
    }

    it('successfully fetches blob data', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .get('/test-blob')
        .reply(200, 'PDF binary content', {
          'Content-Type': 'application/pdf',
        });

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const [result, failure] = await client.fetchBlob('/test-blob', TestFailure, {
        method: 'GET',
      });

      expect(failure).toBeUndefined();
      expect(result?.size).toBeGreaterThan(0);
      expect(result?.type).toBe('application/pdf');
    });

    it('successfully fetches blob with custom headers', async () => {
      const baseUrl = 'https://example.test';

      nock(baseUrl)
        .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
        .matchHeader('X-Custom-Header', 'custom-value')
        .get('/test-blob')
        .reply(200, 'PDF binary content', {
          'Content-Type': 'application/pdf',
        });

      const client = new TestHttpClient(baseUrl);
      client.getHeadersMock.mockResolvedValue(contextHeaders());

      const [result, failure] = await client.fetchBlob('/test-blob', TestFailure, {
        method: 'GET',
        headers: {
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(failure).toBeUndefined();
      expect(result?.size).toBeGreaterThan(0);
      expect(result?.type).toBe('application/pdf');
    });

    describe('error handling', () => {
      it('returns a failure when response is not ok (status: 400)', async () => {
        const baseUrl = 'https://example.test';
        const errorResponse = { error: 'Bad Request', message: 'Invalid input' };

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .get('/test-blob')
          .reply(400, errorResponse);

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetchBlob('/test-blob', TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(
          Fail(
            new TestFailure(errorResponse, {
              status: 400,
              statusText: 'Bad Request',
            }),
          ),
        );
      });

      it('handles non-JSON error responses gracefully', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .get('/test-blob')
          .reply(500, 'Internal Server Error');

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetchBlob('/test-blob', TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(
          Fail(
            new TestFailure(
              { message: 'Internal Server Error' },
              {
                status: 500,
                statusText: 'Internal Server Error',
              },
            ),
          ),
        );
      });

      it('returns a not found failure when response is 404', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .get('/test-blob')
          .reply(404, { error: 'Not Found' });

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetchBlob('/test-blob', TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(Fail(new NotFoundFailure()));
      });

      it('returns a network failure when it is unable to connect', async () => {
        const baseUrl = 'https://example.test';

        nock(baseUrl)
          .matchHeader('Authorization', (val) => val === 'Bearer mock-id-token')
          .get('/test-blob')
          .replyWithError('Network error');

        const client = new TestHttpClient(baseUrl);
        client.getHeadersMock.mockResolvedValue(contextHeaders());

        const result = await client.fetchBlob('/test-blob', TestFailure, {
          method: 'GET',
        });

        expect(result).toEqual(Fail(new NetworkFailure(new Error('Network error'))));
      });
    });
  });
});
