#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { alignOpenApiOperationPatterns } from "../../sdkwork-specs/tools/lib/align-api-operation-patterns.mjs";
import { bootstrapOpenApiEnvelope } from "../../sdkwork-specs/tools/lib/migrate-openapi-legacy-envelope.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(scriptDir, "..");
const generatedOutputDir = path.join(workspaceRoot, "generated", "openapi");
const routeManifestOutputDir = path.join(workspaceRoot, "sdks", "_route-manifests");
const OWNER = "sdkwork-music";
const DOMAIN = "music";
const APP_ROUTE_CRATE = "sdkwork-routes-music-app-api";
const BACKEND_ROUTE_CRATE = "sdkwork-routes-music-backend-api";
const CLOUDROUTER_OPEN_SDK_FAMILY = "cloudrouter-open-sdk";
const CLOUDROUTER_API_AUTHORITY = "sdkwork-cloudrouter.ai";
const CLOUDROUTER_API_PREFIX = "/v1";
const CLOUDROUTER_SUNO_CREATE_OPERATION_ID = "sunoCreateMusicGeneration";
const CLOUDROUTER_SUNO_RETRIEVE_OPERATION_ID = "sunoRetrieveMusicGeneration";
const CLOUDROUTER_SUNO_CREATE_ENDPOINT_KEY = "suno.music.generations.create";
const CLOUDROUTER_SUNO_CREATE_PATH = "/suno/v1/music/generations";
const CLOUDROUTER_SUNO_RETRIEVE_PATH = "/suno/v1/music/generations/{task_id}";

const schemas = {
  MusicApiResult: objectSchema(["code", "message", "requestId", "data"], {
    code: stringSchema({ minLength: 1 }),
    message: stringSchema({ minLength: 1 }),
    requestId: { type: "string", format: "uuid" },
    data: {},
  }),
  MusicMediaChecksum: objectSchema(["algorithm", "value"], {
    algorithm: stringSchema({ minLength: 1, maxLength: 32 }),
    value: stringSchema({ minLength: 1, maxLength: 256 }),
  }),
  MusicMediaAiProvenance: objectSchema(["provenance"], {
    provenance: { type: "string", enum: ["generated", "edited", "uploaded", "unknown"] },
    provider: stringSchema({ maxLength: 64 }),
    model: stringSchema({ maxLength: 128 }),
    taskId: stringSchema({ maxLength: 128 }),
    moderationStatus: { $ref: "#/components/schemas/MusicModerationStatus" },
  }),
  MusicMediaResource: objectSchema(["kind", "source"], {
    id: stringSchema({ maxLength: 128 }),
    kind: { type: "string", enum: ["image", "video", "audio", "voice", "document", "archive", "other"] },
    source: { type: "string", enum: ["drive", "provider_asset", "external_url", "generated"] },
    uri: stringSchema({ minLength: 1, maxLength: 512 }),
    url: { type: "string", format: "uri" },
    publicUrl: { type: "string", format: "uri" },
    mimeType: stringSchema({ maxLength: 128 }),
    sizeBytes: int64String(),
    durationSeconds: int32Schema({ minimum: 0 }),
    checksum: { $ref: "#/components/schemas/MusicMediaChecksum" },
    ai: { $ref: "#/components/schemas/MusicMediaAiProvenance" },
    metadata: { type: "object", additionalProperties: true },
  }),
  MusicArtist: objectSchema(["id", "tenantId", "slug", "name"], {
    id: idSchema(),
    tenantId: idSchema(),
    slug: slugSchema(),
    name: stringSchema({ minLength: 1, maxLength: 128 }),
    bio: stringSchema({ maxLength: 2000 }),
    avatar: { $ref: "#/components/schemas/MusicMediaResource" },
    avatarMediaResourceId: idSchema(),
  }),
  MusicAlbum: objectSchema(["id", "tenantId", "artistId", "slug", "title"], {
    id: idSchema(),
    tenantId: idSchema(),
    artistId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    cover: { $ref: "#/components/schemas/MusicMediaResource" },
    coverMediaResourceId: idSchema(),
    releaseDate: { type: "string", format: "date" },
  }),
  MusicAudioAsset: objectSchema(
    ["id", "tenantId", "title", "driveUri", "audio", "mimeType", "durationSeconds", "status"],
    {
      id: idSchema(),
      tenantId: idSchema(),
      title: stringSchema({ minLength: 1, maxLength: 160 }),
      driveSpaceId: idSchema(),
      driveNodeId: idSchema(),
      driveUri: driveUriSchema(),
      audio: { $ref: "#/components/schemas/MusicMediaResource" },
      mimeType: stringSchema({ minLength: 1, maxLength: 128 }),
      durationSeconds: int32Schema({ minimum: 0 }),
      checksum: { $ref: "#/components/schemas/MusicMediaChecksum" },
      status: { $ref: "#/components/schemas/MusicAudioAssetStatus" },
    },
  ),
  MusicAudioAssetStatus: {
    type: "string",
    enum: ["processing", "queued", "ready", "failed", "archived"],
  },
  MusicTrack: objectSchema(["id", "tenantId", "artistId", "slug", "title", "durationSeconds", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    artistId: idSchema(),
    artistName: stringSchema({ maxLength: 128 }),
    albumId: idSchema(),
    albumTitle: stringSchema({ maxLength: 160 }),
    audioAssetId: idSchema(),
    audio: { $ref: "#/components/schemas/MusicMediaResource" },
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    durationSeconds: int32Schema({ minimum: 0 }),
    status: { $ref: "#/components/schemas/MusicTrackStatus" },
    tags: stringArray(20),
    publishedAt: dateTimeSchema(),
    updatedAt: dateTimeSchema(),
  }),
  MusicTrackStatus: {
    type: "string",
    enum: ["draft", "published", "archived"],
  },
  MusicPlaylist: objectSchema(["id", "tenantId", "slug", "title", "trackIds"], {
    id: idSchema(),
    tenantId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    description: stringSchema({ maxLength: 1000 }),
    cover: { $ref: "#/components/schemas/MusicMediaResource" },
    trackIds: { type: "array", items: idSchema(), maxItems: 500 },
    updatedAt: dateTimeSchema(),
  }),
  MusicPlaylistFollow: objectSchema(["id", "tenantId", "userId", "playlistId"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    playlistId: idSchema(),
    source: stringSchema({ maxLength: 64 }),
    createdAt: dateTimeSchema(),
  }),
  MusicComment: objectSchema(["id", "tenantId", "userId", "resourceType", "resourceId", "body", "moderationStatus"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    resourceType: stringSchema({ minLength: 1, maxLength: 64 }),
    resourceId: idSchema(),
    parentCommentId: idSchema(),
    body: stringSchema({ minLength: 1, maxLength: 2000 }),
    moderationStatus: { $ref: "#/components/schemas/MusicModerationStatus" },
    likeCount: int32Schema({ minimum: 0 }),
    replyCount: int32Schema({ minimum: 0 }),
    createdAt: dateTimeSchema(),
    updatedAt: dateTimeSchema(),
  }),
  MusicContentReport: objectSchema(["id", "tenantId", "reporterUserId", "resourceType", "resourceId", "reasonCode", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    reporterUserId: idSchema(),
    resourceType: stringSchema({ minLength: 1, maxLength: 64 }),
    resourceId: idSchema(),
    reasonCode: stringSchema({ minLength: 1, maxLength: 64 }),
    description: stringSchema({ maxLength: 1000 }),
    status: { type: "string", enum: ["open", "reviewing", "resolved", "dismissed"] },
    resolvedBy: idSchema(),
    resolutionNote: stringSchema({ maxLength: 1000 }),
    createdAt: dateTimeSchema(),
    updatedAt: dateTimeSchema(),
    resolvedAt: dateTimeSchema(),
  }),
  MusicChart: objectSchema(["id", "tenantId", "slug", "title", "chartType", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    chartType: { type: "string", enum: ["daily", "weekly", "monthly", "genre", "editorial", "ai"] },
    status: { type: "string", enum: ["draft", "active", "paused", "archived"] },
    periodStart: dateTimeSchema(),
    periodEnd: dateTimeSchema(),
  }),
  MusicChartEntry: objectSchema(["id", "tenantId", "chartId", "trackId", "rank", "score"], {
    id: idSchema(),
    tenantId: idSchema(),
    chartId: idSchema(),
    trackId: idSchema(),
    track: { $ref: "#/components/schemas/MusicTrack" },
    rank: int32Schema({ minimum: 1 }),
    previousRank: int32Schema({ minimum: 1 }),
    score: int32Schema({ minimum: 0 }),
  }),
  MusicHomeShelf: objectSchema(["id", "tenantId", "slug", "title", "shelfType", "items"], {
    id: idSchema(),
    tenantId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    shelfType: { type: "string", enum: ["personalized", "new_release", "chart", "playlist", "ai_generation", "editorial"] },
    items: { type: "array", items: { $ref: "#/components/schemas/MusicRecommendationItem" }, maxItems: 50 },
  }),
  MusicRecommendationItem: objectSchema(["id", "itemType", "itemId", "position"], {
    id: idSchema(),
    itemType: { type: "string", enum: ["track", "album", "artist", "playlist", "chart", "ai_generation_task"] },
    itemId: idSchema(),
    position: int32Schema({ minimum: 0 }),
    reasonCode: stringSchema({ maxLength: 64 }),
    track: { $ref: "#/components/schemas/MusicTrack" },
    playlist: { $ref: "#/components/schemas/MusicPlaylist" },
  }),
  MusicRecommendationFeedback: objectSchema(["id", "tenantId", "userId", "itemType", "itemId", "feedbackType"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    itemType: { type: "string", enum: ["track", "album", "artist", "playlist", "chart", "ai_generation_task"] },
    itemId: idSchema(),
    feedbackType: { type: "string", enum: ["like", "dislike", "not_interested", "skip", "hide", "report"] },
    reasonCode: stringSchema({ maxLength: 64 }),
    context: { type: "object", additionalProperties: true },
    createdAt: dateTimeSchema(),
  }),
  MusicSearchResult: objectSchema(["resourceType", "resourceId", "title"], {
    resourceType: { type: "string", enum: ["track", "album", "artist", "playlist", "chart"] },
    resourceId: idSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    subtitle: stringSchema({ maxLength: 240 }),
    track: { $ref: "#/components/schemas/MusicTrack" },
    artist: { $ref: "#/components/schemas/MusicArtist" },
    album: { $ref: "#/components/schemas/MusicAlbum" },
    playlist: { $ref: "#/components/schemas/MusicPlaylist" },
  }),
  MusicSearchSuggestion: objectSchema(["id", "tenantId", "suggestionType", "displayText", "queryText", "weight"], {
    id: idSchema(),
    tenantId: idSchema(),
    suggestionType: { type: "string", enum: ["hot", "personalized", "history", "scene", "ai_style"] },
    displayText: stringSchema({ minLength: 1, maxLength: 160 }),
    queryText: stringSchema({ minLength: 1, maxLength: 160 }),
    weight: int32Schema({ minimum: 0 }),
  }),
  MusicUserLibraryItem: objectSchema(["id", "tenantId", "userId", "itemType", "itemId", "source"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    itemType: { type: "string", enum: ["track", "album", "artist", "playlist", "chart", "ai_generation_task"] },
    itemId: idSchema(),
    source: { type: "string", enum: ["favorite", "collected", "downloaded", "created", "followed", "recent"] },
    updatedAt: dateTimeSchema(),
  }),
  MusicListeningHistoryItem: objectSchema(["trackId", "trackTitle", "playCount", "lastPlayedAt"], {
    trackId: idSchema(),
    trackTitle: stringSchema({ minLength: 1, maxLength: 160 }),
    playCount: int32Schema({ minimum: 0 }),
    lastPlayedAt: dateTimeSchema(),
    track: { $ref: "#/components/schemas/MusicTrack" },
  }),
  MusicDownloadEntitlement: objectSchema(["id", "tenantId", "userId", "trackId", "audioAssetId", "quality", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    trackId: idSchema(),
    audioAssetId: idSchema(),
    quality: { type: "string", enum: ["standard", "high", "lossless", "hi_res"] },
    status: { type: "string", enum: ["active", "expired", "revoked"] },
    expiresAt: dateTimeSchema(),
    track: { $ref: "#/components/schemas/MusicTrack" },
  }),
  MusicPlaybackSession: objectSchema(["id", "tenantId", "userId", "deviceId", "playbackState"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    deviceId: stringSchema({ minLength: 1, maxLength: 128 }),
    currentTrackId: idSchema(),
    queue: { type: "array", items: idSchema(), maxItems: 500 },
    positionMs: int32Schema({ minimum: 0 }),
    playbackState: { type: "string", enum: ["idle", "playing", "paused", "buffering", "ended"] },
    updatedAt: dateTimeSchema(),
  }),
  MusicAiStylePreset: objectSchema(["id", "tenantId", "slug", "title", "styleTags", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    styleTags: stringArray(32),
    promptHint: stringSchema({ maxLength: 1000 }),
    status: { type: "string", enum: ["draft", "active", "archived"] },
  }),
  MusicAiPromptTemplate: objectSchema(["id", "tenantId", "slug", "title", "templateText", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    templateText: stringSchema({ minLength: 1, maxLength: 4000 }),
    variables: { type: "array", items: stringSchema({ minLength: 1, maxLength: 64 }), maxItems: 32 },
    status: { type: "string", enum: ["draft", "active", "archived"] },
  }),
  MusicAiProviderInvocationMode: {
    type: "string",
    enum: ["sync", "async_task", "webhook", "hybrid"],
  },
  MusicAiGenerationProvider: objectSchema(
    [
      "id",
      "tenantId",
      "providerCode",
      "displayName",
      "providerFamily",
      "capability",
      "invocationMode",
      "cloudRouterProviderCode",
      "cloudRouterEndpointKey",
      "cloudRouterStandardPath",
      ...cloudRouterProviderBindingRequired(),
      "supportsPolling",
      "supportsWebhook",
      "status",
    ],
    {
      id: idSchema(),
      tenantId: idSchema(),
      providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
      displayName: stringSchema({ minLength: 1, maxLength: 160 }),
      providerFamily: stringSchema({ minLength: 1, maxLength: 64 }),
      capability: { type: "string", enum: ["text_to_music", "lyrics_to_music", "reference_to_music", "stem_generation", "arrangement", "voice_to_song"] },
      invocationMode: { $ref: "#/components/schemas/MusicAiProviderInvocationMode" },
      ...cloudRouterProviderBindingProperties(),
      supportsPolling: { type: "boolean" },
      supportsWebhook: { type: "boolean" },
      status: { type: "string", enum: ["draft", "active", "paused", "archived"] },
      configSnapshot: { type: "object", additionalProperties: true },
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
    },
  ),
  MusicAiGenerationProviderModel: objectSchema(
    [
      "id",
      "tenantId",
      "providerId",
      "providerCode",
      "modelName",
      "displayName",
      "capability",
      "minDurationSeconds",
      "maxDurationSeconds",
      "maxVariantCount",
      "supportedFormats",
      "pricingUnit",
      "status",
    ],
    {
      id: idSchema(),
      tenantId: idSchema(),
      providerId: idSchema(),
      providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
      modelName: stringSchema({ minLength: 1, maxLength: 128 }),
      displayName: stringSchema({ minLength: 1, maxLength: 160 }),
      capability: { type: "string", enum: ["text_to_music", "lyrics_to_music", "reference_to_music", "stem_generation", "arrangement", "voice_to_song"] },
      minDurationSeconds: int32Schema({ minimum: 1 }),
      maxDurationSeconds: int32Schema({ minimum: 1 }),
      maxVariantCount: int32Schema({ minimum: 1, maximum: 16 }),
      supportedFormats: { type: "array", items: stringSchema({ minLength: 1, maxLength: 32 }), maxItems: 16 },
      supportedStyleTags: stringArray(64),
      pricingUnit: { type: "string", enum: ["generation", "second", "credit", "token", "provider_native"] },
      status: { type: "string", enum: ["draft", "active", "paused", "archived"] },
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
    },
  ),
  MusicAiGenerationTask: objectSchema(
    [
      "id",
      "tenantId",
      "userId",
      "prompt",
      "styleTags",
      "generationMode",
      "providerCode",
      "providerModel",
      "providerInvocationMode",
      "status",
      "moderationStatus",
    ],
    {
      id: idSchema(),
      tenantId: idSchema(),
      projectId: idSchema(),
      userId: idSchema(),
      prompt: stringSchema({ minLength: 1, maxLength: 2000 }),
      lyricsPrompt: stringSchema({ maxLength: 4000 }),
      styleTags: stringArray(32),
      generationMode: { type: "string", enum: ["text_to_music", "lyrics_to_music", "reference_to_music", "stem_generation", "arrangement", "voice_to_song"] },
      providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
      providerModel: stringSchema({ minLength: 1, maxLength: 128 }),
      providerInvocationMode: { $ref: "#/components/schemas/MusicAiProviderInvocationMode" },
      providerTaskId: stringSchema({ maxLength: 128 }),
      externalTaskId: stringSchema({ maxLength: 128 }),
      providerStatus: stringSchema({ maxLength: 128 }),
      providerOutputCount: int32Schema({ minimum: 0 }),
      modelProvider: stringSchema({ maxLength: 64 }),
      modelName: stringSchema({ maxLength: 128 }),
      reference: { $ref: "#/components/schemas/MusicMediaResource" },
      referenceDriveUri: driveUriSchema(),
      requestedDurationSeconds: int32Schema({ minimum: 1 }),
      variantCount: int32Schema({ minimum: 1, maximum: 16 }),
      status: { $ref: "#/components/schemas/MusicAiGenerationTaskStatus" },
      moderationStatus: { $ref: "#/components/schemas/MusicModerationStatus" },
      rightsPolicyId: idSchema(),
      variants: { type: "array", items: { $ref: "#/components/schemas/MusicAiGenerationVariant" }, maxItems: 16 },
      attempts: { type: "array", items: { $ref: "#/components/schemas/MusicAiGenerationProviderAttempt" }, maxItems: 32 },
      events: { type: "array", items: { $ref: "#/components/schemas/MusicAiGenerationProviderEvent" }, maxItems: 100 },
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
      lastProviderSyncAt: dateTimeSchema(),
      nextPollAt: dateTimeSchema(),
      completedAt: dateTimeSchema(),
    },
  ),
  MusicAiGenerationTaskStatus: {
    type: "string",
    enum: ["queued", "routing", "submitted", "running", "waiting_webhook", "succeeded", "failed", "cancelled", "expired"],
  },
  MusicAiGenerationProviderAttempt: objectSchema(
    [
      "id",
      "tenantId",
      "taskId",
      "providerId",
      "providerCode",
      "modelName",
      "invocationMode",
      "cloudRouterEndpointKey",
      "cloudRouterStandardPath",
      "cloudRouterOperationId",
      "status",
    ],
    {
      id: idSchema(),
      tenantId: idSchema(),
      taskId: idSchema(),
      providerId: idSchema(),
      providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
      modelName: stringSchema({ minLength: 1, maxLength: 128 }),
      invocationMode: { $ref: "#/components/schemas/MusicAiProviderInvocationMode" },
      cloudRouterEndpointKey: enumStringSchema(CLOUDROUTER_SUNO_CREATE_ENDPOINT_KEY),
      cloudRouterStandardPath: enumStringSchema(CLOUDROUTER_SUNO_CREATE_PATH),
      cloudRouterOperationId: enumStringSchema(CLOUDROUTER_SUNO_CREATE_OPERATION_ID),
      cloudRouterRequestId: stringSchema({ maxLength: 128 }),
      externalTaskId: stringSchema({ maxLength: 128 }),
      status: { $ref: "#/components/schemas/MusicAiGenerationTaskStatus" },
      providerStatus: stringSchema({ maxLength: 128 }),
      requestSnapshot: { type: "object", additionalProperties: true },
      responseSnapshot: { type: "object", additionalProperties: true },
      submittedAt: dateTimeSchema(),
      createdAt: dateTimeSchema(),
      updatedAt: dateTimeSchema(),
    },
  ),
  MusicAiGenerationProviderEvent: objectSchema(
    ["id", "tenantId", "taskId", "providerCode", "eventType", "source", "providerStatus", "statusBefore", "statusAfter", "createdAt"],
    {
      id: idSchema(),
      tenantId: idSchema(),
      taskId: idSchema(),
      attemptId: idSchema(),
      providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
      externalTaskId: stringSchema({ maxLength: 128 }),
      externalEventId: stringSchema({ maxLength: 128 }),
      eventType: stringSchema({ minLength: 1, maxLength: 64 }),
      source: { type: "string", enum: ["start", "poll", "webhook", "manual_sync", "provider_callback"] },
      providerStatus: stringSchema({ minLength: 1, maxLength: 128 }),
      statusBefore: { $ref: "#/components/schemas/MusicAiGenerationTaskStatus" },
      statusAfter: { $ref: "#/components/schemas/MusicAiGenerationTaskStatus" },
      payloadHash: stringSchema({ maxLength: 128 }),
      payloadSnapshot: { type: "object", additionalProperties: true },
      hasOutputs: { type: "boolean" },
      createdAt: dateTimeSchema(),
    },
  ),
  MusicAiGenerationNotification: objectSchema(["id", "tenantId", "userId", "taskId", "notificationType", "status", "createdAt"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    taskId: idSchema(),
    notificationType: stringSchema({ minLength: 1, maxLength: 64 }),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    body: stringSchema({ maxLength: 1000 }),
    status: { type: "string", enum: ["unread", "read", "archived"] },
    createdAt: dateTimeSchema(),
    readAt: dateTimeSchema(),
  }),
  MusicAiGenerationVariant: objectSchema(["id", "tenantId", "taskId", "title", "audio", "moderationStatus"], {
    id: idSchema(),
    tenantId: idSchema(),
    taskId: idSchema(),
    audioAssetId: idSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    audio: { $ref: "#/components/schemas/MusicMediaResource" },
    durationSeconds: int32Schema({ minimum: 0 }),
    moderationStatus: { $ref: "#/components/schemas/MusicModerationStatus" },
  }),
  MusicAiGenerationCreditLedgerEntry: objectSchema(["id", "tenantId", "userId", "direction", "amount", "balanceAfter", "reasonCode", "createdAt"], {
    id: idSchema(),
    tenantId: idSchema(),
    userId: idSchema(),
    taskId: idSchema(),
    direction: { type: "string", enum: ["credit", "debit", "refund"] },
    amount: int32Schema({ minimum: 0 }),
    balanceAfter: int32Schema({ minimum: 0 }),
    reasonCode: stringSchema({ minLength: 1, maxLength: 64 }),
    createdAt: dateTimeSchema(),
  }),
  MusicModerationStatus: {
    type: "string",
    enum: ["unknown", "pending", "approved", "rejected", "blocked"],
  },
  MusicRightsPolicy: objectSchema(["id", "tenantId", "policyCode", "title", "licenseType", "usageScope", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    policyCode: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    licenseType: { type: "string", enum: ["platform", "creator_owned", "licensed", "public_domain", "restricted"] },
    usageScope: stringSchema({ minLength: 1, maxLength: 256 }),
    attributionRequired: { type: "boolean" },
    commercialUseAllowed: { type: "boolean" },
    status: { type: "string", enum: ["draft", "active", "archived"] },
  }),
  MusicRightsTerritory: objectSchema(["id", "tenantId", "rightsPolicyId", "regionCode", "availability"], {
    id: idSchema(),
    tenantId: idSchema(),
    rightsPolicyId: idSchema(),
    regionCode: stringSchema({ minLength: 2, maxLength: 16 }),
    availability: { type: "string", enum: ["allowed", "blocked", "windowed"] },
    startsAt: dateTimeSchema(),
    endsAt: dateTimeSchema(),
  }),
  MusicModerationSignal: objectSchema(["id", "tenantId", "resourceType", "resourceId", "signalType", "severity", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    resourceType: stringSchema({ minLength: 1, maxLength: 64 }),
    resourceId: idSchema(),
    signalType: stringSchema({ minLength: 1, maxLength: 64 }),
    severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
    status: { type: "string", enum: ["open", "reviewing", "resolved", "dismissed"] },
    reason: stringSchema({ maxLength: 1000 }),
    createdAt: dateTimeSchema(),
  }),
  MusicRelease: objectSchema(["id", "tenantId", "sourceType", "sourceId", "status"], {
    id: idSchema(),
    tenantId: idSchema(),
    trackId: idSchema(),
    sourceType: { type: "string", enum: ["track", "ai_generation_task", "ai_generation_variant"] },
    sourceId: idSchema(),
    rightsPolicyId: idSchema(),
    status: { type: "string", enum: ["draft", "published", "rejected", "archived"] },
    publishedAt: dateTimeSchema(),
  }),
  MusicReleaseChannel: objectSchema(["id", "tenantId", "releaseId", "channelCode", "distributionStatus"], {
    id: idSchema(),
    tenantId: idSchema(),
    releaseId: idSchema(),
    channelCode: stringSchema({ minLength: 1, maxLength: 64 }),
    distributionStatus: { type: "string", enum: ["scheduled", "publishing", "published", "failed", "revoked"] },
    scheduledAt: dateTimeSchema(),
    publishedAt: dateTimeSchema(),
  }),
  MusicArtistCommand: objectSchema([], {
    slug: slugSchema(),
    name: stringSchema({ minLength: 1, maxLength: 128 }),
    bio: stringSchema({ maxLength: 2000 }),
    avatar: { $ref: "#/components/schemas/MusicMediaResource" },
    avatarMediaResourceId: idSchema(),
  }),
  MusicAlbumCommand: objectSchema([], {
    artistId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    cover: { $ref: "#/components/schemas/MusicMediaResource" },
    coverMediaResourceId: idSchema(),
    releaseDate: { type: "string", format: "date" },
  }),
  MusicTrackCommand: objectSchema([], {
    artistId: idSchema(),
    albumId: idSchema(),
    audioAssetId: idSchema(),
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    durationSeconds: int32Schema({ minimum: 0 }),
    tags: stringArray(20),
  }),
  MusicAudioAssetCommand: objectSchema([], {
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    driveSpaceId: idSchema(),
    driveNodeId: idSchema(),
    driveUri: driveUriSchema(),
    audio: { $ref: "#/components/schemas/MusicMediaResource" },
    mimeType: stringSchema({ minLength: 1, maxLength: 128 }),
    durationSeconds: int32Schema({ minimum: 0 }),
    checksum: { $ref: "#/components/schemas/MusicMediaChecksum" },
    status: { $ref: "#/components/schemas/MusicAudioAssetStatus" },
  }),
  MusicLibraryItemCommand: objectSchema(["itemType", "itemId", "source"], {
    itemType: { type: "string", enum: ["track", "album", "artist", "playlist", "chart", "ai_generation_task"] },
    itemId: idSchema(),
    source: { type: "string", enum: ["favorite", "collected", "downloaded", "created", "followed", "recent"] },
  }),
  MusicPlaylistTrackCommand: objectSchema(["trackId"], {
    trackId: idSchema(),
    position: int32Schema({ minimum: 0 }),
  }),
  MusicPlaylistFollowCommand: objectSchema([], {
    source: stringSchema({ maxLength: 64 }),
  }),
  MusicCommentCommand: objectSchema(["resourceType", "resourceId", "body"], {
    resourceType: stringSchema({ minLength: 1, maxLength: 64 }),
    resourceId: idSchema(),
    parentCommentId: idSchema(),
    body: stringSchema({ minLength: 1, maxLength: 2000 }),
  }),
  MusicContentReportCommand: objectSchema(["resourceType", "resourceId", "reasonCode"], {
    resourceType: stringSchema({ minLength: 1, maxLength: 64 }),
    resourceId: idSchema(),
    reasonCode: stringSchema({ minLength: 1, maxLength: 64 }),
    description: stringSchema({ maxLength: 1000 }),
  }),
  MusicContentReportResolutionCommand: objectSchema(["status"], {
    status: { type: "string", enum: ["resolved", "dismissed"] },
    resolutionNote: stringSchema({ maxLength: 1000 }),
  }),
  MusicRecommendationFeedbackCommand: objectSchema(["itemType", "itemId", "feedbackType"], {
    itemType: { type: "string", enum: ["track", "album", "artist", "playlist", "chart", "ai_generation_task"] },
    itemId: idSchema(),
    feedbackType: { type: "string", enum: ["like", "dislike", "not_interested", "skip", "hide", "report"] },
    reasonCode: stringSchema({ maxLength: 64 }),
    context: { type: "object", additionalProperties: true },
  }),
  MusicPlaybackSessionCommand: objectSchema(["deviceId", "playbackState"], {
    deviceId: stringSchema({ minLength: 1, maxLength: 128 }),
    currentTrackId: idSchema(),
    queue: { type: "array", items: idSchema(), maxItems: 500 },
    positionMs: int32Schema({ minimum: 0 }),
    playbackState: { type: "string", enum: ["idle", "playing", "paused", "buffering", "ended"] },
  }),
  MusicPlayEventCommand: objectSchema(["trackId", "occurredAt"], {
    trackId: idSchema(),
    durationSeconds: int32Schema({ minimum: 0 }),
    playedSeconds: int32Schema({ minimum: 0 }),
    completionRate: int32Schema({ minimum: 0, maximum: 100 }),
    source: stringSchema({ maxLength: 64 }),
    occurredAt: dateTimeSchema(),
  }),
  MusicChartCommand: objectSchema(["slug", "title", "chartType", "status"], {
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    chartType: { type: "string", enum: ["daily", "weekly", "monthly", "genre", "editorial", "ai"] },
    status: { type: "string", enum: ["draft", "active", "paused", "archived"] },
    periodStart: dateTimeSchema(),
    periodEnd: dateTimeSchema(),
  }),
  MusicChartEntryCommand: objectSchema(["trackId", "rank"], {
    trackId: idSchema(),
    rank: int32Schema({ minimum: 1 }),
    previousRank: int32Schema({ minimum: 1 }),
    score: int32Schema({ minimum: 0 }),
  }),
  MusicRecommendationShelfCommand: objectSchema(["slug", "title", "shelfType", "status"], {
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    shelfType: { type: "string", enum: ["personalized", "new_release", "chart", "playlist", "ai_generation", "editorial"] },
    algorithmCode: stringSchema({ maxLength: 64 }),
    status: { type: "string", enum: ["draft", "active", "paused", "archived"] },
    items: { type: "array", items: { $ref: "#/components/schemas/MusicRecommendationItemCommand" }, maxItems: 100 },
  }),
  MusicRecommendationItemCommand: objectSchema(["itemType", "itemId", "position"], {
    itemType: { type: "string", enum: ["track", "album", "artist", "playlist", "chart", "ai_generation_task"] },
    itemId: idSchema(),
    position: int32Schema({ minimum: 0 }),
    reasonCode: stringSchema({ maxLength: 64 }),
  }),
  MusicAiStylePresetCommand: objectSchema(["slug", "title", "styleTags", "status"], {
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    styleTags: stringArray(32),
    promptHint: stringSchema({ maxLength: 1000 }),
    status: { type: "string", enum: ["draft", "active", "archived"] },
  }),
  MusicAiPromptTemplateCommand: objectSchema(["slug", "title", "templateText", "status"], {
    slug: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    templateText: stringSchema({ minLength: 1, maxLength: 4000 }),
    variables: { type: "array", items: stringSchema({ minLength: 1, maxLength: 64 }), maxItems: 32 },
    status: { type: "string", enum: ["draft", "active", "archived"] },
  }),
  MusicAiGenerationProviderCommand: objectSchema(
    [
      "providerCode",
      "displayName",
      "providerFamily",
      "capability",
      "invocationMode",
      "cloudRouterProviderCode",
      "cloudRouterEndpointKey",
      "cloudRouterStandardPath",
      ...cloudRouterProviderBindingRequired(),
      "supportsPolling",
      "supportsWebhook",
      "status",
    ],
    {
      providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
      displayName: stringSchema({ minLength: 1, maxLength: 160 }),
      providerFamily: stringSchema({ minLength: 1, maxLength: 64 }),
      capability: { type: "string", enum: ["text_to_music", "lyrics_to_music", "reference_to_music", "stem_generation", "arrangement", "voice_to_song"] },
      invocationMode: { $ref: "#/components/schemas/MusicAiProviderInvocationMode" },
      ...cloudRouterProviderBindingProperties(),
      supportsPolling: { type: "boolean" },
      supportsWebhook: { type: "boolean" },
      status: { type: "string", enum: ["draft", "active", "paused", "archived"] },
      configSnapshot: { type: "object", additionalProperties: true },
    },
  ),
  MusicAiGenerationProviderModelCommand: objectSchema(
    [
      "providerId",
      "providerCode",
      "modelName",
      "displayName",
      "capability",
      "minDurationSeconds",
      "maxDurationSeconds",
      "maxVariantCount",
      "supportedFormats",
      "pricingUnit",
      "status",
    ],
    {
      providerId: idSchema(),
      providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
      modelName: stringSchema({ minLength: 1, maxLength: 128 }),
      displayName: stringSchema({ minLength: 1, maxLength: 160 }),
      capability: { type: "string", enum: ["text_to_music", "lyrics_to_music", "reference_to_music", "stem_generation", "arrangement", "voice_to_song"] },
      minDurationSeconds: int32Schema({ minimum: 1 }),
      maxDurationSeconds: int32Schema({ minimum: 1 }),
      maxVariantCount: int32Schema({ minimum: 1, maximum: 16 }),
      supportedFormats: { type: "array", items: stringSchema({ minLength: 1, maxLength: 32 }), maxItems: 16 },
      supportedStyleTags: stringArray(64),
      pricingUnit: { type: "string", enum: ["generation", "second", "credit", "token", "provider_native"] },
      status: { type: "string", enum: ["draft", "active", "paused", "archived"] },
    },
  ),
  MusicAiGenerationTaskCommand: objectSchema(["prompt", "styleTags", "providerCode", "providerModel"], {
    projectId: idSchema(),
    prompt: stringSchema({ minLength: 1, maxLength: 2000 }),
    lyricsPrompt: stringSchema({ maxLength: 4000 }),
    styleTags: stringArray(32),
    generationMode: { type: "string", enum: ["text_to_music", "lyrics_to_music", "reference_to_music", "stem_generation", "arrangement", "voice_to_song"] },
    providerCode: stringSchema({ minLength: 1, maxLength: 64 }),
    providerModel: stringSchema({ minLength: 1, maxLength: 128 }),
    modelProvider: stringSchema({ maxLength: 64 }),
    modelName: stringSchema({ maxLength: 128 }),
    reference: { $ref: "#/components/schemas/MusicMediaResource" },
    referenceDriveUri: driveUriSchema(),
    requestedDurationSeconds: int32Schema({ minimum: 1 }),
    variantCount: int32Schema({ minimum: 1, maximum: 16 }),
    seed: int32Schema({ minimum: 0 }),
    negativePrompt: stringSchema({ maxLength: 1000 }),
    providerOptions: { type: "object", additionalProperties: true },
  }),
  MusicAiGenerationTaskSyncCommand: objectSchema(["source"], {
    source: { type: "string", enum: ["poll", "manual_sync", "webhook_replay"] },
    providerStatus: stringSchema({ maxLength: 128 }),
    externalTaskId: stringSchema({ maxLength: 128 }),
    payloadSnapshot: { type: "object", additionalProperties: true },
  }),
  MusicAiGenerationProviderEventCommand: objectSchema(["eventType", "source", "providerStatus", "payloadHash", "payloadSnapshot"], {
    taskId: idSchema(),
    attemptId: idSchema(),
    externalTaskId: stringSchema({ maxLength: 128 }),
    externalEventId: stringSchema({ maxLength: 128 }),
    eventType: stringSchema({ minLength: 1, maxLength: 64 }),
    source: { type: "string", enum: ["poll", "webhook", "manual_sync", "provider_callback"] },
    providerStatus: stringSchema({ minLength: 1, maxLength: 128 }),
    payloadHash: stringSchema({ minLength: 1, maxLength: 128 }),
    payloadSnapshot: { type: "object", additionalProperties: true },
    hasOutputs: { type: "boolean" },
  }),
  MusicAiGenerationNotificationCommand: objectSchema(["status"], {
    status: { type: "string", enum: ["read", "archived"] },
  }),
  MusicAiGenerationModerationCommand: objectSchema(["moderationStatus"], {
    moderationStatus: { $ref: "#/components/schemas/MusicModerationStatus" },
    reason: stringSchema({ maxLength: 1000 }),
  }),
  MusicAiGenerationPublishCommand: objectSchema(["variantId", "rightsPolicyId"], {
    variantId: idSchema(),
    rightsPolicyId: idSchema(),
    trackSlug: slugSchema(),
    trackTitle: stringSchema({ minLength: 1, maxLength: 160 }),
  }),
  MusicRightsPolicyCommand: objectSchema(["policyCode", "title", "licenseType", "usageScope", "status"], {
    policyCode: slugSchema(),
    title: stringSchema({ minLength: 1, maxLength: 160 }),
    licenseType: { type: "string", enum: ["platform", "creator_owned", "licensed", "public_domain", "restricted"] },
    usageScope: stringSchema({ minLength: 1, maxLength: 256 }),
    attributionRequired: { type: "boolean" },
    commercialUseAllowed: { type: "boolean" },
    status: { type: "string", enum: ["draft", "active", "archived"] },
  }),
  MusicRightsTerritoryCommand: objectSchema(["regionCode", "availability"], {
    regionCode: stringSchema({ minLength: 2, maxLength: 16 }),
    availability: { type: "string", enum: ["allowed", "blocked", "windowed"] },
    startsAt: dateTimeSchema(),
    endsAt: dateTimeSchema(),
  }),
  MusicReleaseChannelCommand: objectSchema(["channelCode", "distributionStatus"], {
    channelCode: stringSchema({ minLength: 1, maxLength: 64 }),
    distributionStatus: { type: "string", enum: ["scheduled", "publishing", "published", "failed", "revoked"] },
    scheduledAt: dateTimeSchema(),
  }),
  ProblemDetail: {
    type: "object",
    additionalProperties: true,
    required: ["type", "title", "status"],
    properties: {
      type: { type: "string", format: "uri-reference" },
      title: stringSchema({ minLength: 1, maxLength: 200 }),
      status: { type: "integer", minimum: 100, maximum: 599 },
      detail: stringSchema({ maxLength: 2000 }),
      requestId: { type: "string", format: "uuid" },
    },
  },
};

const appRoutes = [
  route("get", "/app/v3/api/music/home/shelves", "home.shelves.list", { schema: arrayOf("MusicHomeShelf") }, [queryParam("cursor"), limitParam()], null, APP_ROUTE_CRATE, { permission: "music.home.read" }),
  route("get", "/app/v3/api/music/search", "search.query", { schema: arrayOf("MusicSearchResult") }, [queryParam("q", { required: true }), queryParam("type"), limitParam()], null, APP_ROUTE_CRATE, { permission: "music.search.read" }),
  route("get", "/app/v3/api/music/artists", "artists.list", { schema: arrayOf("MusicArtist") }, listParams("artist"), null, APP_ROUTE_CRATE),
  route("get", "/app/v3/api/music/albums", "albums.list", { schema: arrayOf("MusicAlbum") }, listParams("album"), null, APP_ROUTE_CRATE),
  route("get", "/app/v3/api/music/tracks", "tracks.list", { schema: arrayOf("MusicTrack") }, listParams("track"), null, APP_ROUTE_CRATE),
  route("get", "/app/v3/api/music/playlists", "playlists.list", { schema: arrayOf("MusicPlaylist") }, listParams("playlist"), null, APP_ROUTE_CRATE),
  route("get", "/app/v3/api/music/audio/assets", "audio.assets.list", { schema: arrayOf("MusicAudioAsset") }, listParams("audio"), null, APP_ROUTE_CRATE),
  route("get", "/app/v3/api/music/charts", "charts.list", { schema: arrayOf("MusicChart") }, listParams("chart"), null, APP_ROUTE_CRATE),
  route("get", "/app/v3/api/music/charts/{chartId}", "charts.entries.list", { schema: arrayOf("MusicChartEntry") }, [pathParam("chartId"), limitParam()], null, APP_ROUTE_CRATE),
  route("get", "/app/v3/api/music/library/items", "library.items.list", { schema: arrayOf("MusicUserLibraryItem") }, [queryParam("item_type"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.library.read" }),
  route("post", "/app/v3/api/music/library/items", "library.items.create", { schema: ref("MusicUserLibraryItem") }, [], "MusicLibraryItemCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.library.write", idempotent: true }),
  route("delete", "/app/v3/api/music/library/items/{itemId}", "library.items.delete", { schema: ref("MusicUserLibraryItem") }, [pathParam("itemId")], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.library.write" }),
  route("post", "/app/v3/api/music/playlists/{playlistId}/tracks", "playlists.tracks.create", { schema: ref("MusicPlaylist") }, [pathParam("playlistId")], "MusicPlaylistTrackCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playlists.write", idempotent: true }),
  route("delete", "/app/v3/api/music/playlists/{playlistId}/tracks/{trackId}", "playlists.tracks.delete", { schema: ref("MusicPlaylist") }, [pathParam("playlistId"), pathParam("trackId")], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playlists.write" }),
  route("post", "/app/v3/api/music/playlists/{playlistId}/follow", "playlists.follow.create", { schema: ref("MusicPlaylistFollow") }, [pathParam("playlistId")], "MusicPlaylistFollowCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playlists.follow", idempotent: true }),
  route("delete", "/app/v3/api/music/playlists/{playlistId}/follow", "playlists.follow.delete", { schema: ref("MusicPlaylistFollow") }, [pathParam("playlistId")], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playlists.follow" }),
  route("get", "/app/v3/api/music/comments", "comments.list", { schema: arrayOf("MusicComment") }, [queryParam("resource_type", { required: true }), queryParam("resource_id", { required: true }), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.comments.read" }),
  route("post", "/app/v3/api/music/comments", "comments.create", { schema: ref("MusicComment") }, [], "MusicCommentCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.comments.write", idempotent: true }),
  route("post", "/app/v3/api/music/content_reports", "contentReports.create", { schema: ref("MusicContentReport") }, [], "MusicContentReportCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.contentReports.create", idempotent: true }),
  route("post", "/app/v3/api/music/recommendation/feedback", "recommendation.feedback.create", { schema: ref("MusicRecommendationFeedback") }, [], "MusicRecommendationFeedbackCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.recommendationFeedback.create", idempotent: true }),
  route("get", "/app/v3/api/music/search/suggestions", "search.suggestions.list", { schema: arrayOf("MusicSearchSuggestion") }, [queryParam("type"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.search.read" }),
  route("get", "/app/v3/api/music/downloads/entitlements", "downloads.entitlements.list", { schema: arrayOf("MusicDownloadEntitlement") }, [queryParam("status"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.downloads.read" }),
  route("get", "/app/v3/api/music/playback/sessions", "playback.sessions.list", { schema: arrayOf("MusicPlaybackSession") }, [queryParam("device_id"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playback.read" }),
  route("post", "/app/v3/api/music/playback/sessions", "playback.sessions.create", { schema: ref("MusicPlaybackSession") }, [], "MusicPlaybackSessionCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playback.write", idempotent: true }),
  route("patch", "/app/v3/api/music/playback/sessions/{sessionId}", "playback.sessions.update", { schema: ref("MusicPlaybackSession") }, [pathParam("sessionId")], "MusicPlaybackSessionCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playback.write" }),
  route("get", "/app/v3/api/music/listening_history", "listeningHistory.list", { schema: arrayOf("MusicListeningHistoryItem") }, [limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.history.read" }),
  route("post", "/app/v3/api/music/play_events", "playEvents.create", { schema: ref("MusicListeningHistoryItem") }, [], "MusicPlayEventCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.playback.write", idempotent: true }),
  route("get", "/app/v3/api/music/generations/style_presets", "generations.stylePresets.list", { schema: arrayOf("MusicAiStylePreset") }, [queryParam("status"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.read" }),
  route("get", "/app/v3/api/music/generations/prompt_templates", "generations.promptTemplates.list", { schema: arrayOf("MusicAiPromptTemplate") }, [queryParam("status"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.read" }),
  route("get", "/app/v3/api/music/generations/providers", "generations.providers.list", { schema: arrayOf("MusicAiGenerationProvider") }, [queryParam("status"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.read" }),
  route("get", "/app/v3/api/music/generations/provider_models", "generations.providerModels.list", { schema: arrayOf("MusicAiGenerationProviderModel") }, [queryParam("provider_code"), queryParam("status"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.read" }),
  route("get", "/app/v3/api/music/generations", "generations.list", { schema: arrayOf("MusicAiGenerationTask") }, [queryParam("status"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.read" }),
  route("post", "/app/v3/api/music/generations", "generations.create", { schema: ref("MusicAiGenerationTask") }, [], "MusicAiGenerationTaskCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.create", idempotent: true }),
  route("get", "/app/v3/api/music/generations/{generationId}", "generations.retrieve", { schema: ref("MusicAiGenerationTask") }, [pathParam("generationId")], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.read" }),
  route("get", "/app/v3/api/music/generations/{generationId}/events", "generations.events.list", { schema: arrayOf("MusicAiGenerationProviderEvent") }, [pathParam("generationId"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.read" }),
  route("get", "/app/v3/api/music/generations/notifications", "generations.notifications.list", { schema: arrayOf("MusicAiGenerationNotification") }, [queryParam("status"), limitParam()], null, APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.notifications.read" }),
  route("patch", "/app/v3/api/music/generations/notifications/{notificationId}", "generations.notifications.update", { schema: ref("MusicAiGenerationNotification") }, [pathParam("notificationId")], "MusicAiGenerationNotificationCommand", APP_ROUTE_CRATE, { tenantScope: "user", permission: "music.generations.notifications.write" }),
];

const backendRoutes = [
  route("get", "/backend/v3/api/music/artists", "artists.management.list", { schema: arrayOf("MusicArtist") }, listParams("artist"), null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/artists", "artists.create", { schema: ref("MusicArtist") }, [], "MusicArtistCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.artist.create", idempotent: true }),
  route("get", "/backend/v3/api/music/albums", "albums.management.list", { schema: arrayOf("MusicAlbum") }, listParams("album"), null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/albums", "albums.create", { schema: ref("MusicAlbum") }, [], "MusicAlbumCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.album.create", idempotent: true }),
  route("get", "/backend/v3/api/music/tracks", "tracks.management.list", { schema: arrayOf("MusicTrack") }, listParams("track"), null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/tracks", "tracks.create", { schema: ref("MusicTrack") }, [], "MusicTrackCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.track.create", idempotent: true }),
  route("post", "/backend/v3/api/music/tracks/{trackId}/publish", "tracks.publish", { schema: ref("MusicTrack") }, [pathParam("trackId")], null, BACKEND_ROUTE_CRATE, { auditEvent: "music.track.publish" }),
  route("post", "/backend/v3/api/music/tracks/{trackId}/archive", "tracks.archive", { schema: ref("MusicTrack") }, [pathParam("trackId")], null, BACKEND_ROUTE_CRATE, { auditEvent: "music.track.archive" }),
  route("get", "/backend/v3/api/music/playlists", "playlists.management.list", { schema: arrayOf("MusicPlaylist") }, listParams("playlist"), null, BACKEND_ROUTE_CRATE),
  route("get", "/backend/v3/api/music/audio/assets", "audio.assets.management.list", { schema: arrayOf("MusicAudioAsset") }, listParams("audio"), null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/audio/assets", "audio.assets.create", { schema: ref("MusicAudioAsset") }, [], "MusicAudioAssetCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.audioAsset.create", idempotent: true }),
  route("get", "/backend/v3/api/music/charts", "charts.management.list", { schema: arrayOf("MusicChart") }, listParams("chart"), null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/charts", "charts.create", { schema: ref("MusicChart") }, [], "MusicChartCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.chart.create", idempotent: true }),
  route("patch", "/backend/v3/api/music/charts/{chartId}", "charts.update", { schema: ref("MusicChart") }, [pathParam("chartId")], "MusicChartCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.chart.update" }),
  route("post", "/backend/v3/api/music/charts/{chartId}/entries", "charts.entries.create", { schema: ref("MusicChartEntry") }, [pathParam("chartId")], "MusicChartEntryCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.chartEntry.create", idempotent: true }),
  route("get", "/backend/v3/api/music/recommendation/shelves", "recommendation.shelves.management.list", { schema: arrayOf("MusicHomeShelf") }, listParams("shelf"), null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/recommendation/shelves", "recommendation.shelves.create", { schema: ref("MusicHomeShelf") }, [], "MusicRecommendationShelfCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.recommendationShelf.create", idempotent: true }),
  route("get", "/backend/v3/api/music/recommendation/feedback", "recommendation.feedback.management.list", { schema: arrayOf("MusicRecommendationFeedback") }, [queryParam("item_type"), queryParam("item_id"), queryParam("feedback_type"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("get", "/backend/v3/api/music/content_reports", "contentReports.management.list", { schema: arrayOf("MusicContentReport") }, [queryParam("status"), queryParam("resource_type"), queryParam("resource_id"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/content_reports/{reportId}/resolve", "contentReports.resolve", { schema: ref("MusicContentReport") }, [pathParam("reportId")], "MusicContentReportResolutionCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.contentReport.resolve" }),
  route("get", "/backend/v3/api/music/generations/style_presets", "generations.stylePresets.management.list", { schema: arrayOf("MusicAiStylePreset") }, [queryParam("status"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/generations/style_presets", "generations.stylePresets.create", { schema: ref("MusicAiStylePreset") }, [], "MusicAiStylePresetCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generationStylePreset.create", idempotent: true }),
  route("patch", "/backend/v3/api/music/generations/style_presets/{presetId}", "generations.stylePresets.update", { schema: ref("MusicAiStylePreset") }, [pathParam("presetId")], "MusicAiStylePresetCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generationStylePreset.update" }),
  route("get", "/backend/v3/api/music/generations/prompt_templates", "generations.promptTemplates.management.list", { schema: arrayOf("MusicAiPromptTemplate") }, [queryParam("status"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/generations/prompt_templates", "generations.promptTemplates.create", { schema: ref("MusicAiPromptTemplate") }, [], "MusicAiPromptTemplateCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generationPromptTemplate.create", idempotent: true }),
  route("patch", "/backend/v3/api/music/generations/prompt_templates/{templateId}", "generations.promptTemplates.update", { schema: ref("MusicAiPromptTemplate") }, [pathParam("templateId")], "MusicAiPromptTemplateCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generationPromptTemplate.update" }),
  route("get", "/backend/v3/api/music/generations/credit_ledger", "generations.creditLedger.list", { schema: arrayOf("MusicAiGenerationCreditLedgerEntry") }, [queryParam("user_id"), queryParam("generation_id"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("get", "/backend/v3/api/music/generations", "generations.management.list", { schema: arrayOf("MusicAiGenerationTask") }, [queryParam("status"), queryParam("user_id"), queryParam("provider_code"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("get", "/backend/v3/api/music/generations/providers", "generations.providers.management.list", { schema: arrayOf("MusicAiGenerationProvider") }, [queryParam("status"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/generations/providers", "generations.providers.create", { schema: ref("MusicAiGenerationProvider") }, [], "MusicAiGenerationProviderCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generationProvider.create", idempotent: true }),
  route("patch", "/backend/v3/api/music/generations/providers/{providerId}", "generations.providers.update", { schema: ref("MusicAiGenerationProvider") }, [pathParam("providerId")], "MusicAiGenerationProviderCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generationProvider.update" }),
  route("get", "/backend/v3/api/music/generations/provider_models", "generations.providerModels.management.list", { schema: arrayOf("MusicAiGenerationProviderModel") }, [queryParam("provider_code"), queryParam("status"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/generations/provider_models", "generations.providerModels.create", { schema: ref("MusicAiGenerationProviderModel") }, [], "MusicAiGenerationProviderModelCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generationProviderModel.create", idempotent: true }),
  route("get", "/backend/v3/api/music/generations/{generationId}/attempts", "generations.attempts.list", { schema: arrayOf("MusicAiGenerationProviderAttempt") }, [pathParam("generationId"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("get", "/backend/v3/api/music/generations/events", "generations.events.management.list", { schema: arrayOf("MusicAiGenerationProviderEvent") }, [queryParam("generation_id"), queryParam("provider_code"), queryParam("source"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/generations/{generationId}/sync", "generations.sync", { schema: ref("MusicAiGenerationTask") }, [pathParam("generationId")], "MusicAiGenerationTaskSyncCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generation.sync", idempotent: true }),
  route("post", "/backend/v3/api/music/generations/webhooks/{providerCode}/events", "generations.webhooks.receive", { schema: ref("MusicAiGenerationProviderEvent") }, [pathParam("providerCode")], "MusicAiGenerationProviderEventCommand", BACKEND_ROUTE_CRATE, { tenantScope: "tenant", permission: "music.generations.webhook", auditEvent: "music.generationWebhook.receive", idempotent: true }),
  route("post", "/backend/v3/api/music/generations/{generationId}/moderate", "generations.moderate", { schema: ref("MusicAiGenerationTask") }, [pathParam("generationId")], "MusicAiGenerationModerationCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generation.moderate" }),
  route("post", "/backend/v3/api/music/generations/{generationId}/publish", "generations.publish", { schema: ref("MusicRelease") }, [pathParam("generationId")], "MusicAiGenerationPublishCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.generation.publish", idempotent: true }),
  route("get", "/backend/v3/api/music/rights/policies", "rights.policies.management.list", { schema: arrayOf("MusicRightsPolicy") }, [queryParam("status"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/rights/policies", "rights.policies.create", { schema: ref("MusicRightsPolicy") }, [], "MusicRightsPolicyCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.rightsPolicy.create", idempotent: true }),
  route("post", "/backend/v3/api/music/rights/policies/{policyId}/territories", "rights.policies.territories.create", { schema: ref("MusicRightsTerritory") }, [pathParam("policyId")], "MusicRightsTerritoryCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.rightsTerritory.create", idempotent: true }),
  route("get", "/backend/v3/api/music/moderation/signals", "moderation.signals.list", { schema: arrayOf("MusicModerationSignal") }, [queryParam("resource_type"), queryParam("resource_id"), queryParam("status"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("get", "/backend/v3/api/music/releases", "releases.list", { schema: arrayOf("MusicRelease") }, [queryParam("status"), limitParam()], null, BACKEND_ROUTE_CRATE),
  route("post", "/backend/v3/api/music/releases/{releaseId}/channels", "releases.channels.create", { schema: ref("MusicReleaseChannel") }, [pathParam("releaseId")], "MusicReleaseChannelCommand", BACKEND_ROUTE_CRATE, { auditEvent: "music.releaseChannel.create", idempotent: true }),
];

function ref(name) {
  return { $ref: `#/components/schemas/${name}` };
}

function arrayOf(name) {
  return { type: "array", items: ref(name) };
}

function objectSchema(required, properties, additionalProperties = false) {
  return {
    type: "object",
    additionalProperties,
    ...(required.length ? { required } : {}),
    properties,
  };
}

function stringSchema({ minLength, maxLength, pattern } = {}) {
  return {
    type: "string",
    ...(minLength === undefined ? {} : { minLength }),
    ...(maxLength === undefined ? {} : { maxLength }),
    ...(pattern ? { pattern } : {}),
  };
}

function enumStringSchema(value) {
  return { type: "string", enum: [value] };
}

function cloudRouterProviderBindingRequired() {
  return [
    "cloudRouterSdkFamily",
    "cloudRouterApiAuthority",
    "cloudRouterApiPrefix",
    "cloudRouterCreateOperationId",
    "cloudRouterRetrieveOperationId",
    "cloudRouterRetrieveStandardPath",
  ];
}

function cloudRouterProviderBindingProperties() {
  return {
    cloudRouterProviderCode: stringSchema({ minLength: 1, maxLength: 128 }),
    cloudRouterEndpointKey: enumStringSchema(CLOUDROUTER_SUNO_CREATE_ENDPOINT_KEY),
    cloudRouterStandardPath: enumStringSchema(CLOUDROUTER_SUNO_CREATE_PATH),
    cloudRouterSdkFamily: enumStringSchema(CLOUDROUTER_OPEN_SDK_FAMILY),
    cloudRouterApiAuthority: enumStringSchema(CLOUDROUTER_API_AUTHORITY),
    cloudRouterApiPrefix: enumStringSchema(CLOUDROUTER_API_PREFIX),
    cloudRouterCreateOperationId: enumStringSchema(CLOUDROUTER_SUNO_CREATE_OPERATION_ID),
    cloudRouterRetrieveOperationId: enumStringSchema(CLOUDROUTER_SUNO_RETRIEVE_OPERATION_ID),
    cloudRouterRetrieveStandardPath: enumStringSchema(CLOUDROUTER_SUNO_RETRIEVE_PATH),
  };
}

function idSchema() {
  return stringSchema({ minLength: 1, maxLength: 128 });
}

function slugSchema() {
  return stringSchema({ minLength: 1, maxLength: 128, pattern: "^[a-z0-9]+(?:[-_][a-z0-9]+)*$" });
}

function driveUriSchema() {
  return stringSchema({ minLength: 1, maxLength: 512, pattern: "^drive://spaces/[^/]+/nodes/[^/]+$" });
}

function int32Schema({ minimum, maximum } = {}) {
  return {
    type: "integer",
    ...(minimum === undefined ? {} : { minimum }),
    ...(maximum === undefined ? {} : { maximum }),
  };
}

function int64String() {
  return {
    type: "string",
    format: "int64",
    pattern: "^[0-9]+$",
    "x-sdkwork-int64-string": true,
    "x-sdkwork-rust-type": "i64",
  };
}

function stringArray(maxItems) {
  return { type: "array", items: stringSchema({ minLength: 1, maxLength: 64 }), maxItems };
}

function dateTimeSchema() {
  return { type: "string", format: "date-time" };
}

function pathParam(name) {
  return {
    name,
    in: "path",
    required: true,
    schema: idSchema(),
  };
}

function queryParam(name, options = {}) {
  return {
    name,
    in: "query",
    required: options.required === true,
    schema: options.schema ?? stringSchema({ maxLength: 256 }),
  };
}

function limitParam() {
  return queryParam("page_size", {
    schema: { ...int32Schema({ minimum: 1, maximum: 200 }), default: 20 },
  });
}

function listParams(kind) {
  const common = [queryParam("q"), queryParam("status")];
  if (kind === "track") {
    return [queryParam("artist_id"), queryParam("album_id"), ...common];
  }
  if (kind === "album") {
    return [queryParam("artist_id"), ...common];
  }
  return common;
}

function route(method, pathKey, operationId, response, parameters = [], bodySchemaName = null, sourceRouteCrate, options = {}) {
  const resource = operationId.split(".").slice(0, -1).join(".");
  return {
    method,
    path: pathKey,
    sourceRouteCrate,
    operation: {
      tags: ["music"],
      summary: `Music ${operationId}`,
      operationId,
      parameters,
      ...(bodySchemaName
        ? {
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: ref(bodySchemaName),
                },
              },
            },
          }
        : {}),
      responses: {
        200: {
          description: "OK",
          content: {
            "application/json": response,
          },
        },
        400: problemResponse(),
        401: problemResponse(),
        403: problemResponse(),
      },
      security: [{ AuthToken: [], AccessToken: [] }],
      "x-sdkwork-owner": OWNER,
      "x-sdkwork-api-authority": "",
      "x-sdkwork-domain": DOMAIN,
      "x-sdkwork-resource": resource || operationId.split(".")[0],
      "x-sdkwork-permission": options.permission ?? `music.${resource || operationId.split(".")[0]}`,
      "x-sdkwork-public": false,
      "x-sdkwork-tenant-scope": options.tenantScope ?? "tenant",
      "x-sdkwork-data-scope": options.dataScope ?? "tenant",
      "x-sdkwork-idempotent": options.idempotent === true,
      ...(options.auditEvent ? { "x-sdkwork-audit-event": options.auditEvent } : {}),
      "x-sdkwork-source": "rust-route-manifest",
      "x-sdkwork-source-route-crate": sourceRouteCrate,
    },
  };
}

function problemResponse() {
  return {
    description: "Problem detail",
    content: {
      "application/problem+json": {
        schema: ref("ProblemDetail"),
      },
    },
  };
}

function documentFor({ authority, routes, serverUrl, title }) {
  const paths = {};
  for (const item of routes) {
    paths[item.path] ??= {};
    item.operation["x-sdkwork-api-authority"] = authority;
    paths[item.path][item.method] = item.operation;
  }
  const document = bootstrapOpenApiEnvelope({
    openapi: "3.1.2",
    info: {
      title,
      version: "1.0.0",
      "x-sdkwork-owner": OWNER,
      "x-sdkwork-api-authority": authority,
    },
    servers: [{ url: serverUrl }],
    tags: [{ name: "music", description: "Music API resources.", "x-sdk-nested-resource-surface": true }],
    paths,
    components: {
      securitySchemes: {
        AuthToken: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
        AccessToken: {
          type: "apiKey",
          in: "header",
          name: "Access-Token",
        },
      },
      schemas,
    },
    "x-sdkwork-owner": OWNER,
    "x-sdkwork-api-authority": authority,
    "x-sdkwork-domain": DOMAIN,
    "x-sdkwork-standard-profile": "sdkwork-v3",
  }, { legacyEnvelope: "MusicApiResult" });
  const aligned = alignOpenApiOperationPatterns(document).document;
  for (const item of routes) {
    item.operation.operationId = aligned.paths[item.path][item.method].operationId;
  }
  return aligned;
}

function manifestFor({
  apiAuthority,
  prefix,
  routes,
  sdkFamily,
  surface,
  packageName,
}) {
  return {
    kind: "sdkwork.route.manifest",
    packageName,
    surface,
    owner: OWNER,
    domain: DOMAIN,
    capability: DOMAIN,
    apiAuthority,
    sdkFamily,
    prefix,
    authMode: "dual-token",
    routes: routes.map((item) => ({
      method: item.method.toUpperCase(),
      path: item.path,
      tag: "music",
      operationId: item.operation.operationId,
      authMode: "dual-token",
      ownership: {
        owner: OWNER,
        apiAuthority,
      },
      source: {
        kind: "rust-route-crate",
        crateRoot: `crates/${packageName}`,
        routeCrate: packageName,
      },
    })),
  };
}

function writeRouteManifest(surface, packageName, manifest) {
  const outputDir = path.join(routeManifestOutputDir, surface);
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(
    path.join(outputDir, `${packageName}.route-manifest.json`),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  );
}

const docs = [
  ["music-app-api.openapi.json", documentFor({ authority: "sdkwork-music-app-api", routes: appRoutes, serverUrl: "http://127.0.0.1:18080", title: "SDKWork Music App API" })],
  ["music-backend-api.openapi.json", documentFor({ authority: "sdkwork-music-backend-api", routes: backendRoutes, serverUrl: "http://127.0.0.1:18080", title: "SDKWork Music Backend API" })],
];

mkdirSync(generatedOutputDir, { recursive: true });
for (const [fileName, document] of docs) {
  writeFileSync(path.join(generatedOutputDir, fileName), `${JSON.stringify(document, null, 2)}\n`, "utf8");
}

writeRouteManifest(
  "app-api",
  APP_ROUTE_CRATE,
  manifestFor({
    apiAuthority: "sdkwork-music-app-api",
    prefix: "/app/v3/api",
    routes: appRoutes,
    sdkFamily: "sdkwork-music-app-sdk",
    surface: "app-api",
    packageName: APP_ROUTE_CRATE,
  }),
);
writeRouteManifest(
  "backend-api",
  BACKEND_ROUTE_CRATE,
  manifestFor({
    apiAuthority: "sdkwork-music-backend-api",
    prefix: "/backend/v3/api",
    routes: backendRoutes,
    sdkFamily: "sdkwork-music-backend-sdk",
    surface: "backend-api",
    packageName: BACKEND_ROUTE_CRATE,
  }),
);

process.stdout.write(`[music_openapi_export] ok app=${appRoutes.length} backend=${backendRoutes.length}\n`);
