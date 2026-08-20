import type { MusicModerationSignal } from './music-moderation-signal';
import type { PageInfo } from './page-info';

export interface ModerationSignalsListResponse {
  code: 0;
  data: unknown & { items: MusicModerationSignal[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
