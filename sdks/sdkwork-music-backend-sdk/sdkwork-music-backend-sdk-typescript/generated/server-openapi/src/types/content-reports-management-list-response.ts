import type { MusicContentReport } from './music-content-report';
import type { PageInfo } from './page-info';

export interface ContentReportsManagementListResponse {
  code: 0;
  data: unknown & { items: MusicContentReport[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
