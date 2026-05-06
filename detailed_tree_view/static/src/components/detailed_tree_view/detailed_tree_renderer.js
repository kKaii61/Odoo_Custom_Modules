/** @odoo-module */

import { ListRenderer } from "@web/views/list/list_renderer";
import { useService } from "@web/core/utils/hooks";

export class DetailedTreeListRenderer extends ListRenderer {
    setup(){
        super.setup()
        console.log("This is res partner controller")
        this.action = useService("action")
    }

}

//DetailedTreeListRenderer.recordRowTemplate = "detailed_tree_view.ListRenderer.RecordRow";