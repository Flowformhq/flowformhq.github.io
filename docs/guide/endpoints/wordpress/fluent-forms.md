# Fluent Forms

Route Fluent Forms submissions directly to FlowForm using Fluent Forms' built-in **WebHooks** feed with the `X-FlowForm-Secret` request header.

> [!NOTE]
> Tested by replaying Fluent Forms Pro's documented webhook format; not yet tested on a live Fluent Forms Pro install (`WebHooks` feed module requires **Fluent Forms Pro**; free users need a third-party webhook bridge plugin).

Reference: [Fluent Forms Documentation](https://docs.fluentforms.com/).

---

## Prerequisites

- **Fluent Forms Pro** (the native **WebHooks** integration module requires the Pro license; it is not included in the free Fluent Forms plugin without a third-party bridge plugin such as Bit Integrations or WP Webhooks).
- A FlowForm **Endpoint** form (`type: endpoint`), for example slug `contact-us`.
- An Endpoint **Server Secret** generated on that FlowForm form (**Forms -> Edit -> Generate server secret**), with **Require server secret** enabled in form settings.

---

## Step-by-Step Setup

1. In the WordPress admin dashboard, go to **Fluent Forms -> Integrations** (Pro), find **WebHooks**, and toggle it **On**.
2. Open **Fluent Forms -> Forms**, edit your form, and note your field **Name Attributes** (for example `names`, `email`, `message`).
3. Go to **Settings & Integrations -> WebHook** on that form and click **+ Add New**.
4. Configure the feed:
   - **Name:** `FlowForm Contact`
   - **Request URL:** `https://forms.example.com/api/v1/f/contact-us?_source=wp-fluent-forms` (or `/f/contact-us?_source=wp-fluent-forms`)
   - **Request Method:** `POST`
   - **Request Format:** `JSON` (recommended) or `FORM`
   - **Request Header:** Select **With Headers** and add:
     - Header Key: `X-FlowForm-Secret`
     - Header Value: `YOUR_ENDPOINT_SECRET`
   - **Request Body:** Select **All Fields** or map **Selected Fields** cleanly (`name`, `email`, `message`).
5. Click **Save Feed**.

> [!TIP]
> Fluent Forms Pro supports custom **Request Headers**, so send `X-FlowForm-Secret` as a header rather than `?_secret=` in the URL. If you use a third-party bridge plugin that cannot add custom headers, fall back to `?_source=wp-fluent-forms&_secret=YOUR_ENDPOINT_SECRET` and keep web server access logs restricted since query strings may be logged.

---

## Endpoint URL & Authentication Format

```text
POST https://forms.example.com/api/v1/f/{slug}?_source=wp-fluent-forms
Header: X-FlowForm-Secret: YOUR_ENDPOINT_SECRET
```

- `_source=wp-fluent-forms` records `meta.source = "wp-fluent-forms"` in FlowForm.
- Without a valid `X-FlowForm-Secret` (or `_secret`) when **Require server secret** is enabled, FlowForm rejects the request with `403`:
  - `{"success": false, "error": "Endpoint secret is required."}` (header/query omitted)
  - `{"success": false, "error": "Invalid endpoint secret."}` (secret mismatch)

---

## How to Test

Submit a test entry in Fluent Forms (or replay Fluent Forms' `JSON` webhook POST with `curl`):

```bash
curl -sS -X POST "https://forms.example.com/api/v1/f/contact-us?_source=wp-fluent-forms" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-FlowForm-Secret: YOUR_ENDPOINT_SECRET" \
  -d '{"name":"Fluent Tester","email":"fluent@example.com","message":"Hello from Fluent Forms"}'
```

Verify FlowForm returns `200 OK` (`{"success":true,"message":"Submission received","id":"<uuid>"}`) and records `meta.source = "wp-fluent-forms"`.

---

## What FlowForm Replaces

- Replaces WordPress email notifications (`wp_mail()` / SMTP plugins) for this form. FlowForm sends notifications via the instance's configured SMTP provider in [Mail Settings / Deployment](/guide/deployment) (self-hosters bring their own mail provider) and keeps centralized entries/webhooks inside FlowForm.

---

## Spam Protection & Limits

- **Server-side spam filtering:** Fluent Forms sends webhooks server-to-server after saving/processing on WordPress, bypassing FlowForm's browser-side CAPTCHA check. Keep Fluent Forms' built-in Honeypot / Cloudflare Turnstile / Akismet / reCAPTCHA protection enabled on the WordPress form, **and** enable **Require server secret** on the FlowForm form.
- **Redirects:** Configure confirmations or full redirect URLs inside Fluent Forms (**Settings & Integrations -> Confirmation Settings**); do not use a relative FlowForm `_next` path.
