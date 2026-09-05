Original prompt: Add all YouTube Playables SDK requirements from the supplied documentation, without monetization requirements, and suggest further features.

- Added SDK loading before the app module, readiness notifications, YouTube cloud save/load ordering, YouTube audio controls, SDK pause/resume, locale detection, score reporting, health telemetry, and a local CSP test header.
- No ad, rewarded-ad, or interstitial-ad API is present. `openYTContent` is not used because no valid YouTube content ID was supplied.
- Verification pending: run build, tests, and a local interaction pass.
- Added density-aware canvas rendering and responsive viewport sizing (including narrow portrait and short landscape layouts); pause now stops canvas rendering and game interaction.
