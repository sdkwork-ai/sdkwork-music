import type { MusicAiGenerationProvider } from './music-ai-generation-provider';

export interface GenerationsProvidersCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAiGenerationProvider; };
  /** Server-owned request correlation id. */
  traceId: string;
}
