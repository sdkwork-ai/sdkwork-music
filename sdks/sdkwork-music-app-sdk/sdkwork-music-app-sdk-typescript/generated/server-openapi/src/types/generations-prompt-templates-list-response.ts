import type { MusicAiPromptTemplate } from './music-ai-prompt-template';
import type { PageInfo } from './page-info';

export interface GenerationsPromptTemplatesListResponse {
  code: 0;
  data: unknown & { items: MusicAiPromptTemplate[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
