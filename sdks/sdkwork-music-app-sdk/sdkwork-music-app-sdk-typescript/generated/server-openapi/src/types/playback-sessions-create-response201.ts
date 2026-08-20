import type { MusicPlaybackSession } from './music-playback-session';

export interface PlaybackSessionsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicPlaybackSession; };
  /** Server-owned request correlation id. */
  traceId: string;
}
