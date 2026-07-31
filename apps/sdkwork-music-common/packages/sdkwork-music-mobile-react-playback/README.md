# SDKWork Music Mobile React Playback

Reusable mobile React music playback capability owned by `sdkwork-music`.

## Public Exports

The package root exports the audio store, full player page, mini player, and player components.

## SDK Inputs

This local media capability has no HTTP SDK dependency. Callers provide track URLs through `useAudioStore`.

## Configuration

No runtime configuration is required. The browser `HTMLAudioElement` is created lazily.

## Extensions

Hosts may compose `MusicPlayerPage` as a route and `GlobalMiniPlayer` as shell chrome.

## Security

The package does not own credentials or authentication. Hosts remain responsible for supplying authorized media URLs.

## Verification

Run `pnpm --filter @sdkwork/music-mobile-react-playback test` and the consuming application's typecheck.

## Integration

The same package is reusable in standalone and cloud H5 renderers; deployment-specific URLs stay outside the module.
