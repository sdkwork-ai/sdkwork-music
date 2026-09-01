import { backendApiPath } from './paths';
import type { ApiRequestOptions, HttpClient } from '../http/client';

import type { MusicAiGenerationCreditLedgerEntry, MusicAiGenerationModerationCommand, MusicAiGenerationProvider, MusicAiGenerationProviderAttempt, MusicAiGenerationProviderCommand, MusicAiGenerationProviderEvent, MusicAiGenerationProviderEventCommand, MusicAiGenerationProviderModel, MusicAiGenerationProviderModelCommand, MusicAiGenerationPublishCommand, MusicAiGenerationTask, MusicAiGenerationTaskSyncCommand, MusicAiPromptTemplate, MusicAiPromptTemplateCommand, MusicAiStylePreset, MusicAiStylePresetCommand, MusicAlbum, MusicAlbumCommand, MusicArtist, MusicArtistCommand, MusicAudioAsset, MusicAudioAssetCommand, MusicChart, MusicChartCommand, MusicChartEntry, MusicChartEntryCommand, MusicContentReport, MusicContentReportResolutionCommand, MusicHomeShelf, MusicModerationSignal, MusicPlaylist, MusicRecommendationFeedback, MusicRecommendationItem, MusicRecommendationShelfCommand, MusicRelease, MusicReleaseChannel, MusicReleaseChannelCommand, MusicRightsPolicy, MusicRightsPolicyCommand, MusicRightsTerritory, MusicRightsTerritoryCommand, MusicTrack, MusicTrackCommand, PageInfo } from '../types';


export interface MusicReleasesChannelsCreateParams {
  idempotencyKey: string;
}

export class MusicReleasesChannelsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music releases.channels.create */
  async create(releaseId: string, body: MusicReleaseChannelCommand, params: MusicReleasesChannelsCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicReleaseChannel> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicReleaseChannel>(backendApiPath(`/music/releases/${serializePathParameter(releaseId, { name: 'releaseId', style: 'simple', explode: false })}/channels`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicReleasesListParams {
  status?: string;
  pageSize?: number;
}

export class MusicReleasesApi {
  private client: HttpClient;
  public readonly channels: MusicReleasesChannelsApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.channels = new MusicReleasesChannelsApi(client);
  }


/** Music releases.list */
  async list(params?: MusicReleasesListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicRelease[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicRelease[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/releases`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicModerationSignalsListParams {
  resourceType?: string;
  resourceId?: string;
  status?: string;
  pageSize?: number;
}

export class MusicModerationSignalsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music moderation.signals.list */
  async list(params?: MusicModerationSignalsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicModerationSignal[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'resource_type', value: params?.resourceType, style: 'form', explode: true, allowReserved: false },
      { name: 'resource_id', value: params?.resourceId, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicModerationSignal[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/moderation/signals`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicModerationApi {
  public readonly signals: MusicModerationSignalsApi;

  constructor(client: HttpClient) {
    this.signals = new MusicModerationSignalsApi(client);
  }

}

export interface MusicRightsPoliciesTerritoriesCreateParams {
  idempotencyKey: string;
}

export class MusicRightsPoliciesTerritoriesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music rights.policies.territories.create */
  async create(policyId: string, body: MusicRightsTerritoryCommand, params: MusicRightsPoliciesTerritoriesCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicRightsTerritory> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicRightsTerritory>(backendApiPath(`/music/rights/policies/${serializePathParameter(policyId, { name: 'policyId', style: 'simple', explode: false })}/territories`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicRightsPoliciesManagementListParams {
  status?: string;
  pageSize?: number;
}

export class MusicRightsPoliciesManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music rights.policies.management.list */
  async list(params?: MusicRightsPoliciesManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicRightsPolicy[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicRightsPolicy[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/rights/policies`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicRightsPoliciesCreateParams {
  idempotencyKey: string;
}

export class MusicRightsPoliciesApi {
  private client: HttpClient;
  public readonly management: MusicRightsPoliciesManagementApi;
  public readonly territories: MusicRightsPoliciesTerritoriesApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicRightsPoliciesManagementApi(client);
    this.territories = new MusicRightsPoliciesTerritoriesApi(client);
  }


/** Music rights.policies.create */
  async create(body: MusicRightsPolicyCommand, params: MusicRightsPoliciesCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicRightsPolicy> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicRightsPolicy>(backendApiPath(`/music/rights/policies`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export class MusicRightsApi {
  public readonly policies: MusicRightsPoliciesApi;

  constructor(client: HttpClient) {
    this.policies = new MusicRightsPoliciesApi(client);
  }

}

export interface MusicGenerationsWebhooksCreateParams {
  idempotencyKey: string;
}

export class MusicGenerationsWebhooksApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.webhooks.receive */
  async create(providerCode: string, body: MusicAiGenerationProviderEventCommand, params: MusicGenerationsWebhooksCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationProviderEvent> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAiGenerationProviderEvent>(backendApiPath(`/music/generations/webhooks/${serializePathParameter(providerCode, { name: 'providerCode', style: 'simple', explode: false })}/events`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicGenerationsEventsManagementListParams {
  generationId?: string;
  providerCode?: string;
  source?: string;
  pageSize?: number;
}

export class MusicGenerationsEventsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.events.management.list */
  async list(params?: MusicGenerationsEventsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationProviderEvent[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'generation_id', value: params?.generationId, style: 'form', explode: true, allowReserved: false },
      { name: 'provider_code', value: params?.providerCode, style: 'form', explode: true, allowReserved: false },
      { name: 'source', value: params?.source, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationProviderEvent[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations/events`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicGenerationsEventsApi {
  public readonly management: MusicGenerationsEventsManagementApi;

  constructor(client: HttpClient) {
    this.management = new MusicGenerationsEventsManagementApi(client);
  }

}

export interface MusicGenerationsAttemptsListParams {
  pageSize?: number;
}

export class MusicGenerationsAttemptsApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.attempts.list */
  async list(generationId: string, params?: MusicGenerationsAttemptsListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationProviderAttempt[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationProviderAttempt[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations/${serializePathParameter(generationId, { name: 'generationId', style: 'simple', explode: false })}/attempts`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsProviderModelsManagementListParams {
  providerCode?: string;
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsProviderModelsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.providerModels.management.list */
  async list(params?: MusicGenerationsProviderModelsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationProviderModel[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'provider_code', value: params?.providerCode, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationProviderModel[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations/provider_models`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsProviderModelsCreateParams {
  idempotencyKey: string;
}

export class MusicGenerationsProviderModelsApi {
  private client: HttpClient;
  public readonly management: MusicGenerationsProviderModelsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicGenerationsProviderModelsManagementApi(client);
  }


/** Music generations.providerModels.create */
  async create(body: MusicAiGenerationProviderModelCommand, params: MusicGenerationsProviderModelsCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationProviderModel> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAiGenerationProviderModel>(backendApiPath(`/music/generations/provider_models`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicGenerationsProvidersManagementListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsProvidersManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.providers.management.list */
  async list(params?: MusicGenerationsProvidersManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationProvider[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationProvider[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations/providers`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsProvidersCreateParams {
  idempotencyKey: string;
}

export class MusicGenerationsProvidersApi {
  private client: HttpClient;
  public readonly management: MusicGenerationsProvidersManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicGenerationsProvidersManagementApi(client);
  }


/** Music generations.providers.create */
  async create(body: MusicAiGenerationProviderCommand, params: MusicGenerationsProvidersCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationProvider> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAiGenerationProvider>(backendApiPath(`/music/generations/providers`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Music generations.providers.update */
  async update(providerId: string, body: MusicAiGenerationProviderCommand, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationProvider> {
    return this.client.request<MusicAiGenerationProvider>(backendApiPath(`/music/generations/providers/${serializePathParameter(providerId, { name: 'providerId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicGenerationsManagementListParams {
  status?: string;
  userId?: string;
  providerCode?: string;
  pageSize?: number;
}

export class MusicGenerationsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.management.list */
  async list(params?: MusicGenerationsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationTask[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'user_id', value: params?.userId, style: 'form', explode: true, allowReserved: false },
      { name: 'provider_code', value: params?.providerCode, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationTask[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsCreditLedgerListParams {
  userId?: string;
  generationId?: string;
  pageSize?: number;
}

export class MusicGenerationsCreditLedgerApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.creditLedger.list */
  async list(params?: MusicGenerationsCreditLedgerListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiGenerationCreditLedgerEntry[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'user_id', value: params?.userId, style: 'form', explode: true, allowReserved: false },
      { name: 'generation_id', value: params?.generationId, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiGenerationCreditLedgerEntry[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations/credit_ledger`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsPromptTemplatesManagementListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsPromptTemplatesManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.promptTemplates.management.list */
  async list(params?: MusicGenerationsPromptTemplatesManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiPromptTemplate[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiPromptTemplate[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations/prompt_templates`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsPromptTemplatesCreateParams {
  idempotencyKey: string;
}

export class MusicGenerationsPromptTemplatesApi {
  private client: HttpClient;
  public readonly management: MusicGenerationsPromptTemplatesManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicGenerationsPromptTemplatesManagementApi(client);
  }


/** Music generations.promptTemplates.create */
  async create(body: MusicAiPromptTemplateCommand, params: MusicGenerationsPromptTemplatesCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicAiPromptTemplate> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAiPromptTemplate>(backendApiPath(`/music/generations/prompt_templates`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Music generations.promptTemplates.update */
  async update(templateId: string, body: MusicAiPromptTemplateCommand, requestOptions?: ApiRequestOptions): Promise<MusicAiPromptTemplate> {
    return this.client.request<MusicAiPromptTemplate>(backendApiPath(`/music/generations/prompt_templates/${serializePathParameter(templateId, { name: 'templateId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicGenerationsStylePresetsManagementListParams {
  status?: string;
  pageSize?: number;
}

export class MusicGenerationsStylePresetsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music generations.stylePresets.management.list */
  async list(params?: MusicGenerationsStylePresetsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAiStylePreset[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAiStylePreset[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/generations/style_presets`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicGenerationsStylePresetsCreateParams {
  idempotencyKey: string;
}

export class MusicGenerationsStylePresetsApi {
  private client: HttpClient;
  public readonly management: MusicGenerationsStylePresetsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicGenerationsStylePresetsManagementApi(client);
  }


/** Music generations.stylePresets.create */
  async create(body: MusicAiStylePresetCommand, params: MusicGenerationsStylePresetsCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicAiStylePreset> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAiStylePreset>(backendApiPath(`/music/generations/style_presets`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Music generations.stylePresets.update */
  async update(presetId: string, body: MusicAiStylePresetCommand, requestOptions?: ApiRequestOptions): Promise<MusicAiStylePreset> {
    return this.client.request<MusicAiStylePreset>(backendApiPath(`/music/generations/style_presets/${serializePathParameter(presetId, { name: 'presetId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicGenerationsSyncParams {
  idempotencyKey: string;
}

export interface MusicGenerationsPublishParams {
  idempotencyKey: string;
}

export class MusicGenerationsApi {
  private client: HttpClient;
  public readonly stylePresets: MusicGenerationsStylePresetsApi;
  public readonly promptTemplates: MusicGenerationsPromptTemplatesApi;
  public readonly creditLedger: MusicGenerationsCreditLedgerApi;
  public readonly management: MusicGenerationsManagementApi;
  public readonly providers: MusicGenerationsProvidersApi;
  public readonly providerModels: MusicGenerationsProviderModelsApi;
  public readonly attempts: MusicGenerationsAttemptsApi;
  public readonly events: MusicGenerationsEventsApi;
  public readonly webhooks: MusicGenerationsWebhooksApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.stylePresets = new MusicGenerationsStylePresetsApi(client);
    this.promptTemplates = new MusicGenerationsPromptTemplatesApi(client);
    this.creditLedger = new MusicGenerationsCreditLedgerApi(client);
    this.management = new MusicGenerationsManagementApi(client);
    this.providers = new MusicGenerationsProvidersApi(client);
    this.providerModels = new MusicGenerationsProviderModelsApi(client);
    this.attempts = new MusicGenerationsAttemptsApi(client);
    this.events = new MusicGenerationsEventsApi(client);
    this.webhooks = new MusicGenerationsWebhooksApi(client);
  }


/** Music generations.sync */
  async sync(generationId: string, body: MusicAiGenerationTaskSyncCommand, params: MusicGenerationsSyncParams, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationTask> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAiGenerationTask>(backendApiPath(`/music/generations/${serializePathParameter(generationId, { name: 'generationId', style: 'simple', explode: false })}/sync`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Music generations.moderate */
  async moderate(generationId: string, body: MusicAiGenerationModerationCommand, requestOptions?: ApiRequestOptions): Promise<MusicAiGenerationTask> {
    return this.client.request<MusicAiGenerationTask>(backendApiPath(`/music/generations/${serializePathParameter(generationId, { name: 'generationId', style: 'simple', explode: false })}/moderate`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }

/** Music generations.publish */
  async publish(generationId: string, body: MusicAiGenerationPublishCommand, params: MusicGenerationsPublishParams, requestOptions?: ApiRequestOptions): Promise<MusicRelease> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicRelease>(backendApiPath(`/music/generations/${serializePathParameter(generationId, { name: 'generationId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicContentReportsManagementListParams {
  status?: string;
  resourceType?: string;
  resourceId?: string;
  pageSize?: number;
}

export class MusicContentReportsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music contentReports.management.list */
  async list(params?: MusicContentReportsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicContentReport[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
      { name: 'resource_type', value: params?.resourceType, style: 'form', explode: true, allowReserved: false },
      { name: 'resource_id', value: params?.resourceId, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicContentReport[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/content_reports`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicContentReportsApi {
  private client: HttpClient;
  public readonly management: MusicContentReportsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicContentReportsManagementApi(client);
  }


/** Music contentReports.resolve */
  async resolve(reportId: string, body: MusicContentReportResolutionCommand, requestOptions?: ApiRequestOptions): Promise<MusicContentReport> {
    return this.client.request<MusicContentReport>(backendApiPath(`/music/content_reports/${serializePathParameter(reportId, { name: 'reportId', style: 'simple', explode: false })}/resolve`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicRecommendationFeedbackManagementListParams {
  itemType?: string;
  itemId?: string;
  feedbackType?: string;
  pageSize?: number;
}

export class MusicRecommendationFeedbackManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music recommendation.feedback.management.list */
  async list(params?: MusicRecommendationFeedbackManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicRecommendationFeedback[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'item_type', value: params?.itemType, style: 'form', explode: true, allowReserved: false },
      { name: 'item_id', value: params?.itemId, style: 'form', explode: true, allowReserved: false },
      { name: 'feedback_type', value: params?.feedbackType, style: 'form', explode: true, allowReserved: false },
      { name: 'page_size', value: params?.pageSize, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicRecommendationFeedback[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/recommendation/feedback`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicRecommendationFeedbackApi {
  public readonly management: MusicRecommendationFeedbackManagementApi;

  constructor(client: HttpClient) {
    this.management = new MusicRecommendationFeedbackManagementApi(client);
  }

}

export interface MusicRecommendationShelvesManagementListParams {
  q?: string;
  status?: string;
}

export class MusicRecommendationShelvesManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music recommendation.shelves.management.list */
  async list(params?: MusicRecommendationShelvesManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicHomeShelf[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicHomeShelf[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/recommendation/shelves`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicRecommendationShelvesCreateParams {
  idempotencyKey: string;
}

export class MusicRecommendationShelvesApi {
  private client: HttpClient;
  public readonly management: MusicRecommendationShelvesManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicRecommendationShelvesManagementApi(client);
  }


/** Music recommendation.shelves.create */
  async create(body: MusicRecommendationShelfCommand, params: MusicRecommendationShelvesCreateParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicRecommendationItem[]; pageInfo: PageInfo; }> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<{ items: MusicRecommendationItem[]; pageInfo: PageInfo; }>(backendApiPath(`/music/recommendation/shelves`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'page' });
  }
}

export class MusicRecommendationApi {
  public readonly shelves: MusicRecommendationShelvesApi;
  public readonly feedback: MusicRecommendationFeedbackApi;

  constructor(client: HttpClient) {
    this.shelves = new MusicRecommendationShelvesApi(client);
    this.feedback = new MusicRecommendationFeedbackApi(client);
  }

}

export interface MusicChartsEntriesCreateParams {
  idempotencyKey: string;
}

export class MusicChartsEntriesApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music charts.entries.create */
  async create(chartId: string, body: MusicChartEntryCommand, params: MusicChartsEntriesCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicChartEntry> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicChartEntry>(backendApiPath(`/music/charts/${serializePathParameter(chartId, { name: 'chartId', style: 'simple', explode: false })}/entries`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicChartsManagementListParams {
  q?: string;
  status?: string;
}

export class MusicChartsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music charts.management.list */
  async list(params?: MusicChartsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicChart[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicChart[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/charts`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicChartsCreateParams {
  idempotencyKey: string;
}

export class MusicChartsApi {
  private client: HttpClient;
  public readonly management: MusicChartsManagementApi;
  public readonly entries: MusicChartsEntriesApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicChartsManagementApi(client);
    this.entries = new MusicChartsEntriesApi(client);
  }


/** Music charts.create */
  async create(body: MusicChartCommand, params: MusicChartsCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicChart> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicChart>(backendApiPath(`/music/charts`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Music charts.update */
  async update(chartId: string, body: MusicChartCommand, requestOptions?: ApiRequestOptions): Promise<MusicChart> {
    return this.client.request<MusicChart>(backendApiPath(`/music/charts/${serializePathParameter(chartId, { name: 'chartId', style: 'simple', explode: false })}`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'PATCH' as any, body, contentType: 'application/json', sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicAudioAssetsManagementListParams {
  q?: string;
  status?: string;
}

export class MusicAudioAssetsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music audio.assets.management.list */
  async list(params?: MusicAudioAssetsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAudioAsset[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAudioAsset[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/audio/assets`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicAudioAssetsCreateParams {
  idempotencyKey: string;
}

export class MusicAudioAssetsApi {
  private client: HttpClient;
  public readonly management: MusicAudioAssetsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicAudioAssetsManagementApi(client);
  }


/** Music audio.assets.create */
  async create(body: MusicAudioAssetCommand, params: MusicAudioAssetsCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicAudioAsset> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAudioAsset>(backendApiPath(`/music/audio/assets`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export class MusicAudioApi {
  public readonly assets: MusicAudioAssetsApi;

  constructor(client: HttpClient) {
    this.assets = new MusicAudioAssetsApi(client);
  }

}

export interface MusicPlaylistsManagementListParams {
  q?: string;
  status?: string;
}

export class MusicPlaylistsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music playlists.management.list */
  async list(params?: MusicPlaylistsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicPlaylist[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicPlaylist[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/playlists`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export class MusicPlaylistsApi {
  public readonly management: MusicPlaylistsManagementApi;

  constructor(client: HttpClient) {
    this.management = new MusicPlaylistsManagementApi(client);
  }

}

export interface MusicTracksManagementListParams {
  artistId?: string;
  albumId?: string;
  q?: string;
  status?: string;
}

export class MusicTracksManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music tracks.management.list */
  async list(params?: MusicTracksManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicTrack[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'artist_id', value: params?.artistId, style: 'form', explode: true, allowReserved: false },
      { name: 'album_id', value: params?.albumId, style: 'form', explode: true, allowReserved: false },
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicTrack[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/tracks`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicTracksCreateParams {
  idempotencyKey: string;
}

export class MusicTracksApi {
  private client: HttpClient;
  public readonly management: MusicTracksManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicTracksManagementApi(client);
  }


/** Music tracks.create */
  async create(body: MusicTrackCommand, params: MusicTracksCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicTrack> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicTrack>(backendApiPath(`/music/tracks`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }

/** Music tracks.publish */
  async publish(trackId: string, requestOptions?: ApiRequestOptions): Promise<MusicTrack> {
    return this.client.request<MusicTrack>(backendApiPath(`/music/tracks/${serializePathParameter(trackId, { name: 'trackId', style: 'simple', explode: false })}/publish`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }

/** Music tracks.archive */
  async archive(trackId: string, requestOptions?: ApiRequestOptions): Promise<MusicTrack> {
    return this.client.request<MusicTrack>(backendApiPath(`/music/tracks/${serializePathParameter(trackId, { name: 'trackId', style: 'simple', explode: false })}/archive`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicAlbumsManagementListParams {
  artistId?: string;
  q?: string;
  status?: string;
}

export class MusicAlbumsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music albums.management.list */
  async list(params?: MusicAlbumsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicAlbum[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'artist_id', value: params?.artistId, style: 'form', explode: true, allowReserved: false },
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicAlbum[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/albums`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicAlbumsCreateParams {
  idempotencyKey: string;
}

export class MusicAlbumsApi {
  private client: HttpClient;
  public readonly management: MusicAlbumsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicAlbumsManagementApi(client);
  }


/** Music albums.create */
  async create(body: MusicAlbumCommand, params: MusicAlbumsCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicAlbum> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicAlbum>(backendApiPath(`/music/albums`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export interface MusicArtistsManagementListParams {
  q?: string;
  status?: string;
}

export class MusicArtistsManagementApi {
  private client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }


/** Music artists.management.list */
  async list(params?: MusicArtistsManagementListParams, requestOptions?: ApiRequestOptions): Promise<{ items: MusicArtist[]; pageInfo: PageInfo; }> {
    const query = buildQueryString([
      { name: 'q', value: params?.q, style: 'form', explode: true, allowReserved: false },
      { name: 'status', value: params?.status, style: 'form', explode: true, allowReserved: false },
    ]);
    return this.client.request<{ items: MusicArtist[]; pageInfo: PageInfo; }>(appendQueryString(backendApiPath(`/music/artists`), query), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'GET' as any, sdkworkUnwrapKind: 'page' });
  }
}

export interface MusicArtistsCreateParams {
  idempotencyKey: string;
}

export class MusicArtistsApi {
  private client: HttpClient;
  public readonly management: MusicArtistsManagementApi;

  constructor(client: HttpClient) {
    this.client = client;
    this.management = new MusicArtistsManagementApi(client);
  }


/** Music artists.create */
  async create(body: MusicArtistCommand, params: MusicArtistsCreateParams, requestOptions?: ApiRequestOptions): Promise<MusicArtist> {
    const requestHeaders = buildRequestHeaders(
      {
        'Idempotency-Key': { value: params.idempotencyKey, style: 'simple', explode: false },
      },
      {}
    );
    return this.client.request<MusicArtist>(backendApiPath(`/music/artists`), { ...(requestOptions?.signal !== undefined ? { signal: requestOptions.signal } : {}), ...(requestOptions?.timeout !== undefined ? { timeout: requestOptions.timeout } : {}), method: 'POST' as any, body, contentType: 'application/json', ...(requestHeaders !== undefined ? { headers: requestHeaders } : {}), sdkworkUnwrapKind: 'item' });
  }
}

export class MusicApi {
  public readonly artists: MusicArtistsApi;
  public readonly albums: MusicAlbumsApi;
  public readonly tracks: MusicTracksApi;
  public readonly playlists: MusicPlaylistsApi;
  public readonly audio: MusicAudioApi;
  public readonly charts: MusicChartsApi;
  public readonly recommendation: MusicRecommendationApi;
  public readonly contentReports: MusicContentReportsApi;
  public readonly generations: MusicGenerationsApi;
  public readonly rights: MusicRightsApi;
  public readonly moderation: MusicModerationApi;
  public readonly releases: MusicReleasesApi;

  constructor(client: HttpClient) {
    this.artists = new MusicArtistsApi(client);
    this.albums = new MusicAlbumsApi(client);
    this.tracks = new MusicTracksApi(client);
    this.playlists = new MusicPlaylistsApi(client);
    this.audio = new MusicAudioApi(client);
    this.charts = new MusicChartsApi(client);
    this.recommendation = new MusicRecommendationApi(client);
    this.contentReports = new MusicContentReportsApi(client);
    this.generations = new MusicGenerationsApi(client);
    this.rights = new MusicRightsApi(client);
    this.moderation = new MusicModerationApi(client);
    this.releases = new MusicReleasesApi(client);
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
function buildRequestHeaders(
  headers: Record<string, HeaderParameterSpec | undefined>,
  cookies: Record<string, HeaderParameterSpec | undefined> = {},
): Record<string, string> | undefined {
  const requestHeaders: Record<string, string> = {};

  for (const [name, parameter] of Object.entries(headers)) {
    const serialized = serializeParameterValue(parameter);
    if (serialized !== undefined) {
      requestHeaders[name] = serialized;
    }
  }

  const cookieHeader = buildCookieHeader(cookies);
  if (cookieHeader) {
    requestHeaders.Cookie = requestHeaders.Cookie
      ? `${requestHeaders.Cookie}; ${cookieHeader}`
      : cookieHeader;
  }

  return Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined;
}

interface HeaderParameterSpec {
  value: unknown;
  style: string;
  explode: boolean;
  contentType?: string;
}

function buildCookieHeader(cookies: Record<string, HeaderParameterSpec | undefined>): string | undefined {
  const pairs: string[] = [];
  for (const [name, parameter] of Object.entries(cookies)) {
    const serialized = serializeParameterValue(parameter);
    if (serialized !== undefined) {
      pairs.push(`${encodeURIComponent(name)}=${encodeURIComponent(serialized)}`);
    }
  }
  return pairs.length > 0 ? pairs.join('; ') : undefined;
}

function serializeParameterValue(parameter: HeaderParameterSpec | undefined): string | undefined {
  const value = parameter?.value;
  if (value === undefined || value === null) {
    return undefined;
  }
  if (parameter?.contentType) {
    return JSON.stringify(value);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeHeaderPrimitive(item)).join(',');
  }
  if (typeof value === 'object' && value !== null) {
    return serializeHeaderObject(value as Record<string, unknown>, parameter?.explode === true);
  }
  return serializeHeaderPrimitive(value);
}

function serializeHeaderObject(value: Record<string, unknown>, explode: boolean): string {
  const entries = Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null);
  if (explode) {
    return entries.map(([key, entryValue]) => `${key}=${serializeHeaderPrimitive(entryValue)}`).join(',');
  }
  return entries.flatMap(([key, entryValue]) => [key, serializeHeaderPrimitive(entryValue)]).join(',');
}

function serializeHeaderPrimitive(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return String(value);
}
