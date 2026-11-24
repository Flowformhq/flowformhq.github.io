# Astro

Connect an Astro site to FlowForm with a zero-JS HTML `<form>` on static pages, or use an **Astro Action** when running with SSR.

---

## Option 1 · Static HTML Form

For static Astro sites (`output: 'static'`), render a plain `<form>` inside any `.astro` page:

```astro
---
// src/pages/contact.astro
---
<form action="https://forms.example.com/f/contact-us" method="POST">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />

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

## Option 2 · Astro Action (SSR)

If you use Astro Actions (`src/actions/index.ts`) for typed validation before forwarding to FlowForm:

```typescript
// src/actions/index.ts
import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const server = {
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1),
      email: z.string().email(),
      message: z.string().min(1),
      _gotcha: z.string().optional(),
    }),
    handler: async (input) => {
      const response = await fetch('https://forms.example.com/api/v1/f/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(input),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ActionError({
          code: response.status === 429 ? 'TOO_MANY_REQUESTS' : 'BAD_REQUEST',
          message: data.error || 'Submission failed.',
        });
      }

      return { id: data.id };
    },
  }),
};
```

```astro
---
// src/pages/contact.astro
import { actions } from 'astro:actions';
---
<form method="POST" action={actions.contact}>
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />
  <input type="text" name="name" required />
  <input type="email" name="email" required />
  <textarea name="message" required></textarea>
  <button type="submit">Send</button>
</form>
```

---

## Honeypot Field

The `_gotcha` field is included in both the static HTML `<form>` and the Astro Action `z.object` schema so FlowForm drops automated spam payloads on arrival.

---

## Success & Error Handling

- **Static `<form>`:** Redirects (`302 Found`) to the form's **Redirect URL** if one is set; otherwise returns JSON.
- **Astro Action:** Throws `ActionError` when `!response.ok` and returns `{ id }` on `200 OK`.

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** Add your Astro site's domain to `allowed_domains` in FlowForm form settings when using client-side `<form>` submits.
- **429 Too Many Requests:** Public endpoints enforce `10` requests per minute per IP. With SSR Astro Actions, server-side requests share your server's IP.
- **CORS / Redirect issues:** Set **Redirect URL** on the form to your Astro thank-you page. A relative `_next` such as `/thank-you` redirects to the FlowForm host, not your site; `_next` with a full URL needs your domain in `FLOWFORM_ALLOWED_REDIRECT_HOSTS` on the FlowForm server.
