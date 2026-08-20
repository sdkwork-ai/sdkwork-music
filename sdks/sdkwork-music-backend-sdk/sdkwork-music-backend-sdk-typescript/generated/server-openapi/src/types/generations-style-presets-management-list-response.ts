import type { MusicAiStylePreset } from './music-ai-style-preset';
import type { PageInfo } from './page-info';

export interface GenerationsStylePresetsManagementListResponse {
  code: 0;
  data: unknown & { items: MusicAiStylePreset[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
