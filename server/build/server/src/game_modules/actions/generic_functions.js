"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummy_start = exports.dummy_duration = exports.dummy_effect = exports.basic_duration_modifier = exports.basic_duration = exports.basic_trigger = void 0;
const character_1 = require("../data/entities/character");
function basic_trigger(character) {
    if (character.in_battle()) {
        return character_1.NotificationResponse.InBattle;
    }
    return { response: 'OK' };
}
exports.basic_trigger = basic_trigger;
function basic_duration(character) {
    return 1 + character.get_fatigue() / 50;
}
exports.basic_duration = basic_duration;
function basic_duration_modifier(character) {
    return 1;
}
exports.basic_duration_modifier = basic_duration_modifier;
function dummy_effect(character, cell) {
    return;
}
exports.dummy_effect = dummy_effect;
function dummy_duration(char) {
    return 0.5;
}
exports.dummy_duration = dummy_duration;
function dummy_start(char) { }
exports.dummy_start = dummy_start;
