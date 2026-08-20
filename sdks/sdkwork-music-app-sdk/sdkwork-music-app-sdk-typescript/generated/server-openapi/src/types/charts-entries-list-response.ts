import type { MusicChartEntry } from './music-chart-entry';
import type { PageInfo } from './page-info';

export interface ChartsEntriesListResponse {
  code: 0;
  data: unknown & { items: MusicChartEntry[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
