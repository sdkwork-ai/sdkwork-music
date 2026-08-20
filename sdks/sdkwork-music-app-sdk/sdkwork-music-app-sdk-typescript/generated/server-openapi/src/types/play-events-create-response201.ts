import type { MusicListeningHistoryItem } from './music-listening-history-item';

export interface PlayEventsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicListeningHistoryItem; };
  /** Server-owned request correlation id. */
  traceId: string;
}
