# Core Concepts

FlowForm's data model is designed around composable primitives. Understanding these six concepts covers everything in the system.

## Forms

A form is the top-level container. Every form has:

| Field         | Type    | Description                          |
| ------------- | ------- | ------------------------------------ |
| `uuid`        | UUID    | Public identifier used in API calls  |
| `name`        | string  | Human-readable name                  |
| `slug`        | string  | URL-friendly identifier, auto-generated from name |
| `description` | text    | Optional description                 |
| `is_active`   | boolean | Only active forms appear in the public API |
| `version`     | integer | Incremented when the form structure changes |

Forms own steps, fields, entities, and submissions.

## Steps

Steps divide a form into ordered pages. Each step has a `step_number` that determines its position in the sequence.

| Field              | Type    | Description                              |
| ------------------ | ------- | ---------------------------------------- |
| `step_number`      | integer | Position in the form (1-based)           |
| `title`            | string  | Step heading shown to the user           |
| `description`      | text    | Optional helper text                     |
| `meta`             | JSON    | Arbitrary metadata (e.g., `{"icon": "user"}`) |
| `validation_rules` | JSON    | Step-level validation configuration      |
| `is_visible`       | boolean | Whether the step is visible              |

Steps can be reordered. The form model provides a `reorderSteps()` method that handles the unique constraint on `step_number` safely.

## Fields

Fields are the individual inputs within a step. Each field belongs to exactly one form and one step.

| Field              | Type    | Description                                  |
| ------------------ | ------- | -------------------------------------------- |
| `code`             | string  | Unique identifier within the form (e.g., `first_name`) |
| `label`            | string  | Display label                                |
| `placeholder`      | string  | Input placeholder text                       |
| `description`      | text    | Help text shown below the field              |
| `is_required`      | boolean | Whether the field must have a value          |
| `is_repeatable`    | boolean | Whether multiple values are allowed          |
| `default_value`    | string  | Pre-filled value                             |
| `validation_rules` | JSON    | Laravel validation rules as an array         |
| `config`           | JSON    | Type-specific configuration                  |
| `order`            | integer | Display order within the step                |

The `code` field is unique per form, making it the stable key for referencing fields across API calls.

## Field Types

Field types define what kind of input a field renders. Each type maps to a frontend component.

| Name        | Component            | Notes                     |
| ----------- | -------------------- | ------------------------- |
| `text`      | `text-input`         | Single-line text          |
| `email`     | `email-input`        | Email with validation     |
| `number`    | `number-input`       | Numeric input             |
| `textarea`  | `textarea-input`     | Multi-line text           |
| `select`    | `select-input`       | Dropdown with options     |
| `checkbox`  | `checkbox-input`     | Boolean or multi-select   |
| `radio`     | `radio-input`        | Single choice from options|
| `date`      | `date-input`         | Date picker               |
| `file`      | `file-input`         | File upload               |
| `heading`   | `heading-display`    | Display only, not a data field |
| `paragraph` | `paragraph-display`  | Display only, not a data field |

Types marked with `is_display: true` in their meta are purely visual -- they do not collect data.

Fields of type `select`, `radio`, or `checkbox` can have **field options**: an ordered list of label/value pairs.

## Conditions

Conditions control field visibility and requirement status based on other field values. They enable dynamic forms without custom code.

| Field                | Type   | Description                                   |
| -------------------- | ------ | --------------------------------------------- |
| `field_id`           | FK     | The field being controlled                    |
| `depends_on_field_id`| FK     | The field whose value is evaluated            |
| `operator`           | string | Comparison operator (e.g., `equals`, `not_equals`, `contains`) |
| `value`              | string | The value to compare against                  |
| `action`             | string | What happens when the condition is met (`show`, `hide`, `require`) |

**Example:** Show the "Company Name" field only when "Employment Status" equals "employed".

Conditions are evaluated server-side. The `/submissions/{uuid}/conditions` endpoint returns the computed visibility and requirement state for every field, given the current submission values.

## Submissions

A submission represents one user's progress through a form. Submissions track state through a lifecycle:

```
draft -> completed
```

| Field          | Type    | Description                              |
| -------------- | ------- | ---------------------------------------- |
| `uuid`         | UUID    | Public identifier                        |
| `form_id`      | FK      | The form being filled out                |
| `status`       | string  | `draft` or `completed`                   |
| `current_step` | integer | Which step the user is on (1-based)      |
| `meta`         | JSON    | Arbitrary metadata (e.g., user agent, referrer) |

### Submission Values

Each field value is stored as a separate `SubmissionValue` record:

| Field              | Type   | Description                              |
| ------------------ | ------ | ---------------------------------------- |
| `submission_id`    | FK     | Parent submission                        |
| `field_id`         | FK     | Which field this value belongs to        |
| `entity_record_id` | FK    | Optional link to an entity record        |
| `value`            | string | The submitted value                      |

Values are upserted -- submitting a value for the same field replaces the previous one.

## Entities and Entity Records

Entities model repeatable data groups within a form. Think of them as "sub-tables" -- for example, a "Dependents" entity in an insurance form where the user can add multiple family members.

| Entity Field   | Type    | Description                          |
| -------------- | ------- | ------------------------------------ |
| `name`         | string  | Internal identifier                  |
| `label`        | string  | Display label                        |
| `is_repeatable`| boolean | Whether multiple records are allowed |

Each entity can have many **entity records** per submission. Entity records can be nested (parent/child) and link to submission values, allowing structured data collection within the flat submission model.
