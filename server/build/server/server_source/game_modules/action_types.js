"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharacterAction = void 0;
const move_1 = require("./actions/move");
const eat_1 = require("./actions/eat");
const clean_1 = require("./actions/clean");
const rest_1 = require("./actions/rest");
const hunt_1 = require("./actions/hunt");
const gather_1 = require("./actions/gather");
var CharacterAction;
(function (CharacterAction) {
    CharacterAction.MOVE = move_1.move;
    CharacterAction.CLEAN = clean_1.clean;
    CharacterAction.EAT = eat_1.eat;
    CharacterAction.HUNT = hunt_1.hunt;
    CharacterAction.FISH = hunt_1.fish;
    CharacterAction.REST = rest_1.rest;
    // export const PROPER_REST = proper_rest;
    // export const ATTACK = attack
    CharacterAction.GATHER_WOOD = gather_1.gather_wood;
    CharacterAction.GATHER_COTTON = gather_1.gather_cotton;
})(CharacterAction = exports.CharacterAction || (exports.CharacterAction = {}));
