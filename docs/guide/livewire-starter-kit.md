# Laravel Livewire Starter Kit

The Livewire starter kit (`flowformhq/livewire-starter`) is a Composer package that embeds FlowForm into a Laravel application using Livewire 3 and Blade templates — no JavaScript build step required.

## Quick Start

```bash
# In your Laravel project
composer require flowformhq/livewire-starter

# Publish config and views
php artisan vendor:publish --tag=flowform-starter-config
php artisan vendor:publish --tag=flowform-starter-views

# Configure environment
# Edit .env: set FLOWFORM_URL and FLOWFORM_TOKEN
```

## Project Structure

```
src/
  Http/FlowFormClient.php          # Guzzle-based PHP SDK
  Livewire/FormRenderer.php        # Livewire 3 component
  LivewireStarterServiceProvider.php
resources/views/
  components/field-renderer.blade.php
  pages/form-renderer.blade.php
config/flowform-starter.php
```

## Architecture

The kit follows the same server-authoritative rendering contract:

1. **Schema fetch** — `GET /api/v1/forms/{uuid}/schema` via Guzzle
2. **Submission creation** — `POST /api/v1/submissions`
3. **Value upsert** — `POST /api/v1/submissions/{uuid}/values`
4. **Step navigation** — `advance` / `retreat`
5. **Condition refresh** — `GET /api/v1/submissions/{uuid}/conditions`
6. **Submit** — `PATCH /api/v1/submissions/{uuid}`

Unlike the React and Vue kits, everything happens server-side via Livewire's wire protocol. The browser sends AJAX requests automatically when values change or buttons are clicked.

## Key Differences from JS Kits

| Aspect | Livewire | React / Vue |
|--------|----------|-------------|
| HTTP client | Guzzle (server-side) | `fetch` (client-side) |
| State | Livewire public properties | React `useState` / Vue `ref` |
| Rendering | Blade templates | JSX / Vue SFC |
| Two-way binding | `wire:model.live` | `onChange` / `v-model` |
| Routing | Laravel routes | Client-side router |
| Build step | None | Vite build required |
| Error handling | Inline `$error` property | Error boundary / error ref |

## Usage in a Blade View

```blade
<div>
    <livewire:form-renderer :form-uuid="$formUuid" />
</div>
```

## Customizing

### Styling

All Blade views use Tailwind CSS classes. Override by publishing views:

```bash
php artisan vendor:publish --tag=flowform-starter-views
```

Then edit `resources/views/vendor/flowform-starter/` files.

### Adding field types

Edit `resources/views/vendor/flowform-starter/components/field-renderer.blade.php` and add a new `@elseif` branch:

```blade
@elseif($component === 'phone-input')
    <label for="{{ $field['code'] }}" class="block text-sm font-medium text-gray-700">
        {{ $field['label'] }}
    </label>
    <input type="tel" id="{{ $field['code'] }}" wire:model.live="values.{{ $field['code'] }}" class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
```

### Config

Published to `config/flowform-starter.php`:

```php
return [
    'url' => env('FLOWFORM_URL', 'http://localhost:8000'),
    'token' => env('FLOWFORM_TOKEN'),
];
```

## Publishing

The package is published to Packagist as `flowformhq/livewire-starter`.
