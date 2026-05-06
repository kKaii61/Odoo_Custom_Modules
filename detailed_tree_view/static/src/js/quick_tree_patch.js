/** @odoo-module **/

import { ListRenderer } from "@web/views/list/list_renderer";
import { patch } from "@web/core/utils/patch";
import { QuickTreeViewPopup } from "./quick_tree_popup";
import { useService } from "@web/core/utils/hooks";

console.log('Quick Tree View: Patch loading...');

patch(ListRenderer.prototype, {
    setup() {
        console.log('Quick Tree View: ListRenderer setup called');
        super.setup();
        this.quickViewCache = new Map();
        this.currentPopup = null;
        this.hoverTimeout = null;
        this.hideTimeout = null;
    },

    /**
     * Odoo 17: Override the getCellProps method to add hover events
     */
    getCellProps(record, column) {
        const props = super.getCellProps(record, column);
        
        // Add hover events to the first cell (or any cell)
        if (column.name === 'id' || column.index === 0) {
            console.log('Quick Tree View: Adding hover props to cell for record:', record.resId);
            return {
                ...props,
                'data-record-id': record.resId.toString(),
                onMouseenter: this.onRowHover.bind(this),
                onMouseleave: this.onRowLeave.bind(this),
            };
        }
        
        return props;
    },

    /**
     * Alternative: Override the getRowProps method (Odoo 17 style)
     */
    getRowProps(record) {
        const props = super.getRowProps(record);
        console.log('Quick Tree View: getRowProps called for record:', record.resId);
        return {
            ...props,
            'data-record-id': record.resId.toString(),
            onMouseenter: this.onRowHover.bind(this),
            onMouseleave: this.onRowLeave.bind(this),
        };
    },

    /**
     * Alternative: Override the render method to add event listeners after mounting
     */
    mounted() {
        console.log('Quick Tree View: ListRenderer mounted');
        super.mounted();
        this.addHoverListeners();
    },

    /**
     * Add hover listeners manually to table rows
     */
    addHoverListeners() {
        console.log('Quick Tree View: Adding hover listeners manually');
        const table = this.el?.querySelector('table');
        if (table) {
            const rows = table.querySelectorAll('tbody tr');
            console.log('Quick Tree View: Found', rows.length, 'table rows');
            
            rows.forEach((row, index) => {
                const record = this.props.list.records[index];
                if (record) {
                    console.log('Quick Tree View: Adding listener to row for record:', record.resId);
                    row.setAttribute('data-record-id', record.resId.toString());
                    row.addEventListener('mouseenter', this.onRowHover.bind(this));
                    row.addEventListener('mouseleave', this.onRowLeave.bind(this));
                }
            });
        } else {
            console.log('Quick Tree View: No table found');
        }
    },

    onRowHover(event) {
        console.log('Quick Tree View: Row hover detected');
        const row = event.currentTarget;
        const recordId = row.dataset.recordId;
        
        console.log('Quick Tree View: Record ID from dataset:', recordId);
        
        if (!recordId) {
            console.log('Quick Tree View: No record ID found, skipping');
            return;
        }
        
        const record = this.props.list.records.find(r => 
            r.resId.toString() === recordId
        );
        
        console.log('Quick Tree View: Found record:', record ? 'YES' : 'NO');
        
        if (!record) return;
        
        // Clear existing timeouts
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
        }
        
        // Debounce hover event
        this.hoverTimeout = setTimeout(() => {
            console.log('Quick Tree View: Triggering quick view show');
            this._showQuickView(row, record);
        }, 200);
    },

    onRowLeave(event) {
        console.log('Quick Tree View: Row leave detected');
        const row = event.currentTarget;
        
        // Clear hover timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
        }
        
        // Delay hiding to prevent flickering
        this.hideTimeout = setTimeout(() => {
            console.log('Quick Tree View: Hiding quick view');
            this._hideQuickView();
        }, 150);
    },

    async _showQuickView(row, record) {
        console.log('Quick Tree View: _showQuickView called');
        console.log('Quick Tree View: Model:', this.props.list.resModel);
        console.log('Quick Tree View: Record ID:', record.resId);
        
        // Hide existing popup if any
        if (this.currentPopup) {
            console.log('Quick Tree View: Destroying existing popup');
            this.currentPopup.destroy();
            this.currentPopup = null;
        }
        
        const modelName = this.props.list.resModel;
        
        // Check cache first
        let quickViewInfo = this.quickViewCache.get(modelName);
        console.log('Quick Tree View: Cache hit:', quickViewInfo ? 'YES' : 'NO');
        
        if (!quickViewInfo) {
            console.log('Quick Tree View: Fetching quick view from backend...');
            // Fetch quick view from backend
            try {
                const result = await this.env.services.orm.call(
                    'ir.ui.view',
                    '_get_quick_tree_view',
                    [modelName]
                );
                
                console.log('Quick Tree View: Backend result:', result);
                
                if (!result) {
                    console.log('Quick Tree View: No quick view defined for model:', modelName);
                    return; // No quick view defined
                }
                
                quickViewInfo = result;
                this.quickViewCache.set(modelName, quickViewInfo);
                console.log('Quick Tree View: Cached view info');
            } catch (error) {
                console.warn('Quick Tree View: Failed to fetch quick tree view:', error);
                return;
            }
        }
        
        console.log('Quick Tree View: Creating popup component...');
        // Create and show popup
        this.currentPopup = new QuickTreeViewPopup(this, {
            record: record,
            viewInfo: quickViewInfo,
            row: row,
            services: this.env.services,
        });
        
        console.log('Quick Tree View: Mounting popup...');
        this.currentPopup.mount();
        console.log('Quick Tree View: Popup mounted successfully');
    },

    _hideQuickView() {
        console.log('Quick Tree View: _hideQuickView called');
        if (this.currentPopup) {
            console.log('Quick Tree View: Destroying popup');
            this.currentPopup.destroy();
            this.currentPopup = null;
        }
    },
});

console.log('Quick Tree View: Patch applied successfully');
