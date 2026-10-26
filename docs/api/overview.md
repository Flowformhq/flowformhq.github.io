# API Overview

FlowForm exposes a RESTful JSON API under `/api/v1`. All endpoints return JSON and follow consistent conventions for pagination, errors, and authentication.

## Base URL

```
http://localhost:8000/api/v1
```

In production, replace with your deployed domain.

## Authentication

FlowForm uses [Laravel Sanctum](https://laravel.com/docs/sanctum) for API authentication via bearer tokens.

**Public endpoints** (listing and reading forms) require no authentication.

**Authenticated endpoints** (creating and managing submissions) require a bearer token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/submissions
```

### Obtaining a Token

Tokens are created through Laravel Sanctum. The database seeder generates a development token automatically:

```bash
php artisan db:seed
# Output: API Token: 1|abc123...
```

For production, create tokens programmatically:

```php
$token = $user->createToken('api-token')->plainTextToken;
```

## Request Format

- Use `Content-Type: application/json` for request bodies
- Send data as JSON in the request body for POST and PATCH requests
- Use query parameters for filtering and pagination on GET requests

## Response Format

All successful responses wrap data in a `data` key:

```json
{
  "data": {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Contact Form",
    "slug": "contact-form"
  }
}
```

Paginated responses include pagination metadata:

```json
{
  "data": [...],
  "links": {
    "first": "http://localhost:8000/api/v1/forms?page=1",
    "last": "http://localhost:8000/api/v1/forms?page=3",
    "prev": null,
    "next": "http://localhost:8000/api/v1/forms?page=2"
  },
  "meta": {
    "current_page": 1,
    "last_page": 3,
    "per_page": 15,
    "total": 42
  }
}
```

## Error Format

Errors return an appropriate HTTP status code with a JSON body:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "form_uuid": ["The form uuid field is required."]
  }
}
```

### Common Status Codes

| Code | Meaning                                      |
| ---- | -------------------------------------------- |
| 200  | Success                                      |
| 201  | Created (new submission)                     |
| 401  | Unauthorized -- missing or invalid token     |
| 404  | Not found -- invalid UUID or slug            |
| 422  | Validation error -- check the `errors` field |
| 429  | Rate limited -- slow down                    |
| 500  | Server error                                 |

## Rate Limiting

The API uses Laravel's built-in rate limiting. By default, requests are throttled to 60 requests per minute per IP. Authenticated requests may have higher limits depending on your configuration.

When rate limited, the response includes headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
Retry-After: 30
```

## Endpoint Summary

### Mode 1: Headless Form Endpoints (Web3Forms / Formspree Alternative)

Public endpoints for static sites (Astro, Next.js, Hugo, HTML) requiring zero bearer token authentication:

| Method | Endpoint             | Description                                                   |
| ------ | -------------------- | ------------------------------------------------------------- |
| POST   | `/f/{slug}`          | Standard HTML form submission with `_next` redirect & honeypot |
| POST   | `/api/v1/f/{slug}`   | Headless JSON / AJAX endpoint returning HTTP 200 + UUID       |

### Mode 2: Multi-Step Forms & Schemas (Public)

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/api/v1/forms`                | List active forms (paginated) |
| GET    | `/api/v1/forms/{uuid}`         | Get form by UUID              |
| GET    | `/api/v1/forms/{slug}/by-slug` | Get form by slug              |
| GET    | `/api/v1/forms/{uuid}/schema`  | Full form schema              |

### Mode 2: Form Submissions & State Machine (Authenticated)

| Method | Endpoint                                  | Description                     |
| ------ | ----------------------------------------- | ------------------------------- |
| POST   | `/api/v1/submissions`                     | Create draft submission         |
| GET    | `/api/v1/submissions/{uuid}`              | Get submission with values      |
| PATCH  | `/api/v1/submissions/{uuid}`              | Update status or meta           |
| POST   | `/api/v1/submissions/{uuid}/values`       | Upsert field values             |
| POST   | `/api/v1/submissions/{uuid}/advance`      | Advance to next step            |
| POST   | `/api/v1/submissions/{uuid}/retreat`      | Retreat to previous step        |
| GET    | `/api/v1/submissions/{uuid}/conditions`   | Get field visibility states     |
