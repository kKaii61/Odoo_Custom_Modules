# -*- coding: utf-8 -*-
{
    'name': "Quick Tree View",
    'summary': "Display quick preview popup on tree view hover",
    'description': """This module introduces a new custom view type named 'quick_tree_view' in Odoo 17.
The purpose of this view is to allow developers to define a lightweight preview layout that is displayed as a hover popup when the user hovers over a row in a standard tree (list) view.
If a 'quick_tree_view' is defined for a given model, hovering over a tree row will display a readonly popup rendered according to the 'quick_tree_view' architecture.
If no 'quick_tree_view' is defined for that model, the system falls back to normal Odoo behavior with no popup rendered.""",
    'author': "Kainowf",
    'website': "Kainowf",
    'category': 'Uncategorized',
    'version': '17.0.0.1',
    # any module necessary for this one to work correctly
    'depends': ['base', 'web', 'sale'],
    # always loaded
    'data': [
        # 'security/ir.model.access.csv',
        # 'views/templates.xml',
        'views/views.xml',
    ],
    'assets': {
        'web.assets_backend': [
            'detailed_tree_view/static/src/components/detailed_tree_view/*.js',
            'detailed_tree_view/static/src/components/detailed_tree_view/*.xml',
            'detailed_tree_view/static/src/scss/quick_tree.scss',
            'detailed_tree_view/static/src/js/quick_tree_patch.js',
            'detailed_tree_view/static/src/js/quick_tree_popup.js',
            'detailed_tree_view/static/src/js/quick_tree_popup.xml',
        ],
    },
    # only loaded in demonstration mode
    'demo': [
        'demo/demo.xml',
    ],
}

