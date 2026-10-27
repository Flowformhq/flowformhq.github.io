---
layout: home

hero:
  name: FlowForm
  text: Headless Multi-Step Intake Engine
  tagline: The developer-first form infrastructure for Laravel & modern frontend stacks. Server-evaluated conditional logic, AES-256 field encryption at rest, and signed webhooks with zero vendor lock-in.
  actions:
    - theme: brand
      text: Quickstart (5 Mins)
      link: /guide/quickstart
    - theme: alt
      text: API Reference
      link: /api/overview
    - theme: alt
      text: View on GitHub
      link: https://github.com/flowformhq/flowform

features:
  - title: Mode 1 · Zero-JS HTML Endpoints
    details: Point raw HTML forms directly to FlowForm. Built-in honeypot anti-spam defense, custom redirects, domain whitelisting, and instant email relay.
  - title: Mode 2 · Server-Evaluated Multi-Step Engine
    details: Build custom intake UI in React, Vue, Next.js, or Blade. Branching conditions are evaluated server-side to prevent client tampering.
  - title: Field-Level AES-256 Encryption at Rest
    details: Transparently encrypts sensitive PII at rest in the database using Laravel Crypt (AES-256-CBC) to satisfy HIPAA and GDPR data sovereignty.
  - title: Signed Outbound Webhooks & Retries
    details: Dispatches HMAC-SHA256 signed payloads (X-FlowForm-Signature) to your webhooks or API gateway with 3 exponential backoff attempts (10s, 60s, 300s).
  - title: In-App Transactional Mail Transport
    details: Easily plug in Custom SMTP, Amazon SES, Resend, or Postmark via Filament Admin with a real-time diagnostic connectivity test.
  - title: 100% Data Sovereignty & Fair Pricing
    details: Self-host for $0 with AGPLv3, or use our Managed Cloud with never-expiring Pay-As-You-Go credit packs ($19 for 10k submissions) and Agency OEM licensing.
---
