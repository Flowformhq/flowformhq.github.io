# Static Site Generators (Hugo, Eleventy, Jekyll)

Static site generators compile templates into plain HTML files with no server runtime. Embed a standard HTML `<form>` partial pointing to your FlowForm `/f/{slug}` endpoint.

---

## Hugo

Create a reusable partial at `layouts/partials/contact-form.html`:

```html
<!-- layouts/partials/contact-form.html -->
<form action="{{ .Site.Params.flowformEndpoint }}" method="POST">
  <!-- Honeypot anti-spam trap -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />

  <!-- Optional redirect after submit -->

  <label for="name">Name</label>
  <input id="name" type="text" name="name" required />

  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
```

Set the endpoint in `hugo.toml`:

```toml
[params]
  flowformEndpoint = "https://forms.example.com/f/contact-us"
```

---

## Eleventy (11ty)

Create a Nunjucks include at `_includes/contact-form.njk`:

```html
<!-- _includes/contact-form.njk -->
<form action="{{ site.flowformEndpoint }}" method="POST">
  <!-- Honeypot anti-spam trap -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />


  <label for="name">Name</label>
  <input id="name" type="text" name="name" required />

  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
```

Define `flowformEndpoint` in `_data/site.json`:

```json
{
  "flowformEndpoint": "https://forms.example.com/f/contact-us"
}
```

---

## Jekyll

Create a Liquid include at `_includes/contact-form.html`:

```html
<!-- _includes/contact-form.html -->
<form action="{{ site.flowform_endpoint }}" method="POST">
  <!-- Honeypot anti-spam trap -->
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />


  <label for="name">Name</label>
  <input id="name" type="text" name="name" required />

  <label for="email">Email</label>
  <input id="email" type="email" name="email" required />

  <label for="message">Message</label>
  <textarea id="message" name="message" required></textarea>

  <button type="submit">Send</button>
</form>
```

Define `flowform_endpoint` in `_config.yml`:

```yaml
flowform_endpoint: "https://forms.example.com/f/contact-us"
```

---

## Honeypot Field

Every partial includes `<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" />`. FlowForm detects non-empty `_gotcha` values, drops the submission, and still honors the redirect so bots cannot tell they were blocked.

---

## Success & Error Handling

- **Redirect on success:** Configure **Redirect URL** in the FlowForm form settings with your full thank-you page URL. Don't use a relative `_next` (it resolves against the FlowForm host).
- **No-reload UX:** Add a small progressive script using [vanilla JavaScript `fetch`](/guide/endpoints/javascript) if you want inline confirmation instead of a redirect.

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** Add your published static site domain (such as `example.com`) to `allowed_domains` in FlowForm. Remember to include `localhost` if previewing with `hugo server`, `eleventy --serve`, or `jekyll serve`.
- **429 Too Many Requests:** Public endpoints allow `10` requests per minute per visitor IP.
- **CORS & Redirects:** Plain HTML form posts do not require CORS, but full external URLs in `_next` (such as `https://example.com/thank-you`) require `example.com` to be allowlisted in `FLOWFORM_ALLOWED_REDIRECT_HOSTS` on your FlowForm instance (or configured in the form's `redirect_url` setting).
