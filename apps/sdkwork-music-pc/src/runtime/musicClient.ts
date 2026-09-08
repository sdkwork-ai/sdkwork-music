import { createClient, type SdkworkAppClient } from '@sdkwork/music-app-sdk';
import { resolveBaseUrl } from '@sdkwork/sdk-common';
import type { MusicHomeShelf } from '../types/music';

// Prefer an explicit Vite override; otherwise resolve the shared
// SDKWORK_API_BASE_URL through @sdkwork/sdk-common (env + brand + protocol
// aware), eliminating the hardcoded localhost default.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || resolveBaseUrl().url;

let musicClient: SdkworkAppClient | null = null;

/**
 * SDK client construction and HTTP dispatch belong at the runtime/bootstrap
 * layer, not in the service layer. The music service consumes these functions
 * instead of building URLs or calling fetch itself.
 */
function getMusicClient(): SdkworkAppClient {
  if (!musicClient) {
    musicClient = createClient({
      baseUrl: API_BASE_URL,
      accessToken: '',
    });
  }
  return musicClient;
}

export async function listHomeShelves(
  cursor?: string,
  pageSize?: number,
): Promise<MusicHomeShelf[]> {
  const result = await getMusicClient().home.shelves.list({ cursor, pageSize });
  return result.items;
}