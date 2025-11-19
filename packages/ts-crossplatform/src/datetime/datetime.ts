export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatDate(date: number, locales?: Intl.LocalesArgument) {
  return new Date(date).toLocaleDateString(locales, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatTime(date: number, locales?: Intl.LocalesArgument) {
  return new Date(date).toLocaleTimeString(locales, {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatDateTime(date: number, locales?: Intl.LocalesArgument) {
  return `${formatDate(date, locales)} ${formatTime(date, locales)}`;
}

export type DateInfo = {
  startDate: Date;
  allDay: boolean;
  startTime?: Date;
  endTime?: Date;
};

export type DateRange = {
  startDate: Date;
  endDate: Date;
};

export function convertDateInfoToDateRange({
  allDay,
  startDate,
  startTime,
  endTime,
}: DateInfo): DateRange {
  const result: DateRange = {
    startDate: new Date(new Date(startDate).setHours(0, 0, 0, 0)),
    endDate: new Date(new Date(startDate).setHours(23, 59, 59, 999)),
  };

  if (allDay) {
    return result;
  }

  if (startTime) {
    const startTimeDate = new Date(startDate);
    startTimeDate.setHours(
      startTime.getHours(),
      startTime.getMinutes(),
      startTime.getSeconds(),
      startTime.getMilliseconds(),
    );
    result.startDate = startTimeDate;
  }

  if (endTime) {
    const endTimeDate = new Date(startDate);
    endTimeDate.setHours(
      endTime.getHours(),
      endTime.getMinutes(),
      endTime.getSeconds(),
      endTime.getMilliseconds(),
    );
    result.endDate = endTimeDate;
  }

  return result;
}
