"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterAction = void 0;
const actions_move_1 = require("./actions_move");
const actions_hunter_gathering_1 = require("./actions_hunter_gathering");
const actions_self_1 = require("./actions_self");
var CharacterAction;
(function (CharacterAction) {
    CharacterAction.MOVE = actions_move_1.move;
    CharacterAction.CLEAN = actions_self_1.clean;
    CharacterAction.EAT = actions_self_1.eat;
    CharacterAction.HUNT = actions_hunter_gathering_1.hunt;
    CharacterAction.FISH = actions_hunter_gathering_1.fish;
    CharacterAction.REST = actions_self_1.rest;
    // export const PROPER_REST = proper_rest;
    // export const ATTACK = attack
    CharacterAction.GATHER_WOOD = actions_hunter_gathering_1.gather_wood;
    CharacterAction.GATHER_COTTON = actions_hunter_gathering_1.gather_cotton;
})(CharacterAction = exports.CharacterAction || (exports.CharacterAction = {}));
