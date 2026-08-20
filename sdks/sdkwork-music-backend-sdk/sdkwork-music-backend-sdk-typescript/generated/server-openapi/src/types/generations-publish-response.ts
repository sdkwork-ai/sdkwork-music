import type { MusicRelease } from './music-release';

export interface GenerationsPublishResponse {
  code: 0;
  data: unknown & { item: MusicRelease; };
  /** Server-owned request correlation id. */
  traceId: string;
}
