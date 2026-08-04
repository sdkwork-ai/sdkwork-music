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
    MusicGeneratedProviderArtifact, NewMusicAiGenerationProject, NewMusicAiGenerationProvider,
    NewMusicAiGenerationProviderAttempt, NewMusicAiGenerationProviderEvent,
    NewMusicAiGenerationProviderModel, NewMusicAiGenerationTask, NewMusicAiGenerationVariant,
    NewMusicAiPromptTemplate, NewMusicAiStylePreset, NewMusicAlbum, NewMusicArtist,
    NewMusicAudioAsset, NewMusicChart, NewMusicChartEntry, NewMusicComment, NewMusicContentReport,
    NewMusicDownloadEntitlement, NewMusicLibraryItem, NewMusicListeningEvent,
    NewMusicPlaybackSession, NewMusicPlaylist, NewMusicRecommendationFeedback,
    NewMusicRecommendationItem, NewMusicRecommendationShelf, NewMusicReleaseChannel,
    NewMusicRightsTerritory, NewMusicSearchSuggestion, NewMusicTrack, SqliteMusicStore,
};
use sqlx::sqlite::SqlitePoolOptions;
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
async fn sqlite_music_store_records_ai_generation_provider_events_idempotently() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .expect("sqlite pool");
    let store = SqliteMusicStore::new(pool.clone());
    store.migrate().await.expect("music migration");

    store
        .upsert_ai_generation_provider(NewMusicAiGenerationProvider {
            id: "provider_1".to_owned(),
            tenant_id: "100001".to_owned(),
            provider_code: "suno".to_owned(),
            display_name: "Suno Music".to_owned(),
            adapter_id: "sdkwork-music-generation-provider-adapter".to_owned(),
            capability: "text_to_music".to_owned(),
            invocation_mode: "hybrid".to_owned(),
            supports_polling: true,
            supports_webhook: true,
            status: "active".to_owned(),
            config_snapshot: Some(
                r#"{"adapterId":"sdkwork-music-generation-provider-adapter","vendor":"suno","parameterSchema":"suno.music-generation.v1"}"#.to_owned(),
            ),
            now: "2026-06-06T03:00:00Z".to_owned(),
        })
        .await
        .expect("upsert provider");
    store
        .upsert_ai_generation_provider_model(NewMusicAiGenerationProviderModel {
            id: "provider_model_1".to_owned(),
            tenant_id: "100001".to_owned(),
            provider_id: "provider_1".to_owned(),
            provider_code: "suno".to_owned(),
            model_name: "suno-v1".to_owned(),
            display_name: "Suno v1".to_owned(),
            capability: "text_to_music".to_owned(),
            min_duration_seconds: 15,
            max_duration_seconds: 240,
            max_variant_count: 4,
            supported_formats: vec!["audio/mpeg".to_owned(), "audio/wav".to_owned()],
            supported_style_tags: vec!["pop".to_owned(), "cinematic".to_owned()],
            pricing_unit: "music_output_second".to_owned(),
            status: "active".to_owned(),
            now: "2026-06-06T03:01:00Z".to_owned(),
        })
        .await
        .expect("upsert provider model");
    store
        .create_ai_generation_project(NewMusicAiGenerationProject {
            id: "project_provider".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: "user_1".to_owned(),
            title: "Provider Campaign".to_owned(),
            visibility: "private".to_owned(),
            now: "2026-06-06T03:02:00Z".to_owned(),
        })
        .await
        .expect("create project");
    store
        .create_ai_generation_task(NewMusicAiGenerationTask {
            id: "task_provider".to_owned(),
            tenant_id: "100001".to_owned(),
            project_id: Some("project_provider".to_owned()),
            user_id: "user_1".to_owned(),
            prompt: "professional synth pop hook with a clean vocal lead".to_owned(),
            lyrics_prompt: Some("write a chorus about sunrise in the city".to_owned()),
            style_tags: vec!["synth-pop".to_owned(), "vocal".to_owned()],
            model_provider: "suno".to_owned(),
            model_name: "suno-v1".to_owned(),
            reference_drive_uri: None,
            now: "2026-06-06T03:03:00Z".to_owned(),
        })
        .await
        .expect("create task");
    store
        .create_ai_generation_provider_attempt(NewMusicAiGenerationProviderAttempt {
            id: "attempt_1".to_owned(),
            tenant_id: "100001".to_owned(),
            task_id: "task_provider".to_owned(),
            provider_id: "provider_1".to_owned(),
            provider_code: "suno".to_owned(),
            model_name: "suno-v1".to_owned(),
            invocation_mode: "hybrid".to_owned(),
            adapter_id: "sdkwork-music-generation-provider-adapter".to_owned(),
            provider_request_id: Some("provider_request_1".to_owned()),
            external_task_id: Some("external_task_1".to_owned()),
            status: "submitted".to_owned(),
            provider_status: Some("queued".to_owned()),
            request_snapshot: Some(r#"{"prompt":"professional synth pop hook"}"#.to_owned()),
            response_snapshot: Some(r#"{"provider":{"taskId":"external_task_1"}}"#.to_owned()),
            now: "2026-06-06T03:04:00Z".to_owned(),
        })
        .await
        .expect("create attempt");
    let provider_adapter_id: String =
        sqlx::query_scalar("SELECT adapter_id FROM music_ai_generation_provider WHERE id = ?")
            .bind("provider_1")
            .fetch_one(&pool)
            .await
            .expect("provider adapter binding");
    assert_eq!(
        provider_adapter_id,
        "sdkwork-music-generation-provider-adapter"
    );

    let attempt_binding: (String, Option<String>) = sqlx::query_as(
        "SELECT adapter_id, provider_request_id FROM music_ai_generation_provider_attempt WHERE id = ?",
    )
    .bind("attempt_1")
    .fetch_one(&pool)
    .await
    .expect("attempt provider binding");
    assert_eq!(
        attempt_binding.0,
        "sdkwork-music-generation-provider-adapter"
    );
    assert_eq!(attempt_binding.1.as_deref(), Some("provider_request_1"));

    let first_insert = store
        .record_ai_generation_provider_event(NewMusicAiGenerationProviderEvent {
            id: "event_running".to_owned(),
            tenant_id: "100001".to_owned(),
            task_id: "task_provider".to_owned(),
            attempt_id: Some("attempt_1".to_owned()),
            provider_code: "suno".to_owned(),
            external_task_id: Some("external_task_1".to_owned()),
            external_event_id: Some("evt_1".to_owned()),
            event_type: "task.status".to_owned(),
            source: "webhook".to_owned(),
            provider_status: "running".to_owned(),
            payload_hash: "hash_evt_1".to_owned(),
            payload_snapshot: r#"{"status":"running"}"#.to_owned(),
            has_outputs: false,
            now: "2026-06-06T03:05:00Z".to_owned(),
        })
        .await
        .expect("record first event");
    let duplicate_insert = store
        .record_ai_generation_provider_event(NewMusicAiGenerationProviderEvent {
            id: "event_running_duplicate".to_owned(),
            tenant_id: "100001".to_owned(),
            task_id: "task_provider".to_owned(),
            attempt_id: Some("attempt_1".to_owned()),
            provider_code: "suno".to_owned(),
            external_task_id: Some("external_task_1".to_owned()),
            external_event_id: Some("evt_1".to_owned()),
            event_type: "task.status".to_owned(),
            source: "webhook".to_owned(),
            provider_status: "running".to_owned(),
            payload_hash: "hash_evt_1".to_owned(),
            payload_snapshot: r#"{"status":"running"}"#.to_owned(),
            has_outputs: false,
            now: "2026-06-06T03:06:00Z".to_owned(),
        })
        .await
        .expect("record duplicate event");
    assert!(first_insert);
    assert!(!duplicate_insert);

    let success_insert = store
        .record_ai_generation_provider_event(NewMusicAiGenerationProviderEvent {
            id: "event_success".to_owned(),
            tenant_id: "100001".to_owned(),
            task_id: "task_provider".to_owned(),
            attempt_id: Some("attempt_1".to_owned()),
            provider_code: "suno".to_owned(),
            external_task_id: Some("external_task_1".to_owned()),
            external_event_id: Some("evt_2".to_owned()),
            event_type: "task.completed".to_owned(),
            source: "poll".to_owned(),
            provider_status: "succeeded".to_owned(),
            payload_hash: "hash_evt_2".to_owned(),
            payload_snapshot: r#"{"status":"succeeded","artifacts":[{"kind":"audio"}]}"#.to_owned(),
            has_outputs: true,
            now: "2026-06-06T03:07:00Z".to_owned(),
        })
        .await
        .expect("record success event");
    assert!(success_insert);

    let stale_running_insert = store
        .record_ai_generation_provider_event(NewMusicAiGenerationProviderEvent {
            id: "event_stale".to_owned(),
            tenant_id: "100001".to_owned(),
            task_id: "task_provider".to_owned(),
            attempt_id: Some("attempt_1".to_owned()),
            provider_code: "suno".to_owned(),
            external_task_id: Some("external_task_1".to_owned()),
            external_event_id: Some("evt_3".to_owned()),
            event_type: "task.status".to_owned(),
            source: "poll".to_owned(),
            provider_status: "running".to_owned(),
            payload_hash: "hash_evt_3".to_owned(),
            payload_snapshot: r#"{"status":"running"}"#.to_owned(),
            has_outputs: false,
            now: "2026-06-06T03:08:00Z".to_owned(),
        })
        .await
        .expect("record stale event");
    assert!(stale_running_insert);

    let tasks = store
        .list_ai_generation_tasks("100001", Some("user_1"))
        .await
        .expect("AI tasks");
    assert_eq!(tasks[0].status, "succeeded");
    assert_eq!(tasks[0].provider_code.as_deref(), Some("suno"));
    assert_eq!(
        tasks[0].external_task_id.as_deref(),
        Some("external_task_1")
    );
    assert_eq!(tasks[0].provider_output_count, 1);

    let events = store
        .list_ai_generation_provider_events("100001", "task_provider")
        .await
        .expect("provider events");
    assert_eq!(events.len(), 3);
    assert_eq!(events[0].status_after, "succeeded");

    let notifications = store
        .list_ai_generation_notifications("100001", "user_1")
        .await
        .expect("notifications");
    assert_eq!(notifications.len(), 1);
    assert_eq!(
        notifications[0].notification_type,
        "ai_generation_succeeded"
    );
    assert_eq!(notifications[0].status, "unread");
}

#[tokio::test]
async fn sqlite_music_store_migrates_creates_publishes_and_reads_music() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .expect("sqlite pool");
    let store = SqliteMusicStore::new(pool);
    store.migrate().await.expect("music migration");

    store
        .create_artist(NewMusicArtist {
            id: "artist_1".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "studio-band".to_owned(),
            name: "Studio Band".to_owned(),
            bio: Some("Internal music production team".to_owned()),
            now: "2026-06-06T00:00:00Z".to_owned(),
        })
        .await
        .expect("create artist");
    store
        .create_album(NewMusicAlbum {
            id: "album_1".to_owned(),
            tenant_id: "100001".to_owned(),
            artist_id: "artist_1".to_owned(),
            slug: "launch-pack".to_owned(),
            title: "Launch Pack".to_owned(),
            release_date: Some("2026-06-06".to_owned()),
            now: "2026-06-06T00:01:00Z".to_owned(),
        })
        .await
        .expect("create album");
    store
        .create_audio_asset(NewMusicAudioAsset {
            id: "asset_1".to_owned(),
            tenant_id: "100001".to_owned(),
            title: "Launch Theme WAV".to_owned(),
            drive_space_id: "space_music".to_owned(),
            drive_node_id: "node_asset_1".to_owned(),
            drive_uri: "drive://spaces/space_music/nodes/node_asset_1".to_owned(),
            media_resource_id: Some("node_asset_1".to_owned()),
            media_resource_snapshot: Some(r#"{"kind":"audio","source":"drive"}"#.to_owned()),
            mime_type: "audio/wav".to_owned(),
            duration_seconds: 142,
            checksum_algorithm: Some("sha256".to_owned()),
            checksum_value: Some("checksum-1".to_owned()),
            status: "ready".to_owned(),
            now: "2026-06-06T00:02:00Z".to_owned(),
        })
        .await
        .expect("create audio asset");
    store
        .create_track(NewMusicTrack {
            id: "track_1".to_owned(),
            tenant_id: "100001".to_owned(),
            artist_id: "artist_1".to_owned(),
            album_id: Some("album_1".to_owned()),
            audio_asset_id: Some("asset_1".to_owned()),
            slug: "launch-theme".to_owned(),
            title: "Launch Theme".to_owned(),
            duration_seconds: 142,
            tags: vec!["launch".to_owned(), "theme".to_owned()],
            now: "2026-06-06T00:03:00Z".to_owned(),
        })
        .await
        .expect("create track");
    store
        .create_playlist(NewMusicPlaylist {
            id: "playlist_1".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "release-music".to_owned(),
            title: "Release Music".to_owned(),
            description: Some("Launch ready tracks".to_owned()),
            track_ids: vec!["track_1".to_owned()],
            now: "2026-06-06T00:04:00Z".to_owned(),
        })
        .await
        .expect("create playlist");

    assert!(store
        .list_published_tracks("100001", None)
        .await
        .expect("draft list")
        .is_empty());

    store
        .publish_track("100001", "track_1", "user_editor", "2026-06-06T00:05:00Z")
        .await
        .expect("publish track");

    let tracks = store
        .list_published_tracks("100001", Some("theme"))
        .await
        .expect("published tracks");
    assert_eq!(tracks.len(), 1);
    assert_eq!(tracks[0].slug, "launch-theme");
    assert_eq!(tracks[0].artist_name, "Studio Band");
    assert_eq!(tracks[0].album_title.as_deref(), Some("Launch Pack"));
    assert_eq!(tracks[0].tags, vec!["launch", "theme"]);

    let playlist = store
        .retrieve_playlist("100001", "release-music")
        .await
        .expect("retrieve playlist")
        .expect("playlist");
    assert_eq!(playlist.track_ids, vec!["track_1"]);
}

#[tokio::test]
async fn sqlite_music_store_supports_app_discovery_library_and_ai_generation_workflows() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .expect("sqlite pool");
    let store = SqliteMusicStore::new(pool);
    store.migrate().await.expect("music migration");

    store
        .create_artist(NewMusicArtist {
            id: "artist_ai".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "ai-studio".to_owned(),
            name: "AI Studio".to_owned(),
            bio: None,
            now: "2026-06-06T01:00:00Z".to_owned(),
        })
        .await
        .expect("create artist");
    store
        .create_audio_asset(NewMusicAudioAsset {
            id: "asset_ai".to_owned(),
            tenant_id: "100001".to_owned(),
            title: "City Pop Master".to_owned(),
            drive_space_id: "space_ai".to_owned(),
            drive_node_id: "node_ai".to_owned(),
            drive_uri: "drive://spaces/space_ai/nodes/node_ai".to_owned(),
            media_resource_id: Some("node_ai".to_owned()),
            media_resource_snapshot: Some(
                r#"{"kind":"audio","source":"drive","ai":{"provenance":"generated"}}"#.to_owned(),
            ),
            mime_type: "audio/mpeg".to_owned(),
            duration_seconds: 188,
            checksum_algorithm: Some("sha256".to_owned()),
            checksum_value: Some("checksum-ai".to_owned()),
            status: "ready".to_owned(),
            now: "2026-06-06T01:01:00Z".to_owned(),
        })
        .await
        .expect("create audio asset");
    store
        .create_track(NewMusicTrack {
            id: "track_ai".to_owned(),
            tenant_id: "100001".to_owned(),
            artist_id: "artist_ai".to_owned(),
            album_id: None,
            audio_asset_id: Some("asset_ai".to_owned()),
            slug: "neon-commute".to_owned(),
            title: "Neon Commute".to_owned(),
            duration_seconds: 188,
            tags: vec!["city pop".to_owned(), "ai".to_owned()],
            now: "2026-06-06T01:02:00Z".to_owned(),
        })
        .await
        .expect("create track");
    store
        .publish_track("100001", "track_ai", "editor_1", "2026-06-06T01:03:00Z")
        .await
        .expect("publish track");

    store
        .create_chart(NewMusicChart {
            id: "chart_daily".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "daily-hot".to_owned(),
            title: "Daily Hot".to_owned(),
            chart_type: "daily".to_owned(),
            status: "active".to_owned(),
            now: "2026-06-06T01:04:00Z".to_owned(),
        })
        .await
        .expect("create chart");
    store
        .add_chart_entry(NewMusicChartEntry {
            id: "chart_entry_1".to_owned(),
            tenant_id: "100001".to_owned(),
            chart_id: "chart_daily".to_owned(),
            track_id: "track_ai".to_owned(),
            rank: 1,
            score: 9860,
            now: "2026-06-06T01:05:00Z".to_owned(),
        })
        .await
        .expect("add chart entry");

    store
        .create_recommendation_shelf(NewMusicRecommendationShelf {
            id: "shelf_home".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "for-you".to_owned(),
            title: "For You".to_owned(),
            shelf_type: "personalized".to_owned(),
            status: "active".to_owned(),
            now: "2026-06-06T01:06:00Z".to_owned(),
        })
        .await
        .expect("create shelf");
    store
        .add_recommendation_item(NewMusicRecommendationItem {
            id: "shelf_item_1".to_owned(),
            tenant_id: "100001".to_owned(),
            shelf_id: "shelf_home".to_owned(),
            item_type: "track".to_owned(),
            item_id: "track_ai".to_owned(),
            position: 0,
            reason_code: Some("fresh_ai_music".to_owned()),
            now: "2026-06-06T01:07:00Z".to_owned(),
        })
        .await
        .expect("add shelf item");

    store
        .save_library_item(NewMusicLibraryItem {
            id: "library_1".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: "user_1".to_owned(),
            item_type: "track".to_owned(),
            item_id: "track_ai".to_owned(),
            source: "favorite".to_owned(),
            now: "2026-06-06T01:08:00Z".to_owned(),
        })
        .await
        .expect("save library item");
    store
        .record_listening_event(NewMusicListeningEvent {
            id: "play_1".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: Some("user_1".to_owned()),
            track_id: "track_ai".to_owned(),
            duration_seconds: 188,
            played_seconds: 180,
            completion_rate: 95,
            source: Some("home_shelf".to_owned()),
            occurred_at: "2026-06-06T01:09:00Z".to_owned(),
        })
        .await
        .expect("record listening event");

    let chart_entries = store
        .list_chart_entries("100001", "chart_daily")
        .await
        .expect("chart entries");
    assert_eq!(chart_entries.len(), 1);
    assert_eq!(chart_entries[0].rank, 1);
    assert_eq!(chart_entries[0].track_title, "Neon Commute");

    let shelves = store
        .list_home_shelves("100001")
        .await
        .expect("home shelves");
    assert_eq!(shelves.len(), 1);
    assert_eq!(shelves[0].items.len(), 1);
    assert_eq!(
        shelves[0].items[0].reason_code.as_deref(),
        Some("fresh_ai_music")
    );

    let library = store
        .list_library_items("100001", "user_1")
        .await
        .expect("library items");
    assert_eq!(library.len(), 1);
    assert_eq!(library[0].item_id, "track_ai");

    let history = store
        .list_listening_history("100001", "user_1")
        .await
        .expect("listening history");
    assert_eq!(history.len(), 1);
    assert_eq!(history[0].play_count, 1);

    store
        .create_ai_generation_project(NewMusicAiGenerationProject {
            id: "project_1".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: "user_1".to_owned(),
            title: "City Pop Campaign".to_owned(),
            visibility: "private".to_owned(),
            now: "2026-06-06T01:10:00Z".to_owned(),
        })
        .await
        .expect("create AI project");
    store
        .create_ai_generation_task(NewMusicAiGenerationTask {
            id: "task_1".to_owned(),
            tenant_id: "100001".to_owned(),
            project_id: Some("project_1".to_owned()),
            user_id: "user_1".to_owned(),
            prompt: "city pop song for a late subway ride".to_owned(),
            lyrics_prompt: Some("short chorus about neon rain".to_owned()),
            style_tags: vec!["city-pop".to_owned(), "synth".to_owned()],
            model_provider: "sdkwork-ai".to_owned(),
            model_name: "music-v1".to_owned(),
            reference_drive_uri: Some("drive://spaces/space_ai/nodes/reference_1".to_owned()),
            now: "2026-06-06T01:11:00Z".to_owned(),
        })
        .await
        .expect("create AI task");
    store
        .complete_ai_generation_task(NewMusicAiGenerationVariant {
            id: "variant_1".to_owned(),
            tenant_id: "100001".to_owned(),
            task_id: "task_1".to_owned(),
            audio_asset_id: Some("asset_ai".to_owned()),
            title: "Neon Commute v1".to_owned(),
            drive_uri: "drive://spaces/space_ai/nodes/node_ai".to_owned(),
            media_resource_snapshot: Some(
                r#"{"kind":"audio","source":"drive","ai":{"provenance":"generated"}}"#.to_owned(),
            ),
            duration_seconds: 188,
            moderation_status: "approved".to_owned(),
            now: "2026-06-06T01:12:00Z".to_owned(),
        })
        .await
        .expect("complete AI task");

    let tasks = store
        .list_ai_generation_tasks("100001", Some("user_1"))
        .await
        .expect("AI tasks");
    assert_eq!(tasks.len(), 1);
    assert_eq!(tasks[0].status, "succeeded");
    assert_eq!(tasks[0].variant_count, 1);
}

#[tokio::test]
async fn sqlite_music_store_supports_social_playback_search_and_rights_workflows() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .expect("sqlite pool");
    let store = SqliteMusicStore::new(pool);
    store.migrate().await.expect("music migration");

    store
        .create_artist(NewMusicArtist {
            id: "artist_social".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "social-band".to_owned(),
            name: "Social Band".to_owned(),
            bio: None,
            now: "2026-06-06T02:00:00Z".to_owned(),
        })
        .await
        .expect("create artist");
    store
        .create_audio_asset(NewMusicAudioAsset {
            id: "asset_social".to_owned(),
            tenant_id: "100001".to_owned(),
            title: "Social Master".to_owned(),
            drive_space_id: "space_social".to_owned(),
            drive_node_id: "node_social".to_owned(),
            drive_uri: "drive://spaces/space_social/nodes/node_social".to_owned(),
            media_resource_id: Some("node_social".to_owned()),
            media_resource_snapshot: Some(r#"{"kind":"audio","source":"drive"}"#.to_owned()),
            mime_type: "audio/mpeg".to_owned(),
            duration_seconds: 210,
            checksum_algorithm: Some("sha256".to_owned()),
            checksum_value: Some("checksum-social".to_owned()),
            status: "ready".to_owned(),
            now: "2026-06-06T02:01:00Z".to_owned(),
        })
        .await
        .expect("create audio asset");
    store
        .create_track(NewMusicTrack {
            id: "track_social".to_owned(),
            tenant_id: "100001".to_owned(),
            artist_id: "artist_social".to_owned(),
            album_id: None,
            audio_asset_id: Some("asset_social".to_owned()),
            slug: "social-loop".to_owned(),
            title: "Social Loop".to_owned(),
            duration_seconds: 210,
            tags: vec!["social".to_owned(), "pop".to_owned()],
            now: "2026-06-06T02:02:00Z".to_owned(),
        })
        .await
        .expect("create track");
    store
        .publish_track("100001", "track_social", "editor_1", "2026-06-06T02:03:00Z")
        .await
        .expect("publish track");
    store
        .create_playlist(NewMusicPlaylist {
            id: "playlist_social".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "social-mix".to_owned(),
            title: "Social Mix".to_owned(),
            description: Some("Community playlist".to_owned()),
            track_ids: vec!["track_social".to_owned()],
            now: "2026-06-06T02:04:00Z".to_owned(),
        })
        .await
        .expect("create playlist");

    store
        .create_comment(NewMusicComment {
            id: "comment_1".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: "user_1".to_owned(),
            resource_type: "track".to_owned(),
            resource_id: "track_social".to_owned(),
            parent_comment_id: None,
            body: "hook is strong".to_owned(),
            moderation_status: "approved".to_owned(),
            now: "2026-06-06T02:05:00Z".to_owned(),
        })
        .await
        .expect("create comment");
    store
        .create_content_report(NewMusicContentReport {
            id: "report_1".to_owned(),
            tenant_id: "100001".to_owned(),
            reporter_user_id: "user_2".to_owned(),
            resource_type: "comment".to_owned(),
            resource_id: "comment_1".to_owned(),
            reason_code: "spam".to_owned(),
            description: Some("looks promotional".to_owned()),
            now: "2026-06-06T02:06:00Z".to_owned(),
        })
        .await
        .expect("create content report");
    store
        .create_recommendation_feedback(NewMusicRecommendationFeedback {
            id: "feedback_1".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: "user_1".to_owned(),
            item_type: "track".to_owned(),
            item_id: "track_social".to_owned(),
            feedback_type: "not_interested".to_owned(),
            reason_code: Some("too_repetitive".to_owned()),
            now: "2026-06-06T02:07:00Z".to_owned(),
        })
        .await
        .expect("create recommendation feedback");
    store
        .create_search_suggestion(NewMusicSearchSuggestion {
            id: "suggestion_1".to_owned(),
            tenant_id: "100001".to_owned(),
            suggestion_type: "hot".to_owned(),
            display_text: "city pop commute".to_owned(),
            query_text: "city pop commute".to_owned(),
            weight: 900,
            now: "2026-06-06T02:08:00Z".to_owned(),
        })
        .await
        .expect("create search suggestion");
    store
        .create_ai_style_preset(NewMusicAiStylePreset {
            id: "style_1".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "city-pop".to_owned(),
            title: "City Pop".to_owned(),
            style_tags: vec!["city-pop".to_owned(), "synth".to_owned()],
            prompt_hint: Some("bright 80s city pop groove".to_owned()),
            status: "active".to_owned(),
            now: "2026-06-06T02:09:00Z".to_owned(),
        })
        .await
        .expect("create AI style preset");
    store
        .create_ai_prompt_template(NewMusicAiPromptTemplate {
            id: "template_1".to_owned(),
            tenant_id: "100001".to_owned(),
            slug: "ad-jingle".to_owned(),
            title: "Ad Jingle".to_owned(),
            template_text: "Create a short brand-safe jingle about {{topic}}".to_owned(),
            variables_json: Some(r#"["topic"]"#.to_owned()),
            status: "active".to_owned(),
            now: "2026-06-06T02:10:00Z".to_owned(),
        })
        .await
        .expect("create AI prompt template");
    store
        .create_download_entitlement(NewMusicDownloadEntitlement {
            id: "download_1".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: "user_1".to_owned(),
            track_id: "track_social".to_owned(),
            audio_asset_id: "asset_social".to_owned(),
            quality: "lossless".to_owned(),
            status: "active".to_owned(),
            expires_at: Some("2026-07-06T02:11:00Z".to_owned()),
            now: "2026-06-06T02:11:00Z".to_owned(),
        })
        .await
        .expect("create download entitlement");
    store
        .upsert_playback_session(NewMusicPlaybackSession {
            id: "session_1".to_owned(),
            tenant_id: "100001".to_owned(),
            user_id: "user_1".to_owned(),
            device_id: "device_phone".to_owned(),
            current_track_id: Some("track_social".to_owned()),
            queue_json: Some(r#"["track_social"]"#.to_owned()),
            position_ms: 42000,
            playback_state: "playing".to_owned(),
            now: "2026-06-06T02:12:00Z".to_owned(),
        })
        .await
        .expect("upsert playback session");
    store
        .create_rights_territory(NewMusicRightsTerritory {
            id: "territory_1".to_owned(),
            tenant_id: "100001".to_owned(),
            rights_policy_id: "rights_1".to_owned(),
            region_code: "CN".to_owned(),
            availability: "allowed".to_owned(),
            starts_at: Some("2026-06-06T00:00:00Z".to_owned()),
            ends_at: None,
            now: "2026-06-06T02:13:00Z".to_owned(),
        })
        .await
        .expect("create rights territory");
    store
        .create_release_channel(NewMusicReleaseChannel {
            id: "release_channel_1".to_owned(),
            tenant_id: "100001".to_owned(),
            release_id: "release_1".to_owned(),
            channel_code: "app".to_owned(),
            distribution_status: "scheduled".to_owned(),
            scheduled_at: Some("2026-06-07T00:00:00Z".to_owned()),
            now: "2026-06-06T02:14:00Z".to_owned(),
        })
        .await
        .expect("create release channel");

    let comments = store
        .list_comments("100001", "track", "track_social")
        .await
        .expect("comments");
    assert_eq!(comments.len(), 1);
    assert_eq!(comments[0].body, "hook is strong");

    let reports = store
        .list_content_reports("100001", Some("open"))
        .await
        .expect("reports");
    assert_eq!(reports.len(), 1);
    assert_eq!(reports[0].reason_code, "spam");

    let suggestions = store
        .list_search_suggestions("100001", "hot")
        .await
        .expect("search suggestions");
    assert_eq!(suggestions[0].query_text, "city pop commute");

    let style_presets = store
        .list_ai_style_presets("100001")
        .await
        .expect("style presets");
    assert_eq!(style_presets[0].style_tags, vec!["city-pop", "synth"]);

    let prompt_templates = store
        .list_ai_prompt_templates("100001")
        .await
        .expect("prompt templates");
    assert_eq!(prompt_templates[0].slug, "ad-jingle");

    let sessions = store
        .list_playback_sessions("100001", "user_1")
        .await
        .expect("playback sessions");
    assert_eq!(sessions[0].device_id, "device_phone");
    assert_eq!(sessions[0].playback_state, "playing");

    let entitlements = store
        .list_download_entitlements("100001", "user_1")
        .await
        .expect("download entitlements");
    assert_eq!(entitlements[0].quality, "lossless");
}

#[tokio::test]
async fn generated_artifact_archive_uses_drive_ai_space_and_completes_audio_variants() {
    let pool = SqlitePoolOptions::new()
        .max_connections(1)
        .connect("sqlite::memory:")
        .await
        .expect("sqlite pool");
    let store = SqliteMusicStore::new(pool);
    store.migrate().await.expect("music migration");

    store
        .create_ai_generation_project(NewMusicAiGenerationProject {
            id: "project_archive".to_owned(),
            tenant_id: "tenant_archive".to_owned(),
            user_id: "user_archive".to_owned(),
            title: "AI campaign".to_owned(),
            visibility: "private".to_owned(),
            now: "2026-06-06T03:00:00Z".to_owned(),
        })
        .await
        .expect("create AI project");
    store
        .create_ai_generation_task(NewMusicAiGenerationTask {
            id: "task_archive".to_owned(),
            tenant_id: "tenant_archive".to_owned(),
            project_id: Some("project_archive".to_owned()),
            user_id: "user_archive".to_owned(),
            prompt: "generate cover image and preview music for summer campaign".to_owned(),
            lyrics_prompt: None,
            style_tags: vec!["pop".to_owned(), "bright".to_owned()],
            model_provider: "sdkwork-cloudrouter".to_owned(),
            model_name: "multi-modal-music-v1".to_owned(),
            reference_drive_uri: None,
            now: "2026-06-06T03:01:00Z".to_owned(),
        })
        .await
        .expect("create AI task");

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

    store
        .complete_ai_generation_task_with_variants(archived.variants.clone())
        .await
        .expect("complete task with archived variants");
    store
        .complete_ai_generation_task_with_variants(archived.variants)
        .await
        .expect("replayed archive completion should be idempotent");

    let tasks = store
        .list_ai_generation_tasks("tenant_archive", Some("user_archive"))
        .await
        .expect("AI tasks");
    assert_eq!(tasks.len(), 1);
    assert_eq!(tasks[0].status, "succeeded");
    assert_eq!(tasks[0].variant_count, 1);
    assert_eq!(tasks[0].approved_variant_count, 1);
    assert_eq!(tasks[0].provider_output_count, 1);
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
