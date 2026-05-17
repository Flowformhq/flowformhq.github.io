# Vue 3 Starter Kit

The Vue starter kit (`@flowformhq/vue-starter`) is a Vite + Vue 3 + TypeScript + Tailwind CSS project that renders FlowForm schemas using the Composition API.

## Quick Start

```bash
# Clone the kit
cd starter-kits/vue

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env: set VITE_FLOWFORM_URL and VITE_FLOWFORM_TOKEN

# Start dev server
npm run dev
```

## Project Structure

```
src/
  lib/flowform.ts          # Zero-dependency TypeScript SDK
  composables/useFlowForm.ts  # Vue composable: reactive form state
  components/
    FieldRenderer.vue      # Field type rendering with v-model
    FormRenderer.vue       # Multi-step form with progress bar
    FormList.vue           # Browse active forms
```

## Architecture

The kit follows the same server-authoritative rendering contract as the React kit:

1. **Schema fetch** — `GET /api/v1/forms/{uuid}/schema`
2. **Submission creation** — `POST /api/v1/submissions`
3. **Value upsert** — `POST /api/v1/submissions/{uuid}/values`
4. **Step navigation** — `advance` / `retreat`
5. **Condition refresh** — `GET /api/v1/submissions/{uuid}/conditions`
6. **Submit** — `PATCH /api/v1/submissions/{uuid}`

## Key Differences from React Kit

| Aspect | Vue | React |
|--------|-----|-------|
| State | `ref()` + `computed()` | `useState` + `useMemo` |
| Two-way binding | `v-model` / `update:modelValue` | `value` + `onChange` props |
| Reactivity | Automatic dependency tracking | Manual `useCallback` + `useEffect` |
| Routing | `vue-router` | `react-router-dom` |
| Form submit | Button `@click` handlers | `<form onSubmit>` |
| Error handling | Inline `error` ref | `ErrorBoundary` class component |

## Customizing

### Styling

All components use Tailwind CSS. Edit `src/style.css` or override classes in `.vue` SFC templates.

### Adding field types

Edit `src/components/FieldRenderer.vue` and add a new `v-else-if` branch:

```vue
<div v-else-if="field.field_type.component === 'phone-input'">
  <label :for="field.code" class="block text-sm font-medium text-gray-700">
    {{ field.label }}
  </label>
  <input :id="field.code" type="tel" class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2" />
</div>
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_FLOWFORM_URL` | Base URL of your FlowForm API |
| `VITE_FLOWFORM_TOKEN` | API token for authenticated endpoints |

## Publishing

```bash
npm run build
```

Outputs to `dist/`. The kit is published to npm as `@flowformhq/vue-starter`.
