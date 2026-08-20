import type { MusicTrack } from './music-track';

export interface TracksCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicTrack; };
  /** Server-owned request correlation id. */
  traceId: string;
}
