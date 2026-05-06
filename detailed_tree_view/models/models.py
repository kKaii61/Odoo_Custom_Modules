# -*- coding: utf-8 -*-

from odoo import models, fields, api
import logging
_logger = logging.getLogger(__name__)

class IrUiView(models.Model):
    _inherit = 'ir.ui.view'

    type = fields.Selection(selection_add=[
        ('quick_tree_view', 'Quick Tree View')
    ], ondelete={'quick_tree_view': 'cascade'})

    @api.model
    def _get_quick_tree_view(self, model_name):
        """
        Get the quick tree view architecture for a given model.
        Returns: dict with 'id' and 'arch' keys, or False if not found
        """
        _logger.info(f'Quick Tree View: Backend called for model: {model_name}')
        
        domain = [
            ('model', '=', model_name),
            ('type', '=', 'quick_tree_view'),
            ('active', '=', True)
        ]
        quick_view = self.search(domain, limit=1, order='priority desc, id')
        
        _logger.info(f'Quick Tree View: Found {len(quick_view)} quick views for {model_name}')
        
        if not quick_view:
            _logger.info(f'Quick Tree View: No quick view found for {model_name}')
            return False
            
        result = {
            'id': quick_view.id,
            'arch': quick_view.arch,
            'name': quick_view.name,
        }
        _logger.info(f'Quick Tree View: Returning view info: {result}')
        return result


