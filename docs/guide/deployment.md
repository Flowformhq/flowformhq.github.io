# Deployment Guide

Production self-hosting guide for FlowForm. Covers Docker Compose, one-click deploys, and hardening.

## Docker Compose (recommended)

### 1. Clone the repository

```bash
git clone https://github.com/flowformhq/flowform.git
cd flowform
```

### 2. Create your environment file

```bash
cp .env.example .env
```

Edit `.env` with production values:

```bash
APP_NAME=FlowForm
APP_ENV=production
APP_KEY=base64:generate-a-32-char-key
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=flowform
DB_USERNAME=flowform
DB_PASSWORD=a-strong-password

CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=database

LOG_CHANNEL=stderr
LOG_LEVEL=warning

FLOWFORM_TELEMETRY_ENABLED=true
```

### 3. Generate an app key

```bash
php artisan key:generate --env
```

### 4. Start the stack

```bash
docker compose up -d
```

### 5. Run migrations

```bash
docker compose exec flowform php artisan migrate --force
```

### 6. Create an admin user

```bash
docker compose exec flowform php artisan tinker
```

```php
\App\Models\User::create([
    'name' => 'Admin',
    'email' => 'admin@yourdomain.com',
    'password' => bcrypt('your-secure-password'),
]);
```

### 7. Optimize for production

```bash
docker compose exec flowform php artisan config:cache
docker compose exec flowform php artisan route:cache
docker compose exec flowform php artisan view:cache
```

## One-click deploy

### Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/flowform)

Railway deploys from the GitHub repo with automatic SSL and a managed database.

### Render

[![Deploy to Render](https://render.com/images/deploy-to-renderbutton.svg)](https://render.com/deploy)

### DigitalOcean App Platform

Use the `deploy-do.json` manifest in the repository root.

## Production hardening checklist

### Security

- [ ] `APP_DEBUG=false` in production
- [ ] `APP_KEY` is a strong, randomly generated key
- [ ] Database uses a strong, unique password
- [ ] TLS/HTTPS enabled (via reverse proxy or platform)
- [ ] `SESSION_DRIVER` set to `redis` or `database` (not `file`)
- [ ] `CACHE_STORE` set to `redis` or `database`
- [ ] Rate limiting is enabled (default: 60 req/min public, 120 req/min authenticated)
- [ ] Sanctum token expiration configured
- [ ] CORS configured to allow only your frontend domains

### Database

- [ ] Using MySQL or PostgreSQL (not SQLite) for production
- [ ] Automated daily backups configured
- [ ] Connection encryption (TLS to database) enabled
- [ ] Database user has minimal required permissions

### Application

- [ ] Config cache enabled: `php artisan config:cache`
- [ ] Route cache enabled: `php artisan route:cache`
- [ ] View cache enabled: `php artisan view:cache`
- [ ] OpCache configured (included in Docker image)
- [ ] Queue worker running via Supervisor (included in Docker image)
- [ ] Log retention configured (rotate logs, don't let disk fill)

### Networking

- [ ] Application behind a reverse proxy (Nginx, Caddy, or platform load balancer)
- [ ] Security headers set: `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`
- [ ] Upload size limits configured (`upload_max_filesize`, `post_max_size`)
- [ ] Only necessary ports exposed (80/443)

### Monitoring

- [ ] Health check endpoint configured: `GET /api/v1/forms` (returns 200)
- [ ] Log aggregation set up (stdout → your log collector)
- [ ] Alert on 5xx error rate spikes
- [ ] Disk space monitoring on volumes

### Backups

- [ ] Database: daily automated backups, tested restore
- [ ] `storage/` volume: backed up (contains uploaded files and logs)
- [ ] `.env` file: stored securely outside the server (secrets manager)

## Environment variables reference

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | FlowForm | Application display name |
| `APP_ENV` | local | `local`, `staging`, or `production` |
| `APP_KEY` | — | Encryption key (generate with `php artisan key:generate`) |
| `APP_DEBUG` | true | Show detailed errors. **Must be `false` in production** |
| `APP_URL` | http://localhost | Canonical URL for the application |
| `DB_CONNECTION` | sqlite | `sqlite`, `mysql`, or `pgsql` |
| `DB_HOST` | — | Database host |
| `DB_PORT` | — | Database port |
| `DB_DATABASE` | — | Database name |
| `DB_USERNAME` | — | Database user |
| `DB_PASSWORD` | — | Database password |
| `CACHE_STORE` | database | `file`, `database`, or `redis` |
| `SESSION_DRIVER` | database | `file`, `database`, or `redis` |
| `QUEUE_CONNECTION` | database | `sync`, `database`, or `redis` |
| `FLOWFORM_TELEMETRY_ENABLED` | true | Enable/disable telemetry |
| `FLOWFORM_TELEMETRY_ENDPOINT` | — | Telemetry ingestion URL |
| `GITHUB_CLIENT_ID` | — | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | — | GitHub OAuth app client secret |
| `GOOGLE_CLIENT_ID` | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | Google OAuth client secret |
