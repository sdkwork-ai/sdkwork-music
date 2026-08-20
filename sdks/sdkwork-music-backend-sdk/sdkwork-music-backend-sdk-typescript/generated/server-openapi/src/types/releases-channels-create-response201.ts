import type { MusicReleaseChannel } from './music-release-channel';

export interface ReleasesChannelsCreateResponse201 {
  code: 0;
  data: unknown & { item: MusicReleaseChannel; };
  /** Server-owned request correlation id. */
  traceId: string;
}
