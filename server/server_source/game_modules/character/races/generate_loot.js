"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Loot = void 0;
const materials_manager_1 = require("../../manager_classes/materials_manager");
const SKIN_RAT_DIFFICULTY = 10;
const SKIN_HUMAN_DIFFICULTY = 40;
var Loot;
(function (Loot) {
    function base(dead) {
        switch (dead) {
            case 'elo': return [{ material: materials_manager_1.ELODINO_FLESH, amount: 1 }];
            case 'human': return [{ material: materials_manager_1.MEAT, amount: 1 }];
            case 'rat': {
                return [
                    { material: materials_manager_1.MEAT, amount: 1 },
                    { material: materials_manager_1.RAT_BONE, amount: 3 },
                    { material: materials_manager_1.RAT_SKIN, amount: 1 }
                ];
            }
            case 'graci': return [{ material: materials_manager_1.GRACI_HAIR, amount: 3 }];
        }
        return [];
    }
    Loot.base = base;
    function skinning(dead) {
        if (dead == 'rat')
            return 2;
        return 0;
    }
    Loot.skinning = skinning;
})(Loot = exports.Loot || (exports.Loot = {}));
