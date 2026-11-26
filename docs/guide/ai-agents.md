# AI Coding Agents Quickstart

A deterministic guide for AI coding agents (Claude Code, Codex, Cursor, v0, Lovable, Bolt) adding a form or reading submissions from a FlowForm instance.

---

## Add a Contact Form in 3 Steps

### 1. Create an Endpoint Form

Create an **Endpoint** form (`type: "endpoint"`) in the FlowForm admin panel or programmatically via the `create_form` MCP tool.

- **Redirect handling:** Never pass a relative path (like `/thank-you`) in `_next` because relative paths resolve on the FlowForm host, not your app. Instead, set **Redirect URL** in the FlowForm form settings, or pass an absolute `_next` URL whose domain is listed in the form's **Allowed Domains** (or `FLOWFORM_ALLOWED_REDIRECT_HOSTS`).
- **Mail notifications (optional):** Self-hosted deployments use the instance's configured SMTP provider in Admin Panel -> Mail Settings.

### 2. Copy the Form Slug

Record the FlowForm base URL (for example `https://forms.example.com` or `http://localhost:8000`) and the form `slug` (for example `contact-us`). Both `POST /f/{slug}` and `POST /api/v1/f/{slug}` also accept the form `access_key` or `uuid`.

### 3. Paste the Form Snippet

Use a standard HTML form when the browser navigates on submit, or JSON `fetch` when submitting inline without a page reload. Include the hidden `_gotcha` honeypot input in every form.

#### Option A: Zero-JS HTML Form (`POST /f/{slug}`)

```html
<form action="https://forms.example.com/f/contact-us" method="POST">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />

  <label for="name">Name</label>
  <input id="name" type="text" name="name" required />

  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send Message</button>
</form>
```

For Astro, Next.js, Nuxt, SvelteKit, Hugo/Eleventy/Jekyll, or server/mobile clients, see the stack-specific guides:
- [Endpoints Overview](/guide/endpoints/)
- [HTML Forms](/guide/endpoints/html)
- [JavaScript (fetch & FormData)](/guide/endpoints/javascript)
- [Next.js](/guide/endpoints/nextjs)
- [Astro](/guide/endpoints/astro)
- [Nuxt](/guide/endpoints/nuxt)
- [SvelteKit](/guide/endpoints/sveltekit)
- [Static Site Generators](/guide/endpoints/static-site-generators)
- [Mobile & Server Clients](/guide/endpoints/mobile-and-servers)

#### Option B: Browser JavaScript (`POST /api/v1/f/{slug}`)

```html
<form id="contact-form">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />
  <input type="text" name="name" required placeholder="Your name" />
  <input type="email" name="email" required placeholder="you@example.com" />
  <textarea name="message" required placeholder="How can we help?"></textarea>
  <button type="submit">Send</button>
  <p id="form-status" aria-live="polite"></p>
</form>

<script>
  const form = document.getElementById('contact-form');
  const statusEl = document.getElementById('form-status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(form).entries());

    const response = await fetch('https://forms.example.com/api/v1/f/contact-us', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      statusEl.textContent = 'Message sent.';
      form.reset();
    } else {
      statusEl.textContent = result.error || 'Submission failed.';
    }
  });
</script>
```

---

## Exact Response Contract

- `POST /f/{slug}` accepts `application/x-www-form-urlencoded`, `multipart/form-data`, or JSON. When `Accept: application/json` is absent and the form has a **Redirect URL** (or a valid `_next` / `_redirect`), it responds with `302 Found`. Otherwise it returns `200 OK` JSON.
- `POST /api/v1/f/{slug}` always responds with JSON and never redirects.

### Success (`200 OK`)

```json
{
  "success": true,
  "message": "Submission received",
  "id": "22c7a46f-fca5-4ad8-8348-14ccd6fd7cb0"
}
```

When `_gotcha` or `_honeypot` is non-empty, FlowForm discards the submission and returns `200 OK` with `"id": null`.

### Errors

| Status | Cause | Body |
| :--- | :--- | :--- |
| `403` | `Origin` / `Referer` not in the form's Allowed Domains, or the form requires a server secret (`X-FlowForm-Secret` header / `?_secret=`) that is missing or wrong | `{"success": false, "error": "..."}` with `Submissions are not permitted from this domain origin.`, `Endpoint secret is required.` or `Invalid endpoint secret.` |
| `404` | Form slug not found, form is inactive, or form is not in `endpoint` mode | `{"success": false, "error": "Form endpoint not found or inactive."}` |
| `422` | Missing/invalid captcha token (`cf-turnstile-response` / `h-captcha-response`), or uploaded file violates size/MIME rules | `{"success": false, "error": "...", "errors": {...}}` |
| `429` | Per-IP rate limit (`10` req/min/IP), or the owner's quota is exhausted on instances that enable metering (`FLOWFORM_METERING_ENABLED`, off by default) | `{"success": false, "error": "..."}` or standard throttle JSON |

---

## Honeypot & Reserved Control Fields

FlowForm strips these reserved fields from saved submission data:

- `_gotcha`, `_honeypot`: Silent anti-spam trap. Keep hidden and empty for real users.
- `_next`, `_redirect`: Optional redirect target for `POST /f/{slug}`. Must be an absolute URL matching `APP_URL`, the form's **Allowed Domains**, or `FLOWFORM_ALLOWED_REDIRECT_HOSTS`.
- `_token`, `_method`, `_secret`, `_source`, `cf-turnstile-response`, `_turnstile`, `g-recaptcha-response`, `h-captcha-response`, `_hcaptcha`: also stripped automatically. `_source` (e.g. `?_source=astro`) is kept as attribution in the submission's metadata.
- `_replyto` is not stripped: it is stored like any other field and becomes the Reply-To of notification emails (falling back to `reply_to`, then `email`).
- File uploads (`<input type="file" name="attachment" />` with `enctype="multipart/form-data"`) are supported directly on endpoint forms.

---

## Connecting via MCP (`POST /api/v1/mcp`)

FlowForm exposes a JSON-RPC 2.0 Model Context Protocol endpoint at `POST /api/v1/mcp`. Authentication via a Laravel Sanctum bearer token is required. Create a scoped token in **Admin Panel -> API Tokens** or via Artisan (`php artisan token:create`).

### Required Token Abilities & Tools

| Tool Name | Required Ability | Arguments | Description |
| :--- | :--- | :--- | :--- |
| `list_forms` | `forms:read` | `limit` (integer, optional, default `20`, max `50`) | List active FlowForm endpoints and wizards visible to the user |
| `get_form_schema` | `forms:read` | `identifier` (string, required: UUID or slug) | Fetch steps, fields, options, captcha settings, and conditions |
| `create_form` | `forms:write` | `name` (string, required), `slug` (string), `type` (`"endpoint"` \| `"wizard"`), `is_encrypted` (boolean), `webhook_url` (string), `steps` (string[]) | Create a new endpoint or multi-step form |
| `submit_form` | `submissions:write` | `form_slug` (string, required), `data` (object, required) | Store a submission payload and dispatch webhooks |
| `list_submissions` | `submissions:read` | `form_slug` (string, required), `limit` (integer, optional, default `10`, max `30`) | List recent submissions for a form |

### Example MCP Calls

Initialize and list available tools:

```bash
curl -sS -X POST http://localhost:8000/api/v1/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

Create an endpoint form via MCP:

```bash
curl -sS -X POST http://localhost:8000/api/v1/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "create_form",
      "arguments": {
        "name": "Contact Us",
        "slug": "contact-us",
        "type": "endpoint"
      }
    }
  }'
```

Inspect available forms via MCP:

```bash
curl -sS -X POST http://localhost:8000/api/v1/mcp \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "list_forms",
      "arguments": {"limit": 20}
    }
  }'
```

You can also inspect the full AI-readable reference bundle at [/llms.txt](/llms.txt) and [/llms-full.txt](/llms-full.txt).
