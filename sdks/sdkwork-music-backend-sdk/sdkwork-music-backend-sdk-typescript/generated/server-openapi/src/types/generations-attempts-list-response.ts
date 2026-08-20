import type { MusicAiGenerationProviderAttempt } from './music-ai-generation-provider-attempt';
import type { PageInfo } from './page-info';

export interface GenerationsAttemptsListResponse {
  code: 0;
  data: unknown & { items: MusicAiGenerationProviderAttempt[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
