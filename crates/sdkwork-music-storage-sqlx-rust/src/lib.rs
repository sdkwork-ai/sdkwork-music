mod bootstrap;

pub use bootstrap::{
    bootstrap_music_database, bootstrap_music_database_from_env,
    connect_and_bootstrap_music_database_from_env, connect_music_database_pool_from_env,
    MusicDatabaseHost, MusicDatabasePool,
};

use sdkwork_drive_storage_contract::{
    DriveObjectLocator, DriveObjectStore, DriveObjectStoreError, DriveObjectStoreErrorKind,
    PutObjectRequest,
};
use sdkwork_drive_workspace_service::{
    ports::uploader_store::DriveUploaderStore,
    uploader::{
        CompleteStoredUploaderUploadCommand, DriveUploaderService, PrepareUploaderUploadCommand,
        UploaderActor, UploaderRetention, UploaderTarget,
    },
    DriveServiceError,
};
use serde_json::{Map, Value};
use sha2::{Digest, Sha256};
use std::collections::BTreeMap;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MusicRepositoryBinding {
    pub domain: &'static str,
    pub repository_name: &'static str,
    pub tables: Vec<&'static str>,
    pub requires_transaction: bool,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MusicStorageMigration {
    pub sequence: u32,
    pub name: &'static str,
    pub domain: &'static str,
    pub source_path: &'static str,
    pub sql: &'static str,
    pub checksum: String,
    pub required_tables: Vec<&'static str>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MusicStorageCapabilityManifest {
    pub name: &'static str,
    pub schema_version: &'static str,
    pub tables: Vec<&'static str>,
    pub indexes: Vec<&'static str>,
    pub migrations: Vec<&'static str>,
    pub migration_plan: Vec<MusicStorageMigration>,
    pub repository_bindings: Vec<MusicRepositoryBinding>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicArtist {
    pub id: String,
    pub tenant_id: String,
    pub slug: String,
    pub name: String,
    pub bio: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAlbum {
    pub id: String,
    pub tenant_id: String,
    pub artist_id: String,
    pub slug: String,
    pub title: String,
    pub release_date: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAudioAsset {
    pub id: String,
    pub tenant_id: String,
    pub title: String,
    pub drive_space_id: String,
    pub drive_node_id: String,
    pub drive_uri: String,
    pub media_resource_id: Option<String>,
    pub media_resource_snapshot: Option<String>,
    pub mime_type: String,
    pub duration_seconds: i64,
    pub checksum_algorithm: Option<String>,
    pub checksum_value: Option<String>,
    pub status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicTrack {
    pub id: String,
    pub tenant_id: String,
    pub artist_id: String,
    pub album_id: Option<String>,
    pub audio_asset_id: Option<String>,
    pub slug: String,
    pub title: String,
    pub duration_seconds: i64,
    pub tags: Vec<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicPlaylist {
    pub id: String,
    pub tenant_id: String,
    pub slug: String,
    pub title: String,
    pub description: Option<String>,
    pub track_ids: Vec<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicComment {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub resource_type: String,
    pub resource_id: String,
    pub parent_comment_id: Option<String>,
    pub body: String,
    pub moderation_status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicContentReport {
    pub id: String,
    pub tenant_id: String,
    pub reporter_user_id: String,
    pub resource_type: String,
    pub resource_id: String,
    pub reason_code: String,
    pub description: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicChart {
    pub id: String,
    pub tenant_id: String,
    pub slug: String,
    pub title: String,
    pub chart_type: String,
    pub status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicChartEntry {
    pub id: String,
    pub tenant_id: String,
    pub chart_id: String,
    pub track_id: String,
    pub rank: i64,
    pub score: i64,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicRecommendationShelf {
    pub id: String,
    pub tenant_id: String,
    pub slug: String,
    pub title: String,
    pub shelf_type: String,
    pub status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicRecommendationItem {
    pub id: String,
    pub tenant_id: String,
    pub shelf_id: String,
    pub item_type: String,
    pub item_id: String,
    pub position: i64,
    pub reason_code: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicRecommendationFeedback {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub item_type: String,
    pub item_id: String,
    pub feedback_type: String,
    pub reason_code: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicLibraryItem {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub item_type: String,
    pub item_id: String,
    pub source: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicListeningEvent {
    pub id: String,
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub track_id: String,
    pub duration_seconds: i64,
    pub played_seconds: i64,
    pub completion_rate: i64,
    pub source: Option<String>,
    pub occurred_at: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicDownloadEntitlement {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub track_id: String,
    pub audio_asset_id: String,
    pub quality: String,
    pub status: String,
    pub expires_at: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicPlaybackSession {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub device_id: String,
    pub current_track_id: Option<String>,
    pub queue_json: Option<String>,
    pub position_ms: i64,
    pub playback_state: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicSearchSuggestion {
    pub id: String,
    pub tenant_id: String,
    pub suggestion_type: String,
    pub display_text: String,
    pub query_text: String,
    pub weight: i64,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiGenerationProject {
    pub id: String,
    pub tenant_id: String,
    pub user_id: String,
    pub title: String,
    pub visibility: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiStylePreset {
    pub id: String,
    pub tenant_id: String,
    pub slug: String,
    pub title: String,
    pub style_tags: Vec<String>,
    pub prompt_hint: Option<String>,
    pub status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiPromptTemplate {
    pub id: String,
    pub tenant_id: String,
    pub slug: String,
    pub title: String,
    pub template_text: String,
    pub variables_json: Option<String>,
    pub status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiGenerationProvider {
    pub id: String,
    pub tenant_id: String,
    pub provider_code: String,
    pub display_name: String,
    pub adapter_id: String,
    pub capability: String,
    pub invocation_mode: String,
    pub supports_polling: bool,
    pub supports_webhook: bool,
    pub status: String,
    pub config_snapshot: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiGenerationProviderModel {
    pub id: String,
    pub tenant_id: String,
    pub provider_id: String,
    pub provider_code: String,
    pub model_name: String,
    pub display_name: String,
    pub capability: String,
    pub min_duration_seconds: i64,
    pub max_duration_seconds: i64,
    pub max_variant_count: i64,
    pub supported_formats: Vec<String>,
    pub supported_style_tags: Vec<String>,
    pub pricing_unit: String,
    pub status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiGenerationTask {
    pub id: String,
    pub tenant_id: String,
    pub project_id: Option<String>,
    pub user_id: String,
    pub prompt: String,
    pub lyrics_prompt: Option<String>,
    pub style_tags: Vec<String>,
    pub model_provider: String,
    pub model_name: String,
    pub reference_drive_uri: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiGenerationProviderAttempt {
    pub id: String,
    pub tenant_id: String,
    pub task_id: String,
    pub provider_id: String,
    pub provider_code: String,
    pub model_name: String,
    pub invocation_mode: String,
    pub adapter_id: String,
    pub provider_request_id: Option<String>,
    pub external_task_id: Option<String>,
    pub status: String,
    pub provider_status: Option<String>,
    pub request_snapshot: Option<String>,
    pub response_snapshot: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiGenerationProviderEvent {
    pub id: String,
    pub tenant_id: String,
    pub task_id: String,
    pub attempt_id: Option<String>,
    pub provider_code: String,
    pub external_task_id: Option<String>,
    pub external_event_id: Option<String>,
    pub event_type: String,
    pub source: String,
    pub provider_status: String,
    pub payload_hash: String,
    pub payload_snapshot: String,
    pub has_outputs: bool,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicReleaseChannel {
    pub id: String,
    pub tenant_id: String,
    pub release_id: String,
    pub channel_code: String,
    pub distribution_status: String,
    pub scheduled_at: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicRightsTerritory {
    pub id: String,
    pub tenant_id: String,
    pub rights_policy_id: String,
    pub region_code: String,
    pub availability: String,
    pub starts_at: Option<String>,
    pub ends_at: Option<String>,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NewMusicAiGenerationVariant {
    pub id: String,
    pub tenant_id: String,
    pub task_id: String,
    pub audio_asset_id: Option<String>,
    pub title: String,
    pub drive_uri: String,
    pub media_resource_snapshot: Option<String>,
    pub duration_seconds: i64,
    pub moderation_status: String,
    pub now: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct MusicGeneratedProviderArtifact {
    pub id: Option<String>,
    pub title: String,
    pub kind: String,
    pub content_type: String,
    pub content_length: i64,
    pub file_name: String,
    pub checksum_sha256_hex: Option<String>,
    pub duration_seconds: i64,
    pub provider_asset_id: Option<String>,
    pub provider_asset_url: Option<String>,
    pub metadata_json: Option<String>,
    pub content: Option<Vec<u8>>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArchiveMusicGeneratedArtifactsCommand {
    pub tenant_id: String,
    pub user_id: Option<String>,
    pub anonymous_id: Option<String>,
    pub task_id: String,
    pub provider_code: String,
    pub provider_model: String,
    pub provider_task_id: Option<String>,
    pub now: String,
    pub now_epoch_ms: i64,
    pub artifacts: Vec<MusicGeneratedProviderArtifact>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArchivedMusicGeneratedArtifacts {
    pub variants: Vec<NewMusicAiGenerationVariant>,
    pub media_resources: Vec<ArchivedMusicGeneratedMediaResource>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ArchivedMusicGeneratedMediaResource {
    pub artifact_id: Option<String>,
    pub title: String,
    pub kind: String,
    pub drive_uri: String,
    pub media_resource_snapshot: String,
}

#[derive(Clone, Debug, Eq, PartialEq)]
struct StoredMusicGeneratedArtifactObject {
    bucket: String,
    object_key: String,
    etag: Option<String>,
    version_id: Option<String>,
    checksum_sha256_hex: String,
}

pub struct MusicGeneratedArtifactArchiveService<S>
where
    S: DriveUploaderStore,
{
    drive_uploader: DriveUploaderService<S>,
    object_store: Option<Box<dyn DriveObjectStore>>,
}

impl<S> MusicGeneratedArtifactArchiveService<S>
where
    S: DriveUploaderStore,
{
    pub fn new(store: S) -> Self {
        Self {
            drive_uploader: DriveUploaderService::new(store),
            object_store: None,
        }
    }

    pub fn with_object_store(store: S, object_store: impl DriveObjectStore + 'static) -> Self {
        Self {
            drive_uploader: DriveUploaderService::new(store),
            object_store: Some(Box::new(object_store)),
        }
    }

    pub async fn archive_generated_artifacts(
        &self,
        command: ArchiveMusicGeneratedArtifactsCommand,
    ) -> Result<ArchivedMusicGeneratedArtifacts, DriveServiceError> {
        let tenant_id = require_archive_identifier(&command.tenant_id, "tenant_id")?;
        let task_id = require_archive_identifier(&command.task_id, "task_id")?;
        let provider_code = require_archive_identifier(&command.provider_code, "provider_code")?;
        let provider_model = require_archive_identifier(&command.provider_model, "provider_model")?;
        let now = require_archive_text(&command.now, "now")?;
        if command.now_epoch_ms <= 0 {
            return Err(DriveServiceError::Validation(
                "now_epoch_ms must be greater than zero".to_string(),
            ));
        }
        if command.artifacts.is_empty() {
            return Err(DriveServiceError::Validation(
                "artifacts are required".to_string(),
            ));
        }

        let actor = archive_actor(command.user_id.as_deref(), command.anonymous_id.as_deref())?;
        let mut variants = Vec::new();
        let mut media_resources = Vec::with_capacity(command.artifacts.len());
        for (index, artifact) in command.artifacts.iter().enumerate() {
            let ordinal = index + 1;
            let upload_item_id = format!("music-ai-{task_id}-{ordinal:04}");
            let kind = media_kind_for_artifact(artifact);
            let mut upload_item = self
                .drive_uploader
                .prepare_upload(PrepareUploaderUploadCommand {
                    id: upload_item_id.clone(),
                    task_id: upload_item_id.clone(),
                    tenant_id: tenant_id.clone(),
                    organization_id: None,
                    actor: actor.clone(),
                    app_id: "sdkwork-music".to_string(),
                    app_resource_type: app_resource_type_for_media_kind(&kind).to_string(),
                    app_resource_id: format!("{task_id}-{ordinal:04}"),
                    scene: Some("music_ai_generation".to_string()),
                    source: Some("ai_generated".to_string()),
                    upload_profile_code: upload_profile_for_kind(&kind, &artifact.content_type),
                    file_fingerprint: artifact_fingerprint(artifact, &upload_item_id)?,
                    original_file_name: require_archive_text(&artifact.file_name, "file_name")?,
                    content_type: require_archive_text(&artifact.content_type, "content_type")?,
                    content_length: artifact.content_length,
                    chunk_size_bytes: 8 * 1024 * 1024,
                    target: UploaderTarget::AiGeneratedSpace {
                        parent_node_id: None,
                    },
                    retention: UploaderRetention::LongTerm,
                    operator_id: archive_operator_id(&actor),
                    now_epoch_ms: command.now_epoch_ms,
                })
                .await?;

            let stored_object = self
                .store_generated_artifact_object(
                    &tenant_id,
                    &task_id,
                    ordinal,
                    artifact,
                    &upload_item,
                )
                .await?;
            if let Some(stored_object) = stored_object.as_ref() {
                let upload_session_id = upload_item.upload_session_id.clone().ok_or_else(|| {
                    DriveServiceError::Internal(
                        "drive upload item is missing upload session id".to_string(),
                    )
                })?;
                upload_item = self
                    .drive_uploader
                    .complete_stored_upload(CompleteStoredUploaderUploadCommand {
                        tenant_id: tenant_id.clone(),
                        upload_item_id: upload_item.id.clone(),
                        upload_session_id,
                        content_type: upload_item.content_type.clone(),
                        content_length: artifact.content_length,
                        checksum_sha256_hex: stored_object.checksum_sha256_hex.clone(),
                        uploaded_parts_count: 1,
                        operator_id: archive_operator_id(&actor),
                    })
                    .await?;
            }

            let drive_uri = format!(
                "drive://spaces/{}/nodes/{}",
                upload_item.space_id, upload_item.node_id
            );
            let title = require_archive_text(&artifact.title, "title")?;
            let media_resource_snapshot = generated_artifact_snapshot(
                artifact,
                &upload_item,
                &drive_uri,
                &provider_code,
                &provider_model,
                command.provider_task_id.as_deref(),
                ordinal,
                &task_id,
                stored_object.as_ref(),
            )?;
            media_resources.push(ArchivedMusicGeneratedMediaResource {
                artifact_id: optional_archive_text(artifact.id.as_deref()),
                title: title.clone(),
                kind: kind.clone(),
                drive_uri: drive_uri.clone(),
                media_resource_snapshot: media_resource_snapshot.clone(),
            });
            if kind == "audio" {
                variants.push(NewMusicAiGenerationVariant {
                    id: format!("variant_{task_id}_{ordinal:04}"),
                    tenant_id: tenant_id.clone(),
                    task_id: task_id.clone(),
                    audio_asset_id: None,
                    title,
                    drive_uri,
                    media_resource_snapshot: Some(media_resource_snapshot),
                    duration_seconds: artifact.duration_seconds.max(0),
                    moderation_status: "approved".to_string(),
                    now: now.clone(),
                });
            }
        }

        Ok(ArchivedMusicGeneratedArtifacts {
            variants,
            media_resources,
        })
    }

    async fn store_generated_artifact_object(
        &self,
        tenant_id: &str,
        task_id: &str,
        ordinal: usize,
        artifact: &MusicGeneratedProviderArtifact,
        upload_item: &sdkwork_drive_workspace_service::uploader::DriveUploadItem,
    ) -> Result<Option<StoredMusicGeneratedArtifactObject>, DriveServiceError> {
        let Some(content) = artifact.content.as_ref() else {
            return Ok(None);
        };
        let Some(object_store) = self.object_store.as_ref() else {
            return Err(DriveServiceError::Validation(
                "generated artifact content requires a drive object store".to_string(),
            ));
        };
        let bucket = upload_item.object_bucket.as_deref().ok_or_else(|| {
            DriveServiceError::Internal("drive upload item is missing object bucket".to_string())
        })?;
        let object_key = upload_item.object_key.as_deref().ok_or_else(|| {
            DriveServiceError::Internal("drive upload item is missing object key".to_string())
        })?;
        if artifact.content_length >= 0 && artifact.content_length != content.len() as i64 {
            return Err(DriveServiceError::Validation(
                "content_length must match generated artifact content bytes".to_string(),
            ));
        }
        let checksum_sha256_hex = generated_artifact_checksum(artifact, content)?;

        let mut metadata = BTreeMap::new();
        metadata.insert("sdkwork.app".to_string(), "sdkwork-music".to_string());
        metadata.insert("sdkwork.ai.provenance".to_string(), "generated".to_string());
        metadata.insert(
            "sdkwork.ai.space_type".to_string(),
            "ai_generated".to_string(),
        );
        metadata.insert("sdkwork.music.tenant_id".to_string(), tenant_id.to_string());
        metadata.insert("sdkwork.music.task_id".to_string(), task_id.to_string());
        metadata.insert(
            "sdkwork.music.artifact_index".to_string(),
            ordinal.to_string(),
        );
        metadata.insert(
            "sdkwork.music.artifact_kind".to_string(),
            artifact.kind.trim().to_ascii_lowercase(),
        );
        if let Some(provider_asset_id) = artifact
            .provider_asset_id
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
        {
            metadata.insert(
                "sdkwork.music.provider_asset_id".to_string(),
                provider_asset_id.to_string(),
            );
        }

        let response = object_store
            .put_object(PutObjectRequest {
                locator: DriveObjectLocator {
                    bucket: bucket.to_string(),
                    object_key: object_key.to_string(),
                },
                content_type: Some(artifact.content_type.trim().to_ascii_lowercase()),
                metadata,
                body: content.clone(),
                checksum_sha256_hex: Some(checksum_sha256_hex.clone()),
            })
            .await
            .map_err(drive_object_store_error)?;

        Ok(Some(StoredMusicGeneratedArtifactObject {
            bucket: response.locator.bucket,
            object_key: response.locator.object_key,
            etag: response.etag,
            version_id: response.version_id,
            checksum_sha256_hex,
        }))
    }
}

pub fn music_database_tables() -> Vec<&'static str> {
    vec![
        "music_artist",
        "music_album",
        "music_audio_asset",
        "music_track",
        "music_track_tag",
        "music_lyric",
        "music_lyric_line",
        "music_rights_policy",
        "music_playlist",
        "music_playlist_track",
        "music_playlist_follow",
        "music_playlist_collaborator",
        "music_comment",
        "music_content_report",
        "music_chart",
        "music_chart_entry",
        "music_recommendation_shelf",
        "music_recommendation_item",
        "music_recommendation_feedback",
        "music_user_library_item",
        "music_like",
        "music_follow",
        "music_listening_history",
        "music_download_entitlement",
        "music_playback_session",
        "music_search_index",
        "music_search_suggestion",
        "music_ai_generation_project",
        "music_ai_style_preset",
        "music_ai_prompt_template",
        "music_ai_generation_provider",
        "music_ai_generation_provider_model",
        "music_ai_generation_task",
        "music_ai_generation_provider_attempt",
        "music_ai_generation_provider_event",
        "music_ai_generation_variant",
        "music_ai_generation_credit_ledger",
        "music_ai_generation_notification",
        "music_moderation_signal",
        "music_release",
        "music_release_channel",
        "music_rights_territory",
        "music_play_event",
        "music_editorial_audit",
        "music_schema_version",
        "music_migration_lock",
    ]
}

pub fn music_database_indexes() -> Vec<&'static str> {
    vec![
        "idx_music_artist_tenant_slug",
        "idx_music_album_tenant_artist",
        "idx_music_audio_asset_tenant_status",
        "idx_music_track_tenant_status_updated",
        "idx_music_track_tenant_artist",
        "idx_music_track_tenant_album",
        "idx_music_track_tag_tag",
        "idx_music_lyric_track_language",
        "idx_music_lyric_line_position",
        "idx_music_rights_policy_tenant_status",
        "idx_music_playlist_tenant_slug",
        "idx_music_playlist_track_position",
        "idx_music_playlist_follow_user",
        "idx_music_playlist_collaborator_playlist",
        "idx_music_comment_resource_created",
        "idx_music_content_report_status_created",
        "idx_music_chart_tenant_status_updated",
        "idx_music_chart_entry_chart_rank",
        "idx_music_recommendation_shelf_tenant_status",
        "idx_music_recommendation_item_shelf_position",
        "idx_music_recommendation_feedback_user_created",
        "idx_music_user_library_user_updated",
        "idx_music_like_user_item",
        "idx_music_follow_user_target",
        "idx_music_listening_history_user_track",
        "idx_music_listening_history_track",
        "idx_music_download_entitlement_user_status",
        "idx_music_playback_session_user_status",
        "idx_music_search_index_query",
        "idx_music_search_suggestion_tenant_type",
        "idx_music_ai_generation_project_user_updated",
        "idx_music_ai_style_preset_tenant_status",
        "idx_music_ai_prompt_template_tenant_status",
        "idx_music_ai_generation_provider_tenant_status",
        "idx_music_ai_generation_provider_model_tenant_status",
        "idx_music_ai_generation_task_tenant_status_updated",
        "idx_music_ai_generation_task_user_updated",
        "idx_music_ai_generation_task_provider_external",
        "idx_music_ai_generation_provider_attempt_task",
        "idx_music_ai_generation_provider_event_task_created",
        "idx_music_ai_generation_notification_user_status",
        "idx_music_ai_generation_variant_task",
        "idx_music_ai_generation_credit_ledger_user_created",
        "idx_music_moderation_signal_resource",
        "idx_music_release_tenant_status_published",
        "idx_music_release_channel_release_status",
        "idx_music_rights_territory_policy_region",
        "idx_music_play_event_track",
        "idx_music_editorial_audit_resource",
    ]
}

pub fn music_migration_names() -> Vec<&'static str> {
    vec!["0001_music_foundation.sql"]
}

pub fn music_initial_migration_sql() -> &'static str {
    include_str!("../migrations/0001_music_foundation.sql")
}

pub fn music_migration_plan() -> Vec<MusicStorageMigration> {
    vec![migration(
        1,
        "0001_music_foundation.sql",
        "music",
        "migrations/0001_music_foundation.sql",
        music_initial_migration_sql(),
        music_database_tables(),
    )]
}

pub fn music_repository_bindings() -> Vec<MusicRepositoryBinding> {
    vec![
        binding("music", "music.artist.repository", vec!["music_artist"]),
        binding("music", "music.album.repository", vec!["music_album"]),
        binding(
            "music",
            "music.audio_asset.repository",
            vec!["music_audio_asset"],
        ),
        binding(
            "music",
            "music.track.repository",
            vec![
                "music_track",
                "music_track_tag",
                "music_lyric",
                "music_lyric_line",
                "music_rights_policy",
                "music_play_event",
            ],
        ),
        binding(
            "music",
            "music.playlist.repository",
            vec![
                "music_playlist",
                "music_playlist_track",
                "music_playlist_follow",
                "music_playlist_collaborator",
            ],
        ),
        binding(
            "music",
            "music.community.repository",
            vec!["music_comment", "music_content_report"],
        ),
        binding(
            "music",
            "music.chart.repository",
            vec!["music_chart", "music_chart_entry"],
        ),
        binding(
            "music",
            "music.recommendation.repository",
            vec![
                "music_recommendation_shelf",
                "music_recommendation_item",
                "music_recommendation_feedback",
            ],
        ),
        binding(
            "music",
            "music.user_engagement.repository",
            vec![
                "music_user_library_item",
                "music_like",
                "music_follow",
                "music_listening_history",
                "music_download_entitlement",
                "music_playback_session",
            ],
        ),
        binding(
            "music",
            "music.search.repository",
            vec!["music_search_index", "music_search_suggestion"],
        ),
        binding(
            "music",
            "music.ai_generation.repository",
            vec![
                "music_ai_generation_project",
                "music_ai_style_preset",
                "music_ai_prompt_template",
                "music_ai_generation_provider",
                "music_ai_generation_provider_model",
                "music_ai_generation_task",
                "music_ai_generation_provider_attempt",
                "music_ai_generation_provider_event",
                "music_ai_generation_variant",
                "music_ai_generation_credit_ledger",
                "music_ai_generation_notification",
            ],
        ),
        binding(
            "music",
            "music.moderation.repository",
            vec!["music_moderation_signal"],
        ),
        binding(
            "music",
            "music.release.repository",
            vec![
                "music_release",
                "music_release_channel",
                "music_rights_territory",
            ],
        ),
        binding(
            "music",
            "music.audit.repository",
            vec!["music_editorial_audit"],
        ),
    ]
}

pub fn music_storage_capability_manifest() -> MusicStorageCapabilityManifest {
    MusicStorageCapabilityManifest {
        name: "sdkwork-music-storage-sqlx",
        schema_version: "music.storage.v1",
        tables: music_database_tables(),
        indexes: music_database_indexes(),
        migrations: music_migration_names(),
        migration_plan: music_migration_plan(),
        repository_bindings: music_repository_bindings(),
    }
}

fn binding(
    domain: &'static str,
    repository_name: &'static str,
    tables: Vec<&'static str>,
) -> MusicRepositoryBinding {
    MusicRepositoryBinding {
        domain,
        repository_name,
        tables,
        requires_transaction: true,
    }
}

fn migration(
    sequence: u32,
    name: &'static str,
    domain: &'static str,
    source_path: &'static str,
    sql: &'static str,
    required_tables: Vec<&'static str>,
) -> MusicStorageMigration {
    MusicStorageMigration {
        sequence,
        name,
        domain,
        source_path,
        sql,
        checksum: migration_checksum(name, sql),
        required_tables,
    }
}

fn migration_checksum(name: &str, sql: &str) -> String {
    let mut hash = 0xcbf29ce484222325u64;
    for byte in name.bytes().chain(sql.bytes()) {
        hash ^= u64::from(byte);
        hash = hash.wrapping_mul(0x100000001b3);
    }
    format!("music-migration-checksum:{hash:016x}")
}

fn normalize_tag_slug(value: &str) -> String {
    value.trim().to_ascii_lowercase().replace(' ', "-")
}

fn bool_int(value: bool) -> i64 {
    if value {
        1
    } else {
        0
    }
}

fn require_archive_text(value: &str, field_name: &str) -> Result<String, DriveServiceError> {
    let value = value.trim();
    if value.is_empty() {
        return Err(DriveServiceError::Validation(format!(
            "{field_name} is required"
        )));
    }
    Ok(value.to_string())
}

fn optional_archive_text(value: Option<&str>) -> Option<String> {
    value
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

fn require_archive_identifier(value: &str, field_name: &str) -> Result<String, DriveServiceError> {
    let value = require_archive_text(value, field_name)?;
    if value.len() > 255
        || !value
            .chars()
            .all(|ch| ch.is_ascii_alphanumeric() || matches!(ch, '.' | '_' | ':' | '@' | '-'))
    {
        return Err(DriveServiceError::Validation(format!(
            "{field_name} contains invalid characters"
        )));
    }
    Ok(value)
}

fn archive_actor(
    user_id: Option<&str>,
    anonymous_id: Option<&str>,
) -> Result<UploaderActor, DriveServiceError> {
    if let Some(user_id) = user_id.map(str::trim).filter(|value| !value.is_empty()) {
        return Ok(UploaderActor::User {
            user_id: require_archive_identifier(user_id, "user_id")?,
        });
    }
    let anonymous_id = anonymous_id
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .unwrap_or("app:sdkwork-music:anonymous");
    Ok(UploaderActor::Anonymous {
        anonymous_id: require_archive_identifier(anonymous_id, "anonymous_id")?,
    })
}

fn archive_operator_id(actor: &UploaderActor) -> String {
    match actor {
        UploaderActor::Anonymous { anonymous_id } => anonymous_id.clone(),
        UploaderActor::User { user_id } => user_id.clone(),
        UploaderActor::System { operator_id } => operator_id.clone(),
    }
}

fn media_kind_for_artifact(artifact: &MusicGeneratedProviderArtifact) -> String {
    let normalized_kind = artifact.kind.trim().to_ascii_lowercase();
    let content_type = artifact.content_type.trim().to_ascii_lowercase();
    match normalized_kind.as_str() {
        "image" | "video" | "audio" | "document" | "archive" => normalized_kind,
        "music" | "voice" => "audio".to_string(),
        _ if content_type.starts_with("image/") => "image".to_string(),
        _ if content_type.starts_with("video/") => "video".to_string(),
        _ if content_type.starts_with("audio/") => "audio".to_string(),
        _ => "other".to_string(),
    }
}

fn app_resource_type_for_media_kind(kind: &str) -> &'static str {
    if kind == "audio" {
        "music_ai_generation_variant"
    } else {
        "music_ai_generation_artifact"
    }
}

fn upload_profile_for_kind(kind: &str, content_type: &str) -> String {
    let normalized_kind = kind.trim().to_ascii_lowercase();
    let normalized_content_type = content_type.trim().to_ascii_lowercase();
    match normalized_kind.as_str() {
        "image" | "video" | "audio" | "document" | "archive" | "text" => normalized_kind,
        "music" | "voice" => "audio".to_string(),
        _ if normalized_content_type.starts_with("image/") => "image".to_string(),
        _ if normalized_content_type.starts_with("video/") => "video".to_string(),
        _ if normalized_content_type.starts_with("audio/") => "audio".to_string(),
        _ => "generic".to_string(),
    }
}

fn artifact_fingerprint(
    artifact: &MusicGeneratedProviderArtifact,
    fallback_id: &str,
) -> Result<String, DriveServiceError> {
    if let Some(checksum) = artifact
        .checksum_sha256_hex
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        validate_archive_sha256_checksum(checksum)?;
        return Ok(checksum.to_string());
    }
    Ok(format!("provider_asset:{fallback_id}"))
}

fn generated_artifact_checksum(
    artifact: &MusicGeneratedProviderArtifact,
    content: &[u8],
) -> Result<String, DriveServiceError> {
    if let Some(checksum) = artifact
        .checksum_sha256_hex
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        validate_archive_sha256_checksum(checksum)?;
        return Ok(checksum.to_string());
    }
    Ok(sha256_hex(content))
}

fn sha256_hex(content: &[u8]) -> String {
    let digest = Sha256::digest(content);
    let mut output = String::with_capacity("sha256:".len() + 64);
    output.push_str("sha256:");
    for byte in digest {
        push_hex_byte(&mut output, byte);
    }
    output
}

fn push_hex_byte(output: &mut String, byte: u8) {
    const HEX: &[u8; 16] = b"0123456789abcdef";
    output.push(char::from(HEX[usize::from(byte >> 4)]));
    output.push(char::from(HEX[usize::from(byte & 0x0f)]));
}

fn validate_archive_sha256_checksum(value: &str) -> Result<(), DriveServiceError> {
    let Some(hex) = value.strip_prefix("sha256:") else {
        return Err(DriveServiceError::Validation(
            "checksum_sha256_hex must use sha256:<64 lowercase hex>".to_string(),
        ));
    };
    if hex.len() != 64 || !hex.bytes().all(|byte| byte.is_ascii_hexdigit()) {
        return Err(DriveServiceError::Validation(
            "checksum_sha256_hex must use sha256:<64 lowercase hex>".to_string(),
        ));
    }
    Ok(())
}

#[allow(clippy::too_many_arguments)]
fn generated_artifact_snapshot(
    artifact: &MusicGeneratedProviderArtifact,
    upload_item: &sdkwork_drive_workspace_service::uploader::DriveUploadItem,
    drive_uri: &str,
    provider_code: &str,
    provider_model: &str,
    provider_task_id: Option<&str>,
    ordinal: usize,
    task_id: &str,
    stored_object: Option<&StoredMusicGeneratedArtifactObject>,
) -> Result<String, DriveServiceError> {
    let kind = media_kind_for_artifact(artifact);
    let mut root = Map::new();
    root.insert("kind".to_string(), Value::String(kind));
    root.insert("source".to_string(), Value::String("drive".to_string()));
    root.insert("uri".to_string(), Value::String(drive_uri.to_string()));
    root.insert(
        "mimeType".to_string(),
        Value::String(artifact.content_type.trim().to_ascii_lowercase()),
    );
    root.insert(
        "sizeBytes".to_string(),
        Value::String(artifact.content_length.max(0).to_string()),
    );
    root.insert(
        "durationSeconds".to_string(),
        Value::Number(serde_json::Number::from(artifact.duration_seconds.max(0))),
    );

    let checksum = stored_object
        .map(|stored_object| stored_object.checksum_sha256_hex.as_str())
        .or_else(|| {
            artifact
                .checksum_sha256_hex
                .as_deref()
                .map(str::trim)
                .filter(|value| !value.is_empty())
        });
    if let Some(checksum) = checksum {
        validate_archive_sha256_checksum(checksum)?;
        let mut checksum_json = Map::new();
        checksum_json.insert("algorithm".to_string(), Value::String("sha256".to_string()));
        checksum_json.insert("value".to_string(), Value::String(checksum.to_string()));
        root.insert("checksum".to_string(), Value::Object(checksum_json));
    }

    let mut drive = Map::new();
    drive.insert(
        "spaceType".to_string(),
        Value::String("ai_generated".to_string()),
    );
    drive.insert(
        "spaceId".to_string(),
        Value::String(upload_item.space_id.clone()),
    );
    drive.insert(
        "nodeId".to_string(),
        Value::String(upload_item.node_id.clone()),
    );
    drive.insert("uri".to_string(), Value::String(drive_uri.to_string()));
    drive.insert(
        "uploadItemId".to_string(),
        Value::String(upload_item.id.clone()),
    );
    if let Some(upload_session_id) = &upload_item.upload_session_id {
        drive.insert(
            "uploadSessionId".to_string(),
            Value::String(upload_session_id.clone()),
        );
    }
    if let Some(storage_provider_id) = &upload_item.storage_provider_id {
        drive.insert(
            "storageProviderId".to_string(),
            Value::String(storage_provider_id.clone()),
        );
    }
    if let Some(storage_upload_id) = &upload_item.storage_upload_id {
        drive.insert(
            "storageUploadId".to_string(),
            Value::String(storage_upload_id.clone()),
        );
    }
    drive.insert(
        "uploadStatus".to_string(),
        Value::String(upload_item.status.clone()),
    );
    if let Some(stored_object) = stored_object {
        let mut object = Map::new();
        object.insert(
            "bucket".to_string(),
            Value::String(stored_object.bucket.clone()),
        );
        object.insert(
            "objectKey".to_string(),
            Value::String(stored_object.object_key.clone()),
        );
        object.insert(
            "uploadStatus".to_string(),
            Value::String(upload_item.status.clone()),
        );
        if let Some(etag) = &stored_object.etag {
            object.insert("etag".to_string(), Value::String(etag.clone()));
        }
        if let Some(version_id) = &stored_object.version_id {
            object.insert("versionId".to_string(), Value::String(version_id.clone()));
        }
        drive.insert("object".to_string(), Value::Object(object));
    } else if let (Some(bucket), Some(object_key)) = (
        upload_item.object_bucket.as_ref(),
        upload_item.object_key.as_ref(),
    ) {
        let mut object = Map::new();
        object.insert("bucket".to_string(), Value::String(bucket.clone()));
        object.insert("objectKey".to_string(), Value::String(object_key.clone()));
        object.insert(
            "uploadStatus".to_string(),
            Value::String("prepared".to_string()),
        );
        drive.insert("object".to_string(), Value::Object(object));
    }
    root.insert("drive".to_string(), Value::Object(drive));

    let mut ai = Map::new();
    ai.insert(
        "provenance".to_string(),
        Value::String("generated".to_string()),
    );
    ai.insert(
        "provider".to_string(),
        Value::String(provider_code.to_string()),
    );
    ai.insert(
        "model".to_string(),
        Value::String(provider_model.to_string()),
    );
    ai.insert("taskId".to_string(), Value::String(task_id.to_string()));
    ai.insert(
        "artifactIndex".to_string(),
        Value::Number(serde_json::Number::from(ordinal as u64)),
    );
    if let Some(provider_task_id) = provider_task_id {
        ai.insert(
            "providerTaskId".to_string(),
            Value::String(provider_task_id.to_string()),
        );
    }
    if let Some(provider_asset_id) = artifact
        .provider_asset_id
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        ai.insert(
            "providerAssetId".to_string(),
            Value::String(provider_asset_id.to_string()),
        );
    }
    if let Some(provider_asset_url) = artifact
        .provider_asset_url
        .as_deref()
        .map(str::trim)
        .filter(|value| !value.is_empty())
    {
        ai.insert(
            "providerAssetUrl".to_string(),
            Value::String(provider_asset_url.to_string()),
        );
    }
    root.insert("ai".to_string(), Value::Object(ai));

    if let Some(metadata) = parse_artifact_metadata(artifact.metadata_json.as_deref())? {
        root.insert("metadata".to_string(), metadata);
    }

    serde_json::to_string(&Value::Object(root)).map_err(|error| {
        DriveServiceError::Internal(format!(
            "serialize generated artifact snapshot failed: {error}"
        ))
    })
}

fn parse_artifact_metadata(raw: Option<&str>) -> Result<Option<Value>, DriveServiceError> {
    let Some(raw) = raw.map(str::trim).filter(|value| !value.is_empty()) else {
        return Ok(None);
    };
    let parsed: Value = serde_json::from_str(raw).map_err(|error| {
        DriveServiceError::Validation(format!("metadata_json must be valid JSON: {error}"))
    })?;
    if parsed.is_object() {
        Ok(Some(parsed))
    } else {
        let mut wrapper = Map::new();
        wrapper.insert("providerPayload".to_string(), parsed);
        Ok(Some(Value::Object(wrapper)))
    }
}

fn drive_object_store_error(error: DriveObjectStoreError) -> DriveServiceError {
    match error.kind {
        DriveObjectStoreErrorKind::NotFound => DriveServiceError::NotFound(error.message),
        DriveObjectStoreErrorKind::Conflict => DriveServiceError::Conflict(error.message),
        DriveObjectStoreErrorKind::PermissionDenied => {
            DriveServiceError::PermissionDenied(error.message)
        }
        DriveObjectStoreErrorKind::InvalidRequest | DriveObjectStoreErrorKind::IntegrityFailed => {
            DriveServiceError::Validation(error.message)
        }
        DriveObjectStoreErrorKind::RateLimited
        | DriveObjectStoreErrorKind::Timeout
        | DriveObjectStoreErrorKind::Unavailable
        | DriveObjectStoreErrorKind::UpstreamError
        | DriveObjectStoreErrorKind::NotSupported
        | DriveObjectStoreErrorKind::Internal => DriveServiceError::Internal(error.message),
    }
}
