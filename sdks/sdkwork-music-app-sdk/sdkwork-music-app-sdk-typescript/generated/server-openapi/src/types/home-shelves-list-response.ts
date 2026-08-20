import type { MusicHomeShelf } from './music-home-shelf';
import type { PageInfo } from './page-info';

export interface HomeShelvesListResponse {
  code: 0;
  data: unknown & { items: MusicHomeShelf[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
