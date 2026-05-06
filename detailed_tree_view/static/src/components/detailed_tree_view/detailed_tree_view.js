/** @odoo-module */

import { registry } from "@web/core/registry";
import { DetailedTreeListRenderer } from "./detailed_tree_renderer";
import { RelationalModel } from "@web/model/relational_model/relational_model";
import { FormController } from "@web/views/form/form_controller";
import { FormRenderer } from "@web/views/form/form_renderer";
import { FormArchParser } from "@web/views/form/form_arch_parser";

export const detailedTreeView = {
    type: "quick_tree_view",
    display_name: "Detailed Tree View",
    icon: "fa fa-picture-o", // the icon that will be displayed in the Layout panel
    multiRecord: false,
    Controller: FormController,
    Renderer: DetailedTreeListRenderer,
    ArchParser: FormArchParser,
    Model: RelationalModel,
    buttonTemplate: false,

    props(genericProps, view) {
        const { ArchParser } = view;
        const { arch, relatedModels, resModel } = genericProps;
        const archInfo = new ArchParser().parse(arch, relatedModels, resModel);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            buttonTemplate: false,
            Compiler: view.Compiler,
            archInfo,
        };
    },
};

registry.category("views").add("quick_tree_view", detailedTreeView);