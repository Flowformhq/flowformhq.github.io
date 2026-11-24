# Plain HTML Form

Point any standard HTML `<form>` directly to FlowForm with zero JavaScript. FlowForm stores the submission, sends notifications and, if you set a Redirect URL on the form, sends your visitor to your thank-you page.

---

## Minimal Snippet

```html
<form action="https://forms.example.com/f/contact-us" method="POST">
  <!-- Honeypot spam trap: keep hidden from human visitors -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />


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

1. **Recommended:** set **Redirect URL** in the form settings to your full thank-you page (for example `https://example.com/thank-you`). FlowForm responds with `302 Found` to it after every successful submission.
2. Per-page override: add `<input type="hidden" name="_next" value="https://example.com/thank-you" />`. FlowForm only follows `_next` when its host is the instance's own host or is listed in `FLOWFORM_ALLOWED_REDIRECT_HOSTS` (self-hosted setting); otherwise it falls back to the Redirect URL. Don't use a relative path: `/thank-you` redirects to that path on the FlowForm host, not on your site.
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
- **CORS & Redirects:** Native HTML `<form>` submits are normal browser navigations and are not blocked by CORS. For redirects, use the form's **Redirect URL** setting; `_next` to your own domain only works if that host is in `FLOWFORM_ALLOWED_REDIRECT_HOSTS` on the FlowForm instance.
