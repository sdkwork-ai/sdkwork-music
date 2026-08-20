import type { MusicChartEntry } from './music-chart-entry';

export interface ChartsEntriesCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicChartEntry; };
  /** Server-owned request correlation id. */
  traceId: string;
}
