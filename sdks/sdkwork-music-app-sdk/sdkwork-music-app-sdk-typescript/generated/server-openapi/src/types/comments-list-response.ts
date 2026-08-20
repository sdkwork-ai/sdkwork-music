import type { MusicComment } from './music-comment';
import type { PageInfo } from './page-info';

export interface CommentsListResponse {
  code: 0;
  data: unknown & { items: MusicComment[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
