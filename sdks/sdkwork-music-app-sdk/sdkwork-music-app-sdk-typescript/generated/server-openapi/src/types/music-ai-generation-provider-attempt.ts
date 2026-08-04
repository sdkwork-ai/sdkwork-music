import type { MusicAiGenerationTaskStatus } from './music-ai-generation-task-status';
import type { MusicAiProviderInvocationMode } from './music-ai-provider-invocation-mode';

export interface MusicAiGenerationProviderAttempt {
  id: string;
  tenantId: string;
  taskId: string;
  providerId: string;
  providerCode: string;
  modelName: string;
  invocationMode: MusicAiProviderInvocationMode;
  cloudRouterEndpointKey: 'suno.music.generations.create';
  cloudRouterStandardPath: '/suno/v1/music/generations';
  cloudRouterOperationId: 'sunoCreateMusicGeneration';
  cloudRouterRequestId?: string;
  externalTaskId?: string;
  status: MusicAiGenerationTaskStatus;
  providerStatus?: string;
  requestSnapshot?: Record<string, unknown>;
  responseSnapshot?: Record<string, unknown>;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
