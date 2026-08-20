import type { MusicPlaylist } from './music-playlist';
import type { PageInfo } from './page-info';

export interface PlaylistsManagementListResponse {
  code: 0;
  data: unknown & { items: MusicPlaylist[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
