import type { MusicAudioAsset } from './music-audio-asset';
import type { PageInfo } from './page-info';

export interface AudioAssetsListResponse {
  code: 0;
  data: unknown & { items: MusicAudioAsset[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
