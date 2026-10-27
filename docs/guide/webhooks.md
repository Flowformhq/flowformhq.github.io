# Outbound Webhooks & HMAC Signatures

FlowForm dispatches real-time outbound webhooks upon every completed form submission, enabling downstream pipelines (CRMs, Slack, Discord, internal databases, or microservices).

---

## Webhook Architecture & Retries

Outbound webhooks are queued and dispatched with:
- **3 Exponential Retries**: `[10s, 60s, 300s]` backoff delays if the target endpoint returns a non-2xx status code or experiences connection timeouts.
- **HMAC-SHA256 Signatures**: A cryptographic signature header (`X-FlowForm-Signature`) verifying that the payload originated from FlowForm and was not tampered with in transit.
- **Unique Event IDs**: `X-FlowForm-Submission-Id` for idempotency tracking.

---

## Webhook Headers

| Header | Description |
| :--- | :--- |
| `Content-Type` | `application/json` |
| `User-Agent` | `FlowForm-Webhook/1.0` |
| `X-FlowForm-Event` | `form.submission` |
| `X-FlowForm-Submission-Id` | Unique submission UUID (e.g. `9f1a2b...`) |
| `X-FlowForm-Timestamp` | Unix timestamp of dispatch |
| `X-FlowForm-Signature` | Hex-encoded HMAC-SHA256 signature generated with your `webhook_secret` |

---

## Signature Verification Examples

### Node.js / Express
```javascript
const crypto = require('crypto');

function verifyFlowFormWebhook(req, secret) {
  const signature = req.headers['x-flowform-signature'];
  const rawBody = JSON.stringify(req.body);
  
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

### Python / FastAPI
```python
import hmac
import hashlib

def verify_flowform_webhook(payload_bytes: bytes, signature_header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode('utf-8'), payload_bytes, hashlib.sha256).hexdigest()
    return hmac.compare_digest(signature_header, expected)
```

### PHP
```php
$signature = $_SERVER['HTTP_X_FLOWFORM_SIGNATURE'] ?? '';
$payload = file_get_contents('php://input');
$expected = hash_hmac('sha256', $payload, $webhookSecret);

if (hash_equals($expected, $signature)) {
    // Verified FlowForm submission payload
}
```
