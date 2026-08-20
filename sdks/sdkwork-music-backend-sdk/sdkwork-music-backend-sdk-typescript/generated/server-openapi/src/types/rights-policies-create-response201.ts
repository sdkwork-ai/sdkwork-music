import type { MusicRightsPolicy } from './music-rights-policy';

export interface RightsPoliciesCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicRightsPolicy; };
  /** Server-owned request correlation id. */
  traceId: string;
}
