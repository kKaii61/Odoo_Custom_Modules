# Nâng cấp module từ Odoo 14 -> 17 (ĐÃ HOÀN THÀNH)

## Tổng quan thay đổi

Module đã được nâng cấp hoàn toàn cho Odoo 17. Chức năng chính: cho phép xóa
các message (bao gồm tracking/notification) trong chatter/form view.

## Chi tiết các thay đổi

### 1. `__manifest__.py`
- Xóa key `qweb` (deprecated trong Odoo 17)
- Xóa `views/ks_assets.xml` khỏi `data` (không cần nữa)
- Thêm key `assets` với `web.assets_backend` để khai báo JS/CSS
- Xóa `live_test_url`

### 2. `models/models.py`
- Sửa bug `ks_delete_message`: dùng `total_seconds()` thay vì `.seconds`
  (`.seconds` chỉ trả về phần giây, không phải tổng giây của timedelta)
- Sửa bug config parameter key: `'base_setup.ks_admin_delete_access'`
  (trước đó dùng sai key `'ks_admin_delete_access'`)
- Thêm `tracking_value_ids.unlink()` để xóa tracking values khi delete
- Thêm `subtype_id = False` khi delete message
- Thêm `sudo()` cho write/unlink operations
- Cập nhật `_message_format` signature: `(self, fnames, format_reply=True)`
- Xóa override `read()` (không cần trong Odoo 17)
- Dùng `super()` không có args (Python 3 style)

### 3. `static/src/js/ks_mail_extended.js` (VIẾT LẠI HOÀN TOÀN)
- Chuyển từ `odoo.define` / `require` sang ES6 modules (`/** @odoo-module **/`)
- Dùng `patch()` từ `@web/core/utils/patch` (OWL 2 pattern)
- Patch `Message.prototype` để override `deletable` và `editable` getters
- Override `onClickDelete` dùng custom RPC `ks_delete_message`
- Dùng `luxon.DateTime` thay vì `moment.js` (Odoo 17 standard)
- Dùng `session` từ `@web/session` để đọc config parameters
- Dùng ORM service cho RPC calls
- Dùng `MessageConfirmDialog` cho delete confirmation (thay vì `confirm()`)

### 4. `views/ks_inherited_res_config.xml` (VIẾT LẠI)
- Chuyển `inherit_id` sang `mail.res_config_settings_view_form`
- Dùng `<setting>` elements (Odoo 17 structure)
- Thay `attrs={'invisible':...}` bằng `invisible="not ks_chat_enable"`
- Xóa `action_mail_message_extension` (không cần)

### 5. `static/src/xml/ks_inherited_mail_config.xml`
- Không còn cần thiết - Odoo 17 dùng `messageActionsRegistry` cho message actions
- File giữ lại với comment giải thích

### 6. `static/src/css/ks_edit_chat.css`
- Đơn giản hóa - Odoo 17 dùng built-in UI cho message actions

### 7. Files KHÔNG CÒN SỬ DỤNG (có thể xóa)
- `views/ks_assets.xml` - assets giờ khai báo trong `__manifest__.py`
- `static/src/js/ks_mail_extend.js` - file legacy Odoo 12/13, không được load

## Cách hoạt động trong Odoo 17

1. **Delete**: Patch `Message.prototype.deletable` để cho phép xóa ALL message types
   (bao gồm tracking/notification) với time-based restrictions
2. **Edit**: Patch `Message.prototype.editable` với time-based restrictions
   (chỉ áp dụng cho comment messages - Odoo 17 đã có built-in edit)
3. **Settings**: Truyền config qua `session_info()` → `session.ks_chat_enable`
4. **Time limits**:
   - Admin + admin_delete_access: 48 giờ
   - Admin thường: 15 phút (chỉ message của mình)
   - User thường: 15 phút (chỉ message của mình)