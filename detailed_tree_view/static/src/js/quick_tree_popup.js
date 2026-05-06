/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useService } from "@web/core/utils/hooks";
import { registry } from "@web/core/registry";
import { parseXML } from "@web/core/utils/xml";

console.log('Quick Tree View: Popup component loading...');

export class QuickTreeViewPopup extends Component {
    static template = "detailed_tree_view.QuickTreeViewPopup";
    
    setup() {
        console.log('Quick Tree View: Popup setup called');
        this.orm = useService("orm");
        this.viewService = useService("view");
        this.popupRoot = null;
        this.isDestroyed = false;
        this.recordData = null;
        
        console.log('Quick Tree View: Popup props:', this.props);
        
        this.setupPopup();
        this.loadRecordData();
    }
    
    setupPopup() {
        console.log('Quick Tree View: Setting up popup DOM element');
        // Create popup container
        this.popupRoot = document.createElement('div');
        this.popupRoot.className = 'quick-tree-view-popup';
        this.popupRoot.style.position = 'absolute';
        this.popupRoot.style.zIndex = '1000';
        this.popupRoot.style.background = 'white';
        this.popupRoot.style.border = '1px solid #dee2e6';
        this.popupRoot.style.borderRadius = '4px';
        this.popupRoot.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        this.popupRoot.style.padding = '12px';
        this.popupRoot.style.maxWidth = '600px';
        this.popupRoot.style.maxHeight = '400px';
        this.popupRoot.style.overflow = 'auto';
        
        // Position popup near the row
        this.positionPopup();
        
        // Add to document
        document.body.appendChild(this.popupRoot);
        console.log('Quick Tree View: Popup added to document');
        
        // Add mouse events to prevent closing when hovering popup
        this.popupRoot.addEventListener('mouseenter', () => {
            if (this.hideTimeout) {
                clearTimeout(this.hideTimeout);
            }
        });
        
        this.popupRoot.addEventListener('mouseleave', () => {
            if (!this.isDestroyed) {
                this.hideTimeout = setTimeout(() => {
                    this.destroy();
                }, 150);
            }
        });
    }
    
    positionPopup() {
        console.log('Quick Tree View: Positioning popup');
        const row = this.props.row;
        const rowRect = row.getBoundingClientRect();
        const popupWidth = 400; // Estimated width
        const popupHeight = 200; // Estimated height
        
        let left = rowRect.right + 10;
        let top = rowRect.top;
        
        // Adjust if popup would go off screen
        if (left + popupWidth > window.innerWidth) {
            left = rowRect.left - popupWidth - 10;
        }
        
        if (left < 10) {
            left = 10;
        }
        
        if (top + popupHeight > window.innerHeight) {
            top = window.innerHeight - popupHeight - 10;
        }
        
        if (top < 10) {
            top = 10;
        }
        
        this.popupRoot.style.left = `${left}px`;
        this.popupRoot.style.top = `${top}px`;
        console.log('Quick Tree View: Popup positioned at', { left, top });
    }
    
    async loadRecordData() {
        console.log('Quick Tree View: Loading record data...');
        try {
            const record = this.props.record;
            const modelName = this.parent.props.list.resModel;
            
            console.log('Quick Tree View: Reading record:', modelName, record.resId);
            
            // Load full record data
            this.recordData = await this.orm.read(modelName, [record.resId], []);
            
            console.log('Quick Tree View: Record data loaded:', this.recordData);
            
            if (this.recordData && this.recordData.length > 0) {
                this.renderView();
            } else {
                this.showError('Record not found');
            }
            
        } catch (error) {
            console.error('Quick Tree View: Failed to load record data:', error);
            this.showError('Error loading record');
        }
    }
    
    renderView() {
        console.log('Quick Tree View: Rendering view');
        const { arch } = this.props.viewInfo;
        const record = this.recordData[0];
        
        console.log('Quick Tree View: Architecture:', arch);
        console.log('Quick Tree View: Record data:', record);
        
        // Parse the architecture and render manually
        try {
            const archDoc = parseXML(arch);
            console.log('Quick Tree View: Parsed XML:', archDoc);
            const html = this.renderArchToHtml(archDoc, record);
            console.log('Quick Tree View: Generated HTML:', html);
            this.popupRoot.innerHTML = html;
        } catch (error) {
            console.error('Quick Tree View: Failed to render view:', error);
            this.showError('Error rendering view');
        }
    }
    
    renderArchToHtml(archNode, record) {
        console.log('Quick Tree View: Converting arch to HTML');
        let html = '<div class="quick-tree-view-popup-content">';
        
        // Process each child node
        for (const child of archNode.children) {
            console.log('Quick Tree View: Processing child:', child.tagName, child.attributes);
            if (child.tagName === 'field') {
                const fieldName = child.getAttribute('name');
                const fieldValue = record[fieldName];
                
                console.log('Quick Tree View: Field:', fieldName, 'Value:', fieldValue);
                
                if (fieldValue !== undefined && fieldValue !== false) {
                    html += `<div class="field-group">`;
                    html += `<div class="field-label">${fieldName}</div>`;
                    
                    // Handle different field types
                    if (Array.isArray(fieldValue)) {
                        // One2many or Many2many field
                        console.log('Quick Tree View: Rendering related field');
                        html += this.renderRelatedField(child, fieldValue, record);
                    } else if (typeof fieldValue === 'object' && fieldValue !== null) {
                        // Many2one field
                        html += `<div class="field-value">${fieldValue.display_name || fieldValue.id}</div>`;
                    } else {
                        // Simple field
                        html += `<div class="field-value">${fieldValue}</div>`;
                    }
                    
                    html += `</div>`;
                }
            }
        }
        
        html += '</div>';
        return html;
    }
    
    renderRelatedField(fieldNode, records, parentRecord) {
        console.log('Quick Tree View: Rendering related field with', records.length, 'records');
        let html = '<div class="related-records">';
        
        // Check if there's a nested view (tree/form)
        let nestedView = null;
        for (const child of fieldNode.children) {
            if (child.tagName === 'tree' || child.tagName === 'form') {
                nestedView = child;
                break;
            }
        }
        
        console.log('Quick Tree View: Nested view found:', nestedView ? 'YES' : 'NO');
        
        if (nestedView && records.length > 0) {
            // Render as table if tree view
            if (nestedView.tagName === 'tree') {
                html += '<table class="o_list_table table table-sm">';
                
                // Header
                html += '<thead><tr>';
                for (const child of nestedView.children) {
                    if (child.tagName === 'field') {
                        const fieldName = child.getAttribute('name');
                        html += `<th>${fieldName}</th>`;
                    }
                }
                html += '</tr></thead>';
                
                // Body
                html += '<tbody>';
                for (const record of records) {
                    if (typeof record === 'object' && record !== null) {
                        html += '<tr>';
                        for (const child of nestedView.children) {
                            if (child.tagName === 'field') {
                                const fieldName = child.getAttribute('name');
                                const value = record[fieldName];
                                html += `<td>${this.formatFieldValue(value)}</td>`;
                            }
                        }
                        html += '</tr>';
                    }
                }
                html += '</tbody></table>';
            }
        } else {
            // Simple list display
            html += '<div class="simple-list">';
            records.forEach(record => {
                if (typeof record === 'object' && record !== null) {
                    html += `<div class="list-item">${record.display_name || record.id}</div>`;
                } else {
                    html += `<div class="list-item">${record}</div>`;
                }
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }
    
    formatFieldValue(value) {
        if (value === null || value === undefined) {
            return '';
        }
        if (typeof value === 'object' && value !== null) {
            return value.display_name || value.id || JSON.stringify(value);
        }
        return String(value);
    }
    
    showError(message) {
        console.log('Quick Tree View: Showing error:', message);
        this.popupRoot.innerHTML = `<div class="text-danger">${message}</div>`;
    }
    
    destroy() {
        console.log('Quick Tree View: Destroying popup');
        if (this.isDestroyed) return;
        
        this.isDestroyed = true;
        
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        if (this.popupRoot && this.popupRoot.parentNode) {
            this.popupRoot.parentNode.removeChild(this.popupRoot);
        }
        
        super.destroy();
    }
    
    mount() {
        console.log('Quick Tree View: Mounting popup component');
        // Component is already mounted in setup
        return Promise.resolve();
    }
}

console.log('Quick Tree View: Popup component loaded');
