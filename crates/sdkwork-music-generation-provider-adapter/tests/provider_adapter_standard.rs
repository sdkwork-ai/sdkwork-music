use sdkwork_music_generation_provider_adapter::{
    build_music_generation_request, resolve_music_sdk_route, MUSIC_GENERATION_PROVIDER_ADAPTER_ID,
};
use sdkwork_music_generation_provider_spi::{
    MusicGenerationCommand, MusicGenerationVendorParameters, MusicVendorId,
};

fn command() -> MusicGenerationCommand {
    MusicGenerationCommand {
        vendor: MusicVendorId::new("suno").expect("vendor"),
        model: "suno-v5".to_string(),
        prompt: "Cinematic electronic anthem".to_string(),
        title: Some("Launch".to_string()),
        tags: Some("electronic, cinematic".to_string()),
        negative_tags: None,
        duration_seconds: Some(45.0),
        instrumental: None,
        callback_url: None,
        idempotency_key: None,
        vendor_parameters: None,
    }
}

#[test]
fn sdk_routes_are_owned_only_by_the_adapter() {
    let route = resolve_music_sdk_route();
    assert_eq!(route.create_resource, "music_suno");
    assert_eq!(route.create_method, "create_v1_music_generation");
    assert_eq!(route.retrieve_method, "list_v1_music_generations");
    assert_eq!(
        MUSIC_GENERATION_PROVIDER_ADAPTER_ID,
        "sdkwork-music-generation-provider-adapter"
    );
}

#[test]
fn maps_common_and_versioned_vendor_parameters_to_sdk_request() {
    let mut command = command();
    command.vendor_parameters = Some(MusicGenerationVendorParameters {
        schema: "suno.music-generation.v1".to_string(),
        values: serde_json::json!({}),
    });
    let request = build_music_generation_request(&command).expect("request");
    assert_eq!(request.model.as_deref(), Some("suno-v5"));
    assert_eq!(request.duration, Some(45.0));
    assert_eq!(request.title.as_deref(), Some("Launch"));
}

#[test]
fn rejects_parameters_not_exposed_by_generated_sdk() {
    let mut command = command();
    command.instrumental = Some(true);
    let error = build_music_generation_request(&command).expect_err("unsupported field");
    assert!(error.to_string().contains("instrumental"));
}
