use cloudrouter_open_sdk::SunoMusicGenerationRequest;
use sdkwork_music_generation_provider_spi::{
    MusicGenerationCommand, MusicGenerationProviderError, MusicGenerationProviderResult,
};

#[derive(Default, serde::Deserialize)]
#[serde(deny_unknown_fields)]
struct SunoVendorParameters {}

pub fn build_music_generation_request(
    command: &MusicGenerationCommand,
) -> MusicGenerationProviderResult<SunoMusicGenerationRequest> {
    command.validate()?;
    if command.instrumental.is_some() {
        return Err(MusicGenerationProviderError::UnsupportedParameter(
            "instrumental is not exposed by the generated music SDK request".to_string(),
        ));
    }
    let _: SunoVendorParameters = decode_vendor_parameters(command, "suno.music-generation.v1")?;
    Ok(SunoMusicGenerationRequest {
        callback_url: normalized(command.callback_url.as_deref()),
        duration: command.duration_seconds,
        model: Some(command.model.trim().to_string()),
        negative_tags: normalized(command.negative_tags.as_deref()),
        prompt: command.prompt.trim().to_string(),
        tags: normalized(command.tags.as_deref()),
        title: normalized(command.title.as_deref()),
    })
}

fn decode_vendor_parameters<T>(
    command: &MusicGenerationCommand,
    expected_schema: &str,
) -> MusicGenerationProviderResult<T>
where
    T: serde::de::DeserializeOwned + Default,
{
    let Some(parameters) = command.vendor_parameters.as_ref() else {
        return Ok(T::default());
    };
    if parameters.schema.trim() != expected_schema {
        return Err(MusicGenerationProviderError::UnsupportedParameter(format!(
            "vendor parameter schema {} is not valid for {}",
            parameters.schema, command.vendor
        )));
    }
    serde_json::from_value(parameters.values.clone()).map_err(|error| {
        MusicGenerationProviderError::InvalidRequest(format!(
            "invalid {} vendor parameters: {error}",
            command.vendor
        ))
    })
}

fn normalized(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}
