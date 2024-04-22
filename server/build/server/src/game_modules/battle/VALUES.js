"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BattleValues = void 0;
const character_1 = require("../scripted-values/character");
var BattleValues;
(function (BattleValues) {
    BattleValues.HALFWIDTH = 15;
    BattleValues.HALFHEIGHT = 15;
    function flee_chance(position) {
        return 0.1 + Math.max(Math.abs(position.x) / BattleValues.HALFWIDTH, Math.abs(position.y) / BattleValues.HALFHEIGHT) / 2;
    }
    BattleValues.flee_chance = flee_chance;
    function move_cost(unit) {
        return character_1.CharacterValues.movement_cost_battle(unit);
    }
    BattleValues.move_cost = move_cost;
})(BattleValues || (exports.BattleValues = BattleValues = {}));
