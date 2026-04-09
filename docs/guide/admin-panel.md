# Admin Panel

FlowForm includes a full administration interface built with [Filament 4](https://filamentphp.com). The admin panel lets you manage every aspect of the form engine without writing code.

## Accessing the Panel

After starting the development server, navigate to:

```
http://localhost:8000/admin
```

Log in with the seeded admin credentials:

- **Email:** `admin@flowform.dev`
- **Password:** `password`

## Resources

The admin panel provides CRUD interfaces for all core models.

### Forms

Create and manage forms from the Forms resource. Each form has:

- **Name** and **slug** (slug is auto-generated)
- **Description** for internal documentation
- **Active toggle** to control public API visibility
- **Version number** that tracks structural changes

From the form edit page, you can manage the form's steps and fields.

### Steps

Steps are managed within the context of a form. Each step has:

- **Title** and optional **description**
- **Step number** controlling the order
- **Visibility toggle**
- **Meta** field for arbitrary JSON data (e.g., icons)
- **Validation rules** as a JSON array

### Fields

Fields are the core building blocks. The field form includes:

- **Code** -- a unique identifier within the form (e.g., `email`, `first_name`)
- **Label** and **placeholder** text
- **Field type** selection from the available types
- **Step assignment** to place the field on a specific step
- **Required** and **repeatable** toggles
- **Default value**
- **Validation rules** as a JSON array
- **Config** as a JSON object for type-specific settings

Fields of type `select`, `radio`, or `checkbox` can have options managed through a nested form.

### Field Types

The Field Types resource shows all available input types. Each type has:

- **Name** (e.g., `text`, `email`, `select`)
- **Component** name that maps to a frontend component
- **Meta** for type-specific configuration (e.g., `is_display: true` for non-data fields)

The default types are seeded during setup. You can add custom types to extend the system.

### Submissions

View submissions in a read-only interface. The submissions list shows:

- **Form name**
- **Status** (draft or completed)
- **Current step**
- **Created/updated timestamps**

The detail view shows all submission values through a relation manager, displaying each field's label and submitted value.

### Entities

Manage entity definitions that enable repeatable data groups within forms:

- **Name** and **label**
- **Repeatable toggle**
- **Associated form**

## Customization

The admin panel is built with standard Filament resources. You can customize it by:

- Modifying the resource classes in `app/Filament/Resources/`
- Adding new pages or actions
- Customizing the panel configuration in `app/Providers/Filament/AdminPanelProvider.php`

Each resource follows a consistent structure:

```
app/Filament/Resources/{Model}/
  ├── {Model}Resource.php      # Resource definition
  ├── Pages/
  │   ├── Create{Model}.php
  │   ├── Edit{Model}.php
  │   └── List{Models}.php
  ├── Schemas/
  │   └── {Model}Form.php      # Form schema
  └── Tables/
      └── {Models}Table.php    # Table schema
```
