# Security & Field-Level Encryption

FlowForm is engineered for privacy-conscious developers, healthcare applications, and legal intake systems that require strict data sovereignty.

---

## Field-Level AES-256 Encryption at Rest

When ingesting sensitive Personally Identifiable Information (PII) or Protected Health Information (PHI) under **HIPAA** or **GDPR**, storing database rows in plaintext creates severe regulatory and security liability.

FlowForm features built-in transparent field-level encryption at rest:

```
[ Client Submission ]
        │
        ▼ (TLS 1.3 / HTTPS Ingestion)
[ FlowForm API Controller ]
        │
        ▼ Checks `form->is_encrypted === true`
[ AES-256-CBC Encryption via Laravel Crypt ]
        │
        ▼ Ciphertext JSON payload stored
[ Database: `submissions.data` ] (e.g. eyJpdiI6IlpM...)
        │
        ▼ (Transparently Decrypted on Access via Decryption Accessor)
[ Authenticated Filament Admin / Authorized Tenant API ]
```

---

## How to Enable Encryption

### 1. In Filament Admin
1. Open your Form in the FlowForm dashboard.
2. Toggle on **Field-Level AES-256 Encryption at Rest**.
3. Save the form. All future submissions for this form will automatically be encrypted before writing to disk.

### 2. Via API / Database
Set `is_encrypted = true` on the `forms` record:
```php
$form = Form::create([
    'name' => 'Patient Medical Intake',
    'slug' => 'patient-intake',
    'type' => 'endpoint',
    'is_encrypted' => true,
]);
```

---

## Verification & Ciphertext Inspection

In the database, encrypted submission payloads look like:
```sql
SELECT id, is_encrypted, data FROM submissions WHERE id = 42;
```

Output:
```
id | is_encrypted | data
42 | 1            | eyJpdiI6Inl3ZmdSZVZqSEVqW... (non-readable AES-256 ciphertext)
```

Direct database inspection, automated SQL backups, and volume snapshots will never reveal raw patient records, Social Security Numbers, or credit intake details.

---

## Object-Level Tenancy Authorization

Every API request to `/api/v1/submissions/{uuid}` enforces object-level tenancy authorization. Authenticated API tokens can only read or mutate submissions belonging to forms owned by their account (`form->user_id === auth()->id()`). Unauthorized requests receive `404 Not Found` without disclosing record existence.
