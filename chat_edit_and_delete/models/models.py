from odoo import models, fields, api
from odoo.exceptions import AccessError
import datetime


class MailMessage(models.Model):
    _inherit = 'mail.message'
    msg_del = fields.Char()
    msg_edit = fields.Boolean()

    # Function to delete the tracking message and changes the message to notification.
    @api.model
    def action_ui_delete_message(self, message_id):
        # Check if chat edit/delete is enabled
        if not self.env.company.chat_enable:
            raise AccessError("Chat edit/delete functionality is disabled. Contact your administrator.")
        
        # Check if user has delete permission
        if not self.env.user.has_group('chat_edit_and_delete.group_chat_admin'):
            raise AccessError("You don't have permission to delete messages. Contact your administrator.")
        
        admin_delete_access = self.env.company.admin_delete_access
        message = self.browse(message_id)
        date = message.create_date
        present = datetime.datetime.now()
        difference = (present - date)

        # Chat Admin with admin_delete_access enabled: can delete any message within 48h
        if self.env.user.has_group('chat_edit_and_delete.group_chat_admin') and admin_delete_access:
            if difference.total_seconds() <= 48 * 60 * 60:
                res = self.env['res.users'].search([("id", "=", message.create_uid.id)])
                if res.has_group('base.group_system'):
                    custom_message = "This message was deleted."
                else:
                    custom_message = "Admin has deleted this message."

                message.sudo().write({
                    'message_type': "notification",
                    'msg_del': message.body,
                    'body': custom_message,
                    'subtype_id': False,
                })
                message.sudo().attachment_ids.unlink()
                message.sudo().tracking_value_ids.unlink()
                # Can add a condition here to make it delete permanently or keep it
                message.sudo().unlink()
        # Chat Admin without admin_delete_access: can only delete own messages within 15min
        elif self.env.user.has_group('chat_edit_and_delete.group_chat_admin'):
            if difference.total_seconds() <= 600 and message.create_uid.id == self.env.user.id:
                message.sudo().write({
                    'message_type': "notification",
                    'msg_del': message.body,
                    'body': "This message was deleted.",
                    'subtype_id': False,
                })
                message.sudo().attachment_ids.unlink()
                message.sudo().tracking_value_ids.unlink()
                # Can add a condition here to make it delete permanently or keep it
                message.sudo().unlink()


    # Function to set the value of msg_edit is true if message is updated.
    @api.model
    def action_ui_edit_message(self, message_id, state):
        # Check if chat edit/delete is enabled
        if not self.env.company.chat_enable:
            raise AccessError("Chat edit/delete functionality is disabled. Contact your administrator.")
        
        # Check if user has edit permission
        if not self.env.user.has_group('chat_edit_and_delete.group_chat_user'):
            raise AccessError("You don't have permission to edit messages. Contact your administrator.")
        
        message = self.browse(message_id)
        
        # Only allow editing own messages
        if message.create_uid.id != self.env.user.id:
            raise AccessError("You can only edit your own messages.")
        
        date = message.create_date
        present = datetime.datetime.now()
        difference = present - date

        # Chat User can edit within 15 minutes (600 seconds)
        if difference.total_seconds() <= 600:
            message.msg_edit = state
        else:
            raise AccessError("Message can only be edited within 15 minutes of creation.")

    def _message_format(self, fnames, format_reply=True):
        vals_list = super()._message_format(fnames, format_reply=format_reply)
        for vals in vals_list:
            message_sudo = self.browse(vals['id']).sudo().with_prefetch(self.ids)
            vals['msg_edit'] = bool(message_sudo.msg_edit)
        return vals_list


class ResConfigSettings(models.TransientModel):
    _inherit = "res.config.settings"

    chat_enable = fields.Boolean(
        string="Enable Chat Edit/Delete",
        check_company=True,
        related='company_id.chat_enable',
        readonly=False,
    )
    admin_delete_access = fields.Boolean(
        string="Admin Delete Access",
        check_company=True,
        related='company_id.admin_delete_access',
        readonly=False,
    )

    @api.onchange('chat_enable')
    def reset_admin_access(self):
        if not self.chat_enable:
            self.admin_delete_access = False


class ResCompany(models.Model):
    _inherit = 'res.company'

    chat_enable = fields.Boolean(
        string="Enable Chat Edit/Delete"
    )
    admin_delete_access = fields.Boolean(
        string="Admin Delete Access", default=True
    )


class IrHttp(models.AbstractModel):
    _inherit = 'ir.http'


    def session_info(self):
        session = super(IrHttp, self).session_info()
        user = self.env.user
        chat_enable = self.env.company.sudo().chat_enable
        admin_delete_access  = self.env.company.sudo().admin_delete_access
        is_chat_user= user.has_group('chat_edit_and_delete.group_chat_user')
        is_chat_admin = user.has_group('chat_edit_and_delete.group_chat_admin')
        return {
            **session,
            "chat_permission": {
                "chat_enable": chat_enable,
                "admin_delete_access": admin_delete_access,
                "is_chat_user": is_chat_user,
                "is_chat_admin": is_chat_admin,
            },
        }