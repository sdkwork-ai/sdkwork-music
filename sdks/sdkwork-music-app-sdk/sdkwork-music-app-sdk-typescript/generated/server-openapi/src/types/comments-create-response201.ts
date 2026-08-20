import type { MusicComment } from './music-comment';

export interface CommentsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicComment; };
  /** Server-owned request correlation id. */
  traceId: string;
}
