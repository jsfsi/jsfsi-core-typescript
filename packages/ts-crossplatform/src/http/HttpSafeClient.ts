import { z } from 'zod';

import { Failure } from '../failures/failure';
import { Fail, Ok, Result } from '../result/result';

import { NetworkConflictFailure } from './failures/NetworkConflictFailure';
import { NetworkFailure } from './failures/NetworkFailure';
import { NotFoundFailure } from './failures/NotFoundFailure';

export abstract class HttpSafeClient {
  constructor(private readonly baseUrl: string) {}

  protected abstract getHeaders(): Promise<Set<[string, string]>>;

  public async fetch<T, F extends Failure>(
    path: string,
    responseSchema: z.ZodType<T>,
    failure: new (error: unknown, metadata?: unknown) => F,
    options: RequestInit = {},
  ): Promise<Result<T, NetworkFailure | NetworkConflictFailure | NotFoundFailure | F>> {
    try {
      const headers = await this.mergeHeaders(options.headers);

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      if (response.status === 409) {
        return Fail(
          new NetworkConflictFailure({
            status: response.status,
            statusText: response.statusText,
            /* v8 ignore start -- @preserve */
            body: await response.json().catch(() => {
              return response.text();
            }),
            /* v8 ignore end -- @preserve */
          }),
        );
      }

      if (response.status === 404) {
        return Fail(new NotFoundFailure());
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        return Fail(
          new failure({
            error,
            metadata: {
              status: response.status,
              statusText: response.statusText,
            },
          }),
        );
      }

      const responseText = (await response.text()).trim();

      const responseBody =
        response.status === 204 ? undefined : responseText ? JSON.parse(responseText) : undefined;

      const parsedResponse = responseSchema.safeParse(responseBody);

      if (!parsedResponse.success) {
        return Fail(new failure(new Error('Invalid response body'), responseBody));
      }

      return Ok(parsedResponse.data as T);
    } catch (error) {
      return Fail(new NetworkFailure(error));
    }
  }

  public async fetchBlob<F extends Failure>(
    path: string,
    failure: new (error: unknown, metadata?: unknown) => F,
    options: RequestInit = {},
  ): Promise<Result<Blob, NetworkFailure | NotFoundFailure | F>> {
    try {
      const headers = await this.mergeHeaders(options.headers);

      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        headers,
      });

      if (response.status === 404) {
        return Fail(new NotFoundFailure());
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        return Fail(
          new failure(error, {
            status: response.status,
            statusText: response.statusText,
          }),
        );
      }

      const blob = await response.blob();
      return Ok(blob);
    } catch (error) {
      return Fail(new NetworkFailure(error));
    }
  }

  private async mergeHeaders(optionsHeaders?: HeadersInit): Promise<Headers> {
    const headers = new Headers([...(await this.getHeaders())]);
    const options = new Headers(optionsHeaders);
    options.forEach((value, key) => headers.set(key, value));
    return headers;
  }
}
