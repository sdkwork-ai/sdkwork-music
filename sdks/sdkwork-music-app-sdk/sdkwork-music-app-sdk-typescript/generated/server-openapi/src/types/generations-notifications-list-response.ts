import type { MusicAiGenerationNotification } from './music-ai-generation-notification';
import type { PageInfo } from './page-info';

export interface GenerationsNotificationsListResponse {
  code: 0;
  data: unknown & { items: MusicAiGenerationNotification[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
