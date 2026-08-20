import type { MusicRelease } from './music-release';
import type { PageInfo } from './page-info';

export interface ReleasesListResponse {
  code: 0;
  data: unknown & { items: MusicRelease[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
