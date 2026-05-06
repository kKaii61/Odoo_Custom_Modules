/** @odoo-module **/

import { Message } from "@mail/core/common/message";
import { MessageConfirmDialog } from "@mail/core/common/message_confirm_dialog";
import { patch } from "@web/core/utils/patch";
import { session } from "@web/session";
import { _t } from "@web/core/l10n/translation";
import { useService } from "@web/core/utils/hooks";

const { DateTime } = luxon;

/**
 * Helper: check if the message body indicates it was already deleted.
 */
function _isDeletedMessage(body) {
    if (!body) return false;
    return (
        body.includes("This message was deleted") ||
        body.includes("Admin has deleted this message")
    );
}

patch(Message.prototype, {
    setup() {
        super.setup(...arguments);
        this.orm = useService("orm");
    },

    /**
     * Override deletable to allow deleting tracking/notification messages
     * when the chat_enable setting is active.
     * - Chat Admin with admin_delete_access: can delete any message within 48h
     * - Chat Admin without admin_delete_access: can delete own messages within 15min
     * - Chat User: cannot delete (only edit)
     */
    get deletable() {
        const chat_enable = session.chat_permission.chat_enable;
        const admin_delete_access = session.chat_permission.admin_delete_access;
        const is_chat_admin = session.chat_permission.is_chat_admin;
        const is_chat_user = session.chat_permission.is_chat_user;
        if (!chat_enable) {
            return super.deletable;
        }
        // Only Chat Admin group can delete
        if (!is_chat_admin) {
            return false;
        }
        if (!this.props.hasActions) {
            return false;
        }
        const message = this.props.message;
        if (_isDeletedMessage(message.body)) {
            return false;
        }

        const diffMinutes = DateTime.now().diff(message.datetime, "minutes").minutes;

        // Chat Admin with admin_delete_access enabled -> 48 hours, any message
        if (is_chat_admin && admin_delete_access) {
            return diffMinutes < 2880;
        }
        // Chat Admin without admin_delete_access -> 15 min, own messages only
        if (is_chat_admin && message.isSelfAuthored) {
            return diffMinutes < 15;
        }
        return false;
    },

    /**
     * Override editable: when chat_enable is on, apply time-based
     * restrictions. Editing only applies to comment-type messages.
     * - Chat User (and Chat Admin): can edit own messages within 15min
     */
    get editable() {
        const chat_enable = session.chat_permission.chat_enable;
        const admin_delete_access = session.chat_permission.admin_delete_access;
        const is_chat_admin = session.chat_permission.is_chat_admin;
        const is_chat_user = session.chat_permission.is_chat_user;
        if (!chat_enable) {
            return super.editable;
        }
        // Only Chat User group (or higher) can edit
        if (!is_chat_user) {
            return false;
        }
        if (!this.props.hasActions) {
            return false;
        }
        const message = this.props.message;
        if (_isDeletedMessage(message.body)) {
            return false;
        }
        // Only comment messages can be edited
        if (message.type !== "comment") {
            return false;
        }
        // Only own messages can be edited
        if (!message.isSelfAuthored) {
            return false;
        }

        const diffMinutes = DateTime.now().diff(message.datetime, "minutes").minutes;

        // Chat User can edit within 15 minutes
        if (is_chat_user && diffMinutes < 15) {
            return true;
        }
        return false;
    },

    /**
     * Override delete: use custom delete_message RPC to handle
     * tracking/notification messages properly, with "soft delete"
     * (replaces body with "This message was deleted").
     */
    onClickDelete() {
        const chat_enable = session.chat_permission.chat_enable;
        const admin_delete_access = session.chat_permission.admin_delete_access;
        const is_chat_admin = session.chat_permission.is_chat_admin;
        const is_chat_user = session.chat_permission.is_chat_user;
        if (!chat_enable) {
            return super.onClickDelete(...arguments);
        }
        this.env.services.dialog.add(MessageConfirmDialog, {
            message: this.props.message,
            messageComponent: Message,
            prompt: _t("Are you sure you want to delete this message permanently?"),
            onConfirm: async () => {
                await this.orm.call(
                    "mail.message",
                    "action_ui_delete_message",
                    [this.props.message.id]
                );
                // Update local state to reflect the deletion
                this.props.message.body =
                    "This message was deleted.";
                this.props.message.trackingValues = [];
                this.props.message.attachments = [];
            },
        });
    },
});