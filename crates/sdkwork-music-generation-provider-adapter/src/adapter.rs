use cloudrouter_open_sdk::SdkworkAiClient;
use sdkwork_music_generation_provider_spi::{
    MusicGenerationCommand, MusicGenerationProvider, MusicGenerationProviderCapability,
    MusicGenerationProviderDescriptor, MusicGenerationProviderError, MusicGenerationProviderResult,
    MusicProviderDispatchPlan, MusicProviderSubmission, MusicProviderTaskMode, MusicVendorId,
    NormalizedMusicGenerationResult,
};

use crate::normalization::{normalize_submission, normalize_task};
use crate::requests::build_music_generation_request;
use crate::routing::MUSIC_GENERATION_PROVIDER_ADAPTER_ID;

#[derive(Clone)]
pub struct MusicGenerationProviderAdapter {
    client: SdkworkAiClient,
    descriptor: MusicGenerationProviderDescriptor,
}

impl MusicGenerationProviderAdapter {
    pub fn new(client: SdkworkAiClient) -> Self {
        Self {
            client,
            descriptor: MusicGenerationProviderDescriptor {
                id: MUSIC_GENERATION_PROVIDER_ADAPTER_ID.to_string(),
                vendors: vec![MusicVendorId::new("suno").expect("static music vendor")],
                capabilities: vec![
                    MusicGenerationProviderCapability::TextToMusic,
                    MusicGenerationProviderCapability::MultipleTracks,
                    MusicGenerationProviderCapability::Lyrics,
                    MusicGenerationProviderCapability::Polling,
                    MusicGenerationProviderCapability::Webhook,
                ],
            },
        }
    }
}

#[async_trait::async_trait]
impl MusicGenerationProvider for MusicGenerationProviderAdapter {
    fn descriptor(&self) -> &MusicGenerationProviderDescriptor {
        &self.descriptor
    }
    fn validate(&self, command: &MusicGenerationCommand) -> MusicGenerationProviderResult<()> {
        if !self.descriptor.supports_vendor(&command.vendor) {
            return Err(MusicGenerationProviderError::UnsupportedVendor(
                command.vendor.to_string(),
            ));
        }
        build_music_generation_request(command)?;
        Ok(())
    }
    async fn generate(
        &self,
        command: &MusicGenerationCommand,
    ) -> MusicGenerationProviderResult<MusicProviderSubmission> {
        self.validate(command)?;
        let request = build_music_generation_request(command)?;
        let response = self
            .client
            .audio_suno()
            .create_v1_music_generation(&request)
            .await
            .map_err(map_sdk_error)?;
        Ok(MusicProviderSubmission {
            dispatch_plan: MusicProviderDispatchPlan {
                provider_id: self.descriptor.id.clone(),
                vendor: command.vendor.clone(),
                model: command.model.trim().to_string(),
                task_mode: if command.callback_url.is_some() {
                    MusicProviderTaskMode::Webhook
                } else {
                    MusicProviderTaskMode::Task
                },
            },
            result: normalize_submission(command.vendor.as_str(), response),
        })
    }
    async fn retrieve(
        &self,
        dispatch_plan: &MusicProviderDispatchPlan,
        provider_task_id: &str,
    ) -> MusicGenerationProviderResult<NormalizedMusicGenerationResult> {
        let response = self
            .client
            .audio_suno()
            .list_v1_music_generations(provider_task_id)
            .await
            .map_err(map_sdk_error)?;
        Ok(normalize_task(dispatch_plan.vendor.as_str(), response))
    }
}

fn map_sdk_error(error: cloudrouter_open_sdk::SdkworkError) -> MusicGenerationProviderError {
    match error {
        cloudrouter_open_sdk::SdkworkError::Http(error) if error.is_timeout() => {
            MusicGenerationProviderError::Timeout(error.to_string())
        }
        cloudrouter_open_sdk::SdkworkError::Http(error) => {
            MusicGenerationProviderError::Transport(error.to_string())
        }
        cloudrouter_open_sdk::SdkworkError::HttpStatus { status: 408, body } => {
            MusicGenerationProviderError::Timeout(body)
        }
        cloudrouter_open_sdk::SdkworkError::HttpStatus { status: 429, body } => {
            MusicGenerationProviderError::RateLimited(body)
        }
        cloudrouter_open_sdk::SdkworkError::HttpStatus { status, body } if status >= 500 => {
            MusicGenerationProviderError::ProviderUnavailable(format!(
                "http status {status}: {body}"
            ))
        }
        cloudrouter_open_sdk::SdkworkError::HttpStatus { status, body } => {
            MusicGenerationProviderError::Rejected(format!("http status {status}: {body}"))
        }
        cloudrouter_open_sdk::SdkworkError::Serialization(error) => {
            MusicGenerationProviderError::InvalidProviderResponse(error.to_string())
        }
        error @ (cloudrouter_open_sdk::SdkworkError::InvalidHeaderName(_)
        | cloudrouter_open_sdk::SdkworkError::InvalidHeaderValue(_)
        | cloudrouter_open_sdk::SdkworkError::InvalidHttpMethod(_)) => {
            MusicGenerationProviderError::Configuration(error.to_string())
        }
    }
}
