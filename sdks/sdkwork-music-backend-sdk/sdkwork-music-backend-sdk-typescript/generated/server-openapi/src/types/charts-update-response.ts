import type { MusicChart } from './music-chart';

export interface ChartsUpdateResponse {
  code: 0;
  data: unknown & { item: MusicChart; };
  /** Server-owned request correlation id. */
  traceId: string;
}
