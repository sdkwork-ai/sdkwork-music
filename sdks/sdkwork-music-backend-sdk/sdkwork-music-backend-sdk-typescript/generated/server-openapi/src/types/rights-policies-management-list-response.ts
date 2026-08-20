import type { MusicRightsPolicy } from './music-rights-policy';
import type { PageInfo } from './page-info';

export interface RightsPoliciesManagementListResponse {
  code: 0;
  data: unknown & { items: MusicRightsPolicy[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
