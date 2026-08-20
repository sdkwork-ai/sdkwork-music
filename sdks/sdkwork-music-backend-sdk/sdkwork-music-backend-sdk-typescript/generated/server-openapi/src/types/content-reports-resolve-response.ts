import type { MusicContentReport } from './music-content-report';

export interface ContentReportsResolveResponse {
  code: 0;
  data: unknown & { item: MusicContentReport; };
  /** Server-owned request correlation id. */
  traceId: string;
}
