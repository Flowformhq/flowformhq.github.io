# Starter Kits

FlowForm provides official starter kits for popular frontend frameworks. All kits share the same rendering contract: fetch the schema, render fields, submit values.

## React + Vite

**Package:** `@flowformhq/starter-kit-react`
**Source:** [`starter-kit-react/`](https://github.com/flowformhq/flowform/tree/main/starter-kit-react)

```bash
git clone https://github.com/flowformhq/flowform.git
cd starter-kit-react
npm install
cp .env.example .env
# Set VITE_FLOWFORM_URL and VITE_FLOWFORM_TOKEN
npm run dev
```

**Features:** Error boundaries, accessible form rendering with `<form>` element and label/id pairing, multi-step navigation, server-evaluated conditional fields, progress bar, TypeScript SDK included.

## Vue 3 + Vite

**Package:** `@flowformhq/vue-starter`
**Source:** [`starter-kits/vue/`](https://github.com/flowformhq/flowform/tree/main/starter-kits/vue)

```bash
cd starter-kits/vue
npm install
cp .env.example .env
# Set VITE_FLOWFORM_URL and VITE_FLOWFORM_TOKEN
npm run dev
```

**Features:** Composition API (`useFlowForm` composable), Vue Router integration, Tailwind CSS 4, TypeScript SDK included, identical rendering contract to React kit.

## Laravel Livewire

**Package:** `flowformhq/livewire-starter`
**Source:** [`starter-kits/livewire/`](https://github.com/flowformhq/flowform/tree/main/starter-kits/livewire)

```bash
composer require flowformhq/livewire-starter
php artisan vendor:publish --tag=flowform-starter-config
```

Add to `.env`:

```
FLOWFORM_URL=http://localhost:8000
FLOWFORM_TOKEN=your-api-token
```

Use in any Blade view:

```blade
<livewire:flowform-starter::form-renderer formUuid="your-form-uuid" />
```

**Features:** Livewire 3 component, Guzzle-based API client, server-side rendering, no JavaScript build step required.

## Shared rendering contract

All starter kits implement the same contract:

| Aspect | Behavior |
|---|---|
| Schema fetch | `GET /forms/{uuid}/schema` — single call, full structure |
| Submission creation | `POST /submissions` — creates draft at step 1 |
| Value storage | `POST /submissions/{uuid}/values` — upsert, batch |
| Step navigation | `POST .../advance` and `POST .../retreat` |
| Condition evaluation | `GET /submissions/{uuid}/conditions` — server-side |
| Completion | `PATCH /submissions/{uuid} { status: "completed" }` |

### Supported field types

All kits render these `field_type.component` values:

| Component | Element |
|---|---|
| `text-input` | `<input type="text">` |
| `email-input` | `<input type="email">` |
| `number-input` | `<input type="number">` |
| `textarea-input` | `<textarea>` |
| `select-input` | `<select>` with options |
| `checkbox-input` | `<input type="checkbox">` |
| `radio-input` | Radio group |
| `date-input` | `<input type="date">` |
| `file-input` | `<input type="file">` |
| `heading-display` | `<h3>` (display only) |
| `paragraph-display` | `<p>` (display only) |

Unknown components fall through to a plain text input.

## Coming soon

- **Inertia.js** starter kit (weeks 10–14)
- **Angular** starter kit (weeks 10–14)
