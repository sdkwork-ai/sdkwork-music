import type { MusicAlbum } from './music-album';

export interface AlbumsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicAlbum; };
  /** Server-owned request correlation id. */
  traceId: string;
}
