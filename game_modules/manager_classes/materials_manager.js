"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterialsManager = void 0;
const item_tags_1 = require("../static_data/item_tags");
class MaterialsManager {
    constructor() {
        this.materials = [];
        this.mat_dict = {};
        this.new_material_id = 0;
        this.list_of_indices = [];
    }
    add_material(material) {
        this.materials.push(material);
        this.mat_dict[material.string_tag] = this.new_material_id;
        this.list_of_indices.push(this.new_material_id);
        this.new_material_id = this.new_material_id + 1;
        return this.new_material_id - 1;
    }
    create_material(density, hardness, string_tag) {
        let mat = new item_tags_1.ITEM_MATERIAL(density, hardness, string_tag);
        let ind = this.add_material(mat);
        return ind;
    }
    get_materials_json() {
        return this.mat_dict;
    }
    get_materials_list() {
        return this.list_of_indices;
    }
    get_material_with_index(n) {
        return this.materials[n];
    }
    get_material_with_tag(tag) {
        return this.materials[this.mat_dict[tag]];
    }
}
exports.MaterialsManager = MaterialsManager;
