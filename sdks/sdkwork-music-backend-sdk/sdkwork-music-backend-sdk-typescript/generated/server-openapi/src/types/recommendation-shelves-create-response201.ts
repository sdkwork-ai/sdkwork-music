import type { MusicRecommendationItem } from './music-recommendation-item';
import type { PageInfo } from './page-info';

export interface RecommendationShelvesCreateResponse201 {
  code: 0;
  data: unknown & { items: MusicRecommendationItem[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
