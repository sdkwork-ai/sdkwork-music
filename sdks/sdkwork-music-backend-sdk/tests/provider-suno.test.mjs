import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  createSunoMusicProviderFacade,
  SUNO_MUSIC_GENERATION_ENDPOINT,
  SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT,
  toSunoMusicGenerationRequest,
} from "../composed/provider-suno.mjs";

test("Suno provider facade submits music generation through injected cloud-router SDK client", async () => {
  const calls = [];
  const facade = createSunoMusicProviderFacade({
    cloudRouter: {
      audioSuno: {
        v1: {
          music: {
            generations: {
              async create(body) {
                calls.push(body);
                return {
                  id: "suno-response-1",
                  task_id: "suno-task-1",
                  status: "submitted",
                  created_at: "2026-06-06T16:00:00.000Z",
                };
              },
              async retrieve() {
                throw new Error("retrieve should not be called while submitting");
              },
            },
          },
        },
      },
    },
  });

  const result = await facade.submitGeneration({
    taskId: "music-task-1",
    providerId: "provider-suno",
    providerCode: "suno",
    invocationMode: "async_task",
    command: {
      prompt: "cinematic electronic theme",
      lyricsPrompt: "Verse and chorus about a quiet launch",
      styleTags: ["cinematic", "electronic", "uplifting"],
      providerCode: "suno",
      providerModel: "suno-v4",
      requestedDurationSeconds: 92,
      negativePrompt: "distorted vocals",
      providerOptions: {
        callbackUrl: "https://music.example.test/provider/suno/callback",
        title: "Quiet Launch",
      },
    },
  });

  assert.deepEqual(calls, [
    {
      callback_url: "https://music.example.test/provider/suno/callback",
      duration: 92,
      model: "suno-v4",
      negative_tags: "distorted vocals",
      prompt: "Verse and chorus about a quiet launch\n\ncinematic electronic theme",
      tags: "cinematic, electronic, uplifting",
      title: "Quiet Launch",
    },
  ]);
  assert.deepEqual(result.attempt, {
    taskId: "music-task-1",
    providerId: "provider-suno",
    providerCode: "suno",
    modelName: "suno-v4",
    invocationMode: "async_task",
    cloudRouterEndpointKey: SUNO_MUSIC_GENERATION_ENDPOINT.endpointKey,
    cloudRouterStandardPath: SUNO_MUSIC_GENERATION_ENDPOINT.standardPath,
    cloudRouterOperationId: SUNO_MUSIC_GENERATION_ENDPOINT.operationId,
    externalTaskId: "suno-task-1",
    status: "submitted",
    providerStatus: "submitted",
    requestSnapshot: calls[0],
    responseSnapshot: {
      id: "suno-response-1",
      task_id: "suno-task-1",
      status: "submitted",
      created_at: "2026-06-06T16:00:00.000Z",
    },
    submittedAt: "2026-06-06T16:00:00.000Z",
  });
});

test("Suno provider facade forwards JSON provider options without overriding canonical music fields", () => {
  const request = toSunoMusicGenerationRequest({
    prompt: "canonical prompt",
    lyricsPrompt: "canonical lyrics",
    styleTags: ["cinematic"],
    providerCode: "suno",
    providerModel: "canonical-model",
    requestedDurationSeconds: 92,
    negativePrompt: "canonical negative tags",
    providerOptions: {
      callback_url: "https://music.example.test/provider/suno/callback",
      custom_mode: true,
      duration: 12,
      instrumental: false,
      model: "provider-option-model",
      nested: {
        seed: 42,
        variations: ["intro", "chorus"],
      },
      prompt: "provider option prompt",
      tags: "provider option tags",
      title: "Provider Option Title",
      undefinedOption: undefined,
    },
  });

  assert.deepEqual(request, {
    callback_url: "https://music.example.test/provider/suno/callback",
    custom_mode: true,
    duration: 92,
    instrumental: false,
    model: "canonical-model",
    negative_tags: "canonical negative tags",
    nested: {
      seed: 42,
      variations: ["intro", "chorus"],
    },
    prompt: "canonical lyrics\n\ncanonical prompt",
    tags: "cinematic",
    title: "Provider Option Title",
  });
});

test("Suno provider facade maps retrieve response into music sync, event, and artifact facts", async () => {
  const facade = createSunoMusicProviderFacade({
    cloudRouter: {
      audioSuno: {
        v1: {
          music: {
            generations: {
              async create() {
                throw new Error("create should not be called while retrieving");
              },
              async retrieve(taskId) {
                assert.equal(taskId, "suno-task-1");
                return {
                  id: "suno-response-1",
                  task_id: "suno-task-1",
                  status: "complete",
                  title: "Quiet Launch",
                  tracks: [
                    {
                      id: "track-1",
                      title: "Quiet Launch",
                      audio_url: "https://cdn.example.test/audio/track-1.mp3",
                      image_url: "https://cdn.example.test/image/track-1.png",
                      video_url: "https://cdn.example.test/video/track-1.mp4",
                      lyrics: "Verse and chorus",
                      duration: 92,
                    },
                  ],
                  updated_at: "2026-06-06T16:03:00.000Z",
                };
              },
            },
          },
        },
      },
    },
  });

  const result = await facade.retrieveGeneration({
    taskId: "music-task-1",
    attemptId: "attempt-1",
    externalTaskId: "suno-task-1",
    source: "poll",
  });

  assert.deepEqual(result.syncCommand, {
    source: "poll",
    providerStatus: "complete",
    externalTaskId: "suno-task-1",
    payloadSnapshot: {
      id: "suno-response-1",
      task_id: "suno-task-1",
      status: "complete",
      title: "Quiet Launch",
      tracks: [
        {
          id: "track-1",
          title: "Quiet Launch",
          audio_url: "https://cdn.example.test/audio/track-1.mp3",
          image_url: "https://cdn.example.test/image/track-1.png",
          video_url: "https://cdn.example.test/video/track-1.mp4",
          lyrics: "Verse and chorus",
          duration: 92,
        },
      ],
      updated_at: "2026-06-06T16:03:00.000Z",
    },
  });
  assert.deepEqual(result.eventCommand, {
    taskId: "music-task-1",
    attemptId: "attempt-1",
    externalTaskId: "suno-task-1",
    externalEventId: "suno-response-1",
    eventType: "suno.music.generation.complete",
    source: "poll",
    providerStatus: "complete",
    payloadHash: "sha256:58aaaee7fd1c9c1049b9301b75a3fb7aa58878628c1dc2ce4ec2823ec03f5e9c",
    payloadSnapshot: result.syncCommand.payloadSnapshot,
    hasOutputs: true,
  });
  assert.deepEqual(result.providerTrace, {
    endpointKey: SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.endpointKey,
    standardPath: SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.standardPath,
    operationId: SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.operationId,
  });
  assert.deepEqual(result.artifacts, [
    {
      trackId: "track-1",
      title: "Quiet Launch",
      kind: "audio",
      url: "https://cdn.example.test/audio/track-1.mp3",
      durationSeconds: 92,
      lyrics: "Verse and chorus",
      media: {
        kind: "audio",
        source: "provider_asset",
        url: "https://cdn.example.test/audio/track-1.mp3",
        durationSeconds: 92,
        ai: {
          provenance: "generated",
          provider: "suno",
          taskId: "suno-task-1",
        },
        metadata: {
          trackId: "track-1",
          providerAssetId: "track-1",
          title: "Quiet Launch",
          lyrics: "Verse and chorus",
        },
      },
    },
    {
      trackId: "track-1",
      title: "Quiet Launch",
      kind: "image",
      url: "https://cdn.example.test/image/track-1.png",
      media: {
        kind: "image",
        source: "provider_asset",
        url: "https://cdn.example.test/image/track-1.png",
        ai: {
          provenance: "generated",
          provider: "suno",
          taskId: "suno-task-1",
        },
        metadata: {
          trackId: "track-1",
          providerAssetId: "track-1",
          title: "Quiet Launch",
        },
      },
    },
    {
      trackId: "track-1",
      title: "Quiet Launch",
      kind: "video",
      url: "https://cdn.example.test/video/track-1.mp4",
      durationSeconds: 92,
      media: {
        kind: "video",
        source: "provider_asset",
        url: "https://cdn.example.test/video/track-1.mp4",
        durationSeconds: 92,
        ai: {
          provenance: "generated",
          provider: "suno",
          taskId: "suno-task-1",
        },
        metadata: {
          trackId: "track-1",
          providerAssetId: "track-1",
          title: "Quiet Launch",
        },
      },
    },
  ]);
});

test("Suno provider facade stays outside generated transport and avoids raw HTTP or manual auth", () => {
  const source = readFileSync("sdks/sdkwork-music-backend-sdk/composed/provider-suno.mjs", "utf8");

  assert.doesNotMatch(source, /fetch\s*\(/);
  assert.doesNotMatch(source, /axios/);
  assert.doesNotMatch(source, /Authorization/);
  assert.doesNotMatch(source, /Access-Token/);
  assert.doesNotMatch(source, /X-API-Key/);
  assert.doesNotMatch(source, /\/generated\/server-openapi\/src\//);
});
