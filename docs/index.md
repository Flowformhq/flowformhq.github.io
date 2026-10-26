---
layout: home

hero:
  name: FlowForm
  text: Headless, API-first form and workflow engine
  tagline: Build multi-step forms, conditional logic, and submission workflows with a clean REST API. Powered by Laravel 13 and Filament 5.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/overview
    - theme: alt
      text: View on GitHub
      link: https://github.com/flowformhq/flowform

features:
  - title: Multi-Step Forms
    details: Define forms with ordered steps. Each step contains fields, and submissions track progress through the workflow automatically.
  - title: Conditional Logic
    details: Show, hide, or require fields based on other field values. Conditions are evaluated server-side and exposed via API for client rendering.
  - title: Field Type System
    details: Built-in types include text, email, number, textarea, select, checkbox, radio, date, and file. Display-only types like heading and paragraph are supported too.
  - title: Submission Lifecycle
    details: Submissions start as drafts. Advance and retreat through steps, upsert field values, and complete when ready. Full state is always available via API.
  - title: Entity Records
    details: Group related submission values into repeatable entity records for complex data structures like line items or nested objects.
  - title: Filament Admin Panel
    details: Manage forms, fields, steps, submissions, and field types through a full-featured admin UI built with Filament 5.
---
