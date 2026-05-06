# Quick Tree View – Odoo 17 Module Specification

# THIS MODULE STILL IN PROCESS PLEASE DONT USE IT IN PRODUCT

## 1. Overview

This module introduces a new custom view type named `quick_tree_view` in Odoo 17.

The purpose of this view is to allow developers to define a lightweight preview layout that is displayed as a hover popup when the user hovers over a row in a standard tree (list) view.

If a `quick_tree_view` is defined for a given model, hovering over a tree row will display a readonly popup rendered according to the `quick_tree_view` architecture.

If no `quick_tree_view` is defined for that model, the system must fall back to normal Odoo behavior with no popup rendered.

The solution must respect Odoo 17 architecture standards (OWL v2, ES6 modules, view registry, services).

---

## 2. Goals

* Introduce a new `ir.ui.view` type named `quick_tree_view`
* Render the defined architecture inside a hover popup
* Trigger popup when hovering a row in a tree view
* Ensure the popup is readonly
* Do not interfere with standard list view behavior
* Maintain compatibility with Odoo 17 view registry and OWL

---

## 3. Non-Goals

* No editing capability inside popup (readonly only)
* No modification of core list view behavior
* No override of Odoo core views in a destructive way
* No automatic creation of quick views
* No mobile optimization required in first version

---

## 4. Functional Requirements

### 4.1 View Definition

Developers must be able to define a new view using:

```xml
<record model="ir.ui.view" id="quick_tree_view_sale_order">
    <field name="name">quick_tree_view_sale_order</field>
    <field name="model">sale.order</field>
    <field name="arch" type="xml">
        <quick_tree_view>
            <field name="order_line">
                <tree>
                    <field name="product_id"/>
                </tree>
            </field>
        </quick_tree_view>
    </field>
</record>
```

Behavior:

* The `arch` root tag must be `<quick_tree_view>`
* It must behave similarly to standard Odoo XML view definitions
* Nested views (tree/form) must be supported
* Field rendering must use Odoo standard field widgets

---

### 4.2 Hover Trigger Behavior

When:

* User hovers over a row (`tr`) in a tree view
* The tree view corresponds to a model that has a `quick_tree_view` defined

Then:

* A popup must appear near the hovered row
* Popup must render the defined `quick_tree_view` architecture
* Popup must be readonly
* Popup must disappear when mouse leaves row and popup

If:

* No `quick_tree_view` is defined for that model

Then:

* No popup is shown
* System behaves exactly like standard Odoo

---

### 4.3 Readonly Enforcement

All fields rendered inside the popup must:

* Be readonly regardless of original field definition
* Disable editing, creation, deletion
* Disable inline editing
* Prevent navigation to form view via click inside popup

Readonly must be enforced at rendering level (not relying only on XML).

---

### 4.4 Fallback Logic

The system must:

1. Detect if a `quick_tree_view` exists for the model
2. If not found:

   * Do not attach hover listener
   * Do not attempt rendering
   * No console errors
   * No performance degradation

---

## 5. Technical Architecture

### 5.1 Backend Changes

#### 5.1.1 Extend `ir.ui.view`

Add new view type:

* Extend selection field `type` in `ir.ui.view`
* Add new value: `quick_tree_view`

Example:

```python
type = fields.Selection(selection_add=[('quick_tree_view', 'Quick Tree View')])
```

#### 5.1.2 View Loading

Override view loading mechanism to allow:

* Fetching `quick_tree_view` by model
* Returning architecture for frontend rendering

A helper method must exist:

```
_get_quick_tree_view(model_name)
```

Returns:

* View architecture
* View ID
* Or False if not defined

Only one `quick_tree_view` per model should be active at a time.

---

### 5.2 Frontend (OWL – Odoo 17)

#### 5.2.1 ListView Extension Strategy

Do NOT override entire ListView.

Instead:

* Patch ListRenderer or ListController using Odoo patching mechanism
* Attach hover listener on row (`tbody > tr`)
* Use OWL lifecycle correctly

#### 5.2.2 Hover Detection

On `mouseenter`:

* Retrieve record ID
* Retrieve model name
* Request quick view architecture (if not cached)

On `mouseleave`:

* Remove popup after delay
* Ensure no flickering

Debounce required to prevent excessive RPC calls.

---

### 5.3 Popup Component

Create a new OWL component:

`QuickTreeViewPopup`

Responsibilities:

* Render provided architecture
* Fetch record data
* Enforce readonly mode
* Position relative to row
* Handle mouse enter/leave logic

Must use:

* Odoo view rendering service
* Standard field components
* View registry

Must not:

* Re-implement field rendering manually
* Bypass Odoo rendering system

---

### 5.4 View Rendering Strategy

Rendering must:

1. Fetch view architecture from backend
2. Compile it via Odoo view engine
3. Render record using model and record ID
4. Force readonly mode in view props

Readonly override must be enforced programmatically.

---

## 6. Data Flow

### Step 1 – User hovers row

Frontend:

* Detect row hover
* Extract model and record ID

### Step 2 – Check quick view existence

If not cached:

* RPC call to fetch quick view for model

### Step 3 – Render popup

If quick view exists:

* Mount popup component
* Load record data
* Render readonly view

If not:

* Do nothing

---

## 7. Performance Requirements

* Cache quick view architecture per model
* Avoid repeated RPC calls
* Debounce hover events (recommended 150–250ms)
* Do not re-render if hovering same row

Popup must not slow down tree rendering.

---

## 8. Security Requirements

* Respect Odoo record rules
* Respect access rights
* Do not bypass ACL
* Use standard read() methods

If user has no access to record:

* Do not show popup
* Fail silently

---

## 9. UI/UX Requirements

* Popup must appear adjacent to hovered row
* Popup must not block main UI interaction
* Popup must close automatically
* Popup must not overflow screen boundaries
* Minimal shadow styling
* Use Odoo theme variables

No custom heavy CSS frameworks allowed.

---

## 10. Edge Cases

* Rapid mouse movement across rows
* Large dataset (virtual scrolling)
* Record deleted while popup open
* Model without quick view
* Multiple quick views defined accidentally
* Multi-company behavior
* One2many nested rendering

System must not crash in any case.

---

## 11. Example Behavior (Sale Order)

Defined:

```xml
<quick_tree_view>
    <field name="order_line">
        <tree>
            <field name="product_id"/>
        </tree>
    </field>
</quick_tree_view>
```

When hovering a `sale.order` row:

Popup shows:

* One2many order_line
* Tree view
* Only product_id column
* No edit/delete
* No inline add

If no quick view defined:

* Hover does nothing

---

## 12. Folder Structure

Recommended module structure:

```
quick_tree_view/
├── __init__.py
├── __manifest__.py
├── models/
│   └── ir_ui_view.py
├── static/
│   └── src/
│       ├── js/
│       │   ├── quick_tree_patch.js
│       │   ├── quick_tree_popup.js
│       │   └── view_registry.js
│       └── scss/
│           └── quick_tree.scss
└── views/
    └── assets.xml
```

---

## 13. Implementation Phases

Phase 1:

* Backend: add view type
* Fetch quick view by model

Phase 2:

* Patch ListRenderer
* Implement hover detection

Phase 3:

* Implement popup component
* Enforce readonly mode

Phase 4:

* Add caching
* Add performance tuning

Phase 5:

* Add unit tests

---

## 14. Risks

* Improper patching may break list behavior
* Performance degradation on large lists
* Incorrect readonly enforcement
* Memory leak from unmounted components

Strict testing required.

---

## 15. Testing Checklist

* Hover on model with quick view
* Hover on model without quick view
* Switch between records quickly
* Access rights restricted user
* Multi-company
* Large one2many dataset
* Refresh browser
* Switch views (tree → form → tree)

---

## 16. Success Criteria

* No change to normal tree view behavior
* Popup appears only when quick view exists
* Popup always readonly
* No JS errors
* No performance degradation
* Compatible with Odoo 17 OWL architecture

---
