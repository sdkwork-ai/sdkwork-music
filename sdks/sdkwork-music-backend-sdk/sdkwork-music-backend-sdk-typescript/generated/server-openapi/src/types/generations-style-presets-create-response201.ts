import type { MusicAiStylePreset } from './music-ai-style-preset';

export interface GenerationsStylePresetsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAiStylePreset; };
  /** Server-owned request correlation id. */
  traceId: string;
}
