"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
class Item {
    constructor(durability, affixes, model_tag) {
        this.durability = durability;
        this.affixes = affixes;
        this.model_tag = model_tag;
    }
    json() {
        return {
            durability: this.durability,
            affixes: this.affixes,
            model_tag: this.model_tag,
        };
    }
}
exports.Item = Item;
