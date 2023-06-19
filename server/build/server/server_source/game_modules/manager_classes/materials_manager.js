"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEXTILE = exports.COTTON = exports.FISH = exports.ARROW_BONE = exports.WATER = exports.MEAT = exports.ZAZ = exports.FOOD = exports.STEEL = exports.WOOD = exports.GRACI_HAIR = exports.ELODINO_FLESH = exports.RAT_BONE = exports.RAT_SKIN = exports.materials = exports.MaterialsManager = void 0;
const ITEM_MATERIAL_1 = require("../items/ITEM_MATERIAL");
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
        let mat = new ITEM_MATERIAL_1.ITEM_MATERIAL(density, hardness, string_tag);
        let ind = this.add_material(mat);
        return ind;
    }
    get_materials_json() {
        return this.mat_dict;
    }
    get_materials_list() {
        return this.list_of_indices;
    }
    index_to_material(n) {
        return this.materials[n];
    }
    tag_to_material(tag) {
        return this.materials[this.mat_dict[tag]];
    }
    tag_to_index(tag) {
        return this.mat_dict[tag];
    }
    validate_material(x) {
        if (x < this.new_material_id) {
            return true;
        }
        return false;
    }
}
exports.MaterialsManager = MaterialsManager;
exports.materials = new MaterialsManager();
exports.RAT_SKIN = exports.materials.create_material(0.2, 2, 'rat_skin');
exports.RAT_BONE = exports.materials.create_material(0.3, 5, 'rat_bone');
exports.ELODINO_FLESH = exports.materials.create_material(0.1, 1, 'elodino_flesh');
exports.GRACI_HAIR = exports.materials.create_material(0.5, 20, 'graci_hair');
exports.WOOD = exports.materials.create_material(0.5, 3, 'wood');
exports.STEEL = exports.materials.create_material(3, 20, 'steel');
exports.FOOD = exports.materials.create_material(0.2, 1, 'food');
exports.ZAZ = exports.materials.create_material(1, 10, 'zaz');
exports.MEAT = exports.materials.create_material(0.3, 1, 'meat');
exports.WATER = exports.materials.create_material(0.2, 1, 'water');
exports.ARROW_BONE = exports.materials.create_material(0.5, 3, 'arrow_bone');
exports.FISH = exports.materials.create_material(0.3, 1, 'fish');
exports.COTTON = exports.materials.create_material(0.1, 1, 'cotton');
exports.TEXTILE = exports.materials.create_material(0.1, 3, 'textile');
