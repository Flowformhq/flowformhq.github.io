# Webflow

Point any native Webflow Form Block directly at a FlowForm endpoint without custom code, or embed an HTML form inside an Embed element.

Reference: [Webflow Help Center: Custom form actions](https://help.webflow.com/hc/en-us/articles/33961334431123-Custom-form-actions).

---

## Option 1 · Native Webflow Form Block (Custom Action)

Webflow's native Form Block lets you override the `Action` URL and HTTP `Method` directly in the Designer:

1. Create an **Endpoint** form in FlowForm (for example with slug `contact-us`) and note its URL: `https://forms.example.com/f/contact-us`.
2. In FlowForm form settings, set **Redirect URL** to your Webflow thank-you page (for example `https://yoursite.com/thank-you`), and optionally add your Webflow domain under **Allowed Domains**.
3. Open your project in the **Webflow Designer** and select your **Form Block** on the canvas.
4. Open **Element Settings** (the gear icon on the right sidebar).
5. Under **Form Settings -> Send to**, remove Webflow's default submission destination if present, click **+**, and add **Custom action**.
6. Set:
   - **Action:** `https://forms.example.com/f/contact-us`
   - **Method:** `POST`
7. Give each Webflow input a clean **Name** attribute (`name`, `email`, `message`).
8. Add a hidden honeypot field (`Embed` element inside the Form Block) so spam bots are filtered silently:

```html
<input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />
```

9. **Publish** your Webflow site and test on the published domain (Webflow Designer preview does not execute external `POST` actions).

---

## Option 2 · Code Embed (Keep User on Page with JSON Fetch)

Because a standard Webflow **Custom action** performs a full-page browser `POST` and redirects away from the page, Webflow's built-in Success/Error state boxes do not trigger automatically. If you want an inline submit state without a reload, use an **Embed** element with JavaScript `fetch` posting to `/api/v1/f/{slug}`:

```html
<form id="webflow-flowform">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>
  <button type="submit">Send</button>
  <p id="webflow-flowform-status" aria-live="polite"></p>
</form>

<script>
  const form = document.getElementById('webflow-flowform');
  const statusEl = document.getElementById('webflow-flowform-status');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
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
      statusEl.textContent = 'Thank you. Your message has been received.';
      form.reset();
    } else {
      statusEl.textContent = body.error || 'Submission failed.';
    }
  });
</script>
```

---

## Plan & Feature Limits to Note

- **Webflow Custom Action Availability & Hosting:** Custom form actions bypass Webflow's native form storage and email notifications (submissions go straight to FlowForm instead of your Webflow dashboard). On Starter/unpaid sites, Webflow caps lifetime form submissions for Webflow-hosted handling and gates **Embed** elements and code export behind paid Site or Workspace plans. Check your Webflow plan tier before adding custom Embed code blocks.
- **Native Webflow reCAPTCHA:** Webflow's built-in reCAPTCHA does not validate forms using a Custom Action. Use FlowForm's `_gotcha` honeypot and Turnstile/hCaptcha verification configured in FlowForm instead.
- **Redirect URLs:** Set **Redirect URL** in FlowForm form settings rather than adding a relative `_next` path like `/thank-you` (a relative path resolves on the FlowForm host). If you pass `_next` explicitly in an Embed form, use a full `https://` URL whose domain is in the form's **Allowed Domains**.
- **Mail Delivery:** Self-hosted FlowForm instances deliver notification emails through the SMTP provider you configure in FlowForm Admin -> Mail Settings.
