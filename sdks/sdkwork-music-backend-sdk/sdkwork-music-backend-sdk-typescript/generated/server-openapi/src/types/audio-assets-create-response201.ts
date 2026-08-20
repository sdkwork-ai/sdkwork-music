import type { MusicAudioAsset } from './music-audio-asset';

export interface AudioAssetsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAudioAsset; };
  /** Server-owned request correlation id. */
  traceId: string;
}
