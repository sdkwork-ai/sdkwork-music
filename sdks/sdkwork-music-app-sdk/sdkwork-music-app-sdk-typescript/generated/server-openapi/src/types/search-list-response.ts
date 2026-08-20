import type { MusicSearchResult } from './music-search-result';
import type { PageInfo } from './page-info';

export interface SearchListResponse {
  code: 0;
  data: unknown & { items: MusicSearchResult[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
