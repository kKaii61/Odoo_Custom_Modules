# -*- coding: utf-8 -*-
{
    'name': "Chat Edit & Delete",
    'summary': "Edit and delete messages in Odoo chatter, including tracking notifications",
    'description': """
Chat Edit & Delete for Odoo 17
===================================

This module extends Odoo's messaging capabilities by allowing users to edit and delete messages in chatter and discuss views, including tracking/notification messages which are normally read-only.

Key Features:
• Edit messages within configurable time limits
• Delete tracking and notification messages  
• Admin can delete any message within 48 hours
• Time-based restrictions for security
• Full OWL 2 / Odoo 17 compatibility
• Seamless integration with existing UI

Perfect for teams that need flexibility in message management while maintaining security controls.
    """,
    'author': "Kainowf",
    'website': "https://kainowf.com/",
    'category': 'Tools',
    'version': '17.0.1.0.2',
    'license': 'LGPL-3',
    'currency': 'VND',
    'support': 'kn06102003@gmail.com',
    'depends': ['base', 'mail', 'base_setup', 'web'],
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'views/inherited_res_config.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'chat_edit_and_delete/static/src/js/mail_extended.js',
            'chat_edit_and_delete/static/src/css/edit_chat.css',
            'chat_edit_and_delete/static/src/xml/message_edit.xml',
        ],
    },
    'images': [
        'static/description/Odoo-chat_Edit_Delete_V17.jpg',
    ],
    'installable': True,
    'auto_install': False,
    'application': True,
    'sequence': 100,
}
