# Nuxt

Send form submissions from any Nuxt 3 page or component using `$fetch` with reactive loading, success, and error state.

---

## Minimal Snippet

```vue
<!-- components/ContactForm.vue -->
<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  message: '',
  _gotcha: '',
});

const pending = ref(false);
const submissionId = ref<string | null>(null);
const errorMessage = ref<string | null>(null);

async function submit() {
  pending.value = true;
  errorMessage.value = null;

  try {
    const response = await $fetch<{ success: boolean; message: string; id: string }>(
      'https://forms.example.com/api/v1/f/contact-us',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
        body: { ...form },
      },
    );

    submissionId.value = response.id;
    form.name = '';
    form.email = '';
    form.message = '';
  } catch (err: any) {
    errorMessage.value =
      err?.data?.error || 'Submission failed. Please try again.';
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="submit">
    <!-- Honeypot field -->
    <input
      v-model="form._gotcha"
      type="text"
      name="_gotcha"
      style="display:none"
      tabindex="-1"
      autocomplete="off"
    />

    <div>
      <label for="name">Name</label>
      <input id="name" v-model="form.name" type="text" required />
    </div>

    <div>
      <label for="email">Email</label>
      <input id="email" v-model="form.email" type="email" required />
    </div>

    <div>
      <label for="message">Message</label>
      <textarea id="message" v-model="form.message" required />
    </div>

    <button type="submit" :disabled="pending">
      {{ pending ? 'Sending...' : 'Send Message' }}
    </button>

    <p v-if="submissionId" role="status">
      Thanks! Reference ID: {{ submissionId }}
    </p>
    <p v-if="errorMessage" role="alert">
      {{ errorMessage }}
    </p>
  </form>
</template>
```

---

## Honeypot Field

Binding `_gotcha` to `v-model="form._gotcha"` keeps the input hidden in the DOM while forwarding it in the JSON body. If a bot fills it out, FlowForm silently discards the submission and returns `200 OK`.

---

## Success & Error Handling

`$fetch` automatically parses JSON bodies and throws a `FetchError` on non-2xx responses:

- **Success (`200 OK`):** `response.id` contains the created submission UUID.
- **Error (`403`, `404`, `422`, `429`):** Read `err?.data?.error` inside `catch` and display it in `errorMessage`.

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** Add your Nuxt domain (plus `localhost` for local testing) to `allowed_domains` on the FlowForm form.
- **429 Too Many Requests:** Each client IP is capped at `10` requests per minute. Keep `:disabled="pending"` on the submit button to prevent double submits.
- **CORS errors:** `$fetch` posts JSON directly without cookies by default. Do not add `credentials: 'include'` because FlowForm's public endpoints are stateless.
