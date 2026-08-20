import type { MusicRecommendationFeedback } from './music-recommendation-feedback';
import type { PageInfo } from './page-info';

export interface RecommendationFeedbackManagementListResponse {
  code: 0;
  data: unknown & { items: MusicRecommendationFeedback[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
