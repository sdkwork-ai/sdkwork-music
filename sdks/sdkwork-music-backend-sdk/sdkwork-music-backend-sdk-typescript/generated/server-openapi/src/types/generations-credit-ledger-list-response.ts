import type { MusicAiGenerationCreditLedgerEntry } from './music-ai-generation-credit-ledger-entry';
import type { PageInfo } from './page-info';

export interface GenerationsCreditLedgerListResponse {
  code: 0;
  data: unknown & { items: MusicAiGenerationCreditLedgerEntry[]; pageInfo: PageInfo; };
  /** Server-owned request correlation id. */
  traceId: string;
}
