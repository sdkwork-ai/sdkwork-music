import type { MusicListeningHistoryItem } from './music-listening-history-item';
import type { PageInfo } from './page-info';

export interface ListeningHistoryListResponse {
  code: 0;
  data: unknown & { items: MusicListeningHistoryItem[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
