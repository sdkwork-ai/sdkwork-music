import type { MusicAiGenerationTask } from './music-ai-generation-task';

export interface GenerationsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAiGenerationTask; };
  /** Server-owned request correlation id. */
  traceId: string;
}
