import { createHash } from "node:crypto";

export const SUNO_MUSIC_GENERATION_ENDPOINT = Object.freeze({
  endpointKey: "suno.music.generations.create",
  standardPath: "/suno/v1/music/generations",
  operationId: "sunoCreateMusicGeneration",
});

export const SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT = Object.freeze({
  endpointKey: "suno.music.generations.retrieve",
  standardPath: "/suno/v1/music/generations/{task_id}",
  operationId: "sunoRetrieveMusicGeneration",
});

export function createSunoMusicProviderFacade({ cloudRouter }) {
  const generations = resolveSunoGenerationsClient(cloudRouter);

  return {
    async submitGeneration(input) {
      const request = toSunoMusicGenerationRequest(input.command);
      const response = await generations.create(request);
      const externalTaskId = response.task_id ?? response.id;
      const providerStatus = response.status ?? "submitted";

      return {
        request,
        response,
        attempt: omitUndefined({
          taskId: input.taskId,
          providerId: input.providerId,
          providerCode: input.providerCode,
          modelName: input.command.modelName ?? input.command.providerModel,
          invocationMode: input.invocationMode,
          cloudRouterEndpointKey: SUNO_MUSIC_GENERATION_ENDPOINT.endpointKey,
          cloudRouterStandardPath: SUNO_MUSIC_GENERATION_ENDPOINT.standardPath,
          cloudRouterOperationId: SUNO_MUSIC_GENERATION_ENDPOINT.operationId,
          externalTaskId,
          status: toMusicTaskStatus(providerStatus, "submitted"),
          providerStatus,
          requestSnapshot: request,
          responseSnapshot: response,
          submittedAt: response.created_at,
        }),
      };
    },

    async retrieveGeneration(input) {
      const response = await generations.retrieve(input.externalTaskId);
      const externalTaskId = response.task_id ?? input.externalTaskId ?? response.id;
      const providerStatus = response.status ?? "unknown";
      const payloadSnapshot = response;
      const tracks = Array.isArray(response.tracks) ? response.tracks : [];

      return {
        response,
        syncCommand: omitUndefined({
          source: input.source,
          providerStatus,
          externalTaskId,
          payloadSnapshot,
        }),
        eventCommand: omitUndefined({
          taskId: input.taskId,
          attemptId: input.attemptId,
          externalTaskId,
          externalEventId: response.id ?? externalTaskId,
          eventType: `suno.music.generation.${normalizeEventStatus(providerStatus)}`,
          source: toProviderEventSource(input.source),
          providerStatus,
          payloadHash: hashPayload(payloadSnapshot),
          payloadSnapshot,
          hasOutputs: tracks.some(hasProviderOutput),
        }),
        providerTrace: {
          endpointKey: SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.endpointKey,
          standardPath: SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.standardPath,
          operationId: SUNO_MUSIC_GENERATION_RETRIEVE_ENDPOINT.operationId,
        },
        artifacts: tracks.flatMap((track, index) => toGeneratedArtifacts(track, index, {
          externalTaskId,
          providerCode: input.providerCode ?? "suno",
          providerModel: input.providerModel,
          fallbackTitle: response.title,
        })),
      };
    },
  };
}

export function toSunoMusicGenerationRequest(command) {
  const providerOptions = isRecord(command.providerOptions) ? command.providerOptions : {};
  const canonicalFields = omitUndefined({
    callback_url: optionalString(providerOptions.callbackUrl ?? providerOptions.callback_url),
    duration: optionalNumber(command.requestedDurationSeconds) ?? optionalNumber(providerOptions.duration),
    model: optionalString(command.providerModel) ?? optionalString(providerOptions.model),
    negative_tags: optionalString(command.negativePrompt) ?? optionalString(providerOptions.negative_tags),
    prompt: buildPrompt(command) || optionalString(providerOptions.prompt),
    tags: styleTagsToText(command.styleTags) ?? optionalString(providerOptions.tags),
    title: optionalString(providerOptions.title),
  });
  const request = {
    ...toAdditionalSunoProviderOptions(providerOptions),
    ...canonicalFields,
  };

  if (!request.prompt) {
    throw new Error("Suno music generation requires a non-empty prompt.");
  }

  return request;
}

export function hashPayload(payload) {
  return `sha256:${createHash("sha256").update(stableJsonStringify(payload)).digest("hex")}`;
}

function resolveSunoGenerationsClient(cloudRouter) {
  const generations = cloudRouter?.audioSuno?.v1?.music?.generations;
  if (typeof generations?.create !== "function" || typeof generations?.retrieve !== "function") {
    throw new Error("Suno provider facade requires cloudRouter.audioSuno.v1.music.generations.");
  }
  return generations;
}

function buildPrompt(command) {
  const lyricsPrompt = optionalString(command.lyricsPrompt);
  const prompt = optionalString(command.prompt);
  return [lyricsPrompt, prompt].filter(Boolean).join("\n\n");
}

function styleTagsToText(styleTags) {
  if (!Array.isArray(styleTags)) {
    return undefined;
  }
  const tags = styleTags.map((tag) => optionalString(tag)).filter(Boolean);
  return tags.length > 0 ? tags.join(", ") : undefined;
}

function toAdditionalSunoProviderOptions(providerOptions) {
  const requestOptions = {};

  for (const [key, value] of Object.entries(providerOptions)) {
    if (isSunoCanonicalProviderOptionKey(key) || key === "callbackUrl") {
      continue;
    }
    const jsonValue = toProviderJsonValue(value);
    if (jsonValue !== undefined) {
      requestOptions[key] = jsonValue;
    }
  }

  return requestOptions;
}

function isSunoCanonicalProviderOptionKey(key) {
  return [
    "callback_url",
    "duration",
    "model",
    "negative_tags",
    "prompt",
    "tags",
    "title",
  ].includes(key);
}

function toMusicTaskStatus(providerStatus, fallbackStatus) {
  const normalized = normalizeEventStatus(providerStatus);
  if (["queued", "routing", "submitted", "running", "waiting_webhook", "failed", "cancelled", "expired"].includes(normalized)) {
    return normalized;
  }
  if (["complete", "completed", "success", "succeeded"].includes(normalized)) {
    return "succeeded";
  }
  return fallbackStatus;
}

function normalizeEventStatus(status) {
  return optionalString(status)?.toLowerCase().replaceAll(/[^a-z0-9_]+/g, "_").replaceAll(/^_+|_+$/g, "") || "unknown";
}

function toProviderEventSource(source) {
  return source === "webhook_replay" ? "webhook" : source;
}

function hasProviderOutput(track) {
  return Boolean(track?.audio_url || track?.image_url || track?.video_url);
}

function toGeneratedArtifacts(track, index, context) {
  const title = optionalString(track.title) ?? optionalString(context.fallbackTitle) ?? `Suno track ${index + 1}`;
  const trackId = optionalString(track.id) ?? `track-${index + 1}`;
  const base = {
    trackId,
    title,
  };
  const artifacts = [];

  const audioUrl = optionalString(track.audio_url);
  if (audioUrl) {
    artifacts.push(createProviderAssetArtifact({
      ...base,
      kind: "audio",
      url: audioUrl,
      durationSeconds: optionalNumber(track.duration),
      lyrics: optionalString(track.lyrics),
      context,
    }));
  }

  const imageUrl = optionalString(track.image_url);
  if (imageUrl) {
    artifacts.push(createProviderAssetArtifact({
      ...base,
      kind: "image",
      url: imageUrl,
      context,
    }));
  }

  const videoUrl = optionalString(track.video_url);
  if (videoUrl) {
    artifacts.push(createProviderAssetArtifact({
      ...base,
      kind: "video",
      url: videoUrl,
      durationSeconds: optionalNumber(track.duration),
      context,
    }));
  }

  return artifacts;
}

function createProviderAssetArtifact(input) {
  const metadata = omitUndefined({
    trackId: input.trackId,
    providerAssetId: input.trackId,
    title: input.title,
    lyrics: input.lyrics,
  });
  const ai = omitUndefined({
    provenance: "generated",
    provider: input.context.providerCode,
    model: input.context.providerModel,
    taskId: input.context.externalTaskId,
  });
  const media = omitUndefined({
    kind: input.kind,
    source: "provider_asset",
    url: input.url,
    durationSeconds: input.durationSeconds,
    ai,
    metadata,
  });

  return omitUndefined({
    trackId: input.trackId,
    title: input.title,
    kind: input.kind,
    url: input.url,
    durationSeconds: input.durationSeconds,
    lyrics: input.lyrics,
    media,
  });
}

function stableJsonStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJsonStringify).join(",")}]`;
  }
  if (isRecord(value)) {
    const entries = Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJsonStringify(value[key])}`);
    return `{${entries.join(",")}}`;
  }
  return JSON.stringify(value);
}

function toProviderJsonValue(value) {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (Array.isArray(value)) {
    return value.map(toProviderJsonValue).filter((item) => item !== undefined);
  }
  if (isPlainRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .map(([key, entryValue]) => [key, toProviderJsonValue(entryValue)])
        .filter(([, entryValue]) => entryValue !== undefined),
    );
  }
  return undefined;
}

function omitUndefined(record) {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
}

function optionalString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function optionalNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isPlainRecord(value) {
  if (!isRecord(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
