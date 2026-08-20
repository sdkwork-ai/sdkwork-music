import type { MusicTrack } from './music-track';

export interface TracksArchiveResponse {
  code: 0;
  data: unknown & { item: MusicTrack; };
  /** Server-owned request correlation id. */
  traceId: string;
}
