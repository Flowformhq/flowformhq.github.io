# Bricks

Route Bricks Builder Form submissions to FlowForm using Bricks' native **Webhook** form action with the `X-FlowForm-Secret` header.

> [!NOTE]
> Tested by replaying Bricks' documented webhook format; not yet tested on a live Bricks install.

Reference: [Bricks Academy: Form Element](https://academy.bricksbuilder.io/builder/elements/general/form/).

---

## Prerequisites

- A licensed **Bricks** WordPress theme installation (Bricks has no free tier).
- A FlowForm **Endpoint** form (`type: endpoint`), for example slug `contact-us`.
- An Endpoint **Server Secret** generated on that FlowForm form (**Forms -> Edit -> Generate server secret**), with **Require server secret** enabled in form settings.

---

## Step-by-Step Setup

1. Edit your page in Bricks and select your **Form** element.
2. In **Content -> Fields**, confirm each field has a meaningful `ID` / name (`name`, `email`, `message`).
3. Open **Content -> Actions**, add **Webhook**, and open the **Webhook** action settings:
   - **Endpoint URL:** `https://forms.example.com/api/v1/f/contact-us?_source=wp-bricks` (or `/f/contact-us?_source=wp-bricks`)
   - **Data Format:** `JSON` (recommended) or `Form data (x-www-form-urlencoded)`.
   - **Headers (JSON):**

```json
{
  "X-FlowForm-Secret": "YOUR_ENDPOINT_SECRET",
  "Accept": "application/json"
}
```

   - **Data Payload:** Leave empty to transmit all form fields automatically, or map explicit keys with Bricks dynamic tags (`{{field_id}}`).
4. Do **not** manually add a `Content-Type` header inside **Headers**; Bricks sets `Content-Type` automatically from **Data Format**, and duplicating it can trigger `415 Unsupported Media Type` errors on strict proxies.
5. Save and publish.

> [!TIP]
> Prefer `X-FlowForm-Secret` in Bricks' JSON **Headers** box over `?_secret=` in the URL so the secret stays out of web server access logs.

---

## Endpoint URL & Authentication Format

```text
POST https://forms.example.com/api/v1/f/{slug}?_source=wp-bricks
Header: X-FlowForm-Secret: YOUR_ENDPOINT_SECRET
```

- `_source=wp-bricks` tags submissions with `meta.source = "wp-bricks"` in FlowForm.
- If Bricks custom headers are omitted in an older template, `?_source=wp-bricks&_secret=YOUR_ENDPOINT_SECRET` also works, noting query parameters can appear in HTTP server logs.
- Missing or wrong secret when **Require server secret** is enabled returns `403` (`"Endpoint secret is required."` or `"Invalid endpoint secret."`).

---

## How to Test

Replay Bricks' JSON webhook payload directly against FlowForm:

```bash
curl -sS -X POST "https://forms.example.com/api/v1/f/contact-us?_source=wp-bricks" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-FlowForm-Secret: YOUR_ENDPOINT_SECRET" \
  -d '{"name":"Bricks Tester","email":"bricks@example.com","message":"Hello from Bricks"}'
```

Verify FlowForm returns `200 OK` with `{"success":true,"message":"Submission received","id":"<uuid>"}` and shows `meta.source = "wp-bricks"` in **Admin Panel -> Submissions**.

---

## What FlowForm Replaces

- Replaces WordPress database entry storage and WordPress outbound mail for this form. FlowForm sends email notifications through the instance's configured SMTP provider in [Mail Settings / Deployment](/guide/deployment) (self-hosters bring their own mail provider).

---

## Spam Protection & Limits

- **Server-side spam filtering:** Bricks fires its Webhook action from your WordPress backend, bypassing browser-side FlowForm CAPTCHA validation. Keep Bricks' built-in honeypot / Turnstile / reCAPTCHA protection enabled on the Bricks form **and** keep **Require server secret** enabled in FlowForm so only your WordPress site can submit.
- **Redirects:** Configure post-submit messages or full-URL redirects directly in Bricks; do not use a relative FlowForm `_next` path.
