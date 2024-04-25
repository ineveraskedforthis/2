"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmmunitionCraft = void 0;
const CraftBulk_1 = require("./CraftBulk");
var AmmunitionCraft;
(function (AmmunitionCraft) {
    AmmunitionCraft.bone_arrow = (0, CraftBulk_1.new_craft_bulk)('arrow1', [{ material: 31 /* MATERIAL.WOOD_RED */, amount: 1 }, { material: 4 /* MATERIAL.SMALL_BONE_RAT */, amount: 10 }], [{ material: 0 /* MATERIAL.ARROW_BONE */, amount: 10, skill_checks: [
                { skill: 4 /* SKILL.WOODWORKING */, difficulty: 20 },
                { skill: 9 /* SKILL.BONE_CARVING */, difficulty: 10 },
                { skill: 8 /* SKILL.FLETCHING */, difficulty: 50 }
            ] }]);
    AmmunitionCraft.bone_arrow_graci = (0, CraftBulk_1.new_craft_bulk)('arrow2', [{ material: 31 /* MATERIAL.WOOD_RED */, amount: 1 }, { material: 6 /* MATERIAL.SMALL_BONE_GRACI */, amount: 2 }], [{ material: 0 /* MATERIAL.ARROW_BONE */, amount: 10, skill_checks: [
                { skill: 4 /* SKILL.WOODWORKING */, difficulty: 20 },
                { skill: 9 /* SKILL.BONE_CARVING */, difficulty: 10 },
                { skill: 8 /* SKILL.FLETCHING */, difficulty: 50 }
            ] }]);
    AmmunitionCraft.bone_arrow_human = (0, CraftBulk_1.new_craft_bulk)('arrow3', [{ material: 31 /* MATERIAL.WOOD_RED */, amount: 1 }, { material: 5 /* MATERIAL.SMALL_BONE_HUMAN */, amount: 5 }], [{ material: 0 /* MATERIAL.ARROW_BONE */, amount: 10, skill_checks: [
                { skill: 4 /* SKILL.WOODWORKING */, difficulty: 20 },
                { skill: 9 /* SKILL.BONE_CARVING */, difficulty: 10 },
                { skill: 8 /* SKILL.FLETCHING */, difficulty: 50 }
            ] }]);
    AmmunitionCraft.zaz_arrow = (0, CraftBulk_1.new_craft_bulk)('arrow_zaz', [{ material: 0 /* MATERIAL.ARROW_BONE */, amount: 10 }, { material: 30 /* MATERIAL.ZAZ */, amount: 1 }], [{ material: 1 /* MATERIAL.ARROW_ZAZ */, amount: 10, skill_checks: [
                { skill: 26 /* SKILL.MAGIC */, difficulty: 5 },
                { skill: 28 /* SKILL.ENCHANTING */, difficulty: 10 }
            ] }]);
})(AmmunitionCraft || (exports.AmmunitionCraft = AmmunitionCraft = {}));
