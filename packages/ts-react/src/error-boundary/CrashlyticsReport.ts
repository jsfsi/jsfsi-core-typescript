export type CrashlyticsReportSource = 'boundary' | 'unhandled-rejection' | 'report-failure';

export type CrashlyticsReport = {
  source: CrashlyticsReportSource;
  args: unknown[];
  componentStack?: string;
};

export type CrashlyticsReporter = (report: CrashlyticsReport) => void;

export function notifyReporter(onReport: CrashlyticsReporter | undefined, report: CrashlyticsReport): void {
  try {
    onReport?.(report);
  } catch {
    // a failing reporter must never crash the app
  }
}
