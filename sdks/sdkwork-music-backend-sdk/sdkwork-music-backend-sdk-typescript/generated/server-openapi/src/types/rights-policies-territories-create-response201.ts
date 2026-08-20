import type { MusicRightsTerritory } from './music-rights-territory';

export interface RightsPoliciesTerritoriesCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicRightsTerritory; };
  /** Server-owned request correlation id. */
  traceId: string;
}
