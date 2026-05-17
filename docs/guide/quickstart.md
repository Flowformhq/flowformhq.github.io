# Quickstart

Get a FlowForm form running in 15 minutes — from clone to working submission.

## Prerequisites

- PHP 8.3+
- Composer
- SQLite (default) or MySQL/PostgreSQL

## 1. Clone and install

```bash
git clone https://github.com/flowformhq/flowform.git
cd flowform
composer install
```

## 2. Configure environment

```bash
cp .env.example .env
php artisan key:generate
```

## 3. Set up the database

```bash
touch database/database.sqlite
php artisan migrate --seed
```

This creates the schema and seeds sample data (a demo form with steps and fields).

## 4. Create an API token

Start the server:

```bash
php artisan serve
```

Open `http://localhost:8000/admin` and log in with the seeded user. Go to the API tokens section and generate a token — you'll need it for submission endpoints.

## 5. Fetch a form schema

```bash
curl http://localhost:8000/api/v1/forms
```

Pick a `uuid` from the response, then:

```bash
curl http://localhost:8000/api/v1/forms/{uuid}/schema
```

The schema endpoint returns the full form structure: steps, fields, options, and conditions — everything you need to render the form on any frontend.

## 6. Submit a response

```bash
# Create a draft submission
curl -X POST http://localhost:8000/api/v1/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"form_uuid": "YOUR_FORM_UUID"}'

# Save field values
curl -X POST http://localhost:8000/api/v1/submissions/{submission_uuid}/values \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"values": [{"field_code": "email", "value": "test@example.com"}]}'

# Complete the submission
curl -X PATCH http://localhost:8000/api/v1/submissions/{submission_uuid} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## 7. Try a starter kit

Skip building a frontend from scratch — use a starter kit:

```bash
# React + Vite
git clone https://github.com/flowformhq/flowform.git
cd starter-kit-react
npm install
cp .env.example .env
# Edit .env with your FlowForm URL and token
npm run dev
```

See [Starter Kits](/guide/starter-kits) for Vue and Livewire options.

## Next steps

- [Core Concepts](/guide/concepts) — understand forms, steps, fields, and conditions
- [Conditional Logic](/guide/conditional-logic) — show, hide, and require fields dynamically
- [Deployment Guide](/guide/deployment) — production self-hosting with Docker
- [API Reference](/api/overview) — full endpoint documentation
