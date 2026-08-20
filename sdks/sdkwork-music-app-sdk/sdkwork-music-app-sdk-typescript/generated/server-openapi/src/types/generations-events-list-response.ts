import type { MusicAiGenerationProviderEvent } from './music-ai-generation-provider-event';
import type { PageInfo } from './page-info';

export interface GenerationsEventsListResponse {
  code: 0;
  data: unknown & { items: MusicAiGenerationProviderEvent[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
