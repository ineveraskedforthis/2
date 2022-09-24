"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemSystem = void 0;
const item_1 = require("./item");
var ItemSystem;
(function (ItemSystem) {
    function size(item) {
        if (item.slot == 'weapon') {
            switch (item.weapon_tag) {
                case 'onehand':
                    return 1;
                case 'polearms':
                    return 2;
                case 'ranged':
                    return 1;
                case 'twohanded':
                    return 3;
            }
        }
        switch (item.slot) {
            case 'arms': return 1;
            case 'foot': return 1;
            case 'head': return 1;
            case 'legs': return 3;
            case 'body': return 5;
        }
    }
    ItemSystem.size = size;
    function create(item_desc) {
        let item = new item_1.Item(item_desc.durability, [], item_desc.slot, item_desc.range, item_desc.material, item_desc.weapon_tag, item_desc.model_tag);
        for (let aff of item_desc.affixes) {
            item.affixes.push(aff);
        }
        return item;
    }
    ItemSystem.create = create;
})(ItemSystem = exports.ItemSystem || (exports.ItemSystem = {}));
