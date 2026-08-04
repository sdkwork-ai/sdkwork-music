import type { MusicAiProviderInvocationMode } from './music-ai-provider-invocation-mode';

export interface MusicAiGenerationProviderCommand {
  providerCode: string;
  displayName: string;
  providerFamily: string;
  capability: 'text_to_music' | 'lyrics_to_music' | 'reference_to_music' | 'stem_generation' | 'arrangement' | 'voice_to_song';
  invocationMode: MusicAiProviderInvocationMode;
  cloudRouterProviderCode: string;
  cloudRouterEndpointKey: 'suno.music.generations.create';
  cloudRouterStandardPath: '/suno/v1/music/generations';
  cloudRouterSdkFamily: 'cloudrouter-open-sdk';
  cloudRouterApiAuthority: 'sdkwork-cloudrouter.ai';
  cloudRouterApiPrefix: '/v1';
  cloudRouterCreateOperationId: 'sunoCreateMusicGeneration';
  cloudRouterRetrieveOperationId: 'sunoRetrieveMusicGeneration';
  cloudRouterRetrieveStandardPath: '/suno/v1/music/generations/{task_id}';
  supportsPolling: boolean;
  supportsWebhook: boolean;
  status: 'draft' | 'active' | 'paused' | 'archived';
  configSnapshot?: Record<string, unknown>;
}
