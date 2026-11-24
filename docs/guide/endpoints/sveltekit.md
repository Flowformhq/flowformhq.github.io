# SvelteKit

Use a SvelteKit **Form Action** (`+page.server.ts`) to forward form data from the server, paired with `use:enhance` on `+page.svelte` for progressive enhancement without full page reloads.

---

## Minimal Snippet

### 1. Server Form Action (`src/routes/contact/+page.server.ts`)

```typescript
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();

    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      message: String(formData.get('message') ?? ''),
      _gotcha: String(formData.get('_gotcha') ?? ''),
    };

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
      return fail(response.status, {
        error: result.error || 'Submission failed.',
        name: payload.name,
        email: payload.email,
      });
    }

    return {
      success: true,
      id: result.id,
    };
  },
} satisfies Actions;
```

### 2. Page Component (`src/routes/contact/+page.svelte`)

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  export let form: ActionData;
</script>

<form method="POST" use:enhance>
  <!-- Honeypot spam trap -->
  <input
    type="text"
    name="_gotcha"
    style="display:none"
    tabindex="-1"
    autocomplete="off"
  />

  <label>
    Name
    <input type="text" name="name" value={form?.name ?? ''} required />
  </label>

  <label>
    Email
    <input type="email" name="email" value={form?.email ?? ''} required />
  </label>

  <label>
    Message
    <textarea name="message" required></textarea>
  </label>

  <button type="submit">Send Message</button>

  {#if form?.success}
    <p role="status">Thanks! Reference ID: {form.id}</p>
  {:else if form?.error}
    <p role="alert">{form.error}</p>
  {/if}
</form>
```

---

## Honeypot Field

The hidden `_gotcha` input is forwarded in `payload` to FlowForm. FlowForm strips `_gotcha` from saved data and discards any submission where `_gotcha` has a value.

---

## Success & Error Handling

- When FlowForm returns `200 OK`, the action returns `{ success: true, id: result.id }`.
- When FlowForm returns `403`, `404`, `422`, or `429`, `fail(response.status, { error })` preserves the HTTP error code and renders `form.error` without losing the visitor's entered name or email.

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** SvelteKit `+page.server.ts` actions run on your Node/edge server without a browser `Origin` header, so they bypass browser origin checks. If you switch to client-side `fetch()` on static routes (`@sveltejs/adapter-static`), add your site's domain to `allowed_domains`.
- **429 Too Many Requests:** Server-side actions share your SvelteKit server's IP against the `10` requests/min/IP limit. For high-volume forms, submit directly from `+page.svelte` to `/api/v1/f/{slug}` so each visitor uses their own IP quota.
- **CORS / CSRF errors:** SvelteKit blocks cross-origin browser POSTs to SvelteKit actions unless configured, whereas direct browser calls to FlowForm allow cross-origin `POST` via `Access-Control-Allow-Origin: *`.
