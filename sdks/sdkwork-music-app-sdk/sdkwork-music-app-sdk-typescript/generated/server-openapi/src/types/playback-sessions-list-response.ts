import type { MusicPlaybackSession } from './music-playback-session';
import type { PageInfo } from './page-info';

export interface PlaybackSessionsListResponse {
  code: 0;
  data: unknown & { items: MusicPlaybackSession[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
