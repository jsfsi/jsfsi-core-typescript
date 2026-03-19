import { z } from 'zod';

const DOMAIN_REGEX = /^(?!-)[A-Za-z0-9-]+([-.]{1}[a-z0-9]+)*\.[A-Za-z]{2,63}$/i;

export function SafeDomain(options?: { message: string }) {
  const message = options?.message ?? 'Please enter a valid domain';

  return z
    .string()
    .min(3, { message })
    .max(253)
    .refine((domain) => DOMAIN_REGEX.test(domain), {
      message,
    });
}
