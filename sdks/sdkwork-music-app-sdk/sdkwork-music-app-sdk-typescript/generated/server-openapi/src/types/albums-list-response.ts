import type { MusicAlbum } from './music-album';
import type { PageInfo } from './page-info';

export interface AlbumsListResponse {
  code: 0;
  data: unknown & { items: MusicAlbum[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
