# React Starter Kit

The React starter kit (`@flowformhq/starter-kit-react`) is a Vite + TypeScript + Tailwind CSS project that renders FlowForm schemas with full multi-step and conditional logic support.

## Quick Start

```bash
# Clone the kit
cd starter-kits/react

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
  hooks/useFlowForm.ts     # React hook: schema fetch, submission, step nav
  components/
    FieldRenderer.tsx      # Field type switch (text, email, select, etc.)
    FormRenderer.tsx       # Multi-step form with progress bar
    FormList.tsx           # Browse active forms
    ErrorBoundary.tsx      # Render error fallback
    NotFound.tsx           # 404 page
```

## Architecture

The kit follows a server-authoritative pattern:

1. **Schema fetch** — `GET /api/v1/forms/{uuid}/schema` returns steps, fields, options, conditions
2. **Submission creation** — `POST /api/v1/submissions` creates a draft
3. **Value upsert** — `POST /api/v1/submissions/{uuid}/values` stores answers
4. **Step navigation** — `POST /api/v1/submissions/{uuid}/advance` and `/retreat`
5. **Condition refresh** — `GET /api/v1/submissions/{uuid}/conditions` re-evaluates after every value change
6. **Submit** — `PATCH /api/v1/submissions/{uuid}` with `status: completed`

## Key Features

- **Enter key submits** — `<form onSubmit>` wrapper enables keyboard navigation
- **Accessibility** — `htmlFor`/`id` pairing, `aria-required`, `aria-describedby`
- **Error boundary** — Catches render errors and shows a reload UI
- **404 handling** — `NotFound` component for unknown routes
- **No empty value spam** — Filters empty strings before persisting

## Customizing

### Styling

All components use Tailwind CSS utility classes. Edit `src/index.css` or override classes in components.

### Adding field types

Edit `src/components/FieldRenderer.tsx` and add a new case to the switch statement:

```tsx
case 'phone-input':
  return (
    <div className="mb-4">
      <label htmlFor={field.code} className="block text-sm font-medium">
        {field.label}
      </label>
      <input id={field.code} type="tel" className={baseInput} ... />
    </div>
  );
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

Outputs to `dist/`. The kit is also published to npm as `@flowformhq/starter-kit-react`.
