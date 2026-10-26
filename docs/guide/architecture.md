# Architecture Overview

FlowForm is a headless, API-first, schema-driven form engine built with Laravel.

## Tech stack

| Layer | Technology |
|---|---|
| Backend | PHP 8.4 / Laravel 13 |
| Admin Panel | Filament 5 |
| Authentication | Laravel Sanctum (API tokens) + Socialite (GitHub, Google OAuth) |
| Testing | Pest PHP |
| API Documentation | Scribe (OpenAPI) |
| Frontend SDK | TypeScript (zero dependencies, native fetch) |

## Data model

```
Form (uuid, name, slug, is_active)
 ├── Step (step_number, title, description)
 │    └── Field (code, label, field_type_id, is_required, order)
 │         ├── FieldOption (label, value, order)
 │         └── Condition (depends_on_field_code, operator, value, action)
 ├── Submission (uuid, status, current_step)
 │    ├── SubmissionValue (field_code, value)
 │    └── EntityRecord
 └── Entity (name, label, is_repeatable)

FieldType (name, component)
User (name, email, password)
SocialAccount (provider, provider_id)
```

## Request flow

```
1. Admin creates form via Filament panel
   → Form, Steps, Fields, Conditions persisted to database

2. Client fetches form schema
   → GET /api/v1/forms/{uuid}/schema
   → Returns full form definition (steps, fields, options, conditions)

3. Client creates a submission
   → POST /api/v1/submissions { form_uuid }
   → Draft submission created at step 1

4. Client renders fields from current step
   → Uses field_type.component to determine rendering
   → Calls GET /submissions/{uuid}/conditions for visibility/required states

5. Client persists values and navigates steps
   → POST /submissions/{uuid}/values [{ field_code, value }]
   → POST /submissions/{uuid}/advance or /retreat

6. Client completes the submission
   → PATCH /submissions/{uuid} { status: "completed" }
```

## Key design decisions

### Schema-driven rendering

The schema endpoint (`GET /forms/{uuid}/schema`) returns the entire form structure in one call. Clients never need multiple requests to understand the form layout. This makes the API cacheable and reduces round trips.

### Server-authoritative conditions

Conditional logic is evaluated server-side by `ConditionEvaluator` and `ConditionResolver`. The client calls `GET /submissions/{uuid}/conditions` to get the resolved visibility and required state for every field. This means:

- Condition semantics are consistent across all clients (React, Vue, Livewire)
- Adding new operators or actions doesn't require client updates
- The client codebase stays simple

### Headless by design

FlowForm has no built-in public form rendering. The admin panel is for form management. Rendering happens in your frontend via the REST API and starter kits. This separation means:

- Full control over form appearance
- No CSS/JS framework lock-in
- Forms can be embedded anywhere (SPA, SSR, mobile apps)

### Submission lifecycle

```
draft → (step navigation) → completed
```

Submissions start as `draft`. The client navigates steps via `advance` and `retreat` endpoints. Field values are upserted — call `storeValues` multiple times and only the latest value is kept. The submission is finalized by setting `status: "completed"`.

## Module boundaries

| Module | Responsibility |
|---|---|
| `FormController` | Public form/schema endpoints |
| `SubmissionController` | Submission CRUD, step navigation, condition evaluation |
| `ConditionEvaluator` | Evaluates a single condition (operator comparison) |
| `ConditionResolver` | Resolves all conditions for a submission into field states |
| `FieldState` | Value object: `{ field_id, field_code, is_visible, is_required }` |
| `TelemetryService` | Opt-in anonymous install metrics |
| `SocialLoginController` | GitHub/Google OAuth flow |
