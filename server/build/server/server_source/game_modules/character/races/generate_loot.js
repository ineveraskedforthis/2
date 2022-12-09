"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loot = void 0;
const basic_functions_1 = require("../../calculations/basic_functions");
const items_set_up_1 = require("../../items/items_set_up");
const system_1 = require("../../items/system");
const materials_manager_1 = require("../../manager_classes/materials_manager");
const SKIN_RAT_DIFFICULTY = 10;
const SKIN_HUMAN_DIFFICULTY = 40;
var Loot;
(function (Loot) {
    function base(dead) {
        switch (dead) {
            case 'elo': return [{ material: materials_manager_1.ELODINO_FLESH, amount: 3 }];
            case 'human': return [{ material: materials_manager_1.MEAT, amount: 6 }];
            case 'rat': {
                return [
                    { material: materials_manager_1.MEAT, amount: 3 },
                    { material: materials_manager_1.RAT_BONE, amount: 5 },
                    { material: materials_manager_1.RAT_SKIN, amount: 4 }
                ];
            }
            case 'graci': return [{ material: materials_manager_1.GRACI_HAIR, amount: 3 }, { material: materials_manager_1.MEAT, amount: 50 }];
        }
        return [];
    }
    Loot.base = base;
    function items(dead) {
        let responce = [];
        console.log(dead);
        if (dead == 'rat') {
            let dice_drop = Math.random();
            console.log('drop dice ' + dice_drop);
            if (dice_drop > 0.5) {
                let item = system_1.ItemSystem.create(items_set_up_1.RAT_SKULL_HELMET_ARGUMENT);
                let dice_quality = (0, basic_functions_1.trim)(Math.random() * Math.random(), 0.1, 1);
                item.durability = Math.floor(dice_quality * 100);
                responce.push(item);
            }
        }
        return responce;
    }
    Loot.items = items;
    function skinning(dead) {
        if (dead == 'rat')
            return 4;
        return 0;
    }
    Loot.skinning = skinning;
})(Loot = exports.Loot || (exports.Loot = {}));
