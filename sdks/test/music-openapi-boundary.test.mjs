import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const app = JSON.parse(readFileSync("generated/openapi/music-app-api.openapi.json", "utf8"));
const backend = JSON.parse(readFileSync("generated/openapi/music-backend-api.openapi.json", "utf8"));

function operations(document) {
  return Object.entries(document.paths ?? {}).flatMap(([path, pathItem]) =>
    Object.entries(pathItem ?? {})
      .filter(([method]) => ["get", "post", "put", "patch", "delete"].includes(method))
      .map(([method, operation]) => ({ method, operation, path })),
  );
}

function operation(document, path, method) {
  const resolved = document.paths?.[path]?.[method];
  assert.ok(resolved, `${method.toUpperCase()} ${path} should exist`);
  return resolved;
}

function parameterNames(operation) {
  return (operation.parameters ?? []).map((parameter) => parameter.name);
}

function assertCloudRouterOperationBinding(document, schemaName) {
  const schema = document.components.schemas[schemaName];
  assert.ok(schema, `${schemaName} should exist`);
  const properties = schema.properties ?? {};
  for (const propertyName of [
    "cloudRouterSdkFamily",
    "cloudRouterApiAuthority",
    "cloudRouterApiPrefix",
    "cloudRouterCreateOperationId",
    "cloudRouterRetrieveOperationId",
    "cloudRouterRetrieveStandardPath",
  ]) {
    assert.ok(properties[propertyName], `${schemaName}.${propertyName} should exist`);
    assert.ok(schema.required.includes(propertyName), `${schemaName}.${propertyName} should be required`);
  }
  assert.deepEqual(properties.cloudRouterSdkFamily.enum, ["cloudrouter-open-sdk"]);
  assert.deepEqual(properties.cloudRouterApiAuthority.enum, ["sdkwork-cloudrouter.ai"]);
  assert.deepEqual(properties.cloudRouterApiPrefix.enum, ["/v1"]);
  assert.deepEqual(properties.cloudRouterCreateOperationId.enum, ["sunoCreateMusicGeneration"]);
  assert.deepEqual(properties.cloudRouterRetrieveOperationId.enum, ["sunoRetrieveMusicGeneration"]);
  assert.deepEqual(properties.cloudRouterStandardPath.enum, ["/suno/v1/music/generations"]);
  assert.deepEqual(properties.cloudRouterRetrieveStandardPath.enum, ["/suno/v1/music/generations/{task_id}"]);
}

test("music OpenAPI documents are owner-only sdkwork-v3 compatible inputs", () => {
  for (const [surface, document, prefix, authority] of [
    ["app", app, "/app/v3/api", "sdkwork-music-app-api"],
    ["backend", backend, "/backend/v3/api", "sdkwork-music-backend-api"],
  ]) {
    assert.equal(document.openapi, "3.1.2", surface);
    assert.equal(document["x-sdkwork-owner"], "sdkwork-music", surface);
    assert.equal(document["x-sdkwork-api-authority"], authority, surface);
    assert.deepEqual(document.components.securitySchemes.AuthToken, {
      type: "http",
      scheme: "bearer",
      bearerFormat: "JWT",
    });
    assert.deepEqual(document.components.securitySchemes.AccessToken, {
      type: "apiKey",
      in: "header",
      name: "Access-Token",
    });
    for (const { path, operation } of operations(document)) {
      assert.ok(path.startsWith(prefix), `${surface} path prefix ${path}`);
      assert.equal(operation["x-sdkwork-owner"], "sdkwork-music", `${surface} owner ${path}`);
      assert.equal(operation["x-sdkwork-api-authority"], authority, `${surface} authority ${path}`);
      assert.equal(operation["x-sdkwork-domain"], "music", `${surface} domain ${path}`);
      assert.deepEqual(operation.tags, ["music"], `${surface} tag ${path}`);
      assert.match(operation.operationId, /^[a-z][A-Za-z0-9]*(\.[a-z][A-Za-z0-9]*)+$/u);
      assert.deepEqual(operation.security, [{ AuthToken: [], AccessToken: [] }], `${surface} security ${path}`);
    }
  }
  assert.equal(operations(app).length, 37);
  assert.equal(operations(backend).length, 45);

  assert.deepEqual(parameterNames(operation(app, "/app/v3/api/music/tracks", "get")), [
    "artist_id",
    "album_id",
    "q",
    "status",
  ]);
  assert.deepEqual(parameterNames(operation(backend, "/backend/v3/api/music/tracks", "get")), [
    "artist_id",
    "album_id",
    "q",
    "status",
  ]);

  const createAudioAsset = operation(backend, "/backend/v3/api/music/audio/assets", "post");
  assert.equal(createAudioAsset.operationId, "audio.assets.create");
  assert.deepEqual(
    createAudioAsset.requestBody.content["application/json"].schema,
    { $ref: "#/components/schemas/MusicAudioAssetCommand" },
  );

  assert.ok(app.components.schemas.MusicMediaResource);
  assert.ok(app.components.schemas.MusicHomeShelf);
  assert.ok(app.components.schemas.MusicChartEntry);
  assert.ok(app.components.schemas.MusicUserLibraryItem);
  assert.ok(app.components.schemas.MusicAiGenerationTask);
  assert.ok(app.components.schemas.MusicAiGenerationVariant);
  assert.ok(app.components.schemas.MusicAiGenerationProvider);
  assert.ok(app.components.schemas.MusicAiGenerationProviderModel);
  assert.ok(app.components.schemas.MusicAiGenerationProviderAttempt);
  assert.ok(app.components.schemas.MusicAiGenerationProviderEvent);
  assert.ok(app.components.schemas.MusicAiGenerationNotification);
  assert.ok(app.components.schemas.MusicAiProviderInvocationMode);
  assert.ok(app.components.schemas.MusicAiGenerationProviderEventCommand);
  assert.ok(app.components.schemas.MusicComment);
  assert.ok(app.components.schemas.MusicContentReport);
  assert.ok(app.components.schemas.MusicRecommendationFeedback);
  assert.ok(app.components.schemas.MusicSearchSuggestion);
  assert.ok(app.components.schemas.MusicDownloadEntitlement);
  assert.ok(app.components.schemas.MusicPlaybackSession);
  assert.ok(app.components.schemas.MusicAiStylePreset);
  assert.ok(app.components.schemas.MusicAiPromptTemplate);
  assert.ok(backend.components.schemas.MusicRightsPolicy);
  assert.ok(backend.components.schemas.MusicRightsTerritory);
  assert.ok(backend.components.schemas.MusicReleaseChannel);
  assert.ok(backend.components.schemas.MusicAiGenerationCreditLedgerEntry);
  assert.ok(backend.components.schemas.MusicModerationSignal);
  assert.deepEqual(app.components.schemas.MusicAiGenerationTaskStatus.enum, [
    "queued",
    "routing",
    "submitted",
    "running",
    "waiting_webhook",
    "succeeded",
    "failed",
    "cancelled",
    "expired",
  ]);

  assert.equal(operation(app, "/app/v3/api/music/home/shelves", "get").operationId, "home.shelves.list");
  assert.equal(operation(app, "/app/v3/api/music/search", "get").operationId, "search.query");
  assert.deepEqual(parameterNames(operation(app, "/app/v3/api/music/search", "get")), ["q", "type", "limit"]);
  assert.equal(operation(app, "/app/v3/api/music/charts", "get").operationId, "charts.list");
  assert.equal(operation(app, "/app/v3/api/music/charts/{chartId}", "get").operationId, "charts.entries.list");
  assert.equal(operation(app, "/app/v3/api/music/library/items", "post").operationId, "library.items.create");
  assert.equal(
    operation(app, "/app/v3/api/music/playlists/{playlistId}/tracks", "post").operationId,
    "playlists.tracks.create",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/playlists/{playlistId}/tracks/{trackId}", "delete").operationId,
    "playlists.tracks.delete",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/playlists/{playlistId}/follow", "post").operationId,
    "playlists.follow.create",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/playlists/{playlistId}/follow", "delete").operationId,
    "playlists.follow.delete",
  );
  assert.equal(operation(app, "/app/v3/api/music/comments", "get").operationId, "comments.list");
  assert.equal(operation(app, "/app/v3/api/music/comments", "post").operationId, "comments.create");
  assert.equal(operation(app, "/app/v3/api/music/content_reports", "post").operationId, "contentReports.create");
  assert.equal(
    operation(app, "/app/v3/api/music/recommendation/feedback", "post").operationId,
    "recommendation.feedback.create",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/search/suggestions", "get").operationId,
    "search.suggestions.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/downloads/entitlements", "get").operationId,
    "downloads.entitlements.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/playback/sessions", "get").operationId,
    "playback.sessions.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/playback/sessions", "post").operationId,
    "playback.sessions.create",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/playback/sessions/{sessionId}", "patch").operationId,
    "playback.sessions.update",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/style_presets", "get").operationId,
    "generations.stylePresets.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/prompt_templates", "get").operationId,
    "generations.promptTemplates.list",
  );
  assert.equal(operation(app, "/app/v3/api/music/play_events", "post").operationId, "playEvents.create");
  assert.equal(
    operation(app, "/app/v3/api/music/generations", "post").operationId,
    "generations.create",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/providers", "get").operationId,
    "generations.providers.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/provider_models", "get").operationId,
    "generations.providerModels.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/{generationId}", "get").operationId,
    "generations.retrieve",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/{generationId}/events", "get").operationId,
    "generations.events.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/notifications", "get").operationId,
    "generations.notifications.list",
  );
  assert.equal(
    operation(app, "/app/v3/api/music/generations/notifications/{notificationId}", "patch").operationId,
    "generations.notifications.update",
  );

  assert.equal(operation(backend, "/backend/v3/api/music/charts", "post").operationId, "charts.create");
  assert.equal(
    operation(backend, "/backend/v3/api/music/charts/{chartId}/entries", "post").operationId,
    "charts.entries.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/recommendation/shelves", "post").operationId,
    "recommendation.shelves.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/recommendation/feedback", "get").operationId,
    "recommendation.feedback.management.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/content_reports", "get").operationId,
    "contentReports.management.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/content_reports/{reportId}/resolve", "post").operationId,
    "contentReports.resolve",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/style_presets", "post").operationId,
    "generations.stylePresets.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/style_presets/{presetId}", "patch").operationId,
    "generations.stylePresets.update",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/prompt_templates", "post").operationId,
    "generations.promptTemplates.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/prompt_templates/{templateId}", "patch").operationId,
    "generations.promptTemplates.update",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/credit_ledger", "get").operationId,
    "generations.creditLedger.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations", "get").operationId,
    "generations.management.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/providers", "get").operationId,
    "generations.providers.management.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/providers", "post").operationId,
    "generations.providers.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/providers/{providerId}", "patch").operationId,
    "generations.providers.update",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/provider_models", "get").operationId,
    "generations.providerModels.management.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/provider_models", "post").operationId,
    "generations.providerModels.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/{generationId}/attempts", "get").operationId,
    "generations.attempts.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/events", "get").operationId,
    "generations.events.management.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/{generationId}/sync", "post").operationId,
    "generations.sync",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/webhooks/{providerCode}/events", "post").operationId,
    "generations.webhooks.receive",
  );
  assert.deepEqual(
    operation(backend, "/backend/v3/api/music/generations/webhooks/{providerCode}/events", "post")
      .requestBody.content["application/json"].schema,
    { $ref: "#/components/schemas/MusicAiGenerationProviderEventCommand" },
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/{generationId}/moderate", "post").operationId,
    "generations.moderate",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/generations/{generationId}/publish", "post").operationId,
    "generations.publish",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/moderation/signals", "get").operationId,
    "moderation.signals.list",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/rights/policies", "post").operationId,
    "rights.policies.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/rights/policies/{policyId}/territories", "post").operationId,
    "rights.policies.territories.create",
  );
  assert.equal(
    operation(backend, "/backend/v3/api/music/releases/{releaseId}/channels", "post").operationId,
    "releases.channels.create",
  );
});

test("music provider schemas expose a complete cloud-router Suno operation binding", () => {
  for (const document of [app, backend]) {
    assertCloudRouterOperationBinding(document, "MusicAiGenerationProvider");
    assertCloudRouterOperationBinding(document, "MusicAiGenerationProviderCommand");
  }

  for (const document of [app, backend]) {
    const attempt = document.components.schemas.MusicAiGenerationProviderAttempt;
    assert.ok(attempt.properties.cloudRouterOperationId, "attempt should record the invoked cloud-router operation");
    assert.ok(attempt.required.includes("cloudRouterOperationId"));
    assert.deepEqual(attempt.properties.cloudRouterOperationId.enum, ["sunoCreateMusicGeneration"]);
  }
});
