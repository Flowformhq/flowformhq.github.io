# Elementor Pro

Route Elementor Pro Form widget submissions to FlowForm via **Actions After Submit -> Webhook**.

> [!NOTE]
> Tested by replaying Elementor's documented webhook format; not yet tested on a live Elementor install.

Reference: [Elementor Help Center](https://elementor.com/help/).

---

## Prerequisites

- **Elementor Pro** (the Form widget and Webhook action are not available in Elementor Free).
- A FlowForm **Endpoint** form (`type: endpoint`), for example slug `contact-us`.
- An Endpoint **Server Secret** generated on that FlowForm form (**Forms -> Edit -> Generate server secret**), with **Require server secret** enabled in form settings.

---

## Step-by-Step Setup

1. Open your page in Elementor and select the **Form** widget.
2. In the left panel under **Content -> Form Fields**, give each field a clean **ID** in its **Advanced** tab (`name`, `email`, `message`).
3. Expand **Actions After Submit**, click inside the **Add Action** input, and select **Webhook**.
4. Expand the new **Webhook** panel:
   - **Webhook URL:** Paste your FlowForm endpoint URL with `_source=wp-elementor` and `_secret` query authentication:

```text
https://forms.example.com/f/contact-us?_source=wp-elementor&_secret=YOUR_ENDPOINT_SECRET
```

   - **Advanced Data:** Leave **No / Off** (Simple mode, recommended).
5. Save/Update the page and publish it.

> [!NOTE]
> **Why `_secret` is in the URL for Elementor:** Elementor Pro's built-in Webhook action does not support custom HTTP request headers (`X-FlowForm-Secret`), so query-parameter authentication (`?_secret=...`) is used instead. Keep access logs restricted on intermediate proxies/web servers because URL query parameters can be recorded in HTTP access logs.

### Simple vs. Advanced Data Mode

- **Simple mode (`Advanced Data: Off`, recommended):** Sends flat form fields using your field IDs/labels in `application/x-www-form-urlencoded` format (for example `name=Alice&email=alice@example.com&message=Hello` alongside `form_id` / `form_name`), which FlowForm stores directly as clean top-level submission keys.
- **Advanced Data (`On`):** Wraps submissions in nested metadata blocks (page URL, user agent, IP, serialized field structures), which makes submission payloads much noisier unless you specifically inspect WordPress post context.

---

## Endpoint URL & Authentication Format

```text
POST https://forms.example.com/f/{slug}?_source=wp-elementor&_secret=YOUR_ENDPOINT_SECRET
```

- `_source=wp-elementor` tags submissions with `meta.source = "wp-elementor"` in FlowForm.
- A valid secret passes **Require server secret** (`200 OK`, `{"success": true, "message": "Submission received", "id": "<uuid>"}` for JSON callers).
- Missing secret when required returns `403`: `{"success": false, "error": "Endpoint secret is required."}`.
- Invalid secret returns `403`: `{"success": false, "error": "Invalid endpoint secret."}`.

---

## How to Test

1. Open the published WordPress page and submit a test entry in the Elementor form (or replay Elementor's Simple form-encoded request with `curl`):

```bash
curl -sS -X POST "https://forms.example.com/api/v1/f/contact-us?_source=wp-elementor&_secret=YOUR_ENDPOINT_SECRET" \
  -H "Accept: application/json" \
  --data-urlencode "name=Elementor Tester" \
  --data-urlencode "email=elementor@example.com" \
  --data-urlencode "message=Hello from Elementor Pro"
```

2. Open FlowForm **Admin Panel -> Submissions** and confirm the new submission contains `name`, `email`, and `message`, with `meta.source` set to `wp-elementor`.

---

## What FlowForm Replaces

- FlowForm stores every entry cleanly outside WordPress, dispatches FlowForm webhooks/chat alerts, and sends notification emails using the FlowForm instance's configured SMTP provider in [Mail Settings / Deployment](/guide/deployment) (self-hosters bring their own mail provider).
- You do **not** need `wp_mail()`, WP Mail SMTP, or an Elementor submission database plugin for this form (you can also remove Elementor's **Collect Submissions** / **Email** actions if you want zero local WP storage and zero WP mail).

---

## Spam Protection & Limits

- **Server-side spam filtering:** Elementor submits webhooks from your WordPress server rather than the visitor's browser, so browser-side FlowForm CAPTCHA widgets (`cf-turnstile-response` / `h-captcha-response`) cannot execute during the webhook POST. Keep **reCAPTCHA**, **Cloudflare Turnstile**, or Elementor's **Honeypot** field active inside the Elementor form, and enable **Require server secret** on FlowForm so unauthenticated public callers cannot bypass Elementor.
- **Redirects:** Browser redirects are controlled inside Elementor Pro (**Actions After Submit -> Redirect** using a full destination URL); do not rely on a relative FlowForm `_next` path.
