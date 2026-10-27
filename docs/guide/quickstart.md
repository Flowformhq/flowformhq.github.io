# Quickstart

Get FlowForm running in 5 minutes — from static HTML endpoint to custom multi-step intake API.

---

## Deployment Options

You can use FlowForm in two ways:
1. **FlowForm Cloud (Managed)**: Register an endpoint at [api.flowformhq.com/admin/register](https://api.flowformhq.com/admin/register) ($0 free tier or Pay-As-You-Go).
2. **Self-Hosted (Open Source)**: Deploy your own instance via Docker or Laravel on client infrastructure.

---

## Mode 1 · Zero-JS HTML Form Endpoint (30 Seconds)

If you have a static site (Astro, Next.js, Hugo, HTML), point your `<form>` tag directly to your FlowForm endpoint. No client-side JavaScript or API token required:

```html
<form action="https://api.flowformhq.com/f/contact-us" method="POST">
  <!-- Honeypot anti-spam defense (hidden from real users) -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />

  <!-- Form Fields -->
  <label for="name">Name</label>
  <input type="text" id="name" name="name" required />

  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <!-- Optional Custom Redirect URL -->
  <input type="hidden" name="_next" value="https://yourdomain.com/thank-you" />

  <button type="submit">Submit Inquiry</button>
</form>
```

### Or Submit via JSON / AJAX

```bash
curl -X POST https://api.flowformhq.com/f/contact-us \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "message": "Hello!"}'
```

---

## Mode 2 · Headless Multi-Step Intake API

For custom React, Vue, Next.js, or Livewire wizards with server-evaluated conditional logic:

### 1. Fetch Form Schema
```bash
curl https://api.flowformhq.com/api/v1/forms/{uuid}/schema
```
The schema returns steps, fields, options, and branching rules.

### 2. Create a Draft Submission
```bash
curl -X POST https://api.flowformhq.com/api/v1/submissions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"form_uuid": "YOUR_FORM_UUID"}'
```

### 3. Save Step Values
```bash
curl -X POST https://api.flowformhq.com/api/v1/submissions/{submission_uuid}/values \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"values": [
    {"field_code": "organization_name", "value": "Acme Health"},
    {"field_code": "require_encryption", "value": "yes"}
  ]}'
```

### 4. Advance Step or Complete
```bash
# Advance to next step
curl -X POST https://api.flowformhq.com/api/v1/submissions/{submission_uuid}/advance \
  -H "Authorization: Bearer YOUR_TOKEN"

# Complete submission
curl -X PATCH https://api.flowformhq.com/api/v1/submissions/{submission_uuid} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

---

## Key Security Features

- **Field-Level AES-256 Encryption at Rest**: Enable encryption on any form to automatically protect sensitive PII and medical intake data (HIPAA / GDPR compliant).
- **Signed Outbound Webhooks**: Verify incoming payloads with HMAC-SHA256 (`X-FlowForm-Signature`) and automatic 3-tier exponential backoff retries.

---

## Next Steps

- [Security & Encryption](/guide/security-encryption) — how AES-256 field encryption works
- [Webhooks & Retries](/guide/webhooks) — verify HMAC-SHA256 signatures in Node, Python, and PHP
- [Self-Hosting Guide](/guide/deployment) — production deployment via Docker Compose
