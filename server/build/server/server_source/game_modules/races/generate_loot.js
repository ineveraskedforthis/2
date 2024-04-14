"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loot = void 0;
const basic_functions_1 = require("../calculations/basic_functions");
const data_objects_1 = require("../data/data_objects");
const SKIN_RAT_DIFFICULTY = 10;
const SKIN_HUMAN_DIFFICULTY = 40;
var Loot;
(function (Loot) {
    function base(dead) {
        switch (dead) {
            case 'elo': return [{ material: 20 /* MATERIAL.MEAT_ELODINO */, amount: 3 }];
            case 'human': return [{ material: 22 /* MATERIAL.MEAT_HUMAN */, amount: 6 }];
            case 'rat': {
                return [
                    { material: 18 /* MATERIAL.MEAT_RAT */, amount: 3 },
                    { material: 4 /* MATERIAL.SMALL_BONE_RAT */, amount: 5 },
                    { material: 7 /* MATERIAL.BONE_RAT */, amount: 1 },
                    { material: 10 /* MATERIAL.SKIN_RAT */, amount: 2 }
                ];
            }
            case 'magerat': {
                return [
                    { material: 18 /* MATERIAL.MEAT_RAT */, amount: 2 },
                    { material: 4 /* MATERIAL.SMALL_BONE_RAT */, amount: 4 },
                    { material: 10 /* MATERIAL.SKIN_RAT */, amount: 3 },
                    { material: 30 /* MATERIAL.ZAZ */, amount: 1 }
                ];
            }
            case 'bigrat': {
                return [
                    { material: 18 /* MATERIAL.MEAT_RAT */, amount: 10 },
                    { material: 4 /* MATERIAL.SMALL_BONE_RAT */, amount: 10 },
                    { material: 7 /* MATERIAL.BONE_RAT */, amount: 2 },
                    { material: 10 /* MATERIAL.SKIN_RAT */, amount: 6 }
                ];
            }
            case 'graci': return [{ material: 33 /* MATERIAL.HAIR_GRACI */, amount: 3 }, { material: 23 /* MATERIAL.MEAT_GRACI */, amount: 50 }];
            case "test": return [];
            case "berserkrat": return [
                { material: 18 /* MATERIAL.MEAT_RAT */, amount: 10 },
                { material: 4 /* MATERIAL.SMALL_BONE_RAT */, amount: 10 },
                { material: 7 /* MATERIAL.BONE_RAT */, amount: 2 },
                { material: 10 /* MATERIAL.SKIN_RAT */, amount: 6 }
            ];
            case "human_strong": return [{ material: 22 /* MATERIAL.MEAT_HUMAN */, amount: 20 }];
            case "ball": return [{ material: 21 /* MATERIAL.MEAT_BALL */, amount: 20 }];
        }
        return [];
    }
    Loot.base = base;
    function items(dead) {
        let response = [];
        console.log(dead);
        if (dead == 'rat') {
            let dice_drop = Math.random();
            console.log('drop dice ' + dice_drop);
            if (dice_drop > 0.5) {
                let item = data_objects_1.Data.Items.create_armour(100, [], 0 /* ARMOUR.HELMET_SKULL_RAT */);
                let dice_quality = (0, basic_functions_1.trim)(Math.random() * Math.random(), 0.1, 1);
                item.durability = Math.floor(dice_quality * 100);
                response.push(item);
            }
        }
        return response;
    }
    Loot.items = items;
    function skinning(dead) {
        if (dead == 'rat')
            return 4;
        return 0;
    }
    Loot.skinning = skinning;
})(Loot = exports.Loot || (exports.Loot = {}));
