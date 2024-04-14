"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmmunitionCraft = void 0;
const CraftBulk_1 = require("./CraftBulk");
var AmmunitionCraft;
(function (AmmunitionCraft) {
    AmmunitionCraft.bone_arrow = (0, CraftBulk_1.new_craft_bulk)('arrow', [{ material: 31 /* MATERIAL.WOOD_RED */, amount: 1 }, { material: 4 /* MATERIAL.SMALL_BONE_RAT */, amount: 10 }], [{ material: 0 /* MATERIAL.ARROW_BONE */, amount: 10 }], [{ skill: 'woodwork', difficulty: 20 }, { skill: 'bone_carving', difficulty: 10 }]);
})(AmmunitionCraft || (exports.AmmunitionCraft = AmmunitionCraft = {}));

