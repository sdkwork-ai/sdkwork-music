import type { MusicAiGenerationTask } from './music-ai-generation-task';
import type { PageInfo } from './page-info';

export interface GenerationsListResponse {
  code: 0;
  data: unknown & { items: MusicAiGenerationTask[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
