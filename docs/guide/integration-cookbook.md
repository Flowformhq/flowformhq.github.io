# Integration Cookbook

Practical examples for connecting FlowForm to your downstream systems. All examples use the standard REST API and work with any FlowForm deployment.

## Webhook pattern (generic)

FlowForm doesn't ship with built-in webhooks yet (Phase 1). The recommended pattern is to poll submissions or build a listener in your application.

### Option 1: Poll new submissions

```bash
# Fetch all draft submissions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/forms/{form_uuid}/submissions?status=completed"
```

Run this on a cron job or scheduled task. Process new submissions, then mark them via a metadata flag.

### Option 2: Post-submission redirect

Configure your frontend to redirect to your webhook endpoint after form completion:

```typescript
// After successful submission
await client.updateSubmission(uuid, {
  status: 'completed',
  meta: { processed: false }
});

// Trigger your webhook
await fetch('https://your-app.com/api/flowform-webhook', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ submission_uuid: uuid, form_uuid: formUuid })
});
```

## Example 1: Send submission data via email

Use a server-side endpoint to email submission values after completion.

```php
// In your Laravel app's controller
public function handleSubmissionWebhook(Request $request)
{
    $client = new FlowFormClient(
        config('services.flowform.url'),
        config('services.flowform.token')
    );

    $submission = $client->getSubmission($request->input('submission_uuid'));
    $values = $submission['data']['values'];

    Mail::raw(
        collect($values)
            ->map(fn ($value, $code) => "$code: $value")
            ->implode("\n"),
        fn ($message) => $message
            ->to('notifications@yourcompany.com')
            ->subject('New FlowForm Submission')
    );

    return response()->json(['sent' => true]);
}
```

## Example 2: Sync submissions to a Google Sheet

Use a server-side handler to append each submission as a row.

```typescript
// After a submission completes in your frontend
async function syncToSheet(submissionUuid: string) {
  const client = new FlowFormClient(FLOWFORM_URL, FLOWFORM_TOKEN);
  const { data: submission } = await client.getSubmission(submissionUuid);

  const values = submission.values;
  const row = [
    new Date().toISOString(),
    submission.uuid,
    values['name'] ?? '',
    values['email'] ?? '',
    values['company'] ?? '',
    values['message'] ?? '',
  ];

  // Use Google Sheets API
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:Z:append?valueInputOption=RAW`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GOOGLE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [row] }),
    }
  );
}
```

## Example 3: Create a CRM contact from submission

Map form fields to your CRM's contact model.

```php
public function handleSubmissionWebhook(Request $request)
{
    $client = new FlowFormClient(
        config('services.flowform.url'),
        config('services.flowform.token')
    );

    $submission = $client->getSubmission($request->input('submission_uuid'));
    $values = $submission['data']['values'];

    // Create contact in HubSpot (example)
    Http::withToken(config('services.hubspot.token'))
        ->post('https://api.hubapi.com/crm/v3/objects/contacts', [
            'properties' => [
                'firstname' => $values['first_name'] ?? '',
                'lastname' => $values['last_name'] ?? '',
                'email' => $values['email'] ?? '',
                'company' => $values['company'] ?? '',
                'phone' => $values['phone'] ?? '',
            ],
        ]);

    return response()->json(['synced' => true]);
}
```

## Tips

- Use `submission.meta` to store processing state (`processed: true/false`) and avoid duplicate processing.
- All integrations should use API tokens with minimal permissions.
- For high-volume forms, process submissions asynchronously via a queue worker rather than inline.
- The TypeScript SDK (`FlowFormClient`) can be used in Node.js server-side code, not just browsers.
