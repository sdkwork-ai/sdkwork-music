import type { MusicRecommendationFeedback } from './music-recommendation-feedback';

export interface RecommendationFeedbackCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicRecommendationFeedback; };
  /** Server-owned request correlation id. */
  traceId: string;
}
