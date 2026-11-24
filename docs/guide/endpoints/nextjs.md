# Next.js (App Router)

Use a Next.js App Router **Server Action** to forward submissions from your server, or a **Client Component** to submit directly from the browser.

---

## Option 1 · Server Action (Recommended)

Posting from a Server Action keeps your FlowForm endpoint URL out of client bundles and works with progressive enhancement:

```tsx
// app/contact/actions.ts
'use server';

export interface FormState {
  status: 'idle' | 'success' | 'error';
  message: string;
}

export async function submitContact(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const endpoint = process.env.FLOWFORM_ENDPOINT_URL!;

  const payload = {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    message: String(formData.get('message') ?? ''),
    _gotcha: String(formData.get('_gotcha') ?? ''),
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        status: 'error',
        message: data.error || 'Could not submit your message.',
      };
    }

    return {
      status: 'success',
      message: `Received! Reference ID: ${data.id}`,
    };
  } catch {
    return {
      status: 'error',
      message: 'Unable to reach form service. Please try again.',
    };
  }
}
```

```tsx
// app/contact/page.tsx
'use client';

import { useActionState } from 'react';
import { submitContact, type FormState } from './actions';

const initialState: FormState = { status: 'idle', message: '' };

export default function ContactPage() {
  const [state, formAction, isPending] = useActionState(submitContact, initialState);

  return (
    <form action={formAction}>
      <input
        type="text"
        name="_gotcha"
        style={{ display: 'none' }}
        tabIndex={-1}
        autoComplete="off"
      />

      <input type="text" name="name" placeholder="Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <textarea name="message" placeholder="Message" required />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send'}
      </button>

      {state.message && <p role="status">{state.message}</p>}
    </form>
  );
}
```

Set `FLOWFORM_ENDPOINT_URL=https://forms.example.com/api/v1/f/contact-us` in `.env.local`.

---

## Option 2 · Client Component

If your Next.js app uses static export (`output: 'export'`), submit directly from a Client Component:

```tsx
// app/contact/ContactForm.tsx
'use client';

import { useState, type FormEvent } from 'react';

export function ContactForm() {
  const [status, setStatus] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setStatus('');

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('https://forms.example.com/api/v1/f/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || 'Submission failed.');
        return;
      }

      form.reset();
      setStatus(`Thanks! Reference ID: ${data.id}`);
    } catch {
      setStatus('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="_gotcha" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
      <input type="text" name="name" required />
      <input type="email" name="email" required />
      <textarea name="message" required />
      <button type="submit" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send'}
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
```

---

## Honeypot Field

Both approaches send `_gotcha`. FlowForm strips `_gotcha` from saved submissions and silently ignores requests where `_gotcha` is non-empty.

---

## Success & Error Handling

- Check `response.ok` (HTTP `200`). Read `data.id` for the created submission UUID.
- On error (`403`, `404`, `422`, `429`), read `data.error` (or fall back to a generic message if the rate limiter returns `429` without `.error`).

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** In Client Component mode, add your Next.js domain (and `localhost` for local dev) to `allowed_domains`. Server Actions do not send a browser `Origin` header by default, so they pass `allowed_domains` automatically.
- **429 Too Many Requests:** Server Actions share your Next.js server's outbound IP, so all users submitting through the Server Action share the `10` requests/min/IP limit. For high-traffic sites using Server Actions, prefer direct browser submits in a Client Component so each visitor's IP is rated independently.
- **CORS errors:** Only relevant in Client Components. Ensure you submit to `/api/v1/f/{slug}` with `Content-Type: application/json` and `Accept: application/json` without credentials cookies.
