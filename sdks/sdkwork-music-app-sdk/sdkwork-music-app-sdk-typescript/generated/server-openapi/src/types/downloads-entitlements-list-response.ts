import type { MusicDownloadEntitlement } from './music-download-entitlement';
import type { PageInfo } from './page-info';

export interface DownloadsEntitlementsListResponse {
  code: 0;
  data: unknown & { items: MusicDownloadEntitlement[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
