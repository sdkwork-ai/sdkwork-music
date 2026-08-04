import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const musicRoot = path.resolve(import.meta.dirname, "..", "..");
const workspaceRoot = path.resolve(musicRoot, "..");

const expectedCloudRouterDependency = {
  workspace: "cloudrouter-open-sdk",
  role: "ai-music-generation-provider-capability",
  required: true,
  dependencyMode: "consumer-sdk",
  apiPrefix: "/v1",
  apiAuthority: "sdkwork-cloudrouter.ai",
  generatedTransportImportPolicy: "forbidden",
  operations: ["sunoCreateMusicGeneration", "sunoRetrieveMusicGeneration"],
  paths: ["/suno/v1/music/generations", "/suno/v1/music/generations/{task_id}"],
  packageByLanguage: {
    typescript: "@sdkwork/cloudrouter-open-sdk",
    flutter: "cloudrouter_open_sdk",
    rust: "cloudrouter-open-sdk",
    java: "com.sdkwork.cloudrouter:cloudrouter-open-sdk",
    csharp: "Sdkwork.CloudRouter.Open.Sdk",
    swift: "CloudRouterOpenSdk",
    kotlin: "com.sdkwork.cloudrouter:cloudrouter-open-sdk",
    go: "github.com/sdkwork/cloudrouter-open-sdk",
    python: "sdkwork-cloudrouter-open-sdk",
  },
};

function readJson(root, relativePath) {
  return JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
}

function listFiles(root) {
  const result = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (["node_modules", "dist"].includes(entry.name)) {
          continue;
        }
        stack.push(absolute);
      } else {
        result.push(absolute);
      }
    }
  }
  return result;
}

test("music SDK families declare cloudrouter-open-sdk as the provider dependency contract", () => {
  for (const family of ["sdkwork-music-app-sdk", "sdkwork-music-backend-sdk"]) {
    const familyRoot = path.join("sdks", family);
    const assembly = readJson(musicRoot, path.join(familyRoot, "sdk-manifest.json"));
    const manifest = readJson(musicRoot, path.join(familyRoot, "sdk-manifest.json"));
    const componentSpec = readJson(musicRoot, path.join(familyRoot, "specs", "component.spec.json"));

    assert.deepEqual(assembly.sdkDependencies, [expectedCloudRouterDependency], `${family} assembly dependency`);
    assert.deepEqual(manifest.sdkDependencies, [expectedCloudRouterDependency], `${family} manifest dependency`);
    assert.deepEqual(
      componentSpec.contracts.sdkDependencies,
      [expectedCloudRouterDependency],
      `${family} component dependency`,
    );
  }
});

test("music generated transports do not import dependency SDK packages directly", () => {
  for (const family of ["sdkwork-music-app-sdk", "sdkwork-music-backend-sdk"]) {
    const sourceRoot = path.join(
      musicRoot,
      "sdks",
      family,
      `${family}-typescript`,
      "generated",
      "server-openapi",
      "src",
    );
    const directImports = listFiles(sourceRoot)
      .filter((absolute) => absolute.endsWith(".ts"))
      .filter((absolute) =>
        /(?:from\s+["']@sdkwork\/cloudrouter-open-sdk["']|import\(["']@sdkwork\/cloudrouter-open-sdk["']\)|require\(["']@sdkwork\/cloudrouter-open-sdk["']\))/.test(
          readFileSync(absolute, "utf8"),
        ),
      )
      .map((absolute) => path.relative(musicRoot, absolute).replaceAll("\\", "/"));

    assert.deepEqual(directImports, [], `${family} generated transport must consume cloud-router through sdkDependencies`);
  }
});

test("music cloud-router provider contract matches the current cloudrouter-open-sdk Suno music operations", () => {
  const cloudRouterOpenapi = readJson(
    workspaceRoot,
    path.join("sdkwork-cloudrouter", "sdks", "cloudrouter-open-sdk", "openapi", "cloudrouter-open-sdk.openapi.json"),
  );

  assert.equal(
    cloudRouterOpenapi.paths["/suno/v1/music/generations"].post.operationId,
    "sunoCreateMusicGeneration",
  );
  assert.equal(
    cloudRouterOpenapi.paths["/suno/v1/music/generations/{task_id}"].get.operationId,
    "sunoRetrieveMusicGeneration",
  );
  assert.deepEqual(
    cloudRouterOpenapi.components.schemas.SunoMusicGenerationRequest.additionalProperties.allOf,
    [{ $ref: "#/components/schemas/ProviderJsonValue" }],
  );
});

test("music Suno facade consumes the current cloudrouter TypeScript SDK resource surface", () => {
  const cloudRouterSdk = readFileSync(
    path.join(
      workspaceRoot,
      "sdkwork-cloudrouter",
      "sdks",
      "cloudrouter-open-sdk",
      "cloudrouter-open-sdk-typescript",
      "src",
      "sdk.ts",
    ),
    "utf8",
  );
  const cloudRouterAudioSunoApi = readFileSync(
    path.join(
      workspaceRoot,
      "sdkwork-cloudrouter",
      "sdks",
      "cloudrouter-open-sdk",
      "cloudrouter-open-sdk-typescript",
      "src",
      "api",
      "audio-suno.ts",
    ),
    "utf8",
  );
  const musicSunoFacade = readFileSync(
    path.join(musicRoot, "sdks", "sdkwork-music-backend-sdk", "composed", "provider-suno.mjs"),
    "utf8",
  );
  const musicSunoFacadeTypes = readFileSync(
    path.join(musicRoot, "sdks", "sdkwork-music-backend-sdk", "composed", "provider-suno.d.ts"),
    "utf8",
  );

  assert.match(cloudRouterSdk, /public readonly audioSuno: AudioSunoApi;/);
  assert.match(cloudRouterAudioSunoApi, /export class AudioSunoV1MusicGenerationsApi/);
  assert.match(cloudRouterAudioSunoApi, /async create\(body: SunoMusicGenerationRequest\)/);
  assert.match(cloudRouterAudioSunoApi, /async retrieve\(taskId: string\)/);
  assert.match(musicSunoFacade, /cloudRouter\?\.audioSuno\?\.v1\?\.music\?\.generations/);
  assert.match(musicSunoFacadeTypes, /audioSuno:\s*\{\s*v1:\s*\{\s*music:\s*\{\s*generations: CloudRouterSunoGenerationsClient;/);
  assert.match(musicSunoFacadeTypes, /export type ProviderJsonValue/);
  assert.match(musicSunoFacadeTypes, /\[key: string\]: ProviderJsonValue \| undefined;/);
});
