# WordPress

Connect WordPress sites to FlowForm without installing a WordPress form plugin or configuring `wp_mail` / SMTP inside WordPress.

Reference: [WordPress Custom HTML Block](https://wordpress.org/documentation/article/custom-html/).

---

## WordPress Page-Builder Webhooks

If your site already uses a visual page builder or form plugin with webhook actions, send server-side form submissions straight to FlowForm using an Endpoint Server Secret and `_source=wp-<builder>`:

- [Elementor Pro](/guide/endpoints/wordpress/elementor) - Form widget Actions After Submit (`?_source=wp-elementor&_secret=...`)
- [Bricks](/guide/endpoints/wordpress/bricks) - Form element Webhook action (`X-FlowForm-Secret` header + `?_source=wp-bricks`)
- [Breakdance](/guide/endpoints/wordpress/breakdance) - Pro Form Builder Webhook action (`X-FlowForm-Secret` header + `?_source=wp-breakdance`)
- [Fluent Forms](/guide/endpoints/wordpress/fluent-forms) - Pro WebHooks integration (`X-FlowForm-Secret` header + `?_source=wp-fluent-forms`)

---

## Option 1 · Classic WordPress (Custom HTML Block)

Use WordPress's built-in **Custom HTML** block on any page or post:

1. Create an **Endpoint** form in FlowForm (for example `contact-us`) and set **Redirect URL** in form settings to your WordPress thank-you page (for example `https://example.com/thank-you/`). Optionally add `example.com` to **Allowed Domains**.
2. In the WordPress block editor, click **+**, add a **Custom HTML** block, and paste:

```html
<form action="https://forms.example.com/f/contact-us" method="POST">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />

  <p>
    <label for="ff-name">Name</label><br />
    <input id="ff-name" type="text" name="name" required />
  </p>

  <p>
    <label for="ff-email">Email</label><br />
    <input id="ff-email" type="email" name="email" required />
  </p>

  <p>
    <label for="ff-message">Message</label><br />
    <textarea id="ff-message" name="message" rows="5" required></textarea>
  </p>

  <p>
    <button type="submit">Send Message</button>
  </p>
</form>
```

3. Publish or preview the page and submit a test entry. On success, FlowForm redirects visitors to your configured **Redirect URL** (or returns JSON `200 OK` if no redirect is configured or `Accept: application/json` is sent).

> [!TIP]
> **Redirect rule:** Always configure **Redirect URL** in the FlowForm form settings, or pass a full URL in `_next` whose domain is listed in the form's **Allowed Domains**. Never use a relative `_next` path like `/thank-you/`, because relative paths resolve on the FlowForm host rather than your WordPress site.

---

## Option 2 · Headless WordPress (Next.js / Astro)

If you use WordPress only as a headless CMS with a modern front end, wire your front-end routes straight to FlowForm using the framework guides:

- [Next.js Quickstart](/guide/endpoints/nextjs)
- [Astro Quickstart](/guide/endpoints/astro)
- [Nuxt Quickstart](/guide/endpoints/nuxt)
- [SvelteKit Quickstart](/guide/endpoints/sveltekit)

---

## Why Use FlowForm Instead of a WordPress Form Plugin

- **No `wp_mail()` or WordPress SMTP plugins needed for this form:** FlowForm handles form storage, encryption, webhooks, chat notifications, and email notifications (using the SMTP provider configured by the FlowForm instance operator) so your WordPress server never sends outbound contact-form email directly.
- **Zero submission rows in the WordPress database:** Submissions are stored in FlowForm, keeping `wp_posts`, `wp_postmeta`, and custom plugin tables clean across backups, migrations, and caching layers.
- **Clean static caching:** Plain HTML forms work cleanly behind Cloudflare, WP Engine, Nginx FastCGI cache, and static WordPress exports with zero WordPress nonces breaking cached pages.

---

## Current Limits & WordPress Plugin Status

- **No native Gutenberg block or WordPress plugin yet:** FlowForm currently focuses on standard HTML endpoints and REST API/webhook integrations rather than maintaining a separate WordPress plugin.
- **Request a Gutenberg block plugin:** Upvote or share your use case in [Flowformhq/flowform#104 - Request: WordPress block plugin (collecting demand)](https://github.com/Flowformhq/flowform/issues/104).
