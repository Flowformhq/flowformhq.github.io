# TypeScript SDK

The FlowForm TypeScript SDK provides a typed client for the FlowForm API. It handles authentication, request formatting, and response parsing.

## Installation

::: code-group

```bash [npm]
npm install @flowformhq/sdk
```

```bash [pnpm]
pnpm add @flowformhq/sdk
```

```bash [yarn]
yarn add @flowformhq/sdk
```

:::

## Quick Start

```typescript
import { FlowForm } from '@flowformhq/sdk'

const client = new FlowForm({
  baseUrl: 'http://localhost:8000',
  token: 'YOUR_SANCTUM_TOKEN', // optional for public endpoints
})

// List active forms
const forms = await client.forms.list()

// Get a form schema
const schema = await client.forms.schema('550e8400-e29b-41d4-a716-446655440000')

// Create and complete a submission
const submission = await client.submissions.create({
  formUuid: '550e8400-e29b-41d4-a716-446655440000',
})

await client.submissions.upsertValues(submission.uuid, [
  { fieldId: 1, value: 'Jane Doe' },
  { fieldId: 2, value: 'jane@example.com' },
])

await client.submissions.update(submission.uuid, { status: 'completed' })
```

## Configuration

```typescript
const client = new FlowForm({
  // Required: your FlowForm API base URL
  baseUrl: 'https://api.example.com',

  // Optional: Sanctum bearer token for authenticated endpoints
  token: 'YOUR_TOKEN',

  // Optional: custom fetch implementation (defaults to global fetch)
  fetch: customFetch,

  // Optional: default headers added to every request
  headers: {
    'X-Custom-Header': 'value',
  },
})
```

## Forms

### List Forms

Retrieve a paginated list of active forms.

```typescript
const result = await client.forms.list({ page: 1, perPage: 10 })

console.log(result.data)    // Form[]
console.log(result.meta)    // { current_page, last_page, per_page, total }
```

### Get Form by UUID

```typescript
const form = await client.forms.get('550e8400-e29b-41d4-a716-446655440000')

console.log(form.name)        // "Contact Form"
console.log(form.slug)        // "contact-form"
console.log(form.is_active)   // true
```

### Get Form by Slug

```typescript
const form = await client.forms.getBySlug('contact-form')
```

### Get Form Schema

Returns the full form structure including steps, fields, options, and conditions.

```typescript
const schema = await client.forms.schema(
  '550e8400-e29b-41d4-a716-446655440000'
)

for (const step of schema.steps) {
  console.log(`Step ${step.step_number}: ${step.title}`)

  for (const field of step.fields) {
    console.log(`  ${field.code} (${field.field_type.name})`)

    if (field.options.length > 0) {
      for (const option of field.options) {
        console.log(`    - ${option.label}: ${option.value}`)
      }
    }
  }
}
```

## Submissions

All submission methods require a token to be set in the client configuration.

### Create Submission

```typescript
const submission = await client.submissions.create({
  formUuid: '550e8400-e29b-41d4-a716-446655440000',
})

console.log(submission.uuid)          // "7c9e6679-..."
console.log(submission.status)        // "draft"
console.log(submission.current_step)  // 1
```

### Get Submission

```typescript
const submission = await client.submissions.get(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)

for (const value of submission.values) {
  console.log(`${value.field_code}: ${value.value}`)
}
```

### Update Submission

```typescript
await client.submissions.update('7c9e6679-7425-40de-944b-e07fc1f90ae7', {
  status: 'completed',
  meta: { source: 'web', completed_at: new Date().toISOString() },
})
```

### Upsert Values

Submit or update field values. Values are upserted -- sending a value for a field that already has one will replace it.

```typescript
await client.submissions.upsertValues(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  [
    { fieldId: 1, value: 'Jane Doe' },
    { fieldId: 2, value: 'jane@example.com' },
  ]
)
```

To link a value to an entity record:

```typescript
await client.submissions.upsertValues(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  [
    { fieldId: 10, value: 'John Doe', entityRecordId: 5 },
    { fieldId: 11, value: '1990-05-15', entityRecordId: 5 },
  ]
)
```

### Advance Step

```typescript
const result = await client.submissions.advance(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)

console.log(result.current_step)        // 2
console.log(result.is_last_step)        // true
console.log(result.progress_percentage) // 100
```

### Retreat Step

```typescript
const result = await client.submissions.retreat(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)

console.log(result.current_step)        // 1
console.log(result.progress_percentage) // 50
```

### Get Conditions

Evaluate field conditions based on the current submission values.

```typescript
const conditions = await client.submissions.conditions(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)

// conditions is a Record<number, { visible: boolean; required: boolean }>
for (const [fieldId, state] of Object.entries(conditions)) {
  if (!state.visible) {
    console.log(`Field ${fieldId} is hidden`)
  }
  if (state.required) {
    console.log(`Field ${fieldId} is required`)
  }
}
```

## Error Handling

The SDK throws typed errors for different failure scenarios.

```typescript
import { FlowForm, FlowFormError, ValidationError } from '@flowformhq/sdk'

try {
  await client.submissions.create({ formUuid: 'invalid-uuid' })
} catch (error) {
  if (error instanceof ValidationError) {
    // 422 response -- field-level validation errors
    console.log(error.errors)
    // { form_uuid: ["The form uuid must be a valid UUID."] }
  } else if (error instanceof FlowFormError) {
    // Other API errors (401, 404, 429, 500)
    console.log(error.status)   // HTTP status code
    console.log(error.message)  // Error message from the API
  }
}
```

### Error Types

| Error Class       | HTTP Status | Description                        |
| ----------------- | ----------- | ---------------------------------- |
| `ValidationError` | 422         | Invalid request data               |
| `FlowFormError`   | 401         | Missing or invalid authentication  |
| `FlowFormError`   | 404         | Resource not found                 |
| `FlowFormError`   | 429         | Rate limit exceeded                |
| `FlowFormError`   | 500         | Server error                       |

## TypeScript Types

The SDK exports types for all API responses.

```typescript
import type {
  Form,
  FormSchema,
  Step,
  Field,
  FieldType,
  FieldOption,
  Condition,
  Submission,
  SubmissionValue,
  FieldConditionState,
  PaginatedResponse,
} from '@flowformhq/sdk'
```

## Full Example: Multi-Step Form

```typescript
import { FlowForm } from '@flowformhq/sdk'

const client = new FlowForm({
  baseUrl: 'http://localhost:8000',
  token: 'YOUR_TOKEN',
})

async function submitJobApplication() {
  // 1. Load the form schema
  const schema = await client.forms.schema('550e8400-e29b-41d4-a716-446655440000')

  // 2. Create a draft submission
  const submission = await client.submissions.create({
    formUuid: schema.uuid,
  })

  // 3. Fill in step 1 fields
  await client.submissions.upsertValues(submission.uuid, [
    { fieldId: 1, value: 'Jane Doe' },
    { fieldId: 2, value: 'jane@example.com' },
    { fieldId: 3, value: 'employed' },
  ])

  // 4. Check which fields should be visible
  const conditions = await client.submissions.conditions(submission.uuid)

  // Field 4 (company_name) is visible because employment_status = "employed"
  if (conditions[4].visible) {
    await client.submissions.upsertValues(submission.uuid, [
      { fieldId: 4, value: 'Acme Corp' },
    ])
  }

  // 5. Move to step 2
  const step2 = await client.submissions.advance(submission.uuid)
  console.log(`Now on step ${step2.current_step}`)

  // 6. Fill in step 2 fields
  await client.submissions.upsertValues(submission.uuid, [
    { fieldId: 6, value: 'I am passionate about building great software...' },
  ])

  // 7. Complete the submission
  await client.submissions.update(submission.uuid, {
    status: 'completed',
    meta: { submitted_from: 'careers-page' },
  })

  console.log('Application submitted!')
}
```
