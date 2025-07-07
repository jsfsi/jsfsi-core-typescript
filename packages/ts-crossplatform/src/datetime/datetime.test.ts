import { describe, expect, it } from 'vitest';

import { formatDate, formatDateTime, formatTime, sleep } from './datetime';

describe('datetime', () => {
  describe('#sleep', () => {
    it('sleeps for a 15ms', async () => {
      const start = Date.now();
      await sleep(15);
      const end = Date.now();

      expect(end - start).toBeGreaterThanOrEqual(15);
    });
  });

  describe('#formatDate', () => {
    it('formats a date', () => {
      expect(formatDate(new Date('2025-01-01').getTime())).toEqual('01/01/2025');
    });
  });

  describe('#formatTime', () => {
    it.each`
      date                                         | expected
      ${new Date('2025-01-01T00:00:00').getTime()} | ${'00:00:00'}
      ${new Date('2025-01-01T00:00:02').getTime()} | ${'00:00:02'}
      ${new Date('2025-01-01T00:01:00').getTime()} | ${'00:01:00'}
      ${new Date('2025-01-01T10:16:00').getTime()} | ${'10:16:00'}
      ${new Date('2025-01-01T16:00:00').getTime()} | ${'16:00:00'}
    `('formats a time', ({ date, expected }) => {
      expect(formatTime(date)).toEqual(expected);
    });
  });

  describe('#formatDateTime', () => {
    it('formats a date and time', () => {
      expect(formatDateTime(new Date('2025-01-01T00:00:00').getTime())).toEqual(
        '01/01/2025 00:00:00',
      );
    });
  });
});
