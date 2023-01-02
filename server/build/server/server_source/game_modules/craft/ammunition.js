"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmmunitionCraft = void 0;
const materials_manager_1 = require("../manager_classes/materials_manager");
const CraftBulk_1 = require("./CraftBulk");
var AmmunitionCraft;
(function (AmmunitionCraft) {
    AmmunitionCraft.bone_arrow = (0, CraftBulk_1.new_craft_bulk)('arrow', [{ material: materials_manager_1.WOOD, amount: 1 }, { material: materials_manager_1.RAT_BONE, amount: 10 }], [{ material: materials_manager_1.ARROW_BONE, amount: 10 }], [{ skill: 'woodwork', difficulty: 20 }, { skill: 'bone_carving', difficulty: 10 }]);
})(AmmunitionCraft = exports.AmmunitionCraft || (exports.AmmunitionCraft = {}));
