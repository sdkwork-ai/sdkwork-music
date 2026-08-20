import type { MusicAiPromptTemplate } from './music-ai-prompt-template';

export interface GenerationsPromptTemplatesUpdateResponse {
  code: 0;
  data: unknown & { item: MusicAiPromptTemplate; };
  /** Server-owned request correlation id. */
  traceId: string;
}
