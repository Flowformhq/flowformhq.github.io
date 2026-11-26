# Breakdance

Route Breakdance Form Builder submissions to FlowForm using Breakdance's **Webhook** action after submission.

> [!NOTE]
> Tested by replaying Breakdance's documented webhook format; not yet tested on a live Breakdance install.

Reference: [Breakdance Documentation](https://breakdance.com/documentation/).

---

## Prerequisites

- **Breakdance Pro** (Form Builder webhook actions and custom HTTP headers require the Pro license).
- A FlowForm **Endpoint** form (`type: endpoint`), for example slug `contact-us`.
- An Endpoint **Server Secret** generated on that FlowForm form (**Forms -> Edit -> Generate server secret**), with **Require server secret** enabled in form settings.

---

## Step-by-Step Setup

1. Edit your page in Breakdance and select the **Form Builder** element.
2. Under **Content -> Form**, ensure every field has a clean **Field ID / Name** (`name`, `email`, `message`).
3. Open **Content -> Actions -> Actions After Submission** and add **Webhook**.
4. Configure the **Webhook** action:
   - **Webhook URL:** `https://forms.example.com/api/v1/f/contact-us?_source=wp-breakdance` (or `/f/contact-us?_source=wp-breakdance`)
   - **Headers:** Add a custom header row:
     - Name: `X-FlowForm-Secret`
     - Value: `YOUR_ENDPOINT_SECRET`
   - **Field Map:** Map your Breakdance fields (`name`, `email`, `message`) to matching JSON keys.
5. Save the page and publish.

> [!NOTE]
> If your Breakdance plan or setup omits custom headers in the Webhook action UI, use the query parameter fallback instead (`https://forms.example.com/api/v1/f/contact-us?_source=wp-breakdance&_secret=YOUR_ENDPOINT_SECRET`), keeping in mind that query-string secrets can be recorded in web server access logs.

---

## Endpoint URL & Authentication Format

```text
POST https://forms.example.com/api/v1/f/{slug}?_source=wp-breakdance
Header: X-FlowForm-Secret: YOUR_ENDPOINT_SECRET
```

- `_source=wp-breakdance` sets `meta.source = "wp-breakdance"` on saved submissions.
- Missing secret when **Require server secret** is enabled returns `403`: `{"success": false, "error": "Endpoint secret is required."}`.
- Invalid secret returns `403`: `{"success": false, "error": "Invalid endpoint secret."}`.

---

## How to Test

Replay Breakdance's mapped JSON POST request with `curl`:

```bash
curl -sS -X POST "https://forms.example.com/api/v1/f/contact-us?_source=wp-breakdance" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-FlowForm-Secret: YOUR_ENDPOINT_SECRET" \
  -d '{"name":"Breakdance Tester","email":"breakdance@example.com","message":"Hello from Breakdance"}'
```

Verify FlowForm returns `200 OK` (`{"success":true,"message":"Submission received","id":"<uuid>"}`) and records `meta.source = "wp-breakdance"`.

---

## What FlowForm Replaces

- Replaces WordPress `wp_mail()` / SMTP plugins and Breakdance submission storage for this form. Notification emails are sent by FlowForm via the instance's configured SMTP provider in [Mail Settings / Deployment](/guide/deployment) (self-hosters configure their own mail provider).

---

## Spam Protection & Limits

- **Server-side spam filtering:** Breakdance dispatches webhooks from WordPress PHP after the visitor submits, so FlowForm's frontend CAPTCHA widget cannot validate the browser session. Keep Breakdance's built-in Honeypot / Turnstile / reCAPTCHA enabled on the form, and enable **Require server secret** on the FlowForm form so direct unauthenticated requests are blocked.
- **Redirects:** Configure success messages or full redirect URLs inside Breakdance's Form Builder settings; never pass a relative FlowForm `_next` path.
