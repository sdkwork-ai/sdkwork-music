export declare const SUNO_MUSIC_GENERATION_ENDPOINT: Readonly<{
  endpointKey: "suno.music.generations.create";
  standardPath: "/suno/v1/music/generations";
  operationId: "sunoCreateMusicGeneration";
}>;

export declare const SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT: Readonly<{
  endpointKey: "suno.music.generations.retrieve";
  standardPath: "/suno/v1/music/generations/{task_id}";
  operationId: "sunoRetrieveMusicGeneration";
}>;

export type ProviderJsonValue =
  | string
  | number
  | boolean
  | null
  | ProviderJsonValue[]
  | { [key: string]: ProviderJsonValue };

export interface SunoMusicGenerationRequest {
  [key: string]: ProviderJsonValue | undefined;
  callback_url?: string;
  duration?: number;
  model?: string;
  negative_tags?: string;
  prompt: string;
  tags?: string;
  title?: string;
}

export interface SunoMusicGenerationResponse {
  created_at?: string;
  id?: string;
  status?: string;
  task_id?: string;
}

export interface SunoMusicGenerationTaskResponse {
  created_at?: string;
  error?: Record<string, unknown>;
  id?: string;
  status?: string;
  task_id?: string;
  title?: string;
  tracks?: SunoMusicTrack[];
  updated_at?: string;
}

export interface SunoMusicTrack {
  audio_url?: string;
  duration?: number;
  id?: string;
  image_url?: string;
  lyrics?: string;
  title?: string;
  video_url?: string;
}

export interface CloudRouterSunoGenerationsClient {
  create(body: SunoMusicGenerationRequest): Promise<SunoMusicGenerationResponse>;
  retrieve(taskId: string): Promise<SunoMusicGenerationTaskResponse>;
}

export interface CloudRouterOpenSdkSunoPort {
  audioSuno: {
    v1: {
      music: {
        generations: CloudRouterSunoGenerationsClient;
      };
    };
  };
}

export type MusicAiProviderInvocationMode = "sync" | "async_task" | "webhook" | "hybrid";

export type MusicAiGenerationTaskStatus =
  | "queued"
  | "routing"
  | "submitted"
  | "running"
  | "waiting_webhook"
  | "succeeded"
  | "failed"
  | "cancelled"
  | "expired";

export interface SunoMusicGenerationTaskCommand {
  prompt: string;
  lyricsPrompt?: string;
  styleTags: string[];
  providerCode: string;
  providerModel: string;
  modelName?: string;
  requestedDurationSeconds?: number;
  negativePrompt?: string;
  providerOptions?: Record<string, unknown>;
}

export interface SubmitSunoMusicGenerationInput {
  taskId: string;
  providerId: string;
  providerCode: string;
  invocationMode: MusicAiProviderInvocationMode;
  command: SunoMusicGenerationTaskCommand;
}

export interface RetrieveSunoMusicGenerationInput {
  taskId?: string;
  attemptId?: string;
  externalTaskId: string;
  source: "poll" | "manual_sync" | "webhook_replay";
  providerCode?: string;
  providerModel?: string;
}

export interface SunoMusicProviderFacadeDependencies {
  cloudRouter: CloudRouterOpenSdkSunoPort;
}

export interface MusicGenerationProviderAttemptDraft {
  taskId: string;
  providerId: string;
  providerCode: string;
  modelName: string;
  invocationMode: MusicAiProviderInvocationMode;
  cloudRouterEndpointKey: typeof SUNO_MUSIC_GENERATION_ENDPOINT.endpointKey;
  cloudRouterStandardPath: typeof SUNO_MUSIC_GENERATION_ENDPOINT.standardPath;
  cloudRouterOperationId: typeof SUNO_MUSIC_GENERATION_ENDPOINT.operationId;
  externalTaskId?: string;
  status: MusicAiGenerationTaskStatus;
  providerStatus: string;
  requestSnapshot: SunoMusicGenerationRequest;
  responseSnapshot: SunoMusicGenerationResponse;
  submittedAt?: string;
}

export interface SubmitSunoMusicGenerationResult {
  request: SunoMusicGenerationRequest;
  response: SunoMusicGenerationResponse;
  attempt: MusicGenerationProviderAttemptDraft;
}

export interface MusicGenerationTaskSyncCommandDraft {
  source: "poll" | "manual_sync" | "webhook_replay";
  providerStatus: string;
  externalTaskId?: string;
  payloadSnapshot: SunoMusicGenerationTaskResponse;
}

export interface MusicGenerationProviderEventCommandDraft {
  taskId?: string;
  attemptId?: string;
  externalTaskId?: string;
  externalEventId?: string;
  eventType: string;
  source: "poll" | "webhook" | "manual_sync" | "provider_callback";
  providerStatus: string;
  payloadHash: string;
  payloadSnapshot: SunoMusicGenerationTaskResponse;
  hasOutputs: boolean;
}

export interface SunoProviderTrace {
  endpointKey: typeof SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.endpointKey;
  standardPath: typeof SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.standardPath;
  operationId: typeof SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.operationId;
}

export interface MusicMediaResourceDraft {
  kind: "image" | "video" | "audio";
  source: "provider_asset";
  url: string;
  durationSeconds?: number;
  ai: {
    provenance: "generated";
    provider: string;
    model?: string;
    taskId?: string;
  };
  metadata: {
    trackId: string;
    providerAssetId: string;
    title: string;
    lyrics?: string;
  };
}

export interface SunoGeneratedArtifact {
  trackId: string;
  title: string;
  kind: "image" | "video" | "audio";
  url: string;
  durationSeconds?: number;
  lyrics?: string;
  media: MusicMediaResourceDraft;
}

export interface RetrieveSunoMusicGenerationResult {
  response: SunoMusicGenerationTaskResponse;
  syncCommand: MusicGenerationTaskSyncCommandDraft;
  eventCommand: MusicGenerationProviderEventCommandDraft;
  providerTrace: SunoProviderTrace;
  artifacts: SunoGeneratedArtifact[];
}

export interface SunoMusicProviderFacade {
  submitGeneration(input: SubmitSunoMusicGenerationInput): Promise<SubmitSunoMusicGenerationResult>;
  retrieveGeneration(input: RetrieveSunoMusicGenerationInput): Promise<RetrieveSunoMusicGenerationResult>;
}

export declare function createSunoMusicProviderFacade(
  dependencies: SunoMusicProviderFacadeDependencies,
): SunoMusicProviderFacade;

export declare function toSunoMusicGenerationRequest(command: SunoMusicGenerationTaskCommand): SunoMusicGenerationRequest;

export declare function hashPayload(payload: unknown): string;
