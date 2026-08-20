import type { MusicTrack } from './music-track';
import type { PageInfo } from './page-info';

export interface TracksManagementListResponse {
  code: 0;
  data: unknown & { items: MusicTrack[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
