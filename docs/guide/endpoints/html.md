# Plain HTML Form

Point any standard HTML `<form>` directly to FlowForm with zero JavaScript. FlowForm stores the submission, dispatches notifications, and redirects your visitor to a thank-you page.

---

## Minimal Snippet

```html
<form action="https://forms.example.com/f/contact-us" method="POST">
  <!-- Honeypot spam trap: keep hidden from human visitors -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />

  <!-- Optional: redirect after successful submission -->
  <input type="hidden" name="_next" value="/thank-you" />

  <div>
    <label for="name">Name</label>
    <input id="name" type="text" name="name" required />
  </div>

  <div>
    <label for="email">Email</label>
    <input id="email" type="email" name="email" required />
  </div>

  <div>
    <label for="message">Message</label>
    <textarea id="message" name="message" rows="4" required></textarea>
  </div>

  <button type="submit">Send Message</button>
</form>
```

---

## Honeypot Field

The `_gotcha` input sits off-screen (`style="display:none"`) with `tabindex="-1"` and `autocomplete="off"` so keyboard navigation and password managers skip it. If a bot fills it out, FlowForm treats the request as spam, discards the payload, and redirects or responds as if it succeeded.

---

## Success & Error Handling

### Redirects (`_next` vs. Form Settings)

1. If `_next` (or `_redirect`) is a safe relative path starting with `/` (such as `/thank-you`) or points to an allowlisted host in `FLOWFORM_ALLOWED_REDIRECT_HOSTS`, FlowForm responds with `302 Found` to that URL.
2. If `_next` is omitted or not allowlisted, FlowForm falls back to the form's configured `redirect_url`.
3. If neither is set, FlowForm returns `200 OK` with JSON:

```json
{
  "success": true,
  "message": "Submission received",
  "id": "22c7a46f-fca5-4ad8-8348-14ccd6fd7cb0"
}
```

### Handling Errors

In plain HTML submissions, errors (`403`, `404`, `429`) render JSON responses from the FlowForm endpoint. If you want inline error banners without leaving your page, enhance the form with [vanilla JavaScript `fetch`](/guide/endpoints/javascript).

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** Browsers send a `Referer` header on native `<form>` submits. If `allowed_domains` is set on the form, include the exact domain serving the HTML page (or `localhost` when testing locally).
- **429 Too Many Requests:** Rapidly submitting a test form more than `10` times per minute from the same IP triggers FlowForm's rate limiter.
- **CORS & Redirects:** Native HTML `<form>` submits are normal browser navigations and are not blocked by CORS. However, `_next` URLs pointing to an external domain (such as `https://example.com/thank-you`) will not redirect unless that host is added to `FLOWFORM_ALLOWED_REDIRECT_HOSTS` on your FlowForm instance.
