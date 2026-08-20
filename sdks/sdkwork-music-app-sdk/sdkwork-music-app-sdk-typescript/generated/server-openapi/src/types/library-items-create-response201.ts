import type { MusicUserLibraryItem } from './music-user-library-item';

export interface LibraryItemsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicUserLibraryItem; };
  /** Server-owned request correlation id. */
  traceId: string;
}
