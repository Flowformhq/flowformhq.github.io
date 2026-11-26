# Submit From Any Stack

FlowForm lets any website, app, or server send form submissions to a single hosted or self-hosted endpoint without building your own backend.

Create an **Endpoint** form in the FlowForm admin panel, copy its `slug` or `access_key`, and point your form or HTTP client to it.

---

## Endpoint URLs

Every active Endpoint form exposes two routes. Both accept your form's `slug`, `access_key`, or `uuid`:

| Route | Intended Caller | Default Success Response |
| :--- | :--- | :--- |
| `POST https://forms.example.com/f/{slug}` | HTML `<form action="...">` | `302 Redirect` to `_next` / `redirect_url` (or `200 JSON` if none set) |
| `POST https://forms.example.com/api/v1/f/{slug}` | JavaScript `fetch`, mobile apps, server-to-server | `200 JSON` (`{ "success": true, "message": "Submission received", "id": "<uuid>" }`) |

If you send `Accept: application/json` to `/f/{slug}`, FlowForm also returns JSON instead of redirecting.

---

## Reserved Fields

FlowForm strips reserved control fields before saving submission data so they never clutter your inbox or database:

| Field | Purpose |
| :--- | :--- |
| `_gotcha`, `_honeypot` | Anti-spam honeypot. If either field is non-empty, FlowForm returns a normal success response without saving the submission or sending notifications. |
| `_next`, `_redirect` | Redirect target after an HTML `<form>` submission. Use an absolute URL whose host matches the FlowForm instance's `APP_URL` or is listed in `FLOWFORM_ALLOWED_REDIRECT_HOSTS`. A relative path such as `/thank-you` redirects to that path **on the FlowForm host**, not on your site. For most sites, set **Redirect URL** in the form settings instead. |
| `_token`, `_method` | Stripped automatically so CSRF tokens or HTTP method spoofing fields from frameworks do not leak into submission payloads. |

---

## Minimal Example

```html
<form action="https://forms.example.com/f/contact-us" method="POST">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />

  <label for="name">Name</label>
  <input id="name" type="text" name="name" required />

  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
```

---

## Response Codes & Error Handling

When returning JSON, FlowForm responds with predictable status codes:

```json
// 200 OK
{
  "success": true,
  "message": "Submission received",
  "id": "22c7a46f-fca5-4ad8-8348-14ccd6fd7cb0"
}
```

| Status | Meaning | Response Body |
| :--- | :--- | :--- |
| `200` | Submission saved (or honeypot triggered) | `{"success": true, "message": "Submission received", "id": "<uuid>"}` |
| `403` | Request `Origin` or `Referer` is not in `allowed_domains` | `{"success": false, "error": "Submissions are not permitted from this domain origin."}` |
| `404` | Form does not exist, is inactive, or is not in `endpoint` mode | `{"success": false, "error": "Form endpoint not found or inactive."}` |
| `422` | Validation failure on submitted payload | `{"success": false, "error": "..."}` |
| `429` | Rate limit (`10` requests/min/IP) or owner quota exceeded | `{"success": false, "error": "..."}` (or standard rate-limiter JSON) |

---

## Spam Basics (Honeypot)

Include a hidden `_gotcha` (or `_honeypot`) input in browser forms and JSON payloads. Bots that auto-fill every field trigger the trap and are silently discarded while returning `200 OK`:

```html
<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />
```

When posting JSON from JavaScript or a framework action, send `_gotcha` along with your form fields:

```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "_gotcha": ""
}
```

---

## CORS & Allowed Domains

FlowForm sends `Access-Control-Allow-Origin: *`, `Access-Control-Allow-Methods: POST, OPTIONS`, and `Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With` on endpoint responses so browser `fetch()` calls work from any origin without preflight issues.

To lock a form down to your own websites, set **Allowed Domains** (`allowed_domains`) on the form (comma-separated, wildcards supported):

```text
example.com, *.example.com
```

FlowForm checks the request's `Origin` header (falling back to `Referer`). If the domain does not match, FlowForm rejects the submission with `403 Forbidden`. Requests with no `Origin` or `Referer` header (such as `curl` or server-to-server actions) pass the browser origin check.

---

## Choose Your Stack

- [HTML Forms](/guide/endpoints/html) - Zero-JS HTML `<form>` with honeypot and `_next` redirect
- [JavaScript (fetch & FormData)](/guide/endpoints/javascript) - Vanilla browser JS with JSON and `FormData`
- [Next.js](/guide/endpoints/nextjs) - App Router Server Actions and Client Components
- [Astro](/guide/endpoints/astro) - Static `<form>` and Astro Actions
- [Nuxt](/guide/endpoints/nuxt) - Vue `$fetch` component submission
- [SvelteKit](/guide/endpoints/sveltekit) - Server-side form actions with progressive enhancement
- [Static Site Generators](/guide/endpoints/static-site-generators) - Hugo, Eleventy, and Jekyll partials
- [Mobile & Server Clients](/guide/endpoints/mobile-and-servers) - curl, React Native, Flutter, Python, and PHP/Laravel
- [Webflow](/guide/endpoints/webflow) - Native Custom Action and HTML/fetch embeds
- [Framer](/guide/endpoints/framer) - Native Webhook destination and Embed HTML blocks
- [Carrd](/guide/endpoints/carrd) - Custom Send to URL forms and Code Embeds
- [Squarespace & Wix](/guide/endpoints/squarespace-wix) - Code Block and Embed HTML workarounds
- [WordPress](/guide/endpoints/wordpress/) - Classic Custom HTML blocks, headless WP, and page-builder webhooks ([Elementor Pro](/guide/endpoints/wordpress/elementor), [Bricks](/guide/endpoints/wordpress/bricks), [Breakdance](/guide/endpoints/wordpress/breakdance), [Fluent Forms](/guide/endpoints/wordpress/fluent-forms))

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** Your `Origin` or `Referer` header does not match the form's `allowed_domains`. Add your domain (including `localhost` during local development) or leave `allowed_domains` blank to allow all origins.
- **429 Too Many Requests:** Public endpoints enforce a `10` requests-per-minute-per-IP rate limit (`endpoint-submissions`). Wait 60 seconds before retrying, or avoid rapid automated test bursts from a single IP.
- **CORS preflight errors in browser dev tools:** Ensure you post to `/api/v1/f/{slug}` or `/f/{slug}` and only send standard headers (`Content-Type`, `Accept`, `X-Requested-With`).
- **`_next` redirect ignored (returns JSON instead):** FlowForm only redirects `_next` to the instance's own host or to hosts in `FLOWFORM_ALLOWED_REDIRECT_HOSTS` (`localhost,127.0.0.1` by default). Set **Redirect URL** on the form instead (no server config needed), or, on a self-hosted instance, add your domain to `FLOWFORM_ALLOWED_REDIRECT_HOSTS`.
- **Redirected to a 404 on the FlowForm domain:** a relative `_next` like `/thank-you` resolves against the FlowForm host. Use **Redirect URL** with your full thank-you page URL.
