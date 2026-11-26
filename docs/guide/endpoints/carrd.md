# Carrd

Connect a Carrd landing page to FlowForm using Carrd's custom **Send to URL** form action or a raw **Embed** block.

References: [Carrd Custom Forms](https://carrd.co/docs/forms/custom) and [Carrd Embed Elements](https://carrd.co/docs/building/embedding-custom-code).

---

## Option 1 · Carrd Custom Form (`Send to URL`, Pro Plus+)

Carrd Pro Plus plans can point a native Carrd **Form** element directly at an external endpoint:

1. Create an **Endpoint** form in FlowForm and configure its **Redirect URL** in form settings (for example `https://yoursite.carrd.co/#thanks` or your custom domain thank-you page).
2. In Carrd, click **Add Element (+)** -> **Form**.
3. Set **Type** to **Custom**, then choose **Send to URL**.
4. Set:
   - **URL:**
     - Choose `https://forms.example.com/api/v1/f/contact-us` if using **Method: AJAX** (JSON / `FormData`).
     - Choose `https://forms.example.com/f/contact-us` if using **Method: POST**.
   - **Method:** **AJAX** (for Carrd's built-in on-submission message without leaving the page) or **POST**.
5. Under the **Fields** tab, add inputs named `name`, `email`, and `message`.

---

## Option 2 · Embed Code Block (Pro Standard+)

If you prefer pasting a plain HTML form (with a `_gotcha` honeypot field):

1. Click **Add Element (+)** -> **Embed**.
2. Set **Type** to **Code** and **Style** to **Inline**.
3. Paste:

```html
<form action="https://forms.example.com/f/contact-us" method="POST">
  <input type="text" name="_gotcha" style="display:none" tabindex="-1" autocomplete="off" aria-hidden="true" />

  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message" required></textarea>

  <button type="submit">Send Message</button>
</form>
```

4. Publish the Carrd site to test (Carrd does not execute custom `<form>` embeds inside the editor canvas).

---

## Plan & Configuration Notes

- **Carrd Plan Limits:** Both native **Custom -> Send to URL** forms (Pro Plus or higher) and **Embed** elements (Pro Standard or higher) require a paid Carrd Pro plan. Free Carrd sites cannot embed custom HTML forms or post to external endpoints.
- **Redirects:** Configure **Redirect URL** in FlowForm form settings or send a full `https://` URL in `_next` listed in the form's **Allowed Domains**. Never use a relative `_next` path like `/thanks`.
