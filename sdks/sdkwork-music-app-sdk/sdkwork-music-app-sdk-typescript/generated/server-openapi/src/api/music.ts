import { appApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { MusicAiGenerationNotification, MusicAiGenerationNotificationCommand, MusicAiGenerationProvider, MusicAiGenerationProviderEvent, MusicAiGenerationProviderModel, MusicAiGenerationTask, MusicAiGenerationTaskCommand, MusicAiPromptTemplate, MusicAiStylePreset, MusicAlbum, MusicArtist, MusicAudioAsset, MusicChart, MusicChartEntry, MusicComment, MusicCommentCommand, MusicContentReport, MusicContentReportCommand, MusicDownloadEntitlement, MusicHomeShelf, MusicLibraryItemCommand, MusicListeningHistoryItem, MusicPlaybackSession, MusicPlaybackSessionCommand, MusicPlayEventCommand, MusicPlaylist, MusicPlaylistFollowCommand, MusicPlaylistTrackCommand, MusicRecommendationFeedback, MusicRecommendationFeedbackCommand, MusicSearchResult, MusicSearchSuggestion, MusicTrack, MusicUserLibraryItem, PageInfo, SdkWorkPageData } from '../types';


export interface MusicGenerationsNotificationsListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsNotificationsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.notifications.list */
  async list(params?: MusicGenerationsNotificationsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationNotification[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationNotification[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/generations/notifications`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Music generations.notifications.update */
  async update(notificationId: string, body: MusicAiGenerationNotificationCommand, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationNotification> {
    return this.client.request<MusicAiGenerationNotification>(appApiPath(`/music/generations/notifications/${serializePathParameter(notificationId, { name: 'notificationId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicGenerationsEventsListParams {
  pageSize?: number;
}

export class MusicGenerationsEventsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.events.list */
  async list(generationId: string, params?: MusicGenerationsEventsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationProviderEvent[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationProviderEvent[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/generations/${serializePathParameter(generationId, { name: 'generationId', style: 'simple', explode: false })}/events`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsProviderModelsListParams {
  providerCode?: string;
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsProviderModelsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.providerModels.list */
  async list(params?: MusicGenerationsProviderModelsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationProviderModel[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'provider_code', value: params?.providerCode, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationProviderModel[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/generations/provider_models`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsProvidersListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsProvidersApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.providers.list */
  async list(params?: MusicGenerationsProvidersListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationProvider[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationProvider[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/generations/providers`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsPromptTemplatesListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsPromptTemplatesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.promptTemplates.list */
  async list(params?: MusicGenerationsPromptTemplatesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiPromptTemplate[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiPromptTemplate[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/generations/prompt_templates`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsStylePresetsListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsStylePresetsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.stylePresets.list */
  async list(params?: MusicGenerationsStylePresetsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiStylePreset[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiStylePreset[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/generations/style_presets`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsApi {
  private client: HttpClient;
  public readonly stylePresets: MusicGenerationsStylePresetsApi;
  public readonly promptTemplates: MusicGenerationsPromptTemplatesApi;
  public readonly providers: MusicGenerationsProvidersApi;
  public readonly providerModels: MusicGenerationsProviderModelsApi;
  public readonly events: MusicGenerationsEventsApi;
  public readonly notifications: MusicGenerationsNotificationsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.stylePresets = new MusicGenerationsStylePresetsApi(client);
    this.promptTemplates = new MusicGenerationsPromptTemplatesApi(client);
    this.providers = new MusicGenerationsProvidersApi(client);
    this.providerModels = new MusicGenerationsProviderModelsApi(client);
    this.events = new MusicGenerationsEventsApi(client);
    this.notifications = new MusicGenerationsNotificationsApi(client);
  }


/** Music generations.list */
  async list(params?: MusicGenerationsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationTask[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationTask[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/generations`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Music generations.create */
  async create(body: MusicAiGenerationTaskCommand, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationTask> {
    return this.client.request<MusicAiGenerationTask>(appApiPath(`/music/generations`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Music generations.retrieve */
  async retrieve(generationId: string, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationTask> {
    return this.client.request<MusicAiGenerationTask>(appApiPath(`/music/generations/${serializePathParameter(generationId, { name: 'generationId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'item' });
  }
}

export class MusicPlayEventsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music playEvents.create */
  async create(body: MusicPlayEventCommand, requestOptions?: ApiRequestOptions): Promise<MusicListeningHistoryItem> {
    return this.client.request<MusicListeningHistoryItem>(appApiPath(`/music/play_events`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicListeningHistoryListParams {
  pageSize?: number;
}

export class MusicListeningHistoryApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music listeningHistory.list */
  async list(params?: MusicListeningHistoryListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicListeningHistoryItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicListeningHistoryItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/listening_history`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicPlaybackSessionsListParams {
  deviceId?: string;
  pageSize?: number;
}

export class MusicPlaybackSessionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music playback.sessions.list */
  async list(params?: MusicPlaybackSessionsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicPlaybackSession[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'device_id', value: params?.deviceId, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicPlaybackSession[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/playback/sessions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Music playback.sessions.create */
  async create(body: MusicPlaybackSessionCommand, requestOptions?: ApiRequestOptions): Promise<MusicPlaybackSession> {
    return this.client.request<MusicPlaybackSession>(appApiPath(`/music/playback/sessions`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Music playback.sessions.update */
  async update(sessionId: string, body: MusicPlaybackSessionCommand, requestOptions?: ApiRequestOptions): Promise<MusicPlaybackSession> {
    return this.client.request<MusicPlaybackSession>(appApiPath(`/music/playback/sessions/${serializePathParameter(sessionId, { name: 'sessionId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class MusicPlaybackApi {
  public readonly sessions: MusicPlaybackSessionsApi;

  constructor(client: HttpClient) {
    this.sessions = new MusicPlaybackSessionsApi(client);
  }

}

export interface MusicDownloadsEntitlementsListParams {
  status?: string;
  pageSize?: number;
}

export class MusicDownloadsEntitlementsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music downloads.entitlements.list */
  async list(params?: MusicDownloadsEntitlementsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicDownloadEntitlement[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicDownloadEntitlement[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/downloads/entitlements`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicDownloadsApi {
  public readonly entitlements: MusicDownloadsEntitlementsApi;

  constructor(client: HttpClient) {
    this.entitlements = new MusicDownloadsEntitlementsApi(client);
  }

}

export class MusicRecommendationFeedbackApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music recommendation.feedback.create */
  async create(body: MusicRecommendationFeedbackCommand, requestOptions?: ApiRequestOptions): Promise<MusicRecommendationFeedback> {
    return this.client.request<MusicRecommendationFeedback>(appApiPath(`/music/recommendation/feedback`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export class MusicRecommendationApi {
  public readonly feedback: MusicRecommendationFeedbackApi;

  constructor(client: HttpClient) {
    this.feedback = new MusicRecommendationFeedbackApi(client);
  }

}

export class MusicContentReportsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music contentReports.create */
  async create(body: MusicContentReportCommand, requestOptions?: ApiRequestOptions): Promise<MusicContentReport> {
    return this.client.request<MusicContentReport>(appApiPath(`/music/content_reports`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicCommentsListParams {
  resourceType: string;
  resourceId: string;
  pageSize?: number;
}

export class MusicCommentsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music comments.list */
  async list(params: MusicCommentsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicComment[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'resource_type', value: params.resourceType, style: 'form', explode: true, allowReserved: false },
      { name: 'resource_id', value: params.resourceId, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicComment[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/comments`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Music comments.create */
  async create(body: MusicCommentCommand, requestOptions?: ApiRequestOptions): Promise<MusicComment> {
    return this.client.request<MusicComment>(appApiPath(`/music/comments`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicLibraryItemsListParams {
  itemType?: string;
  pageSize?: number;
}

export class MusicLibraryItemsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music library.items.list */
  async list(params?: MusicLibraryItemsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicUserLibraryItem[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'item_type', value: params?.itemType, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicUserLibraryItem[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/library/items`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }

/** Music library.items.create */
  async create(body: MusicLibraryItemCommand, requestOptions?: ApiRequestOptions): Promise<MusicUserLibraryItem> {
    return this.client.request<MusicUserLibraryItem>(appApiPath(`/music/library/items`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Music library.items.delete */
  async delete(itemId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/music/library/items/${serializePathParameter(itemId, { name: 'itemId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class MusicLibraryApi {
  public readonly items: MusicLibraryItemsApi;

  constructor(client: HttpClient) {
    this.items = new MusicLibraryItemsApi(client);
  }

}

export interface MusicChartsEntriesListParams {
  pageSize?: number;
}

export class MusicChartsEntriesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music charts.entries.list */
  async list(chartId: string, params?: MusicChartsEntriesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicChartEntry[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicChartEntry[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/charts/${serializePathParameter(chartId, { name: 'chartId', style: 'simple', explode: false })}`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicChartsListParams {
  q?: string;
  status?: string;
}

export class MusicChartsApi {
  private client: HttpClient;
  public readonly entries: MusicChartsEntriesApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.entries = new MusicChartsEntriesApi(client);
  }


/** Music charts.list */
  async list(params?: MusicChartsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicChart[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicChart[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/charts`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicAudioAssetsListParams {
  q?: string;
  status?: string;
}

export class MusicAudioAssetsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music audio.assets.list */
  async list(params?: MusicAudioAssetsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAudioAsset[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAudioAsset[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/audio/assets`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicAudioApi {
  public readonly assets: MusicAudioAssetsApi;

  constructor(client: HttpClient) {
    this.assets = new MusicAudioAssetsApi(client);
  }

}

export class MusicPlaylistsFollowApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music playlists.follow.create */
  async create(playlistId: string, body: MusicPlaylistFollowCommand, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    return this.client.request<SdkWorkPageData>(appApiPath(`/music/playlists/${serializePathParameter(playlistId, { name: 'playlistId', style: 'simple', explode: false })}/follow`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'page' });
  }

/** Music playlists.follow.delete */
  async delete(playlistId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/music/playlists/${serializePathParameter(playlistId, { name: 'playlistId', style: 'simple', explode: false })}/follow`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export class MusicPlaylistsTracksApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music playlists.tracks.create */
  async create(playlistId: string, body: MusicPlaylistTrackCommand, requestOptions?: ApiRequestOptions): Promise<SdkWorkPageData> {
    return this.client.request<SdkWorkPageData>(appApiPath(`/music/playlists/${serializePathParameter(playlistId, { name: 'playlistId', style: 'simple', explode: false })}/tracks`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'page' });
  }

/** Music playlists.tracks.delete */
  async delete(playlistId: string, trackId: string, requestOptions?: ApiRequestOptions): Promise<void> {
    return this.client.request<void>(appApiPath(`/music/playlists/${serializePathParameter(playlistId, { name: 'playlistId', style: 'simple', explode: false })}/tracks/${serializePathParameter(trackId, { name: 'trackId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'DELETE' as any });
  }
}

export interface MusicPlaylistsListParams {
  q?: string;
  status?: string;
}

export class MusicPlaylistsApi {
  private client: HttpClient;
  public readonly tracks: MusicPlaylistsTracksApi;
  public readonly follow: MusicPlaylistsFollowApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.tracks = new MusicPlaylistsTracksApi(client);
    this.follow = new MusicPlaylistsFollowApi(client);
  }


/** Music playlists.list */
  async list(params?: MusicPlaylistsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicPlaylist[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicPlaylist[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/playlists`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicTracksListParams {
  artistId?: string;
  albumId?: string;
  q?: string;
  status?: string;
}

export class MusicTracksApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music tracks.list */
  async list(params?: MusicTracksListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicTrack[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'artist_id', value: params?.artistId, style: 'form', explode: true, allowReserved: false },
      { name: 'album_id', value: params?.albumId, style: 'form', explode: true, allowReserved: false },
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicTrack[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/tracks`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicAlbumsListParams {
  artistId?: string;
  q?: string;
  status?: string;
}

export class MusicAlbumsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music albums.list */
  async list(params?: MusicAlbumsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAlbum[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'artist_id', value: params?.artistId, style: 'form', explode: true, allowReserved: false },
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAlbum[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/albums`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicArtistsListParams {
  q?: string;
  status?: string;
}

export class MusicArtistsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music artists.list */
  async list(params?: MusicArtistsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicArtist[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicArtist[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/artists`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicSearchSuggestionsListParams {
  type_?: string;
  pageSize?: number;
}

export class MusicSearchSuggestionsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music search.suggestions.list */
  async list(params?: MusicSearchSuggestionsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicSearchSuggestion[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'type', value: params?.type_, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicSearchSuggestion[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/search/suggestions`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicSearchListParams {
  q: string;
  type_?: string;
  pageSize?: number;
}

export class MusicSearchApi {
  private client: HttpClient;
  public readonly suggestions: MusicSearchSuggestionsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.suggestions = new MusicSearchSuggestionsApi(client);
  }


/** Music search.query */
  async list(params: MusicSearchListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicSearchResult[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params.q, style: 'form', explode: true, allowReserved: false },
      { name: 'type', value: params.type_, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicSearchResult[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/search`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicHomeShelvesListParams {
  cursor?: string;
  pageSize?: number;
}

export class MusicHomeShelvesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music home.shelves.list */
  async list(params?: MusicHomeShelvesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicHomeShelf[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'cursor', value: params?.cursor, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicHomeShelf[]; pageInfo: PageInfo; }>(appendQueryString(appApiPath(`/music/home/shelves`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicHomeApi {
  public readonly shelves: MusicHomeShelvesApi;

  constructor(client: HttpClient) {
    this.shelves = new MusicHomeShelvesApi(client);
  }

}

export class MusicApi {
  public readonly home: MusicHomeApi;
  public readonly search: MusicSearchApi;
  public readonly artists: MusicArtistsApi;
  public readonly albums: MusicAlbumsApi;
  public readonly tracks: MusicTracksApi;
  public readonly playlists: MusicPlaylistsApi;
  public readonly audio: MusicAudioApi;
  public readonly charts: MusicChartsApi;
  public readonly library: MusicLibraryApi;
  public readonly comments: MusicCommentsApi;
  public readonly contentReports: MusicContentReportsApi;
  public readonly recommendation: MusicRecommendationApi;
  public readonly downloads: MusicDownloadsApi;
  public readonly playback: MusicPlaybackApi;
  public readonly listeningHistory: MusicListeningHistoryApi;
  public readonly playEvents: MusicPlayEventsApi;
  public readonly generations: MusicGenerationsApi;

  constructor(client: HttpClient) {
    this.home = new MusicHomeApi(client);
    this.search = new MusicSearchApi(client);
    this.artists = new MusicArtistsApi(client);
    this.albums = new MusicAlbumsApi(client);
    this.tracks = new MusicTracksApi(client);
    this.playlists = new MusicPlaylistsApi(client);
    this.audio = new MusicAudioApi(client);
    this.charts = new MusicChartsApi(client);
    this.library = new MusicLibraryApi(client);
    this.comments = new MusicCommentsApi(client);
    this.contentReports = new MusicContentReportsApi(client);
    this.recommendation = new MusicRecommendationApi(client);
    this.downloads = new MusicDownloadsApi(client);
    this.playback = new MusicPlaybackApi(client);
    this.listeningHistory = new MusicListeningHistoryApi(client);
    this.playEvents = new MusicPlayEventsApi(client);
    this.generations = new MusicGenerationsApi(client);
  }

}

export function createMusicApi(client: HttpClient): MusicApi {
  return new MusicApi(client);
}

function appendQueryString(path: string, rawQueryString: string): string {
  const query = rawQueryString.replace(/^\?+/, '');
  if (!query) {
    return path;
  }
  return path.includes('?') ? `${path}&${query}` : `${path}?${query}`;
}

interface PathParameterSpec {
  name: string;
  style: string;
  explode: boolean;
}

function serializePathParameter(value: unknown, spec: PathParameterSpec): string {
  if (value === undefined || value === null) {
    return '';
  }

  const style = spec.style || 'simple';
  if (Array.isArray(value)) {
    return serializePathArray(spec.name, value, style, spec.explode);
  }
  if (typeof value === 'object') {
    return serializePathObject(spec.name, value as Record<string, unknown>, style, spec.explode);
  }
  return pathPrefix(spec.name, style, false) + encodePathValue(serializePathPrimitive(value));
}

function serializePathArray(name: string, values: unknown[], style: string, explode: boolean): string {
  const serialized = values
    .filter((item) => item !== undefined && item !== null)
    .map((item) => encodePathValue(serializePathPrimitive(item)));
  if (serialized.length === 0) {
    return pathPrefix(name, style, false);
  }
  if (style === 'matrix') {
    return explode
      ? serialized.map((item) => `;${name}=${item}`).join('')
      : `;${name}=${serialized.join(',')}`;
  }
  return pathPrefix(name, style, false) + serialized.join(explode ? '.' : ',');
}

function serializePathObject(name: string, value: Record<string, unknown>, style: string, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return pathPrefix(name, style, true);
  }
  if (style === 'matrix') {
    return explode
      ? entries.map(([key, entryValue]) => `;${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join('')
      : `;${name}=${entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',')}`;
  }
  const serialized = explode
    ? entries.map(([key, entryValue]) => `${encodePathValue(key)}=${encodePathValue(serializePathPrimitive(entryValue))}`).join(style === 'label' ? '.' : ',')
    : entries.flatMap(([key, entryValue]) => [encodePathValue(key), encodePathValue(serializePathPrimitive(entryValue))]).join(',');
  return pathPrefix(name, style, true) + serialized;
}

function pathPrefix(name: string, style: string, _objectValue: boolean): string {
  if (style === 'label') return '.';
  if (style === 'matrix') return `;${name}`;
  return '';
}

function encodePathValue(value: string): string {
  return encodeURIComponent(value);
}

function serializePathPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}
interface QueryParameterSpec {
  name: string;
  value: unknown;
  style: string;
  explode: boolean;
  allowReserved: boolean;
  contentType?: string;
}

function buildQueryString(parameters: QueryParameterSpec[]): string {
  const pairs: string[] = [];
  for (const parameter of parameters) {
    appendSerializedParameter(pairs, parameter);
  }
  return pairs.join('&');
}

function appendSerializedParameter(pairs: string[], parameter: QueryParameterSpec): void {
  if (parameter.value === undefined || parameter.value === null) {
    return;
  }

  if (parameter.contentType) {
    pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(JSON.stringify(parameter.value), parameter.allowReserved)}`);
    return;
  }

  const style = parameter.style || 'form';
  if (style === 'deepObject') {
    appendDeepObjectParameter(pairs, parameter.name, parameter.value, parameter.allowReserved);
    return;
  }

  if (Array.isArray(parameter.value)) {
    appendArrayParameter(pairs, parameter.name, parameter.value, style, parameter.explode, parameter.allowReserved);
    return;
  }

  if (typeof parameter.value === 'object') {
    appendObjectParameter(pairs, parameter.name, parameter.value as Record<string, unknown>, style, parameter.explode, parameter.allowReserved);
    return;
  }

  pairs.push(`${encodeQueryComponent(parameter.name)}=${encodeQueryValue(serializePrimitive(parameter.value), parameter.allowReserved)}`);
}

function appendArrayParameter(
  pairs: string[],
  name: string,
  value: unknown[],
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const values = value
    .filter((item) => item !== undefined && item !== null)
    .map((item) => serializePrimitive(item));
  if (values.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const item of values) {
      pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(item, allowReserved)}`);
    }
    return;
  }

  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(values.join(','), allowReserved)}`);
}

function appendObjectParameter(
  pairs: string[],
  name: string,
  value: Record<string, unknown>,
  style: string,
  explode: boolean,
  allowReserved: boolean,
): void {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (entries.length === 0) {
    return;
  }

  if (style === 'form' && explode) {
    for (const [key, entryValue] of entries) {
      pairs.push(`${encodeQueryComponent(key)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
    }
    return;
  }

  const serialized = entries.flatMap(([key, entryValue]) => [key, serializePrimitive(entryValue)]).join(',');
  pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serialized, allowReserved)}`);
}

function appendDeepObjectParameter(
  pairs: string[],
  name: string,
  value: unknown,
  allowReserved: boolean,
): void {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    pairs.push(`${encodeQueryComponent(name)}=${encodeQueryValue(serializePrimitive(value), allowReserved)}`);
    return;
  }

  for (const [key, entryValue] of Object.entries(value as Record<string, unknown>)) {
    if (entryValue === undefined || entryValue === null) {
      continue;
    }
    pairs.push(`${encodeQueryComponent(`${name}[${key}]`)}=${encodeQueryValue(serializePrimitive(entryValue), allowReserved)}`);
  }
}

function serializePrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

function encodeQueryComponent(value: string): string {
  return encodeURIComponent(value);
}

function encodeQueryValue(value: string, allowReserved: boolean): string {
  const encoded = encodeURIComponent(value);
  if (!allowReserved) {
    return encoded;
  }
  return encoded.replace(/%3A/gi, ':')
    .replace(/%2F/gi, '/')
    .replace(/%3F/gi, '?')
    .replace(/%23/gi, '#')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
    .replace(/%40/gi, '@')
    .replace(/%21/gi, '!')
    .replace(/%24/gi, '$')
    .replace(/%26/gi, '&')
    .replace(/%27/gi, "'")
    .replace(/%28/gi, '(')
    .replace(/%29/gi, ')')
    .replace(/%2A/gi, '*')
    .replace(/%2B/gi, '+')
    .replace(/%2C/gi, ',')
    .replace(/%3B/gi, ';')
    .replace(/%3D/gi, '=');
}
