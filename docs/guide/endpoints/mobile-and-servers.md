# Mobile Apps & Server Clients

Send submissions directly from native mobile apps, CLI scripts, or backend workers using `/api/v1/f/{slug}`. No API authentication token is required for active Endpoint forms.

---

## curl

```bash
curl -X POST https://forms.example.com/api/v1/f/contact-us \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "name": "Alice",
    "email": "alice@example.com",
    "message": "Hello from curl!",
    "_gotcha": ""
  }'
```

Success response (`200 OK`):

```json
{
  "success": true,
  "message": "Submission received",
  "id": "22c7a46f-fca5-4ad8-8348-14ccd6fd7cb0"
}
```

---

## React Native (`fetch`)

```typescript
export async function submitToFlowForm(payload: {
  name: string;
  email: string;
  message: string;
  _gotcha?: string;
}) {
  const response = await fetch('https://forms.example.com/api/v1/f/contact-us', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      _gotcha: '',
      ...payload,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as { success: boolean; message: string; id: string };
}
```

---

## Flutter (`package:http`)

Add `http` to `pubspec.yaml` (`flutter pub add http`) and post JSON:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<String> submitToFlowForm({
  required String name,
  required String email,
  required String message,
  String honeypot = '',
}) async {
  final uri = Uri.parse('https://forms.example.com/api/v1/f/contact-us');

  final response = await http.post(
    uri,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: jsonEncode({
      'name': name,
      'email': email,
      'message': message,
      '_gotcha': honeypot,
    }),
  );

  final body = jsonDecode(response.body) as Map<String, dynamic>;

  if (response.statusCode != 200) {
    throw Exception(body['error'] ?? 'Submission failed (${response.statusCode})');
  }

  return body['id'] as String;
}
```

---

## Python (`requests`)

```python
import requests

response = requests.post(
    "https://forms.example.com/api/v1/f/contact-us",
    headers={"Accept": "application/json"},
    json={
        "name": "Alice",
        "email": "alice@example.com",
        "message": "Hello from Python!",
        "_gotcha": "",
    },
    timeout=10,
)

data = response.json()
if not response.ok:
    raise RuntimeError(data.get("error", f"HTTP {response.status_code}"))

print("Submission ID:", data["id"])
```

---

## PHP (Laravel `Http::post`)

```php
use Illuminate\Support\Facades\Http;

$response = Http::acceptJson()
    ->timeout(10)
    ->post('https://forms.example.com/api/v1/f/contact-us', [
        'name' => 'Alice',
        'email' => 'alice@example.com',
        'message' => 'Hello from Laravel!',
        '_gotcha' => '',
    ]);

if ($response->failed()) {
    throw new \RuntimeException(
        $response->json('error') ?? 'Submission failed with status '.$response->status()
    );
}

$submissionId = $response->json('id');
```

---

## Honeypot Field

Include `"_gotcha": ""` (left empty for legitimate submissions) in every mobile or server payload. If populated, FlowForm drops the submission and returns `200 OK`.

---

## Success & Error Handling

Always check the HTTP status code before reading `id`:

- **`200`:** `{"success": true, "message": "Submission received", "id": "<uuid>"}`.
- **`403`:** Origin or `Referer` blocked by `allowed_domains`.
- **`404`:** Unknown slug/access key, inactive form, or form is in `wizard` mode instead of `endpoint` mode.
- **`429`:** Rate limit (`10` req/min/IP) or owner quota exhausted.

---

## Troubleshooting

- **403 Forbidden (Origin not allowed):** Native mobile apps and server HTTP clients typically omit `Origin` and `Referer`, which passes `allowed_domains`. If your client manually sets a `Referer` or `Origin` header, ensure that domain is in `allowed_domains`.
- **429 Too Many Requests:** Background batch jobs or shared backend proxies sending more than `10` requests per minute from a single IP will be throttled. Space out automated jobs or submit with backoff.
- **CORS:** Native mobile runtimes (React Native, Flutter) and server clients (`curl`, Python, PHP) do not enforce browser CORS policies. If running React Native Web or Flutter Web in a browser, use standard JSON headers without cookies.
