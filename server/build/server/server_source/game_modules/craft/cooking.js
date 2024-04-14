"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cooking = void 0;
const CraftBulk_1 = require("./CraftBulk");
var Cooking;
(function (Cooking) {
    Cooking.meat = (0, CraftBulk_1.new_craft_bulk)('meat_to_food', [{ material: 18 /* MATERIAL.MEAT_RAT */, amount: 2 }], [{ material: 19 /* MATERIAL.MEAT_RAT_FRIED */, amount: 1 }], [{ skill: 'cooking', difficulty: 20 }]);
    Cooking.fish = (0, CraftBulk_1.new_craft_bulk)('fish_to_food', [{ material: 26 /* MATERIAL.FISH_OKU */, amount: 2 }], [{ material: 27 /* MATERIAL.FISH_OKU_FRIED */, amount: 1 }], [{ skill: 'cooking', difficulty: 20 }]);
    Cooking.elodino = (0, CraftBulk_1.new_craft_bulk)('elo_to_zaz', [{ material: 20 /* MATERIAL.MEAT_ELODINO */, amount: 1 }], [{ material: 30 /* MATERIAL.ZAZ */, amount: 1 }], [{ skill: 'cooking', difficulty: 10 }, { skill: 'magic_mastery', difficulty: 30 }]);
})(Cooking = exports.Cooking || (exports.Cooking = {}));
