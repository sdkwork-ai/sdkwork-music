import type { MusicAiGenerationProviderModel } from './music-ai-generation-provider-model';
import type { PageInfo } from './page-info';

export interface GenerationsProviderModelsListResponse {
  code: 0;
  data: unknown & { items: MusicAiGenerationProviderModel[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
