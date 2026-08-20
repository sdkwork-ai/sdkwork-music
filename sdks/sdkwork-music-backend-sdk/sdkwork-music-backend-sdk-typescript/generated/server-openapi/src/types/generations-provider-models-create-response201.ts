import type { MusicAiGenerationProviderModel } from './music-ai-generation-provider-model';

export interface GenerationsProviderModelsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAiGenerationProviderModel; };
  /** Server-owned request correlation id. */
  traceId: string;
}
