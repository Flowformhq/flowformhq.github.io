# Framer

Send submissions from a Framer site to FlowForm using Framer's native **Webhook** destination or a custom HTML **Embed** component.

Reference: [Framer Help Center](https://www.framer.com/help/) and [Framer Forms Guide](https://www.framer.com/academy/lessons/forms).

---

## Option 1 · Native Framer Form (Send to Webhook)

Framer's built-in **Form** component can post JSON submissions straight to any `https://` URL without writing HTML or JavaScript:

1. Create an **Endpoint** form in FlowForm and copy its JSON endpoint URL: `https://forms.example.com/api/v1/f/contact-us` (note Framer requires `https://` URLs).
2. In Framer, select your **Form** component on the canvas.
3. In the right-hand properties panel under **Send To**, click **Add...** and choose **Webhook**.
4. Paste `https://forms.example.com/api/v1/f/contact-us`.
5. Configure your Framer form inputs with clear field names (`name`, `email`, `message`) and choose either inline **Success/Error** states or a redirect URL directly inside Framer's form settings.
6. FlowForm returns `200 OK` with `{"success": true, "message": "Submission received", "id": "<uuid>"}`, which satisfies Framer's `2xx` delivery requirement so Framer does not retry unnecessarily.

> [!TIP]
> Framer's webhook is sent from Framer's servers, not the visitor's browser, so origin checks don't apply to it. To make sure only Framer can post to this form, generate a **server secret** in the FlowForm form settings, append it to the webhook URL (`https://forms.example.com/api/v1/f/contact-us?_secret=YOUR_SECRET&_source=framer`), and turn on **Require server secret**. Only do this when the form is used exclusively by the native webhook: a browser embed (Option 2) can't keep a secret.

---

## Option 2 · Custom HTML Form via Framer Embed

When you want full control over `_gotcha` honeypots, file uploads (`multipart/form-data`), or redirect targets:

1. Drag an **Embed** component (`Insert -> Utility -> Embed`) onto your Framer page and switch **Type** to **HTML**.
2. Paste a standard FlowForm HTML `<form>` or JS `fetch` snippet:

```html
<form action="https://forms.example.com/f/contact-us" method="POST">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />

  <label>
    Name
    <input type="text" name="name" required />
  </label>

  <label>
    Email
    <input type="email" name="email" required />
  </label>

  <label>
    Message
    <textarea name="message" required></textarea>
  </label>

  <button type="submit">Send</button>
</form>
```

---

## Important Notes

- **HTTPS Required:** Framer restricts native **Send To -> Webhook** URLs to `https://` endpoints. Use `POST /api/v1/f/{slug}` for Framer native webhooks so FlowForm always returns JSON (`200 OK`) rather than an HTML `302` redirect (Framer does not follow `3xx` redirects on webhooks).
- **Redirect URLs:** For Option 2 HTML `<form>` embeds, set **Redirect URL** in FlowForm form settings (for example `https://yourframer.site/thanks`), or pass a full URL in `_next` whose domain is listed in **Allowed Domains**. Never use a relative `_next` path like `/thanks`.
- **Allowed Domains:** Add both your custom domain and any `.framer.website` staging domain to FlowForm **Allowed Domains** if you lock submissions down by origin.
