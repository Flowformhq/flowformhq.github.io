# Conditional Logic

FlowForm supports dynamic form behavior through server-evaluated conditional rules. Fields can be shown, hidden, or made required based on the values of other fields.

## How it works

Each field can have zero or more **conditions** attached. A condition consists of:

| Property | Description |
|---|---|
| `depends_on_field_code` | The field whose value triggers this condition |
| `operator` | The comparison to perform |
| `value` | The value to compare against |
| `action` | What happens when the condition is met: `show`, `hide`, or `require` |

Conditions are evaluated by the server's `ConditionEvaluator` service. The client never evaluates conditions locally — it sends the current submission values to the server and receives back the resolved field states.

## Supported operators

| Operator | Description | Example |
|---|---|---|
| `equals` | Exact match | `country equals "US"` |
| `not_equals` | Does not match | `status not_equals "blocked"` |
| `contains` | Substring match | `email contains "@company.com"` |
| `greater_than` | Numeric greater than | `age greater_than "18"` |
| `less_than` | Numeric less than | `score less_than "100"` |
| `in` | Value is in a comma-separated list | `country in "US,CA,UK"` |
| `not_in` | Value is not in a list | `status not_in "blocked,suspended"` |
| `empty` | Field has no value | `company empty` |
| `not_empty` | Field has a value | `email not_empty` |

## Actions

- **`show`** — The field becomes visible only when the condition is met. If no `show` condition is met, the field is hidden.
- **`hide`** — The field is hidden when the condition is met. Multiple `hide` conditions on the same field are OR'd — if any is met, the field hides.
- **`require`** — The field becomes required when the condition is met. This only applies when the field is visible.

## Evaluating conditions via API

After creating a submission and persisting values, fetch the current field states:

```
GET /api/v1/submissions/{uuid}/conditions
```

Response:

```json
{
  "data": [
    { "field_id": 1, "field_code": "email", "is_visible": true, "is_required": true },
    { "field_id": 2, "field_code": "company_name", "is_visible": false, "is_required": false },
    { "field_id": 3, "field_code": "vat_number", "is_visible": true, "is_required": true }
  ]
}
```

## Examples

### Example 1: Show a field based on a dropdown

Create a condition on the "Company Name" field:
- `depends_on_field_code`: `employment_status`
- `operator`: `equals`
- `value`: `employed`
- `action`: `show`

The "Company Name" field is hidden by default and only appears when the user selects "Employed" in the employment status dropdown.

### Example 2: Require VAT for EU countries

Create a condition on the "VAT Number" field:
- `depends_on_field_code`: `country`
- `operator`: `in`
- `value`: `DE,FR,NL,BE,IT,ES,AT,PT,IE,LU`
- `action`: `require`

The VAT field is always visible but only becomes required when the selected country is in the EU list.

### Example 3: Hide a field when another is empty

Create a condition on the "Manager Email" field:
- `depends_on_field_code`: `has_manager`
- `operator`: `equals`
- `value`: `1`
- `action`: `show`

The manager email field only appears when the "Do you have a manager?" checkbox is checked.

## Multiple conditions

A field can have multiple conditions. The evaluation rules:

- **Multiple `hide` conditions**: If any hide condition is met, the field is hidden (OR logic).
- **`show` conditions**: If a show condition exists, the field is only visible when at least one show condition is met.
- **`require` conditions**: Only evaluated when the field is visible. If any require condition is met, the field becomes required.

## Starter kit integration

All starter kits (React, Vue, Livewire) automatically fetch conditions after every step change and value persist. Hidden fields are not rendered. Required state overrides the schema default.

The flow:

1. User changes a field value
2. Values are persisted to the server
3. Client calls `GET /submissions/{uuid}/conditions`
4. Each field's `is_visible` and `is_required` state is updated
5. The UI re-renders based on the new states
