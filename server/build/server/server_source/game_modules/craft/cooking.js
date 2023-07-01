"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cooking = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const CraftBulk_1 = require("./CraftBulk");
var Cooking;
(function (Cooking) {
    Cooking.meat = (0, CraftBulk_1.new_craft_bulk)('meat_to_food', [{ material: materials_manager_1.MEAT, amount: 2 }], [{ material: materials_manager_1.FOOD, amount: 1 }], [{ skill: 'cooking', difficulty: 20 }]);
    Cooking.fish = (0, CraftBulk_1.new_craft_bulk)('fish_to_food', [{ material: materials_manager_1.FISH, amount: 2 }], [{ material: materials_manager_1.FOOD, amount: 1 }], [{ skill: 'cooking', difficulty: 20 }]);
    Cooking.elodino = (0, CraftBulk_1.new_craft_bulk)('elo_to_zaz', [{ material: materials_manager_1.ELODINO_FLESH, amount: 1 }], [{ material: materials_manager_1.ZAZ, amount: 1 }, { material: materials_manager_1.MEAT, amount: 0.25 }], [{ skill: 'cooking', difficulty: 10 }, { skill: 'magic_mastery', difficulty: 30 }]);
})(Cooking = exports.Cooking || (exports.Cooking = {}));
