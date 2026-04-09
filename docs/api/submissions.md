# Submissions API

All submission endpoints require authentication via a bearer token. See [API Overview](/api/overview) for details on authentication.

## Create Submission

Creates a new draft submission for a form. The submission starts at step 1.

```
POST /api/v1/submissions
```

### Request Body

| Field       | Type   | Required | Description                |
| ----------- | ------ | -------- | -------------------------- |
| `form_uuid` | string | yes      | UUID of the form to submit |

::: code-group

```bash [curl]
curl -X POST http://localhost:8000/api/v1/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "form_uuid": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

```typescript [TypeScript SDK]
import { FlowForm } from '@flowformhq/sdk'

const client = new FlowForm({
  baseUrl: 'http://localhost:8000',
  token: 'YOUR_TOKEN',
})

const submission = await client.submissions.create({
  formUuid: '550e8400-e29b-41d4-a716-446655440000',
})
```

:::

### Response `201 Created`

```json
{
  "data": {
    "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "form_id": 1,
    "status": "draft",
    "current_step": 1,
    "meta": null,
    "created_at": "2026-04-08T12:00:00.000000Z",
    "updated_at": "2026-04-08T12:00:00.000000Z"
  }
}
```

## Get Submission

Retrieve a submission with all its values.

```
GET /api/v1/submissions/{uuid}
```

::: code-group

```bash [curl]
curl http://localhost:8000/api/v1/submissions/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```typescript [TypeScript SDK]
const submission = await client.submissions.get(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)
```

:::

### Response

```json
{
  "data": {
    "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "form_id": 1,
    "status": "draft",
    "current_step": 1,
    "meta": null,
    "created_at": "2026-04-08T12:00:00.000000Z",
    "updated_at": "2026-04-08T12:30:00.000000Z",
    "values": [
      {
        "field_id": 1,
        "field_code": "full_name",
        "value": "Jane Doe",
        "entity_record_id": null
      },
      {
        "field_id": 2,
        "field_code": "email",
        "value": "jane@example.com",
        "entity_record_id": null
      }
    ]
  }
}
```

## Update Submission

Update a submission's status or metadata.

```
PATCH /api/v1/submissions/{uuid}
```

### Request Body

| Field    | Type   | Required | Description                          |
| -------- | ------ | -------- | ------------------------------------ |
| `status` | string | no       | New status (`draft` or `completed`)  |
| `meta`   | object | no       | Arbitrary metadata to store          |

::: code-group

```bash [curl]
curl -X PATCH http://localhost:8000/api/v1/submissions/7c9e6679-7425-40de-944b-e07fc1f90ae7 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "meta": {
      "user_agent": "Mozilla/5.0",
      "completed_at": "2026-04-08T13:00:00Z"
    }
  }'
```

```typescript [TypeScript SDK]
const updated = await client.submissions.update(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  {
    status: 'completed',
    meta: {
      user_agent: 'Mozilla/5.0',
      completed_at: '2026-04-08T13:00:00Z',
    },
  }
)
```

:::

### Response

```json
{
  "data": {
    "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "form_id": 1,
    "status": "completed",
    "current_step": 2,
    "meta": {
      "user_agent": "Mozilla/5.0",
      "completed_at": "2026-04-08T13:00:00Z"
    },
    "created_at": "2026-04-08T12:00:00.000000Z",
    "updated_at": "2026-04-08T13:00:00.000000Z"
  }
}
```

## Upsert Field Values

Submit or update values for one or more fields. If a value already exists for a field, it is replaced.

```
POST /api/v1/submissions/{uuid}/values
```

### Request Body

| Field    | Type  | Required | Description                  |
| -------- | ----- | -------- | ---------------------------- |
| `values` | array | yes      | Array of field value objects  |

Each value object:

| Field              | Type    | Required | Description                       |
| ------------------ | ------- | -------- | --------------------------------- |
| `field_id`         | integer | yes      | ID of the field                   |
| `value`            | string  | yes      | The submitted value               |
| `entity_record_id` | integer | no      | Link to an entity record          |

::: code-group

```bash [curl]
curl -X POST http://localhost:8000/api/v1/submissions/7c9e6679-7425-40de-944b-e07fc1f90ae7/values \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "values": [
      { "field_id": 1, "value": "Jane Doe" },
      { "field_id": 2, "value": "jane@example.com" },
      { "field_id": 3, "value": "employed" }
    ]
  }'
```

```typescript [TypeScript SDK]
await client.submissions.upsertValues(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7',
  [
    { fieldId: 1, value: 'Jane Doe' },
    { fieldId: 2, value: 'jane@example.com' },
    { fieldId: 3, value: 'employed' },
  ]
)
```

:::

### Response

```json
{
  "data": [
    {
      "field_id": 1,
      "field_code": "full_name",
      "value": "Jane Doe",
      "entity_record_id": null
    },
    {
      "field_id": 2,
      "field_code": "email",
      "value": "jane@example.com",
      "entity_record_id": null
    },
    {
      "field_id": 3,
      "field_code": "employment_status",
      "value": "employed",
      "entity_record_id": null
    }
  ]
}
```

## Advance Step

Move the submission to the next step. Returns an error if already on the last step.

```
POST /api/v1/submissions/{uuid}/advance
```

::: code-group

```bash [curl]
curl -X POST http://localhost:8000/api/v1/submissions/7c9e6679-7425-40de-944b-e07fc1f90ae7/advance \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```typescript [TypeScript SDK]
const result = await client.submissions.advance(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)
```

:::

### Response

```json
{
  "data": {
    "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "current_step": 2,
    "status": "draft",
    "is_last_step": true,
    "progress_percentage": 100
  }
}
```

### Error Response (already on last step)

```json
{
  "message": "Already on the last step."
}
```

## Retreat Step

Move the submission to the previous step. Returns an error if already on the first step.

```
POST /api/v1/submissions/{uuid}/retreat
```

::: code-group

```bash [curl]
curl -X POST http://localhost:8000/api/v1/submissions/7c9e6679-7425-40de-944b-e07fc1f90ae7/retreat \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```typescript [TypeScript SDK]
const result = await client.submissions.retreat(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)
```

:::

### Response

```json
{
  "data": {
    "uuid": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "current_step": 1,
    "status": "draft",
    "is_last_step": false,
    "progress_percentage": 50
  }
}
```

## Get Conditions

Evaluate all field conditions for the current submission state. Returns the visibility and requirement status of every field based on current values.

```
GET /api/v1/submissions/{uuid}/conditions
```

::: code-group

```bash [curl]
curl http://localhost:8000/api/v1/submissions/7c9e6679-7425-40de-944b-e07fc1f90ae7/conditions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

```typescript [TypeScript SDK]
const conditions = await client.submissions.conditions(
  '7c9e6679-7425-40de-944b-e07fc1f90ae7'
)
```

:::

### Response

```json
{
  "data": {
    "1": { "visible": true, "required": true },
    "2": { "visible": true, "required": true },
    "3": { "visible": true, "required": true },
    "4": { "visible": true, "required": false },
    "5": { "visible": true, "required": true },
    "6": { "visible": true, "required": false }
  }
}
```

Each key is a field ID. The object indicates:
- **`visible`**: Whether the field should be displayed
- **`required`**: Whether the field is required given the current values

Use this endpoint after upserting values to update your UI. For example, if field 3 (`employment_status`) changes to `"unemployed"`, field 4 (`company_name`) would return `visible: false`.

## Typical Submission Flow

Here is the complete lifecycle for submitting a multi-step form:

```typescript
// 1. Fetch the form schema
const schema = await client.forms.schema(formUuid)

// 2. Create a draft submission
const submission = await client.submissions.create({ formUuid })
const subUuid = submission.uuid

// 3. Render step 1 fields, collect user input, then save values
await client.submissions.upsertValues(subUuid, [
  { fieldId: 1, value: 'Jane Doe' },
  { fieldId: 2, value: 'jane@example.com' },
  { fieldId: 3, value: 'employed' },
])

// 4. Check conditions to update field visibility
const conditions = await client.submissions.conditions(subUuid)

// 5. Save any conditionally-shown field values
await client.submissions.upsertValues(subUuid, [
  { fieldId: 4, value: 'Acme Corp' },
])

// 6. Advance to step 2
await client.submissions.advance(subUuid)

// 7. Collect and save step 2 values
await client.submissions.upsertValues(subUuid, [
  { fieldId: 6, value: 'I am passionate about this role...' },
])

// 8. Mark as completed
await client.submissions.update(subUuid, { status: 'completed' })
```
