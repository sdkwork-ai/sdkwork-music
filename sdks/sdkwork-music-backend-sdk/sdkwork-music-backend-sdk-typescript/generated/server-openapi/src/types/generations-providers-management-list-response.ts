import type { MusicAiGenerationProvider } from './music-ai-generation-provider';
import type { PageInfo } from './page-info';

export interface GenerationsProvidersManagementListResponse {
  code: 0;
  data: unknown & { items: MusicAiGenerationProvider[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
