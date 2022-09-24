"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
class Item {
    constructor(durability, affixes, slot, range, material, weapon_tag, model_tag) {
        this.durability = durability;
        this.affixes = affixes;
        this.slot = slot;
        this.material = material;
        this.weapon_tag = weapon_tag;
        this.model_tag = model_tag;
        this.range = range;
    }
}
exports.Item = Item;
