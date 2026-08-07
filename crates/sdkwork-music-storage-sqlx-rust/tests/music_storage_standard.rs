use async_trait::async_trait;
use sdkwork_drive_storage_contract::{
    AbortMultipartUploadRequest, CompleteMultipartUploadRequest, CompleteMultipartUploadResponse,
    CopyObjectRequest, CopyObjectResponse, CreateBucketRequest, CreateBucketResponse,
    CreateMultipartUploadRequest, CreateMultipartUploadResponse, DeleteBucketRequest,
    DeleteBucketResponse, DeleteObjectRequest, DeleteObjectResponse, DriveObjectChunkStream,
    DriveObjectStore, DriveObjectStoreError, DriveObjectStoreErrorKind,
    DriveStorageProviderCapabilities, DriveStorageProviderKind, HeadBucketRequest,
    HeadBucketResponse, HeadObjectRequest, HeadObjectResponse, ListBucketsRequest,
    ListBucketsResponse, ListObjectsRequest, ListObjectsResponse, PresignDownloadRequest,
    PresignUploadPartRequest, PresignedDownloadResponse, PresignedUploadPartResponse,
    PutObjectRequest, PutObjectResponse, ReadObjectRangeRequest, ReadObjectRangeResponse,
};
use sdkwork_drive_workspace_service::{
    ports::uploader_store::{
        CompleteDriveStoredUpload, DriveUploaderNodeRecord, DriveUploaderSpaceRecord,
        DriveUploaderStore, NewDriveUploadItem, NewDriveUploadPart, NewDriveUploaderNode,
        NewDriveUploaderSession, NewDriveUploaderSpace,
    },
    uploader::{DriveUploadItem, DriveUploadPart},
    DriveServiceError,
};
use sdkwork_music_storage_sqlx::{
    music_database_tables, music_migration_names, music_storage_capability_manifest,
    ArchiveMusicGeneratedArtifactsCommand, MusicGeneratedArtifactArchiveService,
    MusicGeneratedProviderArtifact,
};
use std::collections::BTreeMap;
use std::sync::{Arc, Mutex};

#[test]
fn music_storage_manifest_declares_complete_music_tables_and_migrations() {
    let manifest = music_storage_capability_manifest();
    assert_eq!(manifest.name, "sdkwork-music-storage-sqlx");
    assert_eq!(manifest.schema_version, "music.storage.v1");
    assert_eq!(music_database_tables(), manifest.tables);
    assert_eq!(music_migration_names(), manifest.migrations);
    assert_eq!(
        manifest.tables,
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
        ],
    );
    assert!(manifest
        .indexes
        .contains(&"idx_music_track_tenant_status_updated"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_audio_asset_tenant_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_chart_entry_chart_rank"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_recommendation_item_shelf_position"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_comment_resource_created"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_content_report_status_created"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_recommendation_feedback_user_created"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_download_entitlement_user_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_playback_session_user_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_search_suggestion_tenant_type"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_style_preset_tenant_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_prompt_template_tenant_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_provider_tenant_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_provider_model_tenant_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_credit_ledger_user_created"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_release_channel_release_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_rights_territory_policy_region"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_task_tenant_status_updated"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_task_provider_external"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_provider_attempt_task"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_provider_event_task_created"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_ai_generation_notification_user_status"));
    assert!(manifest
        .indexes
        .contains(&"idx_music_user_library_user_updated"));
    assert_eq!(manifest.migration_plan[0].name, "0001_music_foundation.sql");
    assert!(manifest.migration_plan[0]
        .sql
        .contains("CREATE TABLE music_track"));
    assert!(manifest.migration_plan[0]
        .sql
        .contains("CREATE TABLE music_ai_generation_provider"));
    assert!(manifest.migration_plan[0]
        .sql
        .contains("CREATE TABLE music_ai_generation_provider_attempt"));
    assert!(manifest.migration_plan[0]
        .sql
        .contains("adapter_id TEXT NOT NULL"));
    assert!(!manifest.migration_plan[0].sql.contains("cloud_router_"));
    assert!(manifest.migration_plan[0]
        .sql
        .contains("CREATE TABLE music_ai_generation_provider_event"));
    assert!(manifest.migration_plan[0]
        .sql
        .contains("UNIQUE (provider_code, external_event_id)"));
    assert!(manifest.migration_plan[0]
        .sql
        .contains("CREATE TABLE music_ai_generation_task"));
    assert!(!manifest.migration_plan[0].sql.contains("source_uri"));
}

#[test]
fn music_storage_repositories_bind_to_music_tables() {
    let manifest = music_storage_capability_manifest();
    let names = manifest
        .repository_bindings
        .iter()
        .map(|binding| binding.repository_name)
        .collect::<Vec<_>>();
    assert_eq!(
        names,
        vec![
            "music.artist.repository",
            "music.album.repository",
            "music.audio_asset.repository",
            "music.track.repository",
            "music.playlist.repository",
            "music.community.repository",
            "music.chart.repository",
            "music.recommendation.repository",
            "music.user_engagement.repository",
            "music.search.repository",
            "music.ai_generation.repository",
            "music.moderation.repository",
            "music.release.repository",
            "music.audit.repository",
        ],
    );
}

#[tokio::test]
async fn generated_artifact_archive_uses_drive_ai_space_and_completes_audio_variants() {

    let object_store = RecordingDriveObjectStore::new();
    let drive_store = InMemoryDriveUploaderStore::new();
    let archive_service = MusicGeneratedArtifactArchiveService::with_object_store(
        drive_store.clone(),
        object_store.clone(),
    );
    let archived = archive_service
        .archive_generated_artifacts(ArchiveMusicGeneratedArtifactsCommand {
            tenant_id: "tenant_archive".to_owned(),
            user_id: Some("user_archive".to_owned()),
            anonymous_id: None,
            task_id: "task_archive".to_owned(),
            provider_code: "suno".to_owned(),
            provider_model: "chirp-v4".to_owned(),
            provider_task_id: Some("provider_task_archive".to_owned()),
            now: "2026-06-06T03:02:00Z".to_owned(),
            now_epoch_ms: 1_780_000_000_000,
            artifacts: vec![
                MusicGeneratedProviderArtifact {
                    id: Some("cover_1".to_owned()),
                    title: "Summer cover".to_owned(),
                    kind: "image".to_owned(),
                    content_type: "image/png".to_owned(),
                    content_length: 4,
                    file_name: "summer-cover.png".to_owned(),
                    checksum_sha256_hex: None,
                    duration_seconds: 0,
                    provider_asset_id: Some("provider_cover_1".to_owned()),
                    provider_asset_url: Some(
                        "https://provider.example/assets/cover_1.png".to_owned(),
                    ),
                    metadata_json: Some(r#"{"seed":42}"#.to_owned()),
                    content: Some(vec![1, 2, 3, 4]),
                },
                MusicGeneratedProviderArtifact {
                    id: Some("preview_1".to_owned()),
                    title: "Summer preview".to_owned(),
                    kind: "audio".to_owned(),
                    content_type: "audio/mpeg".to_owned(),
                    content_length: 13,
                    file_name: "summer-preview.mp3".to_owned(),
                    checksum_sha256_hex: None,
                    duration_seconds: 38,
                    provider_asset_id: Some("provider_preview_1".to_owned()),
                    provider_asset_url: Some(
                        "https://provider.example/assets/preview_1.mp3".to_owned(),
                    ),
                    metadata_json: None,
                    content: Some(b"preview-audio".to_vec()),
                },
            ],
        })
        .await
        .expect("archive generated artifacts to drive");

    assert_eq!(archived.media_resources.len(), 2);
    assert_eq!(archived.variants.len(), 1);
    assert!(archived.media_resources.iter().all(|resource| resource
        .drive_uri
        .starts_with("drive://spaces/space-ai-generated-user-user-archive/nodes/node-")));
    let first_snapshot: serde_json::Value =
        serde_json::from_str(archived.media_resources[0].media_resource_snapshot.as_str())
            .expect("valid snapshot json");
    assert_eq!(first_snapshot["source"], "drive");
    assert_eq!(first_snapshot["kind"], "image");
    assert_eq!(first_snapshot["drive"]["spaceType"], "ai_generated");
    assert_eq!(
        first_snapshot["drive"]["uploadItemId"],
        "music-ai-task_archive-0001"
    );
    assert_eq!(
        first_snapshot["drive"]["uploadSessionId"],
        "session-music-ai-task_archive-0001"
    );
    assert_eq!(
        first_snapshot["drive"]["object"]["bucket"],
        "bucket-drive-generated"
    );
    assert!(first_snapshot["drive"]["object"]["objectKey"]
        .as_str()
        .expect("object key")
        .contains("/source/ai_generated/profile/image/"));
    assert_eq!(
        first_snapshot["drive"]["object"]["uploadStatus"],
        "completed"
    );
    assert_eq!(first_snapshot["ai"]["provenance"], "generated");
    assert_eq!(first_snapshot["ai"]["provider"], "suno");
    assert_eq!(
        first_snapshot["ai"]["providerTaskId"],
        "provider_task_archive"
    );
    assert_eq!(first_snapshot["metadata"]["seed"], 42);
    let variant_snapshot: serde_json::Value = serde_json::from_str(
        archived.variants[0]
            .media_resource_snapshot
            .as_deref()
            .expect("variant snapshot"),
    )
    .expect("valid variant snapshot json");
    assert_eq!(variant_snapshot["kind"], "audio");
    assert_eq!(archived.variants[0].title, "Summer preview");

    let upload_items = drive_store.upload_items();
    assert_eq!(upload_items.len(), 2);
    assert_eq!(
        upload_items[0].app_resource_type,
        "music_ai_generation_artifact"
    );
    assert_eq!(upload_items[0].upload_profile_code, "image");
    assert_eq!(
        upload_items[1].app_resource_type,
        "music_ai_generation_variant"
    );
    assert_eq!(upload_items[1].upload_profile_code, "audio");

    let writes = object_store.put_requests();
    assert_eq!(writes.len(), 2);
    assert_eq!(writes[0].locator.bucket, "bucket-drive-generated");
    assert_eq!(writes[0].content_type.as_deref(), Some("image/png"));
    assert_eq!(writes[0].body, vec![1, 2, 3, 4]);
    assert_eq!(
        writes[0].checksum_sha256_hex.as_deref(),
        Some("sha256:9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a")
    );
    assert_eq!(
        writes[0]
            .metadata
            .get("sdkwork.ai.space_type")
            .map(String::as_str),
        Some("ai_generated")
    );
    assert_eq!(
        writes[0]
            .metadata
            .get("sdkwork.music.task_id")
            .map(String::as_str),
        Some("task_archive")
    );
    assert_eq!(writes[1].content_type.as_deref(), Some("audio/mpeg"));
    assert_eq!(writes[1].body, b"preview-audio".to_vec());
    assert_eq!(
        writes[1].checksum_sha256_hex.as_deref(),
        Some("sha256:621259154bbec3af9b9e60b070fd25113c337b0e2fd9816defc291c4c93684e7")
    );

    let completed_uploads = drive_store.completions();
    assert_eq!(completed_uploads.len(), 2);
    assert_eq!(
        completed_uploads[0].upload_item_id,
        "music-ai-task_archive-0001"
    );
    assert_eq!(completed_uploads[0].content_type, "image/png");
    assert_eq!(completed_uploads[0].content_length, 4);
    assert_eq!(
        completed_uploads[0].checksum_sha256_hex,
        "sha256:9f64a747e1b97f131fabb6b447296c9b6f0201e79fb3c5356e6c77e89b6a806a"
    );
    assert_eq!(
        completed_uploads[1].upload_item_id,
        "music-ai-task_archive-0002"
    );
    assert_eq!(completed_uploads[1].content_type, "audio/mpeg");
    assert_eq!(completed_uploads[1].content_length, 13);
    assert_eq!(
        completed_uploads[1].checksum_sha256_hex,
        "sha256:621259154bbec3af9b9e60b070fd25113c337b0e2fd9816defc291c4c93684e7"
    );
}

#[derive(Clone, Default)]
struct InMemoryDriveUploaderStore {
    state: Arc<Mutex<InMemoryDriveUploaderState>>,
}

#[derive(Default)]
struct InMemoryDriveUploaderState {
    spaces: BTreeMap<(String, String, String, String), String>,
    items: BTreeMap<(String, String), DriveUploadItem>,
    upload_sessions: BTreeMap<String, (String, String)>,
    completions: Vec<CompleteDriveStoredUpload>,
}

impl InMemoryDriveUploaderStore {
    fn new() -> Self {
        Self::default()
    }

    fn completions(&self) -> Vec<CompleteDriveStoredUpload> {
        self.state.lock().expect("drive state").completions.clone()
    }

    fn upload_items(&self) -> Vec<DriveUploadItem> {
        self.state
            .lock()
            .expect("drive state")
            .items
            .values()
            .cloned()
            .collect()
    }
}

#[derive(Clone, Default)]
struct RecordingDriveObjectStore {
    state: Arc<Mutex<RecordingDriveObjectStoreState>>,
}

#[derive(Default)]
struct RecordingDriveObjectStoreState {
    puts: Vec<PutObjectRequest>,
}

impl RecordingDriveObjectStore {
    fn new() -> Self {
        Self::default()
    }

    fn put_requests(&self) -> Vec<PutObjectRequest> {
        self.state.lock().expect("object store state").puts.clone()
    }
}

fn unsupported_object_store_operation() -> DriveObjectStoreError {
    DriveObjectStoreError::new(
        DriveObjectStoreErrorKind::NotSupported,
        "operation is not required by the music archive test",
    )
}

#[async_trait]
impl DriveObjectStore for RecordingDriveObjectStore {
    fn provider_kind(&self) -> DriveStorageProviderKind {
        DriveStorageProviderKind::LocalFilesystem
    }

    fn capabilities(&self) -> DriveStorageProviderCapabilities {
        DriveStorageProviderCapabilities::default_local_filesystem()
    }

    async fn put_object(
        &self,
        request: PutObjectRequest,
    ) -> Result<PutObjectResponse, DriveObjectStoreError> {
        let response = PutObjectResponse {
            locator: request.locator.clone(),
            etag: Some("etag-recorded".to_owned()),
            version_id: Some("version-recorded".to_owned()),
        };
        self.state
            .lock()
            .expect("object store state")
            .puts
            .push(request);
        Ok(response)
    }

    async fn head_object(
        &self,
        request: HeadObjectRequest,
    ) -> Result<HeadObjectResponse, DriveObjectStoreError> {
        let state = self.state.lock().expect("object store state");
        let Some(put) = state.puts.iter().find(|put| put.locator == request.locator) else {
            return Err(DriveObjectStoreError::new(
                DriveObjectStoreErrorKind::NotFound,
                "object not found",
            ));
        };
        Ok(HeadObjectResponse {
            locator: request.locator,
            content_length: put.body.len() as u64,
            content_type: put.content_type.clone(),
            etag: Some("etag-recorded".to_owned()),
            version_id: Some("version-recorded".to_owned()),
            checksum_sha256_hex: put.checksum_sha256_hex.clone(),
            metadata: put.metadata.clone(),
        })
    }

    async fn delete_object(
        &self,
        _request: DeleteObjectRequest,
    ) -> Result<DeleteObjectResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn head_bucket(
        &self,
        request: HeadBucketRequest,
    ) -> Result<HeadBucketResponse, DriveObjectStoreError> {
        Ok(HeadBucketResponse {
            bucket: request.bucket,
            exists: true,
        })
    }

    async fn list_buckets(
        &self,
        _request: ListBucketsRequest,
    ) -> Result<ListBucketsResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn create_bucket(
        &self,
        request: CreateBucketRequest,
    ) -> Result<CreateBucketResponse, DriveObjectStoreError> {
        Ok(CreateBucketResponse {
            bucket: request.bucket,
            created: false,
        })
    }

    async fn delete_bucket(
        &self,
        _request: DeleteBucketRequest,
    ) -> Result<DeleteBucketResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn list_objects(
        &self,
        _request: ListObjectsRequest,
    ) -> Result<ListObjectsResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn copy_object(
        &self,
        _request: CopyObjectRequest,
    ) -> Result<CopyObjectResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn create_multipart_upload(
        &self,
        _request: CreateMultipartUploadRequest,
    ) -> Result<CreateMultipartUploadResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn presign_upload_part(
        &self,
        _request: PresignUploadPartRequest,
    ) -> Result<PresignedUploadPartResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn complete_multipart_upload(
        &self,
        _request: CompleteMultipartUploadRequest,
    ) -> Result<CompleteMultipartUploadResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn abort_multipart_upload(
        &self,
        _request: AbortMultipartUploadRequest,
    ) -> Result<(), DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn presign_download(
        &self,
        _request: PresignDownloadRequest,
    ) -> Result<PresignedDownloadResponse, DriveObjectStoreError> {
        Err(unsupported_object_store_operation())
    }

    async fn read_object_range(
        &self,
        _request: ReadObjectRangeRequest,
    ) -> Result<(ReadObjectRangeResponse, Box<dyn DriveObjectChunkStream>), DriveObjectStoreError>
    {
        Err(unsupported_object_store_operation())
    }
}

#[async_trait]
impl DriveUploaderStore for InMemoryDriveUploaderStore {
    async fn find_upload_space(
        &self,
        tenant_id: &str,
        owner_subject_type: &str,
        owner_subject_id: &str,
        space_type: &str,
    ) -> Result<Option<String>, DriveServiceError> {
        let state = self.state.lock().expect("drive state");
        Ok(state
            .spaces
            .get(&(
                tenant_id.to_owned(),
                owner_subject_type.to_owned(),
                owner_subject_id.to_owned(),
                space_type.to_owned(),
            ))
            .cloned())
    }

    async fn insert_upload_space(
        &self,
        space: &NewDriveUploaderSpace,
    ) -> Result<String, DriveServiceError> {
        let mut state = self.state.lock().expect("drive state");
        state.spaces.insert(
            (
                space.tenant_id.clone(),
                space.owner_subject_type.clone(),
                space.owner_subject_id.clone(),
                space.space_type.clone(),
            ),
            space.id.clone(),
        );
        Ok(space.id.clone())
    }

    async fn live_node_name_exists_in_parent(
        &self,
        tenant_id: &str,
        space_id: &str,
        parent_node_id: Option<&str>,
        node_name: &str,
    ) -> Result<bool, DriveServiceError> {
        let state = self.state.lock().expect("drive state");
        Ok(state.items.values().any(|item| {
            item.tenant_id == tenant_id
                && item.space_id == space_id
                && parent_node_id.is_none()
                && item.original_file_name == node_name
        }))
    }

    async fn find_active_space(
        &self,
        tenant_id: &str,
        space_id: &str,
    ) -> Result<Option<DriveUploaderSpaceRecord>, DriveServiceError> {
        let state = self.state.lock().expect("drive state");
        Ok(state
            .spaces
            .iter()
            .find(|((stored_tenant_id, _, _, _), stored_space_id)| {
                stored_tenant_id == tenant_id && stored_space_id.as_str() == space_id
            })
            .map(
                |(
                    (stored_tenant_id, owner_subject_type, owner_subject_id, space_type),
                    stored_space_id,
                )| {
                    DriveUploaderSpaceRecord {
                        id: stored_space_id.clone(),
                        tenant_id: stored_tenant_id.clone(),
                        owner_subject_type: owner_subject_type.clone(),
                        owner_subject_id: owner_subject_id.clone(),
                        space_type: space_type.clone(),
                    }
                },
            ))
    }

    async fn find_active_node(
        &self,
        tenant_id: &str,
        node_id: &str,
    ) -> Result<Option<DriveUploaderNodeRecord>, DriveServiceError> {
        let state = self.state.lock().expect("drive state");
        Ok(state
            .items
            .values()
            .find(|item| item.tenant_id == tenant_id && item.node_id == node_id)
            .map(|item| DriveUploaderNodeRecord {
                id: item.node_id.clone(),
                tenant_id: item.tenant_id.clone(),
                space_id: item.space_id.clone(),
                parent_node_id: None,
                node_type: "file".to_owned(),
            }))
    }

    async fn has_writer_permission(
        &self,
        _tenant_id: &str,
        _node_id: &str,
        _subject_type: &str,
        _subject_id: &str,
    ) -> Result<bool, DriveServiceError> {
        Ok(false)
    }

    async fn has_writer_share_token(
        &self,
        _tenant_id: &str,
        _node_id: &str,
        _token_hash: &str,
        _now_epoch_ms: i64,
    ) -> Result<bool, DriveServiceError> {
        Ok(false)
    }

    async fn insert_upload_node(
        &self,
        node: &NewDriveUploaderNode,
    ) -> Result<String, DriveServiceError> {
        Ok(node.id.clone())
    }

    async fn insert_upload_session(
        &self,
        session: &NewDriveUploaderSession,
    ) -> Result<String, DriveServiceError> {
        let mut state = self.state.lock().expect("drive state");
        state.upload_sessions.insert(
            format!("{}:{}", session.tenant_id, session.id),
            (session.bucket.clone(), session.object_key.clone()),
        );
        Ok(session.id.clone())
    }

    async fn find_default_storage_provider(
        &self,
        _tenant_id: &str,
    ) -> Result<Option<(String, String)>, DriveServiceError> {
        Ok(Some((
            "provider-drive-generated".to_owned(),
            "bucket-drive-generated".to_owned(),
        )))
    }

    async fn insert_upload_item(
        &self,
        item: &NewDriveUploadItem,
    ) -> Result<DriveUploadItem, DriveServiceError> {
        let mut state = self.state.lock().expect("drive state");
        let upload_item = DriveUploadItem {
            id: item.id.clone(),
            task_id: item.task_id.clone(),
            tenant_id: item.tenant_id.clone(),
            organization_id: item.organization_id.clone(),
            user_id: item.user_id.clone(),
            actor_type: item.actor_type.clone(),
            actor_id: item.actor_id.clone(),
            app_id: item.app_id.clone(),
            app_resource_type: item.app_resource_type.clone(),
            app_resource_id: item.app_resource_id.clone(),
            scene: item.scene.clone(),
            source: item.source.clone(),
            upload_profile_code: item.upload_profile_code.clone(),
            file_fingerprint: item.file_fingerprint.clone(),
            space_id: item.space_id.clone(),
            node_id: item.node_id.clone(),
            upload_session_id: item.upload_session_id.clone(),
            storage_provider_id: item.storage_provider_id.clone(),
            storage_upload_id: item.storage_upload_id.clone(),
            object_bucket: item.upload_session_id.as_ref().and_then(|session_id| {
                state
                    .upload_sessions
                    .get(&format!("{}:{session_id}", item.tenant_id))
                    .map(|(bucket, _)| bucket.clone())
            }),
            object_key: item.upload_session_id.as_ref().and_then(|session_id| {
                state
                    .upload_sessions
                    .get(&format!("{}:{session_id}", item.tenant_id))
                    .map(|(_, object_key)| object_key.clone())
            }),
            original_file_name: item.original_file_name.clone(),
            file_extension: item.file_extension.clone(),
            content_type: item.content_type.clone(),
            content_type_group: item.content_type_group.clone(),
            detected_content_type: item.detected_content_type.clone(),
            content_length: item.content_length,
            checksum_sha256_hex: item.checksum_sha256_hex.clone(),
            chunk_size_bytes: item.chunk_size_bytes,
            total_parts: item.total_parts,
            uploaded_parts_count: 0,
            uploaded_bytes: 0,
            status: item.status.clone(),
            retention_mode: item.retention_mode.clone(),
            retention_expires_at_epoch_ms: item.retention_expires_at_epoch_ms,
            cleanup_action: item.cleanup_action.clone(),
            hard_delete_after_epoch_ms: item.hard_delete_after_epoch_ms,
            cleanup_status: "not_required".to_owned(),
            post_process_status: "not_required".to_owned(),
        };
        state.items.insert(
            (upload_item.tenant_id.clone(), upload_item.task_id.clone()),
            upload_item.clone(),
        );
        Ok(upload_item)
    }

    async fn find_upload_item_by_task(
        &self,
        tenant_id: &str,
        task_id: &str,
    ) -> Result<Option<DriveUploadItem>, DriveServiceError> {
        let state = self.state.lock().expect("drive state");
        Ok(state
            .items
            .get(&(tenant_id.to_owned(), task_id.to_owned()))
            .cloned())
    }

    async fn record_uploaded_part(
        &self,
        part: &NewDriveUploadPart,
    ) -> Result<DriveUploadPart, DriveServiceError> {
        Ok(DriveUploadPart {
            id: part.id.clone(),
            tenant_id: part.tenant_id.clone(),
            upload_item_id: part.upload_item_id.clone(),
            upload_session_id: part.upload_session_id.clone(),
            part_no: part.part_no,
            offset_bytes: part.offset_bytes,
            size_bytes: part.size_bytes,
            etag: part.etag.clone(),
            checksum_sha256_hex: part.checksum_sha256_hex.clone(),
            status: "uploaded".to_owned(),
            retry_count: 0,
            uploaded_at_epoch_ms: Some(part.uploaded_at_epoch_ms),
        })
    }

    async fn complete_stored_upload(
        &self,
        completion: &CompleteDriveStoredUpload,
    ) -> Result<DriveUploadItem, DriveServiceError> {
        let mut state = self.state.lock().expect("drive state");
        let Some(item) = state.items.values_mut().find(|item| {
            item.tenant_id == completion.tenant_id
                && item.id == completion.upload_item_id
                && item.upload_session_id.as_deref() == Some(completion.upload_session_id.as_str())
        }) else {
            return Err(DriveServiceError::NotFound(
                "upload item not found".to_owned(),
            ));
        };
        if item.content_type != completion.content_type
            || item.content_length != completion.content_length
        {
            return Err(DriveServiceError::Conflict(
                "completion does not match prepared upload item".to_owned(),
            ));
        }
        item.status = "completed".to_owned();
        item.checksum_sha256_hex = Some(completion.checksum_sha256_hex.clone());
        item.uploaded_bytes = completion.content_length;
        item.uploaded_parts_count = completion.uploaded_parts_count;
        let completed = item.clone();
        state.completions.push(completion.clone());
        Ok(completed)
    }

    async fn quarantine_blocked_upload_content(
        &self,
        _tenant_id: &str,
        _upload_item_id: &str,
        _operator_id: &str,
    ) -> Result<(), DriveServiceError> {
        Ok(())
    }
}
