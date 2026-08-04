use cloudrouter_open_sdk::{
    ProviderTaskError, SunoMusicGenerationResponse, SunoMusicGenerationTaskResponse,
};
use sdkwork_music_generation_provider_spi::{
    MusicGeneratedAsset, MusicGeneratedAssetKind, MusicGenerationStatus,
    NormalizedMusicGenerationResult,
};

pub(crate) fn normalize_submission(
    vendor: &str,
    response: SunoMusicGenerationResponse,
) -> NormalizedMusicGenerationResult {
    normalize(
        vendor,
        response.task_id.or(response.id),
        response.status,
        Vec::new(),
        None,
    )
}

pub(crate) fn normalize_task(
    vendor: &str,
    response: SunoMusicGenerationTaskResponse,
) -> NormalizedMusicGenerationResult {
    let mut outputs = Vec::new();
    for track in response.tracks.unwrap_or_default() {
        let track_id = track.id.clone();
        if let Some(url) = track.audio_url {
            outputs.push(MusicGeneratedAsset {
                output_index: outputs.len() as i32,
                kind: MusicGeneratedAssetKind::Music,
                provider_asset_id: track_id.clone(),
                provider_url: url,
                title: track.title.clone(),
                mime_type: "audio/mpeg".to_string(),
                duration_seconds: track.duration,
                lyrics: track.lyrics.clone(),
            });
        }
        if let Some(url) = track.image_url {
            outputs.push(MusicGeneratedAsset {
                output_index: outputs.len() as i32,
                kind: MusicGeneratedAssetKind::CoverImage,
                provider_asset_id: track_id.clone(),
                provider_url: url,
                title: track.title.clone(),
                mime_type: "image/jpeg".to_string(),
                duration_seconds: None,
                lyrics: None,
            });
        }
        if let Some(url) = track.video_url {
            outputs.push(MusicGeneratedAsset {
                output_index: outputs.len() as i32,
                kind: MusicGeneratedAssetKind::Video,
                provider_asset_id: track_id,
                provider_url: url,
                title: track.title,
                mime_type: "video/mp4".to_string(),
                duration_seconds: track.duration,
                lyrics: track.lyrics,
            });
        }
    }
    normalize(
        vendor,
        response.task_id.or(response.id),
        response.status,
        outputs,
        response.error,
    )
}

fn normalize(
    vendor: &str,
    task_id: Option<String>,
    provider_status: Option<String>,
    outputs: Vec<MusicGeneratedAsset>,
    error: Option<ProviderTaskError>,
) -> NormalizedMusicGenerationResult {
    let status_text = provider_status
        .as_deref()
        .unwrap_or(if outputs.is_empty() {
            "submitted"
        } else {
            "succeeded"
        })
        .trim()
        .to_ascii_lowercase();
    let status =
        if error.is_some() || matches!(status_text.as_str(), "failed" | "error" | "rejected") {
            MusicGenerationStatus::Failed
        } else if matches!(status_text.as_str(), "cancelled" | "canceled") {
            MusicGenerationStatus::Cancelled
        } else if matches!(status_text.as_str(), "expired" | "timeout" | "timed_out") {
            MusicGenerationStatus::Expired
        } else if matches!(
            status_text.as_str(),
            "succeeded" | "success" | "completed" | "done"
        ) {
            MusicGenerationStatus::Succeeded
        } else if matches!(
            status_text.as_str(),
            "running" | "processing" | "generating"
        ) {
            MusicGenerationStatus::Running
        } else {
            MusicGenerationStatus::Submitted
        };
    let terminal = matches!(
        status,
        MusicGenerationStatus::Succeeded
            | MusicGenerationStatus::Failed
            | MusicGenerationStatus::Cancelled
            | MusicGenerationStatus::Expired
    );
    let (error_code, error_message) = error
        .map(|error| (error.code.or(error.r#type), error.message))
        .unwrap_or((None, None));
    NormalizedMusicGenerationResult {
        vendor: vendor.to_string(),
        provider_task_id: task_id,
        provider_status,
        status,
        terminal,
        outputs,
        error_code,
        error_message,
    }
}
