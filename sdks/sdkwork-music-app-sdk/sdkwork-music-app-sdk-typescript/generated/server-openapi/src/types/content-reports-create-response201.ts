import type { MusicContentReport } from './music-content-report';

export interface ContentReportsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicContentReport; };
  /** Server-owned request correlation id. */
  traceId: string;
}
