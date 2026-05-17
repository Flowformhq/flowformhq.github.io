# Upgrade Guide

## v0.x → v1.0

FlowForm v1.0 introduces API stability guarantees. All `v1` endpoints are now covered by our [API Stability Policy](https://github.com/flowformhq/flowform/blob/main/docs/API-STABILITY.md) with a 6-month deprecation window.

### Breaking Changes

There are no breaking changes between v0.x and v1.0. The API surface is identical — the version bump signals our stability commitment.

### New in v1.0

- **API Stability Lock**: All `/api/v1/*` endpoints are now stability-locked. See the [API Stability Policy](https://github.com/flowformhq/flowform/blob/main/docs/API-STABILITY.md).
- **Social Login**: GitHub and Google OAuth support via Laravel Socialite.
- **Docker**: Production-ready `docker-compose.yml` with nginx, PHP-FPM, and supervisor.
- **Telemetry**: Opt-in anonymous telemetry with env var kill switch (`FLOWFORM_TELEMETRY_ENABLED=false`).
- **Starter Kits**: React, Vue 3, and Laravel Livewire starter kits.
- **Deploy Buttons**: One-click deploy to Railway, Render, or DigitalOcean.

### Upgrading

1. Update Composer dependency:
   ```bash
   composer require flowformhq/flowform:^1.0
   ```

2. Publish new config and migrate:
   ```bash
   php artisan vendor:publish --tag=flowform-config --force
   php artisan migrate
   ```

3. Review new `.env` variables in `.env.example` and add any you need.

### Deprecation Policy

See the [API Stability Policy](https://github.com/flowformhq/flowform/blob/main/docs/API-STABILITY.md) on GitHub for details on how we handle future API changes.
