import type { MusicChart } from './music-chart';
import type { PageInfo } from './page-info';

export interface ChartsListResponse {
  code: 0;
  data: unknown & { items: MusicChart[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
