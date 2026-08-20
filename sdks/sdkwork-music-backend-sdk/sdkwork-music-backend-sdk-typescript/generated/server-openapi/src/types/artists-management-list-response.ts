import type { MusicArtist } from './music-artist';
import type { PageInfo } from './page-info';

export interface ArtistsManagementListResponse {
  code: 0;
  data: unknown & { items: MusicArtist[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
