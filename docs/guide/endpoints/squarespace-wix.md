# Squarespace & Wix

Both **Squarespace** and **Wix** restrict their built-in form blocks to internal platform storage and built-in integrations, so neither platform lets you swap the `action` URL of a native form block directly. Instead, add a **Code Block** (Squarespace) or **Embed HTML** element (Wix) containing a FlowForm `<form>` or JS `fetch` snippet.

References:
- [Squarespace Help: Add custom code to a page with code blocks](https://support.squarespace.com/hc/en-us/articles/206543167-Add-custom-code-to-a-page-with-code-blocks)
- [Wix Support: Embedding a Site or a Widget](https://support.wix.com/en/article/wix-editor-embedding-a-site-or-a-widget)

---

## Squarespace (Code Block)

1. In Squarespace, edit your page, click **Add Block**, and select **Code** (custom form markup in Code Blocks requires a Squarespace **Business** or **Commerce** plan or higher).
2. Ensure **Display Source** is toggled **off** and set mode to **HTML**.
3. Paste the FlowForm form snippet:

```html
<form id="sqsp-flowform" class="flowform-contact">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />

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
  <p id="sqsp-flowform-status" aria-live="polite"></p>
</form>

<script>
  (function () {
    const form = document.getElementById('sqsp-flowform');
    const status = document.getElementById('sqsp-flowform-status');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const res = await fetch('https://forms.example.com/api/v1/f/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });

      const body = await res.json();
      if (res.ok && body.success) {
        status.textContent = 'Message sent. Thank you.';
        form.reset();
      } else {
        status.textContent = body.error || 'Unable to submit form.';
      }
    });
  })();
</script>
```

4. Test while logged out (or in an Incognito/Private window), because Squarespace can suppress custom scripts inside the authenticated editor preview.

---

## Wix (Embed HTML Element)

> [!WARNING]
> Wix wraps **Embed HTML** widgets inside a sandboxed `<iframe>`. Avoid relying on FlowForm `302` redirects inside a Wix embed unless your `<form>` explicitly sets `target="_top"` and uses a **Redirect URL** (or full URL in `_next` whose domain is in **Allowed Domains**). In most cases, submitting inline via JavaScript `fetch` to `POST /api/v1/f/{slug}` is much more reliable inside Wix's iframe container.

1. In the Wix Editor, click **Add Elements (+)** -> **Embed Code** -> **Embed HTML**.
2. Choose **Code** and paste the inline JSON `fetch` HTML snippet above (using `https://` for your FlowForm URL because Wix blocks non-HTTPS endpoints).
3. Click **Apply** and resize the HTML element container so the submit button and status message fit without scrollbars.

---

## Limits & Domain Settings

- **Native Form Blocks Cannot Target External URLs Directly:** Neither Squarespace's native Form Block nor Wix's native Wix Forms offers a configurable external HTTP `POST` `action` URL without an automation bridge (such as Zapier, Make, or FlowForm webhooks/REST subscriptions). Use the Code Block / Embed HTML snippets above when you want submissions to go directly from the browser to FlowForm.
- **CORS & Allowed Domains:** If you enable **Allowed Domains** on your FlowForm form, remember to add your published domain. For Wix embeds, note that Wix HTML widgets run in a generated sandboxed origin (leave **Allowed Domains** empty or verify your iframe `Origin` header in browser DevTools).
- **Redirect URLs:** Never use a relative `_next` path like `/thank-you`. Configure **Redirect URL** in FlowForm form settings or use an absolute `https://` URL in `_next` matching **Allowed Domains**.
