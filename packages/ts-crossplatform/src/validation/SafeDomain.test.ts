import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { SafeDomain } from './SafeDomain';

describe('SafeDomain', () => {
  it('uses custom message when input is empty', () => {
    const schema = z.object({
      domain: SafeDomain({ message: 'Domain is required' }),
    });

    const result = schema.safeParse({ domain: '' });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0].message).toBe('Domain is required');
  });

  it.each([
    'example.com',
    'my-domain.com',
    'api.example.com',
    'app.internal.example.co.uk',
    'test-1.sub-domain.example.org',
  ])('accepts valid domain `%s`', (domain) => {
    const schema = z.object({
      domain: SafeDomain(),
    });

    const result = schema.safeParse({ domain });

    expect(result.success).toBe(true);
  });

  it.each(['localhost', 'invalid_domain', '-example.com', 'example', 'a..com'])(
    'rejects invalid domain `%s`',
    (domain) => {
      const schema = z.object({
        domain: SafeDomain(),
      });

      const result = schema.safeParse({ domain });

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0].message).toBe('Please enter a valid domain');
    },
  );

  it('uses custom message when regex validation fails', () => {
    const schema = z.object({
      domain: SafeDomain({ message: 'Domain is required' }),
    });

    const result = schema.safeParse({ domain: 'localhost' });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0].message).toBe('Domain is required');
  });

  it('rejects domains shorter than 3 characters', () => {
    const schema = z.object({
      domain: SafeDomain(),
    });

    const result = schema.safeParse({ domain: 'ab' });

    expect(result.success).toBe(false);
    if (result.success) {
      return;
    }

    expect(result.error.issues[0].message).toBe('Please enter a valid domain');
  });

  it('rejects domain longer than 253 characters', () => {
    const schema = z.object({
      domain: SafeDomain(),
    });
    const longLabel = 'a'.repeat(64);
    const tooLongDomain = `${longLabel}.${longLabel}.${longLabel}.${longLabel}.com`;

    const result = schema.safeParse({ domain: tooLongDomain });

    expect(result.success).toBe(false);
  });
});
