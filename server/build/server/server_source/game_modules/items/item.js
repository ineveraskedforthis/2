"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
class Item {
    constructor(durability, affixes, slot, range, material, weapon_tag, model_tag, resists, damage) {
        this.durability = durability;
        this.affixes = affixes;
        this.slot = slot;
        this.material = material;
        this.weapon_tag = weapon_tag;
        this.model_tag = model_tag;
        this.range = range;
        this.resists = resists;
        this.damage = damage;
    }
    tag() {
        return this.model_tag;
    }
    json() {
        return {
            durability: this.durability,
            affixes: this.affixes,
            slot: this.slot,
            material: this.material,
            weapon_tag: this.weapon_tag,
            model_tag: this.model_tag,
            range: this.range,
            resists: this.resists,
            damage: this.damage
        };
    }
    is_weapon() {
        return this.slot == 'weapon';
    }
}
exports.Item = Item;
