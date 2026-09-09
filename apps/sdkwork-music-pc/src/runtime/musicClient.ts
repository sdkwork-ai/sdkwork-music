import { createClient, type SdkworkAppClient } from '@sdkwork/music-app-sdk';
import { resolveBaseUrlWithAlignProtocol } from '@sdkwork/sdk-common';
import type { MusicHomeShelf } from '../types/music';

// Single-call §6.3 resolution: the explicit Vite override wins as a candidate
// and the returned origin always follows the page scheme.
const API_BASE_URL = resolveBaseUrlWithAlignProtocol({
  baseUrls: import.meta.env.VITE_API_BASE_URL || undefined,
}).url;

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