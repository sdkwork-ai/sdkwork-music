import type { MusicArtist } from './music-artist';

export interface ArtistsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicArtist; };
  /** Server-owned request correlation id. */
  traceId: string;
}
