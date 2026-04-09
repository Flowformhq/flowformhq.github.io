# Getting Started

FlowForm is a headless, API-first form and workflow engine built with Laravel 13, Filament 4, and PHP 8.3. This guide walks you through installation to your first API call.

## Requirements

- PHP 8.3+
- Composer
- Node.js 18+ and npm
- SQLite (default) or MySQL/PostgreSQL

## Installation

Clone the repository and run the setup script:

```bash
git clone https://github.com/flowformhq/flowform.git
cd flowform
composer setup
```

The `composer setup` command handles everything:
1. Installs PHP dependencies
2. Copies `.env.example` to `.env` (if needed)
3. Generates the application key
4. Runs database migrations
5. Installs Node dependencies and builds frontend assets

## Seed the Database

Seed field types and create an admin user with an API token:

```bash
php artisan db:seed
```

This creates:
- An admin user (`admin@flowform.dev`)
- All built-in field types (text, email, number, textarea, select, checkbox, radio, date, file, heading, paragraph)
- A Sanctum API token printed to the console

**Save the API token** from the output. You will need it for authenticated API calls.

```
API Token: 1|abc123...
```

## Start the Development Server

```bash
composer dev
```

This starts four processes concurrently:
- **Laravel server** at `http://localhost:8000`
- **Queue worker** for background jobs
- **Pail log viewer** for real-time logs
- **Vite dev server** for frontend assets

## Access the Admin Panel

Open `http://localhost:8000/admin` in your browser. Log in with:

- **Email:** `admin@flowform.dev`
- **Password:** `password`

From the admin panel you can create forms, define steps and fields, and view submissions.

## Make Your First API Call

List all active forms:

```bash
curl http://localhost:8000/api/v1/forms
```

Get the full schema for a specific form (replace the UUID):

```bash
curl http://localhost:8000/api/v1/forms/{uuid}/schema
```

Create a submission (requires authentication):

```bash
curl -X POST http://localhost:8000/api/v1/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"form_uuid": "your-form-uuid"}'
```

## Running Tests

```bash
composer test
```

This clears the config cache and runs the Pest test suite.

## Next Steps

- Read [Core Concepts](/guide/concepts) to understand the data model
- Explore the [API Reference](/api/overview) for all endpoints
- Check out the [TypeScript SDK](/sdk/typescript) for client integration
