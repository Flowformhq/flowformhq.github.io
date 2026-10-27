# Regulatory Compliance: GDPR, HIPAA & SOC 2

FlowForm provides built-in enterprise compliance primitives, enabling engineering teams, healthcare organizations, and agencies to handle sensitive personal and clinical data with legal certainty.

---

## Data Processing Addendum (DPA)

FlowForm provides a machine-readable compliance registry endpoint specifying all Data Processing Addendum (DPA) terms, subprocessor lists, and technical controls:

```http
GET https://api.flowformhq.com/api/v1/compliance/dpa
```

### Response Example

```json
{
  "status": "active",
  "version": "2026-v1.0",
  "frameworks": {
    "GDPR": {
      "compliance_status": "Compliant (Articles 15, 17, 20, 28, 32)",
      "rights_supported": {
        "Right of Access (Article 15)": "/api/v1/compliance/gdpr/export",
        "Right to Erasure / Right to be Forgotten (Article 17)": "/api/v1/compliance/gdpr/erasure",
        "Right to Data Portability (Article 20)": "/api/v1/compliance/gdpr/export"
      }
    },
    "HIPAA": {
      "compliance_status": "Safeguards Implemented (45 CFR § 164.312)",
      "technical_safeguards": {
        "Encryption at Rest": "AES-256-GCM / Laravel Crypt",
        "Encryption in Transit": "TLS 1.3 / HTTPS Strict Transport Security",
        "Audit Controls (§ 164.312(b))": "Immutable audit logging for encrypted submission access",
        "Automatic Logoff (§ 164.312(a)(2)(iii))": "Session lifetime inactivity controls"
      },
      "baa_available": true
    }
  }
}
```

---

## GDPR: Right to Data Portability (Article 20)

Authenticated tenants can generate an on-demand, structured JSON export of all forms, schemas, workflows, and decrypted customer submissions:

```bash
curl -H "Authorization: Bearer <YOUR_SANCTUM_TOKEN>" \
     https://api.flowformhq.com/api/v1/compliance/gdpr/export \
     -o flowform-export.json
```

---

## GDPR: Right to be Forgotten (Article 17)

FlowForm supports two granular levels of erasure:

### 1. Data-Subject Specific Erasure

Erase all submissions matching a customer's email address across all tenant forms while keeping form schemas and other submissions intact:

```bash
curl -X POST https://api.flowformhq.com/api/v1/compliance/gdpr/erasure \
     -H "Authorization: Bearer <YOUR_SANCTUM_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"email": "customer@example.com"}'
```

### 2. Purge All Submissions

Wipe all stored submission payloads and values for a tenant:

```bash
curl -X POST https://api.flowformhq.com/api/v1/compliance/gdpr/erasure \
     -H "Authorization: Bearer <YOUR_SANCTUM_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"purge_all_submissions": true}'
```

---

## HIPAA Technical Safeguards (45 CFR § 164.312)

For Protected Health Information (PHI) intake:

1. **Field-Level Encryption (§ 164.312(a)(2)(iv)):** Enable AES-256-GCM field encryption on forms to ensure data is encrypted before hitting persistent storage.
2. **Immutable Audit Trails (§ 164.312(b)):** Every decryption, view, or export of an encrypted submission is recorded in the `audit_logs` table with the actor's user ID, IP address, timestamp, and target UUID.
3. **Session Inactivity Controls (§ 164.312(a)(2)(iii)):** Automated session timeout protects against unauthorized local access.
