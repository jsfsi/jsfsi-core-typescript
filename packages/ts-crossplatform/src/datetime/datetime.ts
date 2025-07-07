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
