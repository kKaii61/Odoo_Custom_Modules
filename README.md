# Odoo Custom Modules Collection

This repository contains custom Odoo modules developed to enhance usability and user experience in Odoo 17, focusing on modern OWL-based frontend improvements.

---

## 📦 Available Modules

### 1. `chat_edit_and_delete`

Enhances the default Odoo chat (Discuss module) by allowing users to:

* ✏️ Edit previously sent messages
* 🗑️ Delete messages when no longer needed

#### Key Features

* Seamless integration with Odoo Discuss UI
* Real-time updates using OWL framework
* Permission-aware (can be extended to restrict edit/delete rights)

#### Use Cases

* Correcting typos or updating information in conversations
* Removing sensitive or unnecessary messages

---

### 2. `detailed_tree_view` - IN PROCESS

Improves the tree (list) view by providing a quick preview of record details.

#### Key Features

* 👆 Hover over any record row to display a popup
* 📄 Shows detailed information without opening the form view
* ⚡ Faster navigation and data inspection

#### Use Cases

* Quickly reviewing records without interrupting workflow
* Reducing number of clicks when browsing large datasets

---

## ⚙️ Installation

1. Clone this repository into your Odoo custom addons directory:

```bash
git clone <your-repo-url>
```

2. Add the path to your `odoo.conf`:

```ini
addons_path = /path/to/your/addons
```

3. Restart Odoo server

4. Activate Developer Mode

5. Go to **Apps** → Update Apps List → Install modules:

   * `chat_edit_and_delete`
   * `detailed_tree_view`

---

## 🧩 Technical Notes

* Built for **Odoo 17**
* Uses:

  * OWL (Odoo Web Library)
  * ES6 JavaScript
  * XML templating
* Designed with modular and extendable architecture

---

## 🚀 Future Improvements

* Add permission control for chat edit/delete
* Support audit logs for message changes
* Enhance popup UI (custom layouts, field selection)
* Add configuration settings per model for `detailed_tree_view`

---

## 👨‍💻 Author

Developed as part of hands-on Odoo customization and frontend enhancement practice.

---

## 📄 License

This project is open-source and available under the MIT License (or your preferred license).

---

## 💡 Notes

These modules focus on improving **user productivity** and **UX**, not altering core business logic.
They are safe to extend and integrate into existing Odoo workflows.

---
