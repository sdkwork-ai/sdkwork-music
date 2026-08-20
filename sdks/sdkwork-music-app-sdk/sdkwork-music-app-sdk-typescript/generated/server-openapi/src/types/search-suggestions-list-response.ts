import type { MusicSearchSuggestion } from './music-search-suggestion';
import type { PageInfo } from './page-info';

export interface SearchSuggestionsListResponse {
  code: 0;
  data: unknown & { items: MusicSearchSuggestion[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
