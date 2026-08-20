import type { MusicAiGenerationNotification } from './music-ai-generation-notification';

export interface GenerationsNotificationsUpdateResponse {
  code: 0;
  data: unknown & { item: MusicAiGenerationNotification; };
  /** Server-owned request correlation id. */
  traceId: string;
}
