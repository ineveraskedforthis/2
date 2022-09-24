"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemsSystem = void 0;
var ItemsSystem;
(function (ItemsSystem) {
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
    ItemsSystem.size = size;
    function create(item_desc) {
    }
    ItemsSystem.create = create;
})(ItemsSystem = exports.ItemsSystem || (exports.ItemsSystem = {}));
