# Forms API

FlowForm supports two operational modes:
- **Mode 1: Headless Form Endpoints** for static sites (Web3Forms / Formspree alternative).
- **Mode 2: Schema-Driven Forms** for dynamic multi-step wizards with conditional logic.

All form discovery and endpoint submission routes are public and require no bearer token.

---

## Mode 1: Submit to Headless Endpoint (HTML / Formspree Mode)

Submit any standard HTML form directly to your FlowForm instance with zero JavaScript.

```
POST /f/{slug}
```

### Supported Special Fields

| Field Name | Type | Description |
| :--- | :--- | :--- |
| `_gotcha` / `_honeypot` | hidden input | Anti-spam honeypot. If filled by automated bots, the submission is silently discarded. |
| `_next` / `_redirect` | hidden input | Target URL to redirect the user after successful submission. Defaults to the form's configured redirect URL. |

### Example HTML Form

```html
<form action="https://demo.flowformhq.com/f/contact" method="POST">
  <input type="text" name="name" placeholder="Your Name" required />
  <input type="email" name="email" placeholder="you@company.com" required />
  <textarea name="message" placeholder="Your message..."></textarea>

  <!-- Spam Honeypot -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />

  <!-- Redirect after submission -->
  <input type="hidden" name="_next" value="https://mysite.com/thanks" />

  <button type="submit">Submit</button>
</form>
```

---

## Mode 1: Submit via AJAX / JSON

Send raw JSON payloads directly from your frontend without multi-step wizard state machines.

```
POST /api/v1/f/{slug}
```

### Request

```bash
curl -X POST http://localhost:8000/api/v1/f/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Miller",
    "email": "alex@startup.com",
    "message": "Interested in enterprise self-hosting."
  }'
```

### Response (`200 OK`)

```json
{
  "message": "Submission received successfully",
  "uuid": "9e5f39e4-6a9b-4395-8128-d7318dbbc892"
}
```

---

## Mode 2: List Active Forms

Returns a paginated list of all active forms.

```
GET /api/v1/forms
```

### Query Parameters

| Parameter | Type    | Default | Description            |
| --------- | ------- | ------- | ---------------------- |
| `page`    | integer | 1       | Page number            |
| `per_page`| integer | 15      | Results per page       |

### Request

::: code-group

```bash [curl]
curl http://localhost:8000/api/v1/forms
```

```typescript [TypeScript SDK]
import { FlowForm } from '@flowformhq/sdk'

const client = new FlowForm({ baseUrl: 'http://localhost:8000' })

const forms = await client.forms.list()
```

:::

### Response

```json
{
  "data": [
    {
      "id": 1,
      "uuid": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Contact Form",
      "slug": "contact-form",
      "description": "Simple contact form with name and email",
      "is_active": true,
      "version": 1,
      "created_at": "2026-04-07T20:30:00.000000Z",
      "updated_at": "2026-04-07T20:30:00.000000Z"
    },
    {
      "id": 2,
      "uuid": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "name": "Job Application",
      "slug": "job-application",
      "description": "Multi-step job application form",
      "is_active": true,
      "version": 2,
      "created_at": "2026-04-07T21:00:00.000000Z",
      "updated_at": "2026-04-08T10:15:00.000000Z"
    }
  ],
  "links": {
    "first": "http://localhost:8000/api/v1/forms?page=1",
    "last": "http://localhost:8000/api/v1/forms?page=1",
    "prev": null,
    "next": null
  },
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 15,
    "total": 2
  }
}
```

## Get Form by UUID

Retrieve a single form by its UUID.

```
GET /api/v1/forms/{uuid}
```

### Request

::: code-group

```bash [curl]
curl http://localhost:8000/api/v1/forms/550e8400-e29b-41d4-a716-446655440000
```

```typescript [TypeScript SDK]
const form = await client.forms.get('550e8400-e29b-41d4-a716-446655440000')
```

:::

### Response

```json
{
  "data": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Contact Form",
    "slug": "contact-form",
    "description": "Simple contact form with name and email",
    "is_active": true,
    "version": 1,
    "created_at": "2026-04-07T20:30:00.000000Z",
    "updated_at": "2026-04-07T20:30:00.000000Z"
  }
}
```

## Get Form by Slug

Retrieve a form using its URL-friendly slug.

```
GET /api/v1/forms/{slug}/by-slug
```

### Request

::: code-group

```bash [curl]
curl http://localhost:8000/api/v1/forms/contact-form/by-slug
```

```typescript [TypeScript SDK]
const form = await client.forms.getBySlug('contact-form')
```

:::

### Response

Same structure as [Get Form by UUID](#get-form-by-uuid).

## Get Form Schema

Returns the complete form structure including steps, fields with their types and options, and conditions. This is the primary endpoint for rendering a form on the client.

```
GET /api/v1/forms/{uuid}/schema
```

### Request

::: code-group

```bash [curl]
curl http://localhost:8000/api/v1/forms/550e8400-e29b-41d4-a716-446655440000/schema
```

```typescript [TypeScript SDK]
const schema = await client.forms.schema('550e8400-e29b-41d4-a716-446655440000')
```

:::

### Response

```json
{
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Job Application",
    "slug": "job-application",
    "description": "Multi-step job application form",
    "is_active": true,
    "version": 2,
    "steps": [
      {
        "id": 1,
        "step_number": 1,
        "title": "Personal Info",
        "description": "Basic information about you",
        "is_visible": true,
        "meta": {
          "icon": "user"
        },
        "fields": [
          {
            "id": 1,
            "code": "full_name",
            "label": "Full Name",
            "placeholder": "Jane Doe",
            "description": null,
            "is_required": true,
            "is_repeatable": false,
            "default_value": null,
            "order": 1,
            "field_type": {
              "name": "text",
              "component": "text-input"
            },
            "options": [],
            "conditions": []
          },
          {
            "id": 2,
            "code": "email",
            "label": "Email Address",
            "placeholder": "jane@example.com",
            "description": "We'll use this to contact you",
            "is_required": true,
            "is_repeatable": false,
            "default_value": null,
            "order": 2,
            "field_type": {
              "name": "email",
              "component": "email-input"
            },
            "options": [],
            "conditions": []
          },
          {
            "id": 3,
            "code": "employment_status",
            "label": "Employment Status",
            "placeholder": null,
            "description": null,
            "is_required": true,
            "is_repeatable": false,
            "default_value": null,
            "order": 3,
            "field_type": {
              "name": "select",
              "component": "select-input"
            },
            "options": [
              { "label": "Employed", "value": "employed", "order": 1 },
              { "label": "Self-Employed", "value": "self_employed", "order": 2 },
              { "label": "Unemployed", "value": "unemployed", "order": 3 },
              { "label": "Student", "value": "student", "order": 4 }
            ],
            "conditions": []
          },
          {
            "id": 4,
            "code": "company_name",
            "label": "Company Name",
            "placeholder": "Acme Corp",
            "description": null,
            "is_required": false,
            "is_repeatable": false,
            "default_value": null,
            "order": 4,
            "field_type": {
              "name": "text",
              "component": "text-input"
            },
            "options": [],
            "conditions": [
              {
                "depends_on_field_id": 3,
                "operator": "equals",
                "value": "employed",
                "action": "show"
              }
            ]
          }
        ]
      },
      {
        "id": 2,
        "step_number": 2,
        "title": "Experience",
        "description": "Tell us about your experience",
        "is_visible": true,
        "meta": null,
        "fields": [
          {
            "id": 5,
            "code": "resume",
            "label": "Upload Resume",
            "placeholder": null,
            "description": "PDF or DOCX, max 5MB",
            "is_required": true,
            "is_repeatable": false,
            "default_value": null,
            "order": 1,
            "field_type": {
              "name": "file",
              "component": "file-input"
            },
            "options": [],
            "conditions": []
          },
          {
            "id": 6,
            "code": "cover_letter",
            "label": "Cover Letter",
            "placeholder": "Tell us why you're a great fit...",
            "description": null,
            "is_required": false,
            "is_repeatable": false,
            "default_value": null,
            "order": 2,
            "field_type": {
              "name": "textarea",
              "component": "textarea-input"
            },
            "options": [],
            "conditions": []
          }
        ]
      }
    ]
  }
}
```

### Using the Schema

The schema response gives you everything needed to render the form:

1. **Iterate over `steps`** to build your multi-step navigation
2. **Iterate over each step's `fields`** to render inputs
3. **Use `field_type.component`** to select the right input component
4. **Render `options`** for select, radio, and checkbox fields
5. **Evaluate `conditions`** client-side for instant feedback, or call the conditions endpoint for server-side evaluation
