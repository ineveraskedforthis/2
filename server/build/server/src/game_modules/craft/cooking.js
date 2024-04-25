"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cooking = void 0;
const CraftBulk_1 = require("./CraftBulk");
var Cooking;
(function (Cooking) {
    Cooking.meat = (0, CraftBulk_1.new_craft_bulk)('meat_to_food1', [{ material: 18 /* MATERIAL.MEAT_RAT */, amount: 10 }], [{ material: 19 /* MATERIAL.MEAT_RAT_FRIED */, amount: 10, skill_checks: [
                { skill: 2 /* SKILL.COOKING */, difficulty: 20 }
            ] }]);
    Cooking.meat2 = (0, CraftBulk_1.new_craft_bulk)('meat_to_food2', [{ material: 22 /* MATERIAL.MEAT_HUMAN */, amount: 10 }], [{ material: 24 /* MATERIAL.MEAT_HUMAN_FRIED */, amount: 10, skill_checks: [
                { skill: 2 /* SKILL.COOKING */, difficulty: 20 }
            ] }]);
    Cooking.meat3 = (0, CraftBulk_1.new_craft_bulk)('meat_to_food3', [{ material: 23 /* MATERIAL.MEAT_GRACI */, amount: 10 }], [{ material: 25 /* MATERIAL.MEAT_GRACI_FRIED */, amount: 10, skill_checks: [
                { skill: 2 /* SKILL.COOKING */, difficulty: 20 }
            ] }]);
    Cooking.fish = (0, CraftBulk_1.new_craft_bulk)('fish_to_food', [{ material: 26 /* MATERIAL.FISH_OKU */, amount: 10 }], [{ material: 27 /* MATERIAL.FISH_OKU_FRIED */, amount: 10, skill_checks: [
                { skill: 2 /* SKILL.COOKING */, difficulty: 20 }
            ] }]);
    Cooking.elodino = (0, CraftBulk_1.new_craft_bulk)('elo_to_zaz', [{ material: 20 /* MATERIAL.MEAT_ELODINO */, amount: 10 }], [{ material: 30 /* MATERIAL.ZAZ */, amount: 10, skill_checks: [
                { skill: 2 /* SKILL.COOKING */, difficulty: 5 },
                { skill: 26 /* SKILL.MAGIC */, difficulty: 5 },
                { skill: 27 /* SKILL.ALCHEMY */, difficulty: 30 }
            ] }]);
    Cooking.berries = (0, CraftBulk_1.new_craft_bulk)('berry_to_zaz', [{ material: 29 /* MATERIAL.BERRY_ZAZ */, amount: 20 }], [{ material: 30 /* MATERIAL.ZAZ */, amount: 5, skill_checks: [
                { skill: 2 /* SKILL.COOKING */, difficulty: 10 },
                { skill: 26 /* SKILL.MAGIC */, difficulty: 10 },
                { skill: 27 /* SKILL.ALCHEMY */, difficulty: 50 }
            ] }]);
})(Cooking || (exports.Cooking = Cooking = {}));
