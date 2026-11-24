# Vanilla JavaScript (`fetch` & `FormData`)

Submit forms asynchronously without a page reload using the browser's built-in `fetch()` API. Post to `/api/v1/f/{slug}` to guarantee a JSON response even if the form has a default redirect URL.

---

## Option 1 · JSON Payload (`fetch`)

```html
<form id="contact-form">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />

  <label for="name">Name</label>
  <input id="name" type="text" name="name" required />

  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
  <p id="form-status" role="status"></p>
</form>

<script>
  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.textContent = 'Sending...';

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const response = await fetch('https://forms.example.com/api/v1/f/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        status.textContent = result.error || 'Submission failed. Please try again.';
        return;
      }

      form.reset();
      status.textContent = `Thanks! Reference ID: ${result.id}`;
    } catch (error) {
      status.textContent = 'Network error. Please check your connection.';
    }
  });
</script>
```

---

## Option 2 · `FormData` Payload

If you prefer sending `multipart/form-data` directly from a `FormData` instance, omit the `Content-Type` header so the browser attaches the boundary automatically:

```javascript
const form = document.getElementById('contact-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const response = await fetch('https://forms.example.com/api/v1/f/contact-us', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
    },
    body: new FormData(form),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || 'Submission failed');
  }

  console.log('Saved submission:', result.id);
});
```

---

## Honeypot Field

Both examples read `_gotcha` automatically through `new FormData(form)`. Bots that populate hidden inputs send a non-empty `_gotcha` value, causing FlowForm to return `200 OK` without storing spam.

---

## Success & Error Handling

Check `response.ok` before reading `result.id`:

- **`200 OK`:** `{ "success": true, "message": "Submission received", "id": "<uuid>" }`.
- **`403` / `404` / `422` / `429`:** `response.ok` is `false`. Display `result.error` to the user, or fall back to a generic message if a `429` rate limit returns `{ "message": "Too Many Attempts." }`.

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** Browsers automatically send the `Origin` header on `fetch()`. Verify that the page's origin is listed in the form's `allowed_domains`.
- **429 Too Many Requests:** Each IP is limited to `10` endpoint submissions per minute. Disable the submit button while the request is in flight to avoid accidental double submits.
- **CORS errors:** Do not set `credentials: 'include'` (FlowForm's endpoint wildcard CORS header is configured for stateless submissions with `supports_credentials: false`), and never manually set `Content-Type: multipart/form-data` when passing a `FormData` body.
