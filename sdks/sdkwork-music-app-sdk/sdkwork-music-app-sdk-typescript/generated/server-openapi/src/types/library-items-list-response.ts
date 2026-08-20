import type { MusicUserLibraryItem } from './music-user-library-item';
import type { PageInfo } from './page-info';

export interface LibraryItemsListResponse {
  code: 0;
  data: unknown & { items: MusicUserLibraryItem[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
