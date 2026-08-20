import type { MusicAiPromptTemplate } from './music-ai-prompt-template';

export interface GenerationsPromptTemplatesCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAiPromptTemplate; };
  /** Server-owned request correlation id. */
  traceId: string;
}
