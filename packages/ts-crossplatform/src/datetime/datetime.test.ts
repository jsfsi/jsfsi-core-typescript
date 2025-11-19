import { describe, expect, it } from 'vitest';

import {
  convertDateInfoToDateRange,
  formatDate,
  formatDateTime,
  formatTime,
  sleep,
} from './datetime';

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

  describe('#convertDateInfoToDateRange', () => {
    it.each`
      startDate                          | allDay   | startTime                          | endTime                            | expectedStart                      | expectedEnd
      ${new Date('2025-01-15T12:30:45')} | ${true}  | ${undefined}                       | ${undefined}                       | ${new Date('2025-01-15T00:00:00')} | ${new Date('2025-01-15T23:59:59.999')}
      ${new Date('2025-01-15T12:30:45')} | ${true}  | ${new Date('2025-01-15T12:30:45')} | ${new Date('2025-01-15T22:30:45')} | ${new Date('2025-01-15T00:00:00')} | ${new Date('2025-01-15T23:59:59.999')}
      ${new Date('2025-01-15T12:30:45')} | ${false} | ${new Date('2025-01-15T09:30:45')} | ${undefined}                       | ${new Date('2025-01-15T09:30:45')} | ${new Date('2025-01-15T23:59:59.999')}
      ${new Date('2025-01-15T12:30:45')} | ${false} | ${new Date('2025-01-15T09:30:45')} | ${new Date('2025-01-15T12:30:45')} | ${new Date('2025-01-15T09:30:45')} | ${new Date('2025-01-15T12:30:45')}
      ${new Date('2025-01-16T12:30:45')} | ${false} | ${new Date('2025-01-15T09:30:45')} | ${new Date('2025-01-15T12:30:45')} | ${new Date('2025-01-16T09:30:45')} | ${new Date('2025-01-16T12:30:45')}
      ${new Date('2025-01-15T12:30:45')} | ${false} | ${undefined}                       | ${new Date('2025-01-15T12:30:45')} | ${new Date('2025-01-15T00:00:00')} | ${new Date('2025-01-15T12:30:45')}
    `(
      'converts date info to date range',
      ({ startDate, allDay, startTime, endTime, expectedStart, expectedEnd }) => {
        const result = convertDateInfoToDateRange({ startDate, allDay, startTime, endTime });

        expect(result.startDate).toEqual(expectedStart);
        expect(result.endDate).toEqual(expectedEnd);
      },
    );
  });
});
