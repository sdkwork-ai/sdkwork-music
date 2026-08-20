import type { MusicAiGenerationProviderEvent } from './music-ai-generation-provider-event';

export interface GenerationsWebhooksCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAiGenerationProviderEvent; };
  /** Server-owned request correlation id. */
  traceId: string;
}
